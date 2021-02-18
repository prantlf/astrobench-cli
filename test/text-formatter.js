/* global it */

const format = require('../lib/formatters/text')

function addTest (description, test) {
  if (typeof describe === 'function') {
    it(description, test)
  } else {
    exports[`test ${description}`] = test
  }
}

addTest('text formatter', assert => {
  const results = require('./results.json')
  const output = format(results, { color: false })
  // eslint-disable-next-line prefer-regex-literals
  const pattern = new RegExp(`A suite
  String#match finished: [.,0-9]+ ops\\/sec ±[.,0-9]+% \\([.,0-9]+% slower\\)
  RegExp#test finished: [.,0-9]+ ops\\/sec ±[.,0-9]+% \\(fastest\\)
B suite
  Benchmark with error failed: text is not defined
  Aborted benchmark aborted
  Deferred benchmark finished: [.,0-9]+ ops/sec [.,0-9]+ms ±[.,0-9]+% \\(fastest\\)`)
  assert.ok(pattern.test(output), 'Formatted text matches the expected one')
})

if (require.main === module) {
  require('test')
    .run(exports)
}
