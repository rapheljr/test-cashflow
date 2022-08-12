const assert = require('assert');
const { test-cashflow } = require('../src/test-cashflow.js');

describe('test-cashflow', () => {
  it('message', () => {
    assert.deepStrictEqual(test-cashflow('args'), 'args');
  });
});
