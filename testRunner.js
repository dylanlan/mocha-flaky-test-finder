'use strict';

const Mocha = require('mocha');
const fs = require('fs');
const path = require('path');
const _ = require('lodash');

const isTestFile = (fileName) => {
    return fileName && fileName.toLowerCase().endsWith('test.js') || fileName.toLowerCase().endsWith('spec.js');
};

const isDirectory = (path) => {
    return fs.existsSync(path) && fs.lstatSync(path).isDirectory();
};

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

const resetTests = (mocha, allTestFiles) => {
    mocha.suite.suites = [];
    allTestFiles.forEach(file => {
        delete require.cache[require.resolve(path.join(__dirname, file))];
    });
};

const runTests = (allTestFiles, currentRun, totalRuns, testFailures = {}) => {
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

        if (currentRun > 0) {
            resetTests(mocha, allTestFiles);
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
                currentRun++;
                if (numRunFailures > 0) {
                    console.log(`Finished run ${currentRun}, number of test failures: ${numRunFailures}`);
                }

                if (currentRun < totalRuns) {
                    resolve(runTests(allTestFiles, currentRun, totalRuns, testFailures));
                } else {
                    resolve(testFailures);
                }
            });
    });
};

const validateInputs = (testDir, totalRuns) => {
    if (!isDirectory(testDir)) {
        console.error(`${testDir} is not a directory`);
        process.exit(1);
    }

    if (totalRuns < 0) {
        console.error(`Number of runs (${totalRuns}) cannot be negative`);
        process.exit(1);
    }
};

exports.findFlakyTests = (testDir, totalRuns) => {
    const allTestFiles = getTestFiles(testDir);
    return runTests(allTestFiles, 0, totalRuns);
};
