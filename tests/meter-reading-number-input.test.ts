import assert from 'node:assert/strict';
import { test } from 'node:test';
import { formatDecimalInputWithCommas, parseFormattedNumber } from '../src/utils/number-input';

test('typing through thousands separators preserves the reading and API value', () => {
  let displayed = '';
  for (const digit of '1234567.8901') {
    displayed = formatDecimalInputWithCommas(displayed + digit);
  }
  assert.equal(displayed, '1,234,567.8901');
  assert.equal(parseFormattedNumber(displayed), 1234567.8901);
});

test('editing an existing thousands group does not turn it into a fraction', () => {
  assert.equal(formatDecimalInputWithCommas('1,2345'), '12,345');
  assert.equal(formatDecimalInputWithCommas('1,23'), '123');
  assert.equal(formatDecimalInputWithCommas('12,34,567'), '1,234,567');
});

test('pasted readings, trailing decimal, zeroes and empty input remain editable', () => {
  assert.equal(formatDecimalInputWithCommas('1,234,567.890'), '1,234,567.890');
  assert.equal(formatDecimalInputWithCommas('1234.'), '1,234.');
  assert.equal(formatDecimalInputWithCommas('0.001'), '0.001');
  assert.equal(formatDecimalInputWithCommas(''), '');
  assert.equal(parseFormattedNumber(formatDecimalInputWithCommas('')), undefined);
});
