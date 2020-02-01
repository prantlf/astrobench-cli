/* global it */

const run = require('../lib/runner')

function addTest (description, test) {
  if (typeof describe === 'function') {
    it(description, test)
  } else {
    exports[`test runner: ${description}`] = test
  }
}

addTest('is the main export', assert => {
  const run2 = require('..')
  assert.equal(run, run2, 'Exported functions are the same')
})

addTest('returns proper results', assert =>
  run({ url: 'test/example/index.html' })
    .then(suites => {
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
    })
    .catch(error => console.error(error)))

if (require.main === module) {
  require('test')
    .run(exports)
}
