# Changes

# [3.0.0](https://github.com/prantlf/astrobench-cli/compare/v2.0.1...v3.0.0) (2024-01-06)

## Features

* Remove the executable parameter ([d7b6db4](https://github.com/prantlf/astrobench-cli/commit/d7b6db4a543d857c34efdb309bfc463bfe6cedd5))

# [2.0.1](https://github.com/prantlf/astrobench-cli/compare/v2.0.0...v2.0.1) (2021-07-09)

## BREAKING CHANGES

Require Node.js 10 or newer.

# [2.0.0](https://github.com/prantlf/astrobench-cli/compare/v1.8.1...v2.0.0) (2021-02-18)

## Chores

* Upgrade NPM dependencies ([bb19f34](https://github.com/prantlf/astrobench-cli/commit/bb19f34acc68bb4ec5e883d35f751ed50ee049cd))

# [1.8.1](https://github.com/prantlf/astrobench-cli/compare/v1.8.0...v1.8.1) (2020-02-20)

## Bug Fixes

* Enable maxAge caching ([57fd3ec](https://github.com/prantlf/astrobench-cli/commit/57fd3ece73ba3057bd1b2ddd64b728f98af779a3))

# [1.8.0](https://github.com/prantlf/astrobench-cli/compare/v1.7.0...v1.8.0) (2020-02-17)

### Bug Fixes

* Enable the coloured output by default only on TTY ([26df09a](https://github.com/prantlf/astrobench-cli/commit/26df09a8dc225935b96c04c925f4066a9254b78c))

### Features

* Add the --ignore-https-errors to force page loading nevertheless ([40b6499](https://github.com/prantlf/astrobench-cli/commit/40b649922115cb0784182a042d48da19f059284a))
* Add the --user-data parameter to set the user data (profile) directory ([ecbe38d](https://github.com/prantlf/astrobench-cli/commit/ecbe38deab6517efea198ff0a6e12a4e58e8a178))
* Add the --viewport parameter to set the default viewport ([22eefc0](https://github.com/prantlf/astrobench-cli/commit/22eefc0e63c8cbf36c004fc49f43e81fb4c9f840))
* Download Chromium automatically ([55a164c](https://github.com/prantlf/astrobench-cli/commit/55a164c12689f9ad7c00dad4090596ca83d25304))
* Improve the browser-downloading progressbar ([3f516cf](https://github.com/prantlf/astrobench-cli/commit/3f516cfa9e7894724c31ab3723670f53cd5594b6))
* Show progresbar when downloading the browser ([341597d](https://github.com/prantlf/astrobench-cli/commit/341597d249ce621048f2adbc53e4334fefa9a779))

# [1.7.0](https://github.com/prantlf/astrobench-cli/compare/v1.6.0...v1.7.0) (2020-02-15)

### Bug Fixes

* Save the error snapshot only in case of an error ([2aa2ca8](https://github.com/prantlf/astrobench-cli/commit/2aa2ca8a9169ee02e6aad7e7904c1cbf3a7debdc))

### Features

* Add the --output parameter setting all --save-* parameters ([7773110](https://github.com/prantlf/astrobench-cli/commit/7773110a0d1144505dc53256f1fcd56aaf29610a))
* Introduce the Runner class for more flexibility ([f6d45fe](https://github.com/prantlf/astrobench-cli/commit/f6d45fe97211c72c31b36ec4cc6cf9361dc03251))

## [1.6.0](https://github.com/prantlf/astrobench-cli/compare/v1.5.0...v1.6.0) (2020-02-14)

### Features

* Enable performance profiling to a directory by benchmark ([eec61e6](https://github.com/prantlf/astrobench-cli/commit/eec61e65118d89b33a274b91dff037988a1580b1))

## [1.5.0](https://github.com/prantlf/astrobench-cli/compare/v1.4.1...v1.5.0) (2020-02-08)

### Features

* Save log, png and html snapshots in case of failure ([18385ef](https://github.com/prantlf/astrobench-cli/commit/18385ef9ef4a3f36239c4a621f00a97d971a8831))
* Allow saving the console output to a file ([fd95666](https://github.com/prantlf/astrobench-cli/commit/fd956665fcee6756b2ffc20e44a68b58e16340d0))
* Check benchmark results against quality thresholds ([36dbbbf](https://github.com/prantlf/astrobench-cli/commit/36dbbbf941d1783413bf7f0b1c0ce56e009bf8a0))

## [1.4.1](https://github.com/prantlf/astrobench-cli/compare/v1.4.0...v1.4.1) (2020-02-07)

### Bug Fixes

* Correct type of shm and sandbox parameters ([12ee5b2](https://github.com/prantlf/astrobench-cli/commit/12ee5b296b036e858bdc5439cd69e3e84f33d7bc))

## [1.4.0](https://github.com/prantlf/astrobench-cli/compare/v1.3.3...v1.4.0) (2020-02-07)

### Features

* Allow specifying the browser executable path and disabling /dev/shm ([2a31f8b](https://github.com/prantlf/astrobench-cli/commit/2a31f8b87a638ee33b256a1fc0a577cf03097579))

## [1.3.3](https://github.com/prantlf/astrobench-cli/compare/v1.3.2...v1.3.3) (2020-02-07)

### Bug Fixes

* Move puppeteer-firefox to peer dependencies, as long as it does not support all platforms ([fcd9304](https://github.com/prantlf/astrobench-cli/commit/fcd9304bdd7e74b878165b9eb63071c5439bc7b7))

## [1.3.2](https://github.com/prantlf/astrobench-cli/compare/v1.3.1...v1.3.2) (2020-02-06)

### Bug Fixes

* Use Chrome as a default browser on the API level too ([34c9e94](https://github.com/prantlf/astrobench-cli/commit/34c9e947664733984eaa2eac6932daa24f3f9db5))
* Upgrade npm dependencies ([12a95c9](https://github.com/prantlf/astrobench-cli/commit/12a95c9b682a1bfd3da703087b478014996e121f))

## [1.3.1](https://github.com/prantlf/astrobench-cli/compare/v1.3.0...v1.3.1) (2020-02-03)

### Bug Fixes

* Print deviation even if comparison of benchmarks was disabled ([beb18e6](https://github.com/prantlf/astrobench-cli/commit/beb18e6f51d78e632aa237601857bd6fa74c9ccc))
* Upgrade npm dependencies ([efff519](https://github.com/prantlf/astrobench-cli/commit/efff5199b1cac67072fd0f9ffed60f0221e985d1))

## [1.3.0](https://github.com/prantlf/astrobench-cli/compare/v1.2.0...v1.3.0) (2020-02-02)

### Features

* Allow suppression of the default progress logging ([7823dc7](https://github.com/prantlf/astrobench-cli/commit/7823dc78e43e7126439e3fe57a21099bfeeae96f))
* Exclude stack frames from npm dependencies from mode_modules ([a396492](https://github.com/prantlf/astrobench-cli/commit/a3964927999214a64ca193e0a38903c6b2131b29))

## [1.2.0](https://github.com/prantlf/astrobench-cli/compare/v1.1.0...v1.2.0) (2020-02-02)

### Features

* Trim the origin of the local web server from error stack traces ([2fa5aae](https://github.com/prantlf/astrobench-cli/commit/2fa5aae4801f934d77c0e04b675f3283c775fc1e))

## [1.1.0](https://github.com/prantlf/astrobench-cli/compare/v1.0.2...v1.1.0) (2020-02-02)

### Features

* Allow suppressing browser console and network request logging ([cb1ea44](https://github.com/prantlf/astrobench/commit/cb1ea44524ae3cc153c4afd02e4fa522b277e94b))
* Save results and page snapshots if requested ([c8d0e0d](https://github.com/prantlf/astrobench/commit/c8d0e0d901033dafed2dd8cc1bddefa364e9cb4b))
* Recognise results that do not compare the fastest test to the others ([c0e4427](https://github.com/prantlf/astrobench/commit/c0e442730b3679fc34bf1938d5c5ce3869808338))

### Bug Fixes

* Upgrade the dependency on @prantlf/astrobench ([c23afd2](https://github.com/prantlf/astrobench/commit/c23afd262e69d1c0278c3f190a2c9d28a99d45c9))

## [1.0.2](https://github.com/prantlf/astrobench-cli/compare/v1.0.1...v1.0.2) (2020-01-31)

### Bug Fixes

* Move @prantlf/astrobench to devDependencies ([0cddea1](https://github.com/prantlf/astrobench/commit/0cddea1acdcc6b8d027d742b23e3eea303f8b8cc))

## [1.0.1](https://github.com/prantlf/astrobench-cli/compare/v1.0.0...v1.0.1) (2020-01-31)

### Bug Fixes

* Upgrade the dependency on @prantlf/astrobench ([780f15e](https://github.com/prantlf/astrobench/commit/780f15e1841c20d7425ace7b7c7216efa001d268))

## 1.0.0 (2020-01-31)

Initial release.
