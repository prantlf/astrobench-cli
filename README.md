# astrobench-cli

[![Latest version](https://img.shields.io/npm/v/astrobench-cli)
 ![Dependency status](https://img.shields.io/librariesio/release/npm/astrobench-cli)
](https://www.npmjs.com/package/astrobench-cli)

Runs benchmarks on web pages written with [@prantlf/astrobench] from the command line using [Puppeteer]. If you want to generate timeline or comparison charts from the performance results, see [benchart].

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

If you want to delay downloading of Chromium to the first test run, or if you want to use your own Chromium installation, set the `PUPPETEER_SKIP_CHROMIUM_DOWNLOAD` environment variable to `true` when you install `astrobench-cli`. You can use [other environment variables] too.

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

The `astrobench` script prints results formatted as it is typical for the results of tests written with [Benchmark.js]. If running the benchmarks fails, exit code 1 will be returned to the caller. If a result threshold is not matched, exit code 2 will be returned to the caller.

```
$ astrobench --help

Usage: astrobench [options] <URL>

Options:
  -V, --version                output the version number
  -b, --browser <name>         web browser to launch (default: "chrome")
  -d, --directory <path>       root directory to serve from (default: ".")
  -p, --port <number>          port for the server to listen to (default: 0)
  -H, --no-headless            show the browser window during the run
  -S, --no-sandbox             pass `--no-sandbox` to Puppeteer
  -M, --no-shm                 pass `--disable-dev-shm-usage` to Puppeteer
  --ignore-https-errors        force page loading despite of HTTPS errors
  -w, --viewport <size>        sets the default viewport (default: 1024x678)
  -a, --user-data <path>       set the user (profile) data directory
  -t, --timeout <number>       benchmark execution timeout [s] (default: 60)
  -f, --format <type>          printed results format (default: "text")
  -u, --output <path>          save all five result artefacts (--save-*)
  -e, --save-text <file>       save results as text
  -j, --save-json <file>       save results as JSON
  -i, --save-image <file>      save PNG screenshot of the page
  -m, --save-html <file>       save HTML markup of the page
  -l, --save-log <file>        save a dump of the console
  -o, --performance <path>     save performance profiles to a directory
  -r, --error-snapshot <path>  save LOG, HTML and PNG snapshots on failure
  -C, --no-color               suppress color output
  -L, --no-console             suppress browser console logging
  -N, --no-network             suppress network request logging
  -P, --no-progress            suppress detailed progress logging
  -q, --quiet                  do not print the test results
  -v, --verbose                print progress of the tests
  --no-aborted                 no benchmark allowed to abort
  --min-hz                     minimum allowed frequency [ops/sec]
  --max-deviation              maximum allowed standard deviation
  --max-mean                   maximum allowed arithmetic mean [s]
  --max-moe                    maximum allowed margin of error
  --max-rme                    maximum allowed relative margin of error [%]
  --max-sem                    standard error of the mean
  --max-variance               maximum allowed variance
  -h, --help                   output usage information

 Available browsers are "chrome" and "firefox".
 Available formats are "text" and "json".

Examples:

 $ astrobench -vLN --no-aborted test/index.html
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
const check = require('astrobench-cli/lib/checker')
const format = require('astrobench-cli/lib/formatters/text')

const suites = await run({ url: 'test/index.html' })
console.log(format(suites))
check(suites, {
  aborted: false, // no aborted test
  hz: 100,        // minimum ops/sec
  rme: 3          // maximum relative margin of error
})
```

### run(options: object): Promise

The main module exports a function which runs a web page with benchmarks and returns a [Promise] to an array of objects with results of benchmark suites. See also the [`Runner`] class below.

Recognised options:

* `browser: string` - web browser to launch (default: `'chrome'`)
* `directory: string` - root directory to serve from (default: `'.'`)
* `port: string` - port for the web server to listen to (default: `0`)
* `headless: boolean` - can show the browser window during the run (default: `true`)
* `sandbox: boolean` - pass `--no-sandbox` to Puppeteer (default: `false`)
* `shm: boolean` - pass `--disable-dev-shm-usage` to Puppeteer (default: `false`)
* `ignoreHTTPSErrors: boolean` - force page loading despite of HTTPS errors
* `viewport: object` - sets the default viewport (default: `{ width: 1024, height: 768 }`)
* `userData: string` - set the user (profile) data directory
* `timeout: string` - benchmark execution timeout [s] (default: `60`)
* `format: string` - printed results format (default: `'text'`)
* `output: string` = save all five result artefacts (`--save-*`) to the specified file path prefix with file extensions `.txt`, `.json`, `.png`, `.html` and `.log`
* `saveText: string` - save results as text to the specified file path
* `saveJson: string` - save results as JSON to the specified file path
* `saveImage: string` - save PNG screenshot of the page to the specified file path
* `saveHtml: string` - save HTML markup of the page to the specified file path
* `saveLog: string` - save a dump of the console to the specified file path
* `performance: string` - save performance profiles to the specified directory
* `errorSnapshot: string` - save LOG, HTML and PNG snapshots on failure to the specified file path prefix; file extensions `.log`, `.png` and `.html` will be appended automatically
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

### class Runner

Instead of calling the [`run`] method, you can can construct an instance of the `Runner` class, call its methods and access its properties among the calls. The named parameter names below have the same meaning as described for the [`run`] method above. This is basically what the [example above] does using the [`run`] method with default parameters:

```js
const { Runner } = require('astrobench-cli')
const check = require('astrobench-cli/lib/checker')
const format = require('astrobench-cli/lib/formatters/text')

const runner = new Runner({ color: true, verbose: false })
try {
  await this.startServer({ directory: '.', port: 0 })
  const port = this.server.address().port
  const url = `http://localhost:${port}/test/index.html`
  await runner.launchBrowser({
    browser: 'chrome', headless: true, sandbox: false, shm: true,
    ignoreHTTPSErrors: false, viewport: { width: 1024, height: 768 }
  })
  await runner.openPage()
  await runner.navigateTo({ url })
  await runner.runTests({ timeout: 60 })
  await runner.watchProgress({ timeout: 60, performance: 'performance' })
  const results = await runner.computeResults()
  await runner.saveResults({ results, output: 'output/results' })
  console.log(format(results))
  check(results, {
    aborted: false, // no aborted test
    hz: 100,        // minimum ops/sec
    rme: 3          // maximum relative margin of error
  })
} catch (error) {
  await runner.saveError({ error, path: 'output/error' })
} finally {
  await runner.exitBrowser()
  await runner.stopServer()
}
```

Starting and stopping the HTTP server is optional. You will want to do it, if your testing page is located in the local file system.

If you want to test multiple pages and always start on a new page, use `closePage` and `openPage` methods, before you navigate to the new URL. The console log (the `log` property) will be reset when you do it.

Properties of an instance of the `Runner` class:

* `server: object` - points to an instance of [`connect`] if `startServer` was called
* `browser: object` - points to an instance of [`Browser`] after `launchBrowser` was called
* `page: object` - points to an instance of [`Page`] after `openPage` was called
* `log: string` - the immediate content of the browser console

### format(suites: array, options?: object): string

Modules `astrobench-cli/lib/formatters/text` and `astrobench-cli/lib/formatters/json` export a function which formats benchmark results to a string. Either to a readable text suitable for printing on the console, or to a JSON text for passing further to machine-processing tools.

Recognised options:

* `color: boolean` - can disable color output, if the formatter supports it (default: `true`)
* `verbose: boolean` - add stack trace to failed benchmarks (default: `false`)

### check(suites: array, thresholds: object): void

Module `astrobench-cli/lib/checker` exports a function which checks benchmark results against specified thresholds. If some fail, the function throws an error.

Supported thresholds:

* `aborted: boolean` - allow aborted benchmarks (default: `true`)
* `min-hz: number` - minimum allowed frequency [ops/sec]
* `max-deviation: number` - maximum allowed standard deviation
* `max-mean: number` - maximum allowed arithmetic mean [s]
* `max-moe: number` - maximum allowed margin of error
* `max-rme: number` - maximum allowed relative margin of error [%]
* `max-sem: number` - standard error of the mean
* `max-variance: number` - maximum allowed variance

## Firefox

[Firefox support is experimental] and the browser binaries are not available for oll operating systems. If you [work on Linux or OSX], you can install `puppeteer-firefox` as a peer-dependency of `astrobench-cli`:

```
npm i -g astrobench-cli puppeteer-firefox
astrobench -b firefox test/index.html
```

## Docker Specifics

If you run the benchmarks in Docker (actually, [Puppeteer in Docker]), you either do it under a non-root user, or pass the parameter `sandbox:true` if you run the tests as `root`. If you base your image on [Alpine Linux], launch Chromium from the distribution instead of the version bundled with Puppeteer. For example, for [Alpine Linux]:

```
apk add chromium
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true npm ci
PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser astrobench -vS  -j results.json test.html
```

Or programmatically:

```js
const run = require('astrobench-cli')
process.env.PUPPETEER_EXECUTABLE_PATH = '/usr/bin/chromium-browser'
const results = await run({
  url: 'test.html',
  saveJson: 'results.json',
  sandbox: false,
  verbose: true
})
```

## Contributing

In lieu of a formal styleguide, take care to maintain the existing coding
style.  Add unit tests for any new or changed functionality. Lint and test
your code using `npm`.

## License

Copyright (c) 2020-2024 Ferdinand Prantl

Licensed under the MIT license.

[@prantlf/astrobench]: https://prantlf.github.io/astrobench/
[benchart]: http://github.com/prantlf/benchart
[Benchmark.js]: https://benchmarkjs.com/
[Puppeteer]: https://pptr.dev/
[Node.js]: http://nodejs.org/
[npm]: https://www.npmjs.org/
[yarn]: https://yarnpkg.com/
[Promise]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
[Benchmark.js documentation]: https://benchmarkjs.com/docs
[Puppeteer in Docker]: https://github.com/puppeteer/puppeteer/blob/master/docs/troubleshooting.md#running-puppeteer-in-docker
[Alpine Linux]: https://alpinelinux.org/
[Firefox support is experimental]: https://github.com/puppeteer/puppeteer/tree/master/experimental/puppeteer-firefox#prototype-puppeteer-for-firefox
[work on Linux or OSX]: https://github.com/puppeteer/juggler/releases
[`Runner`]: #class-runner
[example above]: #programmatic-usage
[`run`]: #runoptions-object-promise
[`connect`]: https://github.com/senchalabs/connect#readme
[`Browser`]: https://github.com/puppeteer/puppeteer/blob/master/docs/api.md#class-browser
[`Page`]: https://github.com/puppeteer/puppeteer/blob/master/docs/api.md#class-page
[Alpine Linux]: https://alpinelinux.org/
[other environment variables]: https://github.com/puppeteer/puppeteer/blob/master/docs/api.md#environment-variables
