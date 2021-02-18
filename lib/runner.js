/* global astrobench */

const connect = require('connect')
const serve = require('serve-static')
const ProgressBar = require('progress')
const { Instance: Chalk } = require('chalk')
const formatToText = require('./formatters/text')
const formatToJSON = require('./formatters/json')
const { URL } = require('url')
const { join } = require('path')
const { ensureDir, outputFile, pathExists } = require('fs-extra')

const runners = []

class Runner {
  constructor ({ color, verbose }) {
    this.color = color !== undefined ? color : process.stdout.isTTY
    this.verbose = verbose
    this.log = ''
    runners.push(this)
  }

  startServer ({ directory, port }) {
    if (!directory) {
      directory = '.'
    }
    if (!port) {
      port = 0
    }
    log(this, `Starting the server at "${directory}" on port ${port}`)
    return new Promise((resolve, reject) => {
      const server = connect()
        .use(serve(directory, { etag: false, maxAge: 86400 }))
        .listen(port, error => {
          if (error) {
            /* istanbul ignore next */
            reject(error)
          } else {
            this.server = server
            resolve()
          }
        })
    })
  }

  async launchBrowser ({
    browser,
    headless,
    sandbox,
    shm,
    ignoreHTTPSErrors,
    viewport,
    userData,
    executable
  }) {
    if (!browser) {
      browser = 'chrome'
    }
    this.log = ''
    const moduleName = browser === 'chrome' ? 'puppeteer' : `puppeteer-${browser}`
    const puppeteer = require(moduleName)
    if (!(executable || process.env.PUPPETEER_EXECUTABLE_PATH)) {
      const { executablePath } = await ensureBrowser(this, browser, puppeteer)
      executable = executablePath
    }
    const args = []
    /* istanbul ignore next */
    if (sandbox === false) {
      args.push('--no-sandbox')
    }
    /* istanbul ignore next */
    if (shm === false) {
      args.push('--disable-dev-shm-usage')
    }
    log(this, `Launching the ${browser} browser`)
    this.browser = await puppeteer.launch({
      executablePath: executable,
      headless: headless !== false,
      ignoreHTTPSErrors,
      defaultViewport: viewport,
      userDataDir: userData,
      args
    })
  }

  async openPage () {
    log(this, 'Opening a new page')
    this.log = ''
    this.page = await this.browser.newPage()
    this.relayConsole()
  }

  relayConsole () {
    const verbose = this.verbose
    const network = verbose && verbose.network !== false
    const browserConsole = verbose && verbose.browserConsole !== false
    const prefixes = {
      log: 'LOG',
      debug: 'DBG',
      info: 'INF',
      error: 'ERR',
      warning: 'WRN',
      dir: 'DIR',
      dirxml: 'DIX',
      table: 'TBL',
      trace: 'TRC',
      clear: 'CLR',
      startGroup: 'GRP',
      startGroupCollapsed: 'GRP',
      endGroup: 'GRE',
      assert: 'ASR',
      profile: 'PRF',
      profileEnd: 'PRE',
      count: 'CNT',
      timeEnd: 'TIM'
    }
    this.page
      .on('console', message => {
        const text = `${prefixes[message.type()] || '???'} ${message.text()}`
        if (browserConsole) {
          console.log(text)
        }
        this.log += `${text}\n`
      })
      .on('pageerror',
        /* istanbul ignore next */
        ({ message }) => {
          if (verbose) {
            console.log(message)
          }
          this.log += `${message}\n`
        })
      .on('response', response => {
        const text = `${response.status()} ${response.url()}`
        if (network) {
          console.log(text)
        }
        this.log += `${text}\n`
      })
      .on('requestfailed', request => {
        const text = `${request.failure().errorText} ${request.url()}`
        if (network) {
          console.log(text)
        }
        this.log += `${text}\n`
      })
  }

  async navigateTo ({ url }) {
    log(this, `Navigating to ${url}`)
    await this.page.goto(url)
  }

  async runTests ({ timeout }) {
    await this.waitForInitialization({ timeout })
    await this.page.evaluate(
      /* istanbul ignore next */
      () => astrobench())
    log(this, 'Running the benchmarks')
  }

  async waitForInitialization ({ timeout }) {
    log(this, `Waiting for the page content to appear (max. ${timeout}s)`)
    timeout = (timeout || 60) * 1000
    // The content of #astrobench is populated when all suites are created.
    await this.page.waitForSelector('#astrobench .fn-suites', { visible: true, timeout })
  }

