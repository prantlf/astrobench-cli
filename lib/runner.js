/* global astrobench */

const connect = require('connect')
const serve = require('serve-static')
const { Instance: Chalk } = require('chalk')
const formatToText = require('./formatters/text')
const formatToJSON = require('./formatters/json')
const { join } = require('path')
const { ensureDir, outputFile } = require('fs-extra')

let server
let browser
let page
let log

async function run ({
  url,
  browser,
  directory,
  port,
  headless,
  sandbox,
  shm,
  executable,
  timeout,
  color,
  verbose,
  saveText,
  saveJson,
  saveImage,
  saveHtml,
  saveLog,
  performance,
  errorSnapshot
} = {}) {
  try {
    const { servedOrigin } = await start({
      browser,
      directory,
      port,
      headless,
      sandbox,
      shm,
      executable,
      url,
      verbose,
      grabLog: saveLog || errorSnapshot
    })
    return await test({
      timeout,
      color,
      verbose,
      saveText,
      saveJson,
      saveImage,
      saveHtml,
      saveLog,
      performance,
      servedOrigin
    })
  } finally {
    await saveErrorSnapshot({ errorSnapshot, verbose })
    await stop({ verbose })
  }
}

async function start ({
  browser,
  directory,
  port,
  headless,
  sandbox,
  shm,
  executable,
  url,
  verbose,
  grabLog
}) {
  let servedOrigin = !(url.includes('://') && url.indexOf('://') < url.indexOf('/'))
  if (servedOrigin) {
    port = await startServer({ directory, port, verbose })
    servedOrigin = `http://localhost:${port}`
    url = `${servedOrigin}/${url}`
  }
  await openBrowser({
    browserName: browser,
    headless,
    sandbox,
    shm,
    executable,
    url,
    verbose,
    grabLog
  })
  return { servedOrigin }
}

function startServer ({ directory, port, verbose }) {
  if (!directory) {
    directory = '.'
  }
  if (!port) {
    port = 0
  }
  if (progressEnabled(verbose)) {
    console.log(`--- Starting the server at "${directory}" on port ${port}`)
  }
  return new Promise((resolve, reject) => {
    server = connect()
      .use(serve(directory, { etag: false }))
      .listen(port, error => {
        if (error) {
          /* istanbul ignore next */
          reject(error)
        } else {
          resolve(server.address().port)
        }
      })
  })
}

async function openBrowser ({
  browserName,
  headless,
  sandbox,
  shm,
  executable,
  url,
  verbose,
  grabLog
}) {
  if (!browserName) {
    browserName = 'chrome'
  }
  if (progressEnabled(verbose)) {
    console.log(`--- Launching the ${browserName} browser`)
  }
  log = ''
  const puppeteer = require(
    browserName === 'chrome' ? 'puppeteer' : 'puppeteer-firefox')
  const args = []
  if (sandbox === false) {
    args.push('--no-sandbox')
  }
  if (shm === false) {
    args.push('--disable-dev-shm-usage')
  }
  browser = await puppeteer.launch({
    executablePath: executable,
    headless: headless !== false,
    args
  })
  page = await browser.newPage()
  if (verbose || grabLog) {
    relayConsole({
      verbose,
      grabLog,
      network: verbose && verbose.network !== false,
      browserConsole: verbose && verbose.browserConsole !== false
    })
  }
  if (progressEnabled(verbose)) {
    console.log(`--- Navigating to ${url}`)
  }
  await page.goto(url)
}

