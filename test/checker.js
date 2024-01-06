const test = require('test')
const { fail, ok } = require('assert')
const { tokenize } = require('@prantlf/jsonlint')
const { print } = require('@prantlf/jsonlint/lib/printer')
const check = require('../lib/checker')
const suites = require('./results.json')

function formatThresholds (thresholds) {
  const tokens = tokenize(JSON.stringify(thresholds), { rawTokens: true })
  return print(tokens, { indent: 0, stripObjectKeys: true }).replace(/\n/g, '')
}

function checkSuccess (thresholds) {
  const description = formatThresholds(thresholds)
  try {
    check(suites, thresholds)
    ok(`Check for ${description} passed.`)
  /* node:coverage ignore next 4 */
  } catch (error) {
    console.error(error)
    fail({ message: `Check for ${description} failed.` })
  }
}

function checkFailure (thresholds) {
  const description = formatThresholds(thresholds)
  let failed
  try {
    check(suites, thresholds)
    failed = true
    fail({ message: `Check for ${description} passed.` })
  } catch (error) {
    /* node:coverage ignore next 3 */
    if (failed) {
      throw error
    }
    ok(`Check for ${description} failed.`)
  }
}

test('passes if no threshold is specified', () =>
  checkSuccess({}))

test('fails if an aborted test is not allowed', () =>
  checkFailure({ aborted: false }))

test('passes if all tests does reach the minimum hz', () =>
  checkSuccess({ hz: 200 }))

test('fails if a test does not reach the minimum hz', () =>
  checkFailure({ hz: 20000000 }))

test('passes if no test exceeds the maximum mean', () =>
  checkSuccess({ mean: 1 }))

test('fails if a test exceeds the maximum mean', () =>
  checkFailure({ mean: 1e-9 }))

test('passes if no test exceeds the maximum rme', () =>
  checkSuccess({ rme: 3 }))

test('fails if a test exceeds the maximum rme', () =>
  checkFailure({ rme: 2 }))

test('passes if no test exceeds the maximum moe', () =>
  checkSuccess({ moe: 2e-9 }))

test('fails if a test exceeds the maximum moe', () =>
  checkFailure({ moe: 1.5e-9 }))

test('passes if no test exceeds the maximum sem', () =>
  checkSuccess({ sem: 2e-9 }))

test('fails if a test exceeds the maximum sem', () =>
  checkFailure({ sem: 1e-9 }))

test('passes if no test exceeds the maximum deviation', () =>
  checkSuccess({ deviation: 8e-9 }))

test('fails if a test exceeds the maximum deviation', () =>
  checkFailure({ deviation: 4e-9 }))

test('passes if no test exceeds the maximum variance', () =>
  checkSuccess({ variance: 6e-17 }))

test('fails if a test exceeds the maximum variance', () =>
  checkFailure({ variance: 2e-17 }))
