/* global it */

const format = require('../lib/formatters/json')

function addTest (description, test) {
  if (typeof describe === 'function') {
    it(description, test)
  } else {
    exports[`test ${description}`] = test
  }
}

addTest('JSON formatter', assert => {
  const results = require('./results.json')
  const output = format(results)
  assert.equal(typeof output, 'string', 'Prints a string')
  const suites = JSON.parse(output)
  assert.deepEqual(results, suites, 'Parses back to the original input')
})

if (require.main === module) {
  require('test')
    .run(exports)
}