function relayConsole ({ verbose, grabLog, network, browserConsole }) {
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
  if (browserConsole || grabLog) {
    page.on('console', message => {
      const text = `${prefixes[message.type()] || '???'} ${message.text()}`
      if (browserConsole) {
        console.log(text)
      }
      if (grabLog) {
        log += `${text}\n`
      }
    })
  }
  page.on('pageerror', ({ message }) => {
    if (verbose) {
      console.log(message)
    }
    if (grabLog) {
      log += `${message}\n`
    }
  })
  if (network || grabLog) {
    page
      .on('response', response => {
        const text = `${response.status()} ${response.url()}`
        if (network) {
          console.log(text)
        }
        if (grabLog) {
          log += `${text}\n`
        }
      })
      .on('requestfailed', request => {
        const text = `${request.failure().errorText} ${request.url()}`
        if (network) {
          console.log(text)
        }
        if (grabLog) {
          log += `${text}\n`
        }
      })
  }
}

async function test ({
  timeout,
  color,
  verbose,
  saveText,
  saveJson,
  saveImage,
  saveHtml,
  saveLog,
  performance,
  servedOrigin
}) {
  await runTests({ timeout, verbose, performance })
  await watchProgress({ timeout, color, verbose, performance })
  const results = await computeResults({ verbose, servedOrigin })
  await saveState({
    results,
    saveText,
    saveJson,
    saveImage,
    saveHtml,
    saveLog,
    verbose
  })
  return results
}

async function runTests ({ timeout, verbose, performance }) {
  if (progressEnabled(verbose)) {
    console.log(`--- Waiting for the page content to appear (max. ${timeout}s)`)
  }
  timeout = (timeout || 60) * 1000
  // The content of #astrobench is populated when all suites are created.
  await page.waitForSelector('#astrobench .fn-suites', {
    visible: true, timeout
  })
  if (progressEnabled(verbose)) {
    console.log('--- Running the benchmarks')
  }
  if (performance) {
    await ensureDir(performance)
  }
  await page.evaluate(
    /* istanbul ignore next */
    () => astrobench())
}

async function watchProgress ({ timeout, color, verbose, performance }) {
  const chalk = new Chalk(color !== false ? undefined : { level: 0 })
  timeout = (timeout || 60) * 1000
  let lastSuite
  let lastBench
  let tracing
  // Loop until all suites have ended. Each iteration means a state change.
  do {
    const { suiteIndex, benchIndex } = await page.evaluate(
      /* istanbul ignore next */
      () => {
        const { index: suiteIndex, benchIndex } = astrobench.state
        return { suiteIndex, benchIndex }
      })
    const { suiteName, benchName } = await page.evaluate(
      /* istanbul ignore next */
      () => {
        const { index: suiteIndex, benchIndex, describes } = astrobench.state
        const suite = describes[suiteIndex].suite
        const suiteName = suite.name
        const benchName = suite[benchIndex].name
        return { suiteName, benchName }
      })
    if (suiteName !== lastSuite) {
      if (verbose) {
        console.log(chalk`--- Suite {yellow ${suiteName}}`)
      }
      lastSuite = suiteName
      lastBench = null
    }
    if (benchName !== lastBench) {
      if (verbose) {
        console.log(chalk`---   Benchmark {cyan ${benchName}}`)
      }
      if (performance) {
        await stopProfiler()
        await startProfiler(performance, suiteName, benchName)
      }
      lastBench = benchName
    }
    // Wait for any state change - switching to another benchmark, starting
    // with another suite or finishing of all suites.
    await page.waitForFunction(
      /* istanbul ignore next */
      (lastSuite, lastBench) => {
        const { index: suiteIndex, benchIndex, running } = astrobench.state
        return !running || suiteIndex !== lastSuite || benchIndex !== lastBench
      },
      { timeout }, suiteIndex, benchIndex)
  } while (await page.evaluate(
    /* istanbul ignore next */
    () => astrobench.state.running))
  if (performance) {
    await stopProfiler()
  }

  async function startProfiler (performance, suiteName, benchName) {
    tracing = true
    if (progressEnabled(verbose)) {
      console.log('--- Starting the profiler')
    }
    await page.tracing.start({
      path: join(performance, `Profile of ${suiteName} - ${benchName}.json`),
      screenshots: false
    })
  }

  async function stopProfiler () {
    if (tracing) {
      tracing = false
      if (progressEnabled(verbose)) {
        console.log('--- Stopping the profiler')
      }
      await page.tracing.stop()
    }
  }
}

