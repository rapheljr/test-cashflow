const assert = require('assert');
const { testCashflow } = require('../src/test-cashflow.js');

describe('testCashflow', () => {
  it('message', () => {
    assert.deepStrictEqual(testCashflow('args'), 'args');
  });
});
