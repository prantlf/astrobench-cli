const { createColors } = require('colorette')

function format (suites, { color, verbose } = {}) {
  const { cyan, green, magenta, red, yellow } = createColors({ useColor: color !== false })
  return suites
    .map(({ name, benchmarks }) => {
      const content = benchmarks
        .map(({ name, error, aborted, sum }) => {
          let content
          let color
          if (error) {
            content = `failed: ${verbose ? error.stack : error.message}`
            color = red
          } else if (aborted) {
            content = 'aborted'
            color = magenta
          } else {
            const { ops, mean, rme, delta, fastest } = sum
            content = `finished: ${ops} ops/sec`
            if (mean) {
              content += ` ${mean}ms`
            }
            content += ` ±${rme}%`
            color = cyan
            if (fastest || delta) {
              if (fastest) {
                content += ' (fastest)'
                color = green
              } else {
                content += ` (${delta}% slower)`
              }
            }
          }
          return color(`  ${name.trim()} ${content}`)
        })
        .join('\n')
      return yellow(`${name.trim()}\n${content}`)
    })
    .join('\n')
}

module.exports = format
