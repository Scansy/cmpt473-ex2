const fs = require('fs');
const path = require('path');
const csv = require('csvtojson');
const cases = require('./TestData/cases.json');

const dataDir = path.join(__dirname, 'TestData');

const inputs = cases.map(testCase =>
  fs.readFileSync(path.join(dataDir, 'TestFiles', testCase.id + '.csv'), 'utf8')
);

const expectedOutputs = cases.map(testCase =>
  JSON.parse(fs.readFileSync(
    path.join(dataDir, 'ExpectedOutput', testCase.id + '.json'), 'utf8'))
);

const expectedMessages = cases.map(testCase =>
  fs.readFileSync(
    path.join(dataDir, 'ExpectedMessages', testCase.id + '.txt'), 'utf8').trim()
);

const actualDir = path.join(__dirname, 'ActualResults');
fs.mkdirSync(actualDir, { recursive: true });

cases.forEach((testCase, index) => {
  describe(testCase.id, () => {
    let output = null;
    let message = 'none';

    // arrange
    beforeAll(async () => {
      // set options for parser
      const options = {
        noheader: !testCase.header,
        checkColumn: true,
        trim: false,
        checkType: false,
        flatKeys: true
      };
      // for headerless inputs
      if (options.noheader) {
        options.headers = ['field1', 'field2'];
      }
      let errorDetails = '';

      // act
      try {
        output = await new Promise((resolve, reject) => {
          csv(options).on('error', reject).fromString(inputs[index]).then(resolve, reject);
        });
      } catch (error) {
        message = 'error';
        errorDetails = String(error);
      }

      // write results into ActualResults/
      fs.writeFileSync(path.join(actualDir, testCase.id + '.json'),
        JSON.stringify(output, null, 2) + '\n');
      fs.writeFileSync(path.join(actualDir, testCase.id + '.txt'), message + '\n');
      fs.writeFileSync(path.join(actualDir, testCase.id + '.error.txt'), errorDetails);
    });

    // assert
    test('returns the expected output', () => {
      expect(output).toEqual(expectedOutputs[index]);
    });

    test('returns the expected message', () => {
      expect(message).toBe(expectedMessages[index]);
    });
  });
});
