const fs = require('fs');
const path = require('path');
const assert = require('assert');
const csv = require('csvtojson');

const dataDir = path.join(__dirname, 'TestData');
const actualDir = path.join(__dirname, 'ActualResults');
const cases = require('./TestData/cases.json');

async function runTests() {
  fs.mkdirSync(actualDir, { recursive: true });
  let passed = 0;

  for (const test of cases) {
    const id = test.id;
    const expected = JSON.parse(fs.readFileSync(
      path.join(dataDir, 'ExpectedOutput', id + '.json'), 'utf8'));
    const expectedMessage = fs.readFileSync(
      path.join(dataDir, 'ExpectedMessages', id + '.txt'), 'utf8').trim();

    let actual = null;
    let message = 'none';
    let errorDetails = '';

    try {
      const options = {
        noheader: !test.partitions.Header,
        checkColumn: true,
        trim: false,
        checkType: false,
        flatKeys: true
      };
      // Give headerless files two JSON keys and a field count to check.
      if (options.noheader) options.headers = ['field1', 'field2'];
      actual = await csv(options).fromFile(
        path.join(dataDir, 'TestFiles', id + '.csv'));
    } catch (err) {
      message = 'error';
      errorDetails = String(err);
    }

    fs.writeFileSync(path.join(actualDir, id + '.json'),
      JSON.stringify(actual, null, 2) + '\n');
    fs.writeFileSync(path.join(actualDir, id + '.txt'), message + '\n');
    fs.writeFileSync(path.join(actualDir, id + '.error.txt'), errorDetails);

    try {
      assert.strictEqual(message, expectedMessage);
      assert.deepStrictEqual(actual, expected);
      console.log('PASS ' + id);
      passed++;
    } catch (err) {
      console.log('FAIL ' + id);
      console.log('  Expected: ' + expectedMessage + ' ' + JSON.stringify(expected));
      console.log('  Actual:   ' + message + ' ' + JSON.stringify(actual));
      if (errorDetails) console.log('  ' + errorDetails);
    }
  }

  console.log('\n' + passed + '/' + cases.length + ' tests passed');
  if (passed !== cases.length) process.exitCode = 1;
}

runTests().catch(err => {
  console.error(err);
  process.exitCode = 1;
});
