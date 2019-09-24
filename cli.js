#!/usr/bin/env node
'use strict';

const _ = require('lodash');
const argv = require('minimist')(process.argv.slice(2));
const { findFlakyTests } = require('./testRunner');

const totalRuns = argv.runs || 100;
const testDir = argv.dir || '.';
const help = argv.help;

if (help) {
    console.log(`usage: flaky-test-finder [...options]`);
    console.log(`\noptions:`);
    console.log('--dir: run tests in this directory')
    console.log('--runs: number of test runs to do');
    console.log('\nexample: flaky-test-finder --dir=/some/test/directory --runs=50')
    process.exit(0);
}

return findFlakyTests(testDir, totalRuns).then(testFailures => {
    console.log('Finished all runs!');
    if (Object.keys(testFailures).length) {
        console.log('Tests that failed:');
        _.each(testFailures, (value, key) => {
            console.log(`${key}, failures: ${value.numFailures}`);
        });
    } else {
        console.log('No failures!');
    }
});
