const Mocha = require('mocha')
const fs = require('fs');
const path = require('path');
const chance = require('chance');
const argv = require('minimist')(process.argv.slice(2));
const _ = require('lodash');

const totalRuns = argv.runs || 5;
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

const mocha = new Mocha({
    reporter: function () {
        //avoid logs
    },
});

allTestFiles.forEach(function(file) {
    mocha.addFile(file);
});

let numRuns = 0;
const testFailures = {};

const runTests = () => {
    return new Promise((resolve, reject) => {
        let numRunFailures = 0;

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
                console.log(`Finished run ${numRuns + 1}, number of test failures: ${numRunFailures}`);
                numRuns++;

                if (numRuns < totalRuns) {
                    resolve(runTests());
                } else {
                    resolve();
                }
            });
    });
};

console.log(`Starting ${totalRuns} test runs...`);

return runTests().then(() => {
    console.log('Finished all runs!');
    console.log('Tests that failed:');
    _.each(testFailures, (value, key) => {
        console.log(`${key}, failures: ${value.numFailures}`);
    });
});
