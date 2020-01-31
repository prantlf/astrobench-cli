/* global suite, bench, beforeBench, text  */

suite('A suite', function () {
  bench('String#match', () =>
    !!'Hello world'.match(/o/)
  )

  bench('RegExp#test', () =>
    !!/o/.test('Hello world')
  )
})

suite('B suite', suite => {
  beforeBench(() => {
    suite.text = 'Hello world'
  })

  bench('Benchmark with error', () =>
    !!text.match(/o/)
  )

  bench('Deferred benchmark', deferred => {
    const result = !!/o/.test(suite.text)

    setTimeout(function () {
      deferred.resolve(result)
    }, 1)
  }, { defer: true })
})
