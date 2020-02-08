# astrobench-cli
[![NPM version](https://badge.fury.io/js/astrobench-cli.png)](http://badge.fury.io/js/astrobench-cli)
[![Build Status](https://travis-ci.org/prantlf/astrobench-cli.png)](https://travis-ci.org/prantlf/astrobench-cli)
[![codecov](https://codecov.io/gh/prantlf/astrobench-cli/branch/master/graph/badge.svg)](https://codecov.io/gh/prantlf/astrobench-cli)
[![Dependency Status](https://david-dm.org/prantlf/astrobench-cli.svg)](https://david-dm.org/prantlf/astrobench-cli)
[![devDependency Status](https://david-dm.org/prantlf/astrobench-cli/dev-status.svg)](https://david-dm.org/prantlf/astrobench-cli#info=devDependencies)

[![NPM Downloads](https://nodei.co/npm/astrobench-cli.png?downloads=true&stars=true)](https://www.npmjs.com/package/astrobench-cli)

Runs benchmarks on web pages written with [@prantlf/astrobench] from the command line using [Puppeteer].

![astrobench-cli usage screencast](doc/astrobench-example.gif)

## Getting Started

Make sure that you have [Node.js] >= 8 installed. Install `astrobench-cli` globally:

```
npm i -g astrobench-cli
```

Test the performance with a HTML page written with [@prantlf/astrobench]:

```
$ astrobench test/example/index.html

A suite
  String#match finished: 22,319,217 ops/sec ±1.28% (44.44% slower)
  RegExp#test finished: 40,172,294 ops/sec ±1.62% (fastest)
B suite
  Benchmark with error failed: text is not defined
  Deferred benchmark finished: 206 ops/sec 4.9ms ±0.42% (fastest)
```

### Synopsis of A Testing Page

```html
<link rel="stylesheet"
      href="https://unpkg.com/@prantlf/astrobench@1.1.0/dist/astrobench.min.css">
<script src="https://unpkg.com/@prantlf/astrobench@1.1.0/dist/astrobench.min.js"></script>

<div id="astrobench"></div>

<script>
  suite('A suite', suite => {
    const text = 'Hello world'
    bench('Validate greeting by regular expression', () => text.match(/^H/))
    bench('Validate greeting by comparison', () => text[0] === 'H')
  })
</script>
```

## Command-Line Usage

The `astrobench` script prints results formatted as it is typical for the results of tests written with [benchmark.js]. If running the benchmarks fails, exit code 1 will be returned to the caller.

```
$ astrobench --help

Usage: astrobench [options] <URL>

Options:
  -V, --version            output the version number
  -b, --browser <name>     web browser to launch (default: "chrome")
  -d, --directory <path>   root directory to serve from (default: ".")
  -p, --port <number>      port for the web server to listen to (default: 0)
  -H, --no-headless        show the browser window during the run
  -S, --no-sandbox         pass `--no-sandbox` to Puppeteer
  -M, --no-shm             pass `--disable-dev-shm-usage` to Puppeteer
  -x, --executable <path>  set the path to the browser executable
  -t, --timeout <number>   benchmark execution timeout [s] (default: 60)
  -f, --format <type>      printed results format (default: "text")
  -e, --save-text <file>   save results as text
  -j, --save-json <file>   save results as JSON
  -i, --save-image <file>  save PNG screenshot of the page
  -m, --save-html <file>   save HTML markup of the page
  -C, --no-color           suppress color output
  -L, --no-console         suppress browser console logging
  -N, --no-network         suppress network request logging
  -P, --no-progress        suppress detailed progress logging
  -q, --quiet              do not print the test results
  -v, --verbose            print progress of the tests
  -h, --help               output usage information

 Available browsers are "chrome" and "firefox".
 Available formats are "text" and "json".

Examples:

 $ astrobench -vLN examples/index.html
 $ astrobench -OS -f json http://localhost:8080/test.html
```

## Programmatic Usage

Make sure that you have [Node.js] >= 8 installed. Install `astrobench-cli` locally in your project  with [npm] or [yarn]:

```
npm i astrobench-cli
yarn add astrobench-cli
```

Execute all suites and print their results as text:

```js
const run = require('astrobench-cli')
const format = require('astrobench-cli/lib/formatters/text')
const results = await run({ url: 'example/index.html' })
console.log(format(results))
```

### run(options: object): Promise

The main module exports a function which runs a web page with benchmarks and returns a [Promise] to an array of objects with results of benchmark suites. Recognised options:

* `browser: string` - web browser to launch (default: `'chrome'`)
* `directory: string` - root directory to serve from (default: `'.'`)
* `port: string` - port for the web server to listen to (default: `0`)
* `headless: boolean` - can show the browser window during the run (default: `true`)
* `sandbox: boolean` - pass `--no-sandbox` to Puppeteer (default: `false`)
* `shm: boolean` - pass `--disable-dev-shm-usage` to Puppeteer (default: `false`)
* `executable: string` - set the path to the browser executable
* `timeout: string` - benchmark execution timeout [s] (default: `60`)
* `format: string` - printed results format (default: `'text'`)
* `saveText: string` - save results as text to the specified file path
* `saveJson: string` - save results as JSON to the specified file path
* `saveImage: string` - save PNG screenshot of the page to the specified file path
* `saveHtml: string` - save HTML markup of the page to the specified file path
* `color: boolean` - can suppress color output (default: `true`)
* `quiet: boolean` - can suppress printing the test results (default: `false`)
* `verbose: boolean|object` - print progress of the tests (default: `false`)

Available browsers are `'chrome'` and `'firefox'`. Available formats are `'text'` and `'json'`.

The `verbose` output on the console can be enabled either by `true` or by an object with following properties, which can suppress some output:

* `console: boolean` - can suppress browser console logging (default: `true`)
* `network: boolean` - can suppress network request logging (default: `true`)
* `progress: boolean` - can suppress detailed progress logging (default: `true`)

An example of the test results. Benchmark properties `aborted`, `error`, `hz`, `stats` and `times` are described in the [Benchmark.js documentation]:

```json
[
  {
    "name": "A suite",
    "benchmarks": [
      {
        "name": "String#match",
        "aborted": false,
        "hz": 21672040.42791444,
        "stats": {
          "moe": 5.954327080006653e-10,
          "rme": 1.394724557215958,
          "sem": 3.0379219795952314e-10,
          "deviation": 2.411275818127806e-9,
          "mean": 4.2691777736331135e-8,
          "sample": [
            4.124457928386555e-8,
            ...
          ],
          "variance": 5.8142510710879216e-18
        },
        "times": {
          "cycle": 0.08077886301779932,
          "elapsed": 6.148,
          "period": 4.2691777736331135e-8,
          "timeStamp": 1580598679963
        },
        "sum": {
          "ops": "20,315,409",
          "rme": "2.35",
          "delta": "41.18"
        }
      },
      {
        "name": "RegExp#test",
        ...,
        "sum": {
          "ops": "34,536,901",
          "rme": "2.65",
          "fastest": true
        }
      },
      {
        "name": "Benchmark with error",
        "error": {
          "message": "text is not defined",
          "name": "ReferenceError",
          "stack": "@test/example/bench.js:19:6
            Benchmark.uid1580598679888createFunction@test/example/index.html:3:124"
        },
        "aborted": true
      }
    ]
  }
]
```

### format(suites: array, options: object): string

Modules `astrobench-cli/lib/formatters/text` and `astrobench-cli/lib/formatters/json` export a function which formats benchmark results to a string. Either to a readable text suitable for printing on the console, or to a JSON text for passing further to machine-processing tools. Recognised options:

* `color: boolean` - can disable color output, if the formatter supports it (default: `true`)
* `verbose: boolean` - add stack trace to failed benchmarks (default: `false`)

## Contributing

In lieu of a formal styleguide, take care to maintain the existing coding
style.  Add unit tests for any new or changed functionality. Lint and test
your code using Grunt.

## Docker Specifics

If you run the benchmarks in Docker (actually, [Puppeteer in Docker]), you either do it under a non-root user, or pass the parameter `sandbox:true` if you run the tests as `root`. If you base your image on [Alpine Linux], launch Chromium from the distribution instead of the version bundled with Puppeteer. For example:

```txt
apk add chromium
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true npm ci
astrobench -vS -x /usr/bin/chromium-browser -j results.json test.html
```

Or programmatically:

```js
const run = require('astrobench-cli')
const results = await run({
  url: 'test.html',
  saveJson: 'results.json',
  executable: '/usr/bin/chromium-browser
  sandbox: false,
  verbose: true
})
```

## License

Copyright (c) 2020 Ferdinand Prantl

Licensed under the MIT license.

[@prantlf/astrobench]: http://prantlf.github.com/astrobench/
[benchmark.js]: https://benchmarkjs.com/
[Puppeteer]: https://pptr.dev/
[Node.js]: http://nodejs.org/
[npm]: https://www.npmjs.org/
[yarn]: https://yarnpkg.com/
[Promise]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
[Benchmark.js documentation]: https://benchmarkjs.com/docs
[Puppeteer in Docker]: https://github.com/puppeteer/puppeteer/blob/master/docs/troubleshooting.md#running-puppeteer-in-docker
[Alpine Linux]: https://alpinelinux.org/
