# astrobench-cli
[![NPM version](https://badge.fury.io/js/astrobench-cli.png)](http://badge.fury.io/js/astrobench-cli)
[![Build Status](https://travis-ci.org/prantlf/astrobench-cli.png)](https://travis-ci.org/prantlf/astrobench-cli)
[![codecov](https://codecov.io/gh/prantlf/astrobench-cli/branch/master/graph/badge.svg)](https://codecov.io/gh/prantlf/astrobench-cli)
[![Dependency Status](https://david-dm.org/prantlf/astrobench-cli.svg)](https://david-dm.org/prantlf/astrobench-cli)
[![devDependency Status](https://david-dm.org/prantlf/astrobench-cli/dev-status.svg)](https://david-dm.org/prantlf/astrobench-cli#info=devDependencies)

[![NPM Downloads](https://nodei.co/npm/astrobench-cli.png?downloads=true&stars=true)](https://www.npmjs.com/package/astrobench-cli)

Runs benchmarks on web pages written with [@prantlf/astrobench] from the command line using [Puppeteer].

## Getting Started

Make sure that you have [NodeJS] >= 8 installed. Install `astrobench-cli` globally:

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
  -S, --no-sandbox         pass --no-sandbox to Puppeteer
  -t, --timeout <number>   benchmark execution timeout [s] (default: 60)
  -f, --format <type>      printed results format (default: "text")
  -e, --save-text <file>   save results as text
  -j, --save-json <file>   save results as JSON
  -i, --save-image <file>  save PNG screenshot of the page
  -m, --save-html <file>   save HTML markup of the page
  -C, --no-color           suppress color output
  -L, --no-console         suppress browser console logging
  -N, --no-network         suppress network request logging
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

Make sure that you have [NodeJS] >= 8 installed. Install `astrobench-cli` locally in your project  with [npm] or [yarn]:

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

The main module exports a function which runs a web page with benchmarks. Supported properties in the `options` parameter correspond with the command-line argument names in the [shell-script source].

The function returns a [Promise] to an array of objects with results of benchmark suites.

### format(suites: array, options: object): string

Modules `astrobench-cli/lib/formatters/text` and `astrobench-cli/lib/formatters/json` export a function which formats benchmark results to a string. Either to a readable text suitable for printing on the console, or to a JSON text for passing further to machine-processing tools.

## Contributing

In lieu of a formal styleguide, take care to maintain the existing coding
style.  Add unit tests for any new or changed functionality. Lint and test
your code using Grunt.

## License

Copyright (c) 2020 Ferdinand Prantl

Licensed under the MIT license.

[@prantlf/astrobench]: http://prantlf.github.com/astrobench/
[benchmark.js]: https://benchmarkjs.com/
[Puppeteer]: https://pptr.dev/
[NodeJS]: http://nodejs.org/
[npm]: https://www.npmjs.org/
[yarn]: https://yarnpkg.com/
[shell-script source]: bin/astrobench
[Promise]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
