[DEPRECATED] Mocha Flaky Test Finder
==================

This project has been deprecated in favour of: https://github.com/Dylanlan/mocha-bad-test-finder

Have some tests that decide to fail once every so often?

If so, this package might be for you!

This is a simple package to find flaky tests in a code repo.

It runs all tests in a specified directory multiple times,
and finds tests that fail sometimes.

Usage:
```
npm install -g mocha-flaky-test-finder
flaky-test-finder --dir=/some/test/directory
```

Options:
```
--dir: look for tests in this directory (default .)
--runs: number of times to execute tests (default 100)
```

Examples:
```
# Runs all tests in current directory 10 times
flaky-test-finder --runs=10

# Runs all tests in /some/test/directory, 200 times
flaky-test-finder --dir=/some/test/directory --runs=200
```

TODO:
* add some tests
* test on various repos