function computeResults ({ verbose, servedOrigin }) {
  if (progressEnabled(verbose)) {
    console.log('--- Computing results')
  }
  return page.evaluate(
    /* istanbul ignore next */
    servedOrigin => astrobench.state.describes.map(({ suite }) => ({
      name: suite.name,
      benchmarks: suite.map(({ name, error, aborted, hz, stats, sum, times }) => {
        if (error) {
          let { message, name, stack } = error
          if (servedOrigin) {
            stack = trimOrigin(stack)
          }
          stack = pruneInternals(stack)
          error = { message, name, stack }
        }
        return { name, error, aborted, hz, stats, sum, times }
        function trimOrigin (stack) {
          const toTrim = `${servedOrigin}/`
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
    })), servedOrigin)
}

async function saveState ({
  results,
  saveText,
  saveJson,
  saveImage,
  saveHtml,
  saveLog,
  verbose
}) {
  if (saveLog) {
    if (progressEnabled(verbose)) {
      console.log(`--- Writing console log to ${saveLog}`)
    }
    await outputFile(saveLog, log)
  }
  if (saveText) {
    if (progressEnabled(verbose)) {
      console.log(`--- Writing text results to ${saveText}`)
    }
    await outputFile(saveText, formatToText(results, {
      color: false, verbose: true
    }))
  }
  if (saveJson) {
    if (progressEnabled(verbose)) {
      console.log(`--- Writing JSON results to ${saveJson}`)
    }
    await outputFile(saveJson, formatToJSON(results))
  }
  if (saveImage || saveHtml) {
    if (progressEnabled(verbose)) {
      console.log('--- Cleaning up the testing page')
    }
    await page.evaluate(
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
  if (saveImage) {
    if (progressEnabled(verbose)) {
      console.log(`--- Writing PNG screenshot to ${saveImage}`)
    }
    await page.screenshot({ path: saveImage, fullPage: true })
  }
  if (saveHtml) {
    if (progressEnabled(verbose)) {
      console.log(`--- Writing HTML markup to ${saveHtml}`)
    }
    const html = await page.evaluate(
      /* istanbul ignore next */
      () => document.documentElement.outerHTML)
    await outputFile(saveHtml, `<!doctype html>
${html}`)
  }
}

async function saveErrorSnapshot ({ errorSnapshot, verbose }) {
  if (errorSnapshot && page) {
    if (progressEnabled(verbose)) {
      console.log(`--- Saving error snapshots to ${errorSnapshot}`)
    }
    try {
      await outputFile(`${errorSnapshot}.log`, log)
      const html = await page.evaluate(
        /* istanbul ignore next */
        () => document.documentElement.outerHTML)
      await outputFile(`${errorSnapshot}.html`, `<!doctype html>
${html}`)
      await page.screenshot({
        path: `${errorSnapshot}.png`, fullPage: true
      })
    } catch (error) {
      /* istanbul ignore next */
      console.error(error)
    }
  }
}

async function stop ({ verbose }) {
  await Promise.all([closeBrowser({ verbose }), stopServer({ verbose })])
}

async function closeBrowser ({ verbose }) {
  if (browser) {
    if (progressEnabled(verbose)) {
      console.log('--- Closing the browser')
    }
    browser.close()
    browser = null
    page = null
  }
}

async function stopServer ({ verbose }) {
  if (server) {
    if (progressEnabled(verbose)) {
      console.log('--- Stopping the server')
    }
    return new Promise(resolve => {
      server.close(resolve)
      server = null
    })
  }
}

process.on('SIGINT',
  /* istanbul ignore next */
  () => {
    console.log()
    stop({ verbose: true })
  })

function progressEnabled (verbose) {
  return verbose && verbose.progress !== false
}

module.exports = run
