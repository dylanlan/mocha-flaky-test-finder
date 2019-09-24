#!/usr/bin/env node
'use strict';

const _ = require('lodash');
const argv = require('minimist')(process.argv.slice(2));
const { findFlakyTests } = require('./testRunner');

const totalRuns = argv.runs || 100;
const testDir = argv.dir || '.';

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
