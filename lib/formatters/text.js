const { Instance: Chalk } = require('chalk')

function format (suites, { color, verbose } = {}) {
  const chalk = new Chalk(color !== false ? undefined : { level: 0 })
  return suites
    .map(({ name, benchmarks }) => {
      const content = benchmarks
        .map(({ name, error, aborted, sum }) => {
          let content
          let color
          if (error) {
            content = `failed: ${verbose ? error.stack : error.message}`
            color = chalk.red
          } else if (aborted) {
            content = 'aborted'
            color = chalk.magenta
          } else {
            const { ops, mean, rme, delta, fastest } = sum
            content = `finished: ${ops} ops/sec`
            if (mean) {
              content += ` ${mean}ms`
            }
            content += ` ±${rme}%`
            color = chalk.cyan
            if (fastest || delta) {
              if (fastest) {
                content += ' (fastest)'
                color = chalk.green
              } else {
                content += ` (${delta}% slower)`
              }
            }
          }
          return color(`  ${name.trim()} ${content}`)
        })
        .join('\n')
      return chalk.yellow(`${name.trim()}\n${content}`)
    })
    .join('\n')
}

module.exports = format
