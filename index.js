'use strict';

const _ = require('lodash');
const { runTests } = require('./testRunner');

return runTests().then(testFailures => {
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
