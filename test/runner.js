/* global it */

const run = require('../lib/runner')
const { join } = require('path')
const { lstat, remove } = require('fs-extra')

function addTest (description, test) {
  if (typeof describe === 'function') {
    it(description, test)
  } else {
    exports[`test runner: ${description}`] = test
  }
}

async function checkFile (path) {
  const stats = await lstat(path)
  if (!stats.isFile()) {
    throw new Error(`No file found at "${path}".`)
  }
}

addTest('is the main export', assert => {
  const run2 = require('..')
  assert.equal(run, run2, 'Exported functions are the same')
})

addTest('returns proper results', async assert => {
  await remove(join(__dirname, '/output/results.log'))
  await remove(join(__dirname, '/output/results.txt'))
  await remove(join(__dirname, '/output/results.json'))
  await remove(join(__dirname, '/output/results.png'))
  await remove(join(__dirname, '/output/results.html'))
  return run({
    url: 'test/example/index.html',
    verbose: true,
    saveLog: join(__dirname, '/output/results.log'),
    saveText: join(__dirname, '/output/results.txt'),
    saveJson: join(__dirname, '/output/results.json'),
    saveImage: join(__dirname, '/output/results.png'),
    saveHtml: join(__dirname, '/output/results.html')
  })
    .then(async suites => {
      assert.ok(Array.isArray(suites), 'Results is an array of suites')
      for (let suiteIndex = 0; suiteIndex < suites.length; ++suiteIndex) {
        const suite = suites[suiteIndex]
        assert.equal(typeof suite, 'object', `The suite ${suiteIndex} is an object`)
        const { name, benchmarks } = suite
        assert.equal(typeof name, 'string', 'A suite has a name')
        assert.ok(Array.isArray(benchmarks), 'A suite contains an array of benchmarks')
        for (let benchIndex = 0; benchIndex < benchmarks.length; ++benchIndex) {
          const benchmark = benchmarks[benchIndex]
          assert.equal(typeof benchmark, 'object', `The benchmark ${benchIndex} is an object`)
          const { name, error, aborted, hz, stats, sum, times } = benchmark
          assert.equal(typeof name, 'string', 'A benchmark has a name')
          if (error) {
            assert.equal(aborted, true, 'A failed benchmark has been aborted')
            const { message, name, stack } = error
            assert.equal(typeof message, 'string', 'A failure contains a message')
            assert.equal(typeof name, 'string', 'A failure has a name')
            assert.equal(typeof stack, 'string', 'A failure has a stack trace')
          } else {
            assert.equal(aborted, false, 'A succeeded benchmark has not been aborted')
            assert.equal(typeof hz, 'number', 'A benchmark has a frequency')
            assert.equal(typeof stats, 'object', 'A benchmark carries stats')
            const { mean, rme } = stats
            assert.equal(typeof mean, 'number', 'Stats contain a mean')
            assert.equal(typeof rme, 'number', 'Stats contain a relative margin deviation')
            assert.equal(typeof sum, 'object', 'A benchmark carries a summary')
            const { ops, mean: mean2, rme: rme2, fastest, delta } = sum
            assert.equal(typeof ops, 'string', 'Summary contains a count of operations per second')
            if (hz < 500) {
              assert.equal(typeof mean2, 'string', 'Summary contains a mean')
            }
            assert.equal(typeof rme2, 'string', 'Summary contains mean a relative margin deviation')
            if (!fastest) {
              assert.equal(typeof delta, 'string', 'Summary contains a delta to the fastest test')
            }
            assert.equal(typeof times, 'object', 'A benchmark carries sample timings')
          }
        }
      }
      await checkFile(join(__dirname, '/output/results.log'))
      await checkFile(join(__dirname, '/output/results.txt'))
      await checkFile(join(__dirname, '/output/results.json'))
      await checkFile(join(__dirname, '/output/results.png'))
      await checkFile(join(__dirname, '/output/results.html'))
    })
    .catch(error => assert.fail(error))
})

addTest('takes error snapshots', async assert => {
  await remove(join(__dirname, '/output/error.log'))
  await remove(join(__dirname, '/output/error.png'))
  await remove(join(__dirname, '/output/error.html'))
  return run({
    url: 'test/example/missing.html',
    verbose: true,
    errorSnapshot: join(__dirname, '/output/error'),
    timeout: 5
  })
    .then(() => {
      assert.fail('Missing file was not reported.')
    })
    .catch(async () => {
      assert.pass('Missing file was reported.')
      await checkFile(join(__dirname, '/output/error.log'))
      await checkFile(join(__dirname, '/output/error.png'))
      await checkFile(join(__dirname, '/output/error.png'))
    })
})

if (require.main === module) {
  require('test')
    .run(exports)
}
