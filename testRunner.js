'use strict';

const argv = require('minimist')(process.argv.slice(2));
const Mocha = require('mocha');
const fs = require('fs');
const path = require('path');
const _ = require('lodash');

const totalRuns = argv.runs || 100;
const testDir = argv.dir || '.';

const isTestFile = (fileName) => {
    return fileName && fileName.toLowerCase().endsWith('test.js') || fileName.toLowerCase().endsWith('spec.js');
};

const isDirectory = (path) => {
    return fs.existsSync(path) && fs.lstatSync(path).isDirectory();
};

if (!isDirectory(testDir)) {
    console.error(`${testDir} is not a directory`);
    process.exit(1);
}

const getTestFiles = (directory) => {
    const files = fs.readdirSync(directory);
    let testFiles = files.filter(f => isTestFile(f)).map(f => path.join(directory, f));
    const directories = files.filter(f => isDirectory(f) && !f.startsWith('.'));
    directories.forEach(dir => {
        const subFiles = getTestFiles(dir);
        testFiles = testFiles.concat(subFiles);
    });

    return testFiles;
};

const allTestFiles = getTestFiles(testDir);

let numRuns = 0;
const testFailures = {};

const resetTests = (mocha) => {
    mocha.suite.suites = [];
    allTestFiles.forEach(file => {
        delete require.cache[require.resolve(path.join(__dirname, file))];
    });
};

exports.runTests = (testFailures = {}) => {
    return new Promise((resolve, reject) => {
        let numRunFailures = 0;

        const mocha = new Mocha({
            reporter: function () {
                //avoid logs
            },
        });
        
        allTestFiles.forEach(function(file) {
            mocha.addFile(file);
        });

        if (numRuns > 0) {
            resetTests(mocha);
        } else {
            console.log(`Starting ${totalRuns} test runs...`);
        }

        return mocha.run()
            .on('fail', function(test, err) {
                const testKey = `${test.file} - ${test.title}`;
                const numFailures = _.get(testFailures, [testKey, 'numFailures'], 0);
                const testValue = {
                    test,
                    numFailures: numFailures + 1
                };
                testFailures[testKey] = testValue;
                numRunFailures++;
            })
            .on('end', function() {
                numRuns++;
                if (numRunFailures > 0) {
                    console.log(`Finished run ${numRuns}, number of test failures: ${numRunFailures}`);
                }

                if (numRuns < totalRuns) {
                    resolve(exports.runTests(testFailures));
                } else {
                    resolve(testFailures);
                }
            });
    });
};