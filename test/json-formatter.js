const test = require('test')
const { deepStrictEqual, strictEqual } = require('assert')
const format = require('../lib/formatters/json')

test('JSON formatter', () => {
  const results = require('./results.json')
  const output = format(results)
  strictEqual(typeof output, 'string', 'Prints a string')
  const suites = JSON.parse(output)
  deepStrictEqual(results, suites, 'Parses back to the original input')
})