  async watchProgress ({ timeout, performance }) {
    const chalk = new Chalk(this.color !== false ? undefined : { level: 0 })
    timeout = (timeout || 60) * 1000
    let lastSuite
    let lastBench
    let tracing
    if (performance) {
      await ensureDir(performance)
    }
    // Loop until all suites have ended. Each iteration means a state change.
    do {
      const { suiteIndex, benchIndex } = await this.page.evaluate(
        /* istanbul ignore next */
        () => {
          const { index: suiteIndex, benchIndex } = astrobench.state
          return { suiteIndex, benchIndex }
        })
      const { suiteName, benchName } = await this.page.evaluate(
        /* istanbul ignore next */
        () => {
          const { index: suiteIndex, benchIndex, describes } = astrobench.state
          const suite = describes[suiteIndex].suite
          const suiteName = suite.name
          const benchName = suite[benchIndex].name
          return { suiteName, benchName }
        })
      if (suiteName !== lastSuite) {
        if (this.verbose) {
          console.log(chalk`--- Suite {yellow ${suiteName}}`)
        }
        lastSuite = suiteName
        lastBench = null
      }
      if (benchName !== lastBench) {
        if (this.verbose) {
          console.log(chalk`---   Benchmark {cyan ${benchName}}`)
        }
        if (performance) {
          if (tracing) {
            await stopProfiler(this)
          } else {
            tracing = true
          }
          await startProfiler(this, join(performance, `${suiteName} - ${benchName}`))
        }
        lastBench = benchName
      }
      // Wait for any state change - switching to another benchmark, starting
      // with another suite or finishing of all suites.
      await this.page.waitForFunction(
        /* istanbul ignore next */
        (lastSuite, lastBench) => {
          const { index: suiteIndex, benchIndex, running } = astrobench.state
          return !running || suiteIndex !== lastSuite || benchIndex !== lastBench
        },
        { timeout }, suiteIndex, benchIndex)
    } while (await this.page.evaluate(
      /* istanbul ignore next */
      () => astrobench.state.running))
    if (performance && tracing) {
      await stopProfiler(this)
    }
  }

  computeResults () {
    log(this, 'Computing results')
    const { origin } = new URL(this.page.url())
    return this.page.evaluate(
      /* istanbul ignore next */
      origin => astrobench.state.describes.map(({ suite }) => ({
        name: suite.name,
        benchmarks: suite.map(({ name, error, aborted, hz, stats, sum, times }) => {
          if (error) {
            let { message, name, stack } = error
            stack = trimOrigin(stack)
            stack = pruneInternals(stack)
            error = { message, name, stack }
          }
          return { name, error, aborted, hz, stats, sum, times }
          function trimOrigin (stack) {
            const toTrim = `${origin}/`
            for (;;) {
              const index = stack.indexOf(toTrim)
              if (index < 0) {
                return stack
              }
              stack = stack.substr(0, index) + stack.substr(index + toTrim.length)
            }
          }
          function pruneInternals (stack) {
            return stack
              .split('\n')
              .map(frame => frame.includes('node_modules/') ? '' : frame)
              .filter(frame => frame)
              .join('\n')
          }
        })
      })), origin)
  }

  async saveResults ({ results, output, saveText, saveJson, saveImage, saveHtml, saveLog }) {
    if (output) {
      saveLog = `${output}.log`
      saveText = `${output}.txt`
      saveJson = `${output}.json`
      saveImage = `${output}.png`
      saveHtml = `${output}.html`
    }
    if (saveLog) {
      log(this, `Writing console log to ${saveLog}`)
      await outputFile(saveLog, this.log)
    }
    if (saveText) {
      log(this, `Writing text results to ${saveText}`)
      await outputFile(saveText, formatToText(results, { color: false, verbose: true }))
    }
    if (saveJson) {
      log(this, `Writing JSON results to ${saveJson}`)
      await outputFile(saveJson, formatToJSON(results))
    }
    if (saveImage || saveHtml) {
      await this.cleanPage()
    }
    if (saveImage) {
      await saveScreenshot(this, saveImage)
    }
    if (saveHtml) {
      await saveHtmlSnapshot(this, saveHtml)
    }
  }

  async cleanPage () {
    log(this, 'Cleaning up the testing page')
    await this.page.evaluate(
      /* istanbul ignore next */
      () => {
        const body = document.body
        for (const element of body.children) {
          if (element.id !== 'astrobench') {
            body.removeChild(element)
          }
        }
      })
  }

  async saveError ({ error, path }) {
    if (this.page) {
      log(this, `Saving error snapshots to ${path}`)
      try {
        await outputFile(`${path}.txt`, error.toString())
        await outputFile(`${path}.log`, this.log)
        await saveHtmlSnapshot(this, `${path}.html`)
        await saveScreenshot(this, `${path}.png`)
      } catch (error) {
        /* istanbul ignore next */
        console.error(error)
      }
    }
  }

