import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { LogJsonValue } from '../src/model/system-log';
import {
  formatCustomerHistoryValue,
  getCustomerHistoryChanges,
  getCustomerHistoryFieldLabel
} from '../src/screens/authentication/manage-customer/history-utils';

test('accountant changes show the specific fields and preserve unchanged customer information', () => {
  const before = {
    customerCode: 'KH001',
    chiefAccountant: { fullName: 'Nguyễn A', phone: '0901111111' }
  };
  const after = {
    customerCode: 'KH001',
    chiefAccountant: { fullName: 'Nguyễn B', phone: '0901111111' }
  };
  assert.deepEqual(getCustomerHistoryChanges(before, after), [
    { field: 'chiefAccountant.fullName', before: 'Nguyễn A', after: 'Nguyễn B' }
  ]);
  assert.equal(getCustomerHistoryFieldLabel('chiefAccountant.fullName'), 'Kế toán trưởng - Tên');
});

test('removing a person retains their old information in the history', () => {
  assert.deepEqual(
    getCustomerHistoryChanges({ contactPerson: { fullName: 'Nguyễn A' } }, { contactPerson: null }),
    [{ field: 'contactPerson.fullName', before: 'Nguyễn A', after: undefined }]
  );
});

test('object key order does not create changes, including inside arrays', () => {
  assert.deepEqual(
    getCustomerHistoryChanges(
      { contacts: [{ fullName: 'Nguyễn A', phone: '0901111111' }] },
      { contacts: [{ phone: '0901111111', fullName: 'Nguyễn A' }] }
    ),
    []
  );
});

test('new customer snapshots, zero values and false values remain visible', () => {
  assert.deepEqual(getCustomerHistoryChanges(null, { customerCode: 'KH001' }), [
    { field: 'customerCode', before: undefined, after: 'KH001' }
  ]);
  assert.equal(formatCustomerHistoryValue(0), '0');
  assert.equal(formatCustomerHistoryValue(false), 'Không');
  assert.equal(formatCustomerHistoryValue(null), '—');
  assert.equal(
    getCustomerHistoryFieldLabel('chiefAccountant.effectiveFrom'),
    'Kế toán trưởng - Hiệu lực từ'
  );
});

test('database field names use the same Vietnamese labels as customer form fields', () => {
  assert.equal(getCustomerHistoryFieldLabel('updated_at'), 'Ngày cập nhật');
  assert.equal(getCustomerHistoryFieldLabel('created_at'), 'Ngày tạo');
  assert.equal(getCustomerHistoryFieldLabel('id'), 'Mã định danh');
  assert.equal(getCustomerHistoryFieldLabel('full_name'), 'Tên khách hàng');
  assert.equal(getCustomerHistoryFieldLabel('chief_accountant.full_name'), 'Kế toán trưởng - Tên');
  assert.equal(getCustomerHistoryFieldLabel('chief_accountant_full_name'), 'Kế toán trưởng - Tên');
});

test('history timestamps omit fractional seconds and dates use day/month/year', () => {
  assert.equal(
    formatCustomerHistoryValue('2026-11-03T09:47:40.513013850', 'updated_at'),
    '09:47:40 - 03/11/2026'
  );
  assert.match(
    formatCustomerHistoryValue('2026-11-03T02:47:40.513013850Z', 'updated_at'),
    /^\d{2}:\d{2}:\d{2} - \d{2}\/\d{2}\/\d{4}$/
  );
  assert.equal(formatCustomerHistoryValue('2026-11-03', 'effective_from'), '03/11/2026');
  assert.equal(
    formatCustomerHistoryValue('03-11-2026', 'contact_person.contact_issue_date'),
    '03/11/2026'
  );
});

test('formatting dates leaves phone numbers, identifiers and invalid dates intact', () => {
  assert.equal(formatCustomerHistoryValue('0900000004', 'phone'), '0900000004');
  assert.equal(formatCustomerHistoryValue('2026-11-03', 'customer_code'), '2026-11-03');
  assert.equal(formatCustomerHistoryValue('not a date', 'updated_at'), 'not a date');
});

test('changing between an object and a non-object preserves both complete values', () => {
  const person = { fullName: 'Nguyễn A' };
  const replacements: LogJsonValue[] = ['Nguyễn B', '', 0, false, ['Nguyễn B']];
  for (const replacement of replacements) {
    assert.deepEqual(
      getCustomerHistoryChanges({ chiefAccountant: person }, { chiefAccountant: replacement }),
      [{ field: 'chiefAccountant', before: person, after: replacement }]
    );
    assert.deepEqual(
      getCustomerHistoryChanges({ chiefAccountant: replacement }, { chiefAccountant: person }),
      [{ field: 'chiefAccountant', before: replacement, after: person }]
    );
  }
});

test('field labels never resolve inherited object properties', () => {
  assert.equal(getCustomerHistoryFieldLabel('constructor'), 'constructor');
  assert.equal(getCustomerHistoryFieldLabel('toString'), 'to String');
  assert.equal(
    getCustomerHistoryFieldLabel('chief_accountant.constructor'),
    'Kế toán trưởng - constructor'
  );
});

test('snapshot fields named like inherited properties do not invent previous values', () => {
  const after = JSON.parse('{"constructor":"A","toString":"B","__proto__":"C"}');
  assert.deepEqual(getCustomerHistoryChanges({}, after), [
    { field: 'constructor', before: undefined, after: 'A' },
    { field: 'toString', before: undefined, after: 'B' },
    { field: '__proto__', before: undefined, after: 'C' }
  ]);
});
