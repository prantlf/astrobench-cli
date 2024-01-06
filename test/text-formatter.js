const test = require('test')
const { ok } = require('assert')
const format = require('../lib/formatters/text')

test('text formatter', () => {
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
  ok(pattern.test(output), 'Formatted text matches the expected one')
})
