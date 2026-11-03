import type { LogJsonValue } from 'model/system-log';
import moment from 'moment';
import { API_DATE_INPUT_FORMATS, FORMAT_DATE_PARAMS, FORMAT_DATE_TIME_PARAMS } from 'utils/date';

export interface CustomerHistoryChange {
  field: string;
  before?: LogJsonValue;
  after?: LogJsonValue;
}

const FIELD_LABELS: Record<string, string> = {
  id: 'Mã định danh',
  customerId: 'Mã định danh khách hàng',
  customerCode: 'Mã khách hàng',
  fullName: 'Tên',
  taxNo: 'Mã số thuế',
  address: 'Địa chỉ',
  representative: 'Người đại diện',
  chiefAccountant: 'Kế toán trưởng',
  contactPerson: 'Người liên hệ',
  contactName: 'Tên người liên hệ',
  contactIdNo: 'CCCD người liên hệ',
  contactIssueDate: 'Ngày cấp CCCD',
  idNo: 'CCCD',
  phone: 'SĐT',
  email: 'Email',
  effectiveFrom: 'Hiệu lực từ',
  effectiveTo: 'Hiệu lực đến',
  effectiveDate: 'Ngày hiệu lực',
  status: 'Trạng thái',
  createdAt: 'Ngày tạo',
  createdBy: 'Người tạo',
  updatedAt: 'Ngày cập nhật',
  updatedBy: 'Người cập nhật',
  operationUnitId: 'Đơn vị vận hành'
};

const normalizeFieldName = (field: string) =>
  field.replace(/_([a-z])/g, (_, letter: string) => letter.toUpperCase());

const getFieldPartLabel = (field: string): string => {
  const normalized = normalizeFieldName(field);
  if (Object.hasOwn(FIELD_LABELS, normalized)) return FIELD_LABELS[normalized];
  const personField = normalized.match(/^(representative|chiefAccountant|contactPerson)([A-Z].*)$/);
  if (personField) {
    const [, person, property] = personField;
    const propertyName = property[0].toLowerCase() + property.slice(1);
    return `${FIELD_LABELS[person]} - ${getFieldPartLabel(propertyName)}`;
  }
  return field.replace(/_/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2');
};

const isObject = (value?: LogJsonValue): value is { [key: string]: LogJsonValue } =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

const equalJson = (before?: LogJsonValue, after?: LogJsonValue): boolean => {
  if (before === after) return true;
  if (Array.isArray(before) && Array.isArray(after)) {
    return before.length === after.length && before.every((value, i) => equalJson(value, after[i]));
  }
  if (isObject(before) && isObject(after)) {
    const keys = Object.keys(before);
    return (
      keys.length === Object.keys(after).length &&
      keys.every((key) => Object.hasOwn(after, key) && equalJson(before[key], after[key]))
    );
  }
  return false;
};

export const getCustomerHistoryChanges = (
  before?: LogJsonValue,
  after?: LogJsonValue
): CustomerHistoryChange[] => {
  const changes: CustomerHistoryChange[] = [];
  const visit = (oldValue?: LogJsonValue, newValue?: LogJsonValue, field = '') => {
    if (equalJson(oldValue, newValue)) return;
    const oldObject = isObject(oldValue) ? oldValue : undefined;
    const newObject = isObject(newValue) ? newValue : undefined;
    const keys = new Set([...Object.keys(oldObject || {}), ...Object.keys(newObject || {})]);
    const canExpandOld = oldObject || oldValue === null || oldValue === undefined;
    const canExpandNew = newObject || newValue === null || newValue === undefined;
    if (keys.size && canExpandOld && canExpandNew) {
      keys.forEach((key) => {
        const oldField = oldObject && Object.hasOwn(oldObject, key) ? oldObject[key] : undefined;
        const newField = newObject && Object.hasOwn(newObject, key) ? newObject[key] : undefined;
        visit(oldField, newField, field ? `${field}.${key}` : key);
      });
      return;
    }
    changes.push({ field, before: oldValue, after: newValue });
  };
  visit(before, after);
  return changes;
};

export const getCustomerHistoryFieldLabel = (field: string) => {
  if (!field) return 'Thông tin khách hàng';
  if (normalizeFieldName(field) === 'fullName') return 'Tên khách hàng';
  return field.split('.').map(getFieldPartLabel).join(' - ');
};

export const formatCustomerHistoryValue = (value?: LogJsonValue, field = ''): string => {
  if (value === undefined || value === null || value === '') return '—';
  if (typeof value === 'boolean') return value ? 'Có' : 'Không';
  const fieldName = normalizeFieldName(field.split('.').pop() || '');
  if (typeof value === 'string' && /(?:At|Date|From|To)$/.test(fieldName)) {
    const date = moment(value, [...API_DATE_INPUT_FORMATS, moment.ISO_8601], true);
    if (date.isValid()) {
      const hasTime = fieldName.endsWith('At') || /[T ]\d{2}:\d{2}/.test(value);
      return date.format(hasTime ? FORMAT_DATE_TIME_PARAMS : FORMAT_DATE_PARAMS);
    }
  }
  return typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value);
};
