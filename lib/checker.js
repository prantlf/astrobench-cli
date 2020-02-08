function check (suites, thresholds) {
  const {
    aborted,
    hz,
    deviation,
    mean,
    moe,
    rme,
    sem,
    variance
  } = thresholds
  for (const suite of suites) {
    for (const benchmark of suite.benchmarks) {
      if (benchmark.aborted) {
        if (aborted === false) {
          fail(suite, benchmark, 'Benchmark aborted.')
        }
      } else {
        if (benchmark.hz < hz) {
          fail(suite, benchmark,
            `Minimum allowed operations per second not reached: ${benchmark.hz}.`)
        }
        const { stats } = benchmark
        if (stats.deviation > deviation) {
          fail(suite, benchmark,
            `Maximum allowed standard deviation exceeded: ${stats.deviation}.`)
        }
        if (stats.mean > mean) {
          fail(suite, benchmark,
            `Maximum allowed arithmetic mean exceeded: ${stats.mean}.`)
        }
        if (stats.moe > moe) {
          fail(suite, benchmark,
            `Maximum allowed maximum allowed margin of error exceeded: ${stats.variamoence}.`)
        }
        if (stats.rme > rme) {
          fail(suite, benchmark,
            `Maximum allowed relative margin of error exceeded: ${stats.rme}%.`)
        }
        if (stats.sem > sem) {
          fail(suite, benchmark,
            `Maximum allowed standard error of the mean exceeded: ${stats.sem}.`)
        }
        if (stats.variance > variance) {
          fail(suite, benchmark,
            `Maximum allowed variance exceeded: ${stats.variance}.`)
        }
      }
    }
  }
}

function fail (
  { name: suiteName },
  { name: benchmarkName },
  message
) {
  const error = new Error(message)
  error.suite = suiteName
  error.benchmark = benchmarkName
  throw error
}

module.exports = check
