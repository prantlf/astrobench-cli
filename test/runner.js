const test = require('test')
const { fail, ok, strictEqual } = require('assert')
const run = require('../lib/runner')
const { join } = require('path')
const { lstat, remove } = require('fs-extra')

async function checkFile (path) {
  const stats = await lstat(path)
  if (!stats.isFile()) {
    throw new Error(`No file found at "${path}".`)
  }
}

test('is the main export', () => {
  const run2 = require('..')
  strictEqual(run, run2, 'Exported functions are the same')
})

test('exports itself and the Runner class as named exports', () => {
  const { run: run2, Runner } = require('..')
  strictEqual(typeof run2, 'function', 'The runner function is exported.')
  strictEqual(run, run2, 'Exported functions are the same')
  strictEqual(typeof Runner, 'function', 'The Runner class is exported.')
})

test('returns proper results', async () => {
  await remove(join(__dirname, 'output/results.log'))
  await remove(join(__dirname, 'output/results.txt'))
  await remove(join(__dirname, 'output/results.json'))
  await remove(join(__dirname, 'output/results.png'))
  await remove(join(__dirname, 'output/results.html'))
  await remove(join(__dirname, 'performance/A suite - String#match.json'))
  return run({
    url: 'test/example/index.html',
    verbose: true,
    output: join(__dirname, 'output/results'),
    performance: join(__dirname, 'performance')
  })
    .then(async suites => {
      ok(Array.isArray(suites), 'Results is an array of suites')
      for (let suiteIndex = 0; suiteIndex < suites.length; ++suiteIndex) {
        const suite = suites[suiteIndex]
        strictEqual(typeof suite, 'object', `The suite ${suiteIndex} is an object`)
        const { name, benchmarks } = suite
        strictEqual(typeof name, 'string', 'A suite has a name')
        ok(Array.isArray(benchmarks), 'A suite contains an array of benchmarks')
        for (let benchIndex = 0; benchIndex < benchmarks.length; ++benchIndex) {
          const benchmark = benchmarks[benchIndex]
          strictEqual(typeof benchmark, 'object', `The benchmark ${benchIndex} is an object`)
          const { name, error, aborted, hz, stats, sum, times } = benchmark
          strictEqual(typeof name, 'string', 'A benchmark has a name')
          if (error) {
            strictEqual(aborted, true, 'A failed benchmark has been aborted')
            const { message, name, stack } = error
            strictEqual(typeof message, 'string', 'A failure contains a message')
            strictEqual(typeof name, 'string', 'A failure has a name')
            strictEqual(typeof stack, 'string', 'A failure has a stack trace')
          } else {
            strictEqual(aborted, false, 'A succeeded benchmark has not been aborted')
            strictEqual(typeof hz, 'number', 'A benchmark has a frequency')
            strictEqual(typeof stats, 'object', 'A benchmark carries stats')
            const { mean, rme } = stats
            strictEqual(typeof mean, 'number', 'Stats contain a mean')
            strictEqual(typeof rme, 'number', 'Stats contain a relative margin deviation')
            strictEqual(typeof sum, 'object', 'A benchmark carries a summary')
            const { ops, mean: mean2, rme: rme2, fastest, delta } = sum
            strictEqual(typeof ops, 'string', 'Summary contains a count of operations per second')
            if (hz < 500) {
              strictEqual(typeof mean2, 'string', 'Summary contains a mean')
            }
            strictEqual(typeof rme2, 'string', 'Summary contains mean a relative margin deviation')
            if (!fastest) {
              strictEqual(typeof delta, 'string', 'Summary contains a delta to the fastest test')
            }
            strictEqual(typeof times, 'object', 'A benchmark carries sample timings')
          }
        }
      }
      await checkFile(join(__dirname, 'output/results.log'))
      await checkFile(join(__dirname, 'output/results.txt'))
      await checkFile(join(__dirname, 'output/results.json'))
      await checkFile(join(__dirname, 'output/results.png'))
      await checkFile(join(__dirname, 'output/results.html'))
      await checkFile(join(__dirname, 'performance/A suite - String#match.json'))
    })
    .catch(error => fail(error))
})

test('takes error snapshots', async () => {
  await remove(join(__dirname, '/output/error.txt'))
  await remove(join(__dirname, '/output/error.log'))
  await remove(join(__dirname, '/output/error.png'))
  await remove(join(__dirname, '/output/error.html'))
  const canFirefox = process.platform === 'darwin' || process.platform === 'linux'
  return run({
    browser: canFirefox ? 'firefox' : 'chrome',
    url: 'test/example/missing.html',
    verbose: true,
    errorSnapshot: join(__dirname, '/output/error'),
    timeout: 5
  })
    .then(() => {
      fail({ message: 'Missing file was not reported.' })
    })
    .catch(async () => {
      ok('Missing file was reported.')
      await checkFile(join(__dirname, '/output/error.txt'))
      await checkFile(join(__dirname, '/output/error.log'))
      await checkFile(join(__dirname, '/output/error.png'))
      await checkFile(join(__dirname, '/output/error.png'))
    })
})