  /* istanbul ignore next */
  async closePage () {
    log(this, 'Exiting the browser')
    await this.page.close()
    this.page = null
  }

  exitBrowser () {
    if (this.browser) {
      log(this, 'Exiting the browser')
      const promise = this.browser.close()
      this.browser = null
      this.page = null
      return promise
    }
  }

  stopServer () {
    if (this.server) {
      log(this, 'Stopping the server')
      return new Promise(resolve => {
        this.server.close(resolve)
        this.server = null
      })
    }
  }
}

async function run ({
  url,
  browser,
  directory,
  port,
  headless,
  sandbox,
  shm,
  ignoreHTTPSErrors,
  executable,
  viewport,
  userData,
  timeout,
  color,
  verbose,
  output,
  saveText,
  saveJson,
  saveImage,
  saveHtml,
  saveLog,
  performance,
  errorSnapshot
} = {}) {
  const runner = new Runner({ color, verbose })
  try {
    if (needsServer(url)) {
      await runner.startServer({ directory, port })
      port = runner.server.address().port
      url = `http://localhost:${port}/${url}`
    }
    await runner.launchBrowser({
      browser,
      headless,
      sandbox,
      shm,
      ignoreHTTPSErrors,
      viewport,
      userData,
      executable
    })
    await runner.openPage()
    await runner.navigateTo({ url })
    await runner.runTests({ timeout })
    await runner.watchProgress({ timeout, performance })
    const results = await runner.computeResults()
    await runner.saveResults({ results, output, saveText, saveJson, saveImage, saveHtml, saveLog })
    return results
  } catch (error) {
	  console.log('***************************', error)
    if (errorSnapshot) {
	  console.log('***************************', errorSnapshot)
      await runner.saveError({ error, path: errorSnapshot })
    }
    throw error
  } finally {
    await runner.exitBrowser()
    await runner.stopServer()
  }
}

/* istanbul ignore next */
async function ensureBrowser (runner, browser, puppeteer) {
  if (await pathExists(puppeteer.executablePath())) {
    return {}
  }
  let showProgress
  log(runner, `Downloading the ${browser} browser`)
  if (canLog(runner) && runner.color !== false) {
    const start = new Date().getTime()
    let received = 0
    let bar
    showProgress = (current, total) => {
      if (current === total) {
        const end = new Date().getTime()
        process.stdout.clearLine()
        process.stdout.cursorTo(0)
        return console.log(`--- Downloaded ${total} bytes in ${end - start} seconds`)
      }
      if (!bar) {
        bar = new ProgressBar('--- [:bar] speed: :rate/bps, finished :percent, ETA: :etas', {
          complete: '=',
          incomplete: ' ',
          width: 20,
          renderThrottle: 1000,
          total
        })
      }
      bar.tick(current - received)
      received = current
    }
  }
  const moduleName = browser === 'chrome' ? 'puppeteer' : `puppeteer-${browser}`
  const { puppeteer: settings } = require(`${moduleName}/package.json`)
  const revisionName = browser === 'chrome' ? 'chromium' : 'firefox'
  const fetcher = puppeteer.createBrowserFetcher()
  return fetcher.download(settings[`${revisionName}_revision`], showProgress)
}

function needsServer (url) {
  return !(url.includes('://') && url.indexOf('://') < url.indexOf('/'))
}

async function startProfiler (runner, path) {
  log(runner, 'Starting the profiler')
  await runner.page.tracing.start({ path: `${path}.json`, screenshots: false })
}

async function stopProfiler (runner) {
  log(runner, 'Stopping the profiler')
  await runner.page.tracing.stop()
}

async function saveHtmlSnapshot (runner, path) {
  log(runner, `Writing HTML markup to ${path}`)
  const html = await runner.page.content()
  await outputFile(path, html)
}

async function saveScreenshot (runner, path) {
  log(runner, `Writing PNG screenshot to ${path}`)
  await runner.page.screenshot({ path, fullPage: true })
}

function log (runner, message) {
  if (canLog(runner)) {
    console.log(`--- ${message}`)
  }
}

function canLog (runner) {
  return runner.verbose && runner.verbose.progress !== false
}

process.on('SIGINT',
  /* istanbul ignore next */
  () => {
    console.log()
    for (const runner of runners) {
      runner.exitBrowser()
      runner.stopServer()
    }
  })

run.run = run
run.Runner = Runner
module.exports = run
