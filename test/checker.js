/* global it */

const { tokenize } = require('@prantlf/jsonlint')
const { print } = require('@prantlf/jsonlint/lib/printer')
const check = require('../lib/checker')
const suites = require('./results.json')

function addTest (description, test) {
  if (typeof describe === 'function') {
    it(description, test)
  } else {
    exports[`test checker: ${description}`] = test
  }
}

function formatThresholds (thresholds) {
  const tokens = tokenize(JSON.stringify(thresholds), { rawTokens: true })
  return print(tokens, { indent: 0, stripObjectKeys: true }).replace(/\n/g, '')
}

function checkSuccess (assert, thresholds) {
  const description = formatThresholds(thresholds)
  try {
    check(suites, thresholds)
    assert.pass(`Check for ${description} passed.`)
  } catch (error) {
    console.error(error)
    assert.fail({ message: `Check for ${description} failed.` })
  }
}

function checkFailure (assert, thresholds) {
  const description = formatThresholds(thresholds)
  let failed
  try {
    check(suites, thresholds)
    failed = true
    assert.fail({ message: `Check for ${description} passed.` })
  } catch (error) {
    if (failed) {
      throw error
    }
    assert.pass(`Check for ${description} failed.`)
  }
}

addTest('passes if no threshold is specified', assert =>
  checkSuccess(assert, {}))

addTest('fails if an aborted test is not allowed', assert =>
  checkFailure(assert, { aborted: false }))

addTest('passes if all tests does reach the minimum hz', assert =>
  checkSuccess(assert, { hz: 200 }))

addTest('fails if a test does not reach the minimum hz', assert =>
  checkFailure(assert, { hz: 20000000 }))

addTest('passes if no test exceeds the maximum rme', assert =>
  checkSuccess(assert, { rme: 3 }))

addTest('fails if a test exceeds the maximum rme', assert =>
  checkFailure(assert, { rme: 2 }))

if (require.main === module) {
  require('test')
    .run(exports)
}
