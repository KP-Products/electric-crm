import { DEFAULT_PAGE_SIZE, K_SIZE_1, NULL_VALUE } from '@constant';
import { AppSelectOption } from 'components/select';
import { TYPE_STATUS } from 'components/status';
import { ErrorBase } from 'model/common';
import { Employee } from 'model/employee';
import { PpeItem } from 'model/ppe-item';
import {
  CreatePpeItemHistoryReq,
  PpeItemHistory,
  SearchPpeItemHistoryReq,
  UpdatePpeItemHistoryReq
} from 'model/ppe-item-history';
import moment from 'moment';
import { API_DATE_INPUT_FORMATS, FORMAT_DATE_API, FORMAT_DATE_PARAMS } from 'utils/date';
import { formatNumberValueWithCommas, parseFormattedNumber } from 'utils/number-input';
import type { PpeItemHistoryFilterForm, PpeItemHistoryForm } from './usePpeItemHistory';

export const PPE_ITEM_HISTORY_DATE_FORMAT = FORMAT_DATE_API;

const PPE_ITEM_HISTORY_DATE_INPUT_FORMATS = API_DATE_INPUT_FORMATS;

export const PPE_ITEM_HISTORY_TYPE = {
  BAN_GIAO: 'BAN_GIAO',
  THU_HOI: 'THU_HOI',
  DOI_MOI: 'DOI_MOI'
} as const;

export const PPE_ITEM_HISTORY_TYPE_OPTIONS: AppSelectOption[] = [
  { value: PPE_ITEM_HISTORY_TYPE.BAN_GIAO, label: 'Bàn giao' },
  { value: PPE_ITEM_HISTORY_TYPE.THU_HOI, label: 'Thu hồi' },
  { value: PPE_ITEM_HISTORY_TYPE.DOI_MOI, label: 'Đổi mới' }
];

const PPE_ITEM_HISTORY_TYPE_LABEL_MAP: Record<string, string> = {
  BAN_GIAO: 'Bàn giao',
  THU_HOI: 'Thu hồi',
  DOI_MOI: 'Đổi mới'
};

const PPE_ITEM_HISTORY_TYPE_STATUS_MAP: Record<string, TYPE_STATUS> = {
  BAN_GIAO: TYPE_STATUS.SUCCESS,
  THU_HOI: TYPE_STATUS.PENDING,
  DOI_MOI: TYPE_STATUS.BRANDING
};

export const DEFAULT_PPE_ITEM_HISTORY_FILTER: PpeItemHistoryFilterForm = {
  ppeItemId: '',
  employeeId: '',
  exportDate: '',
  type: '',
  exportEmployeeId: ''
};

export const DEFAULT_PPE_ITEM_HISTORY_FORM_VALUES: PpeItemHistoryForm = {
  ppeItemId: '',
  employeeId: '',
  exportDate: '',
  quantity: '1',
  note: '',
  type: PPE_ITEM_HISTORY_TYPE.BAN_GIAO,
  exportEmployeeId: ''
};

export const getPpeItemHistoryErrorMessage = (error?: ErrorBase, fallback = 'Có lỗi xảy ra') =>
  error?.businessErrorMessage || error?.systemErrorMessage || error?.detailMessage || fallback;

export const getHistoryTypeLabel = (type?: string) =>
  type ? PPE_ITEM_HISTORY_TYPE_LABEL_MAP[type] || type : NULL_VALUE;

export const getHistoryTypeStatus = (type?: string) =>
  type ? PPE_ITEM_HISTORY_TYPE_STATUS_MAP[type] || TYPE_STATUS.DEFAULT : TYPE_STATUS.DEFAULT;

const formatPpeItemHistoryDate = (date?: string, outputFormat = PPE_ITEM_HISTORY_DATE_FORMAT) => {
  const normalized = date?.trim();
  if (!normalized) return '';

  const parsedDate = moment(normalized, PPE_ITEM_HISTORY_DATE_INPUT_FORMATS, true);
  return parsedDate.isValid() ? parsedDate.format(outputFormat) : normalized;
};

export const renderPpeItemHistoryDate = (date?: string) =>
  date ? formatPpeItemHistoryDate(date, FORMAT_DATE_PARAMS) || NULL_VALUE : NULL_VALUE;

export const renderPpeItemHistoryNumber = (value?: number) =>
  value !== undefined && value !== null
    ? formatNumberValueWithCommas(value) || NULL_VALUE
    : NULL_VALUE;

export const displayText = (value?: string | number | null) =>
  value === undefined || value === null || value === '' ? NULL_VALUE : String(value);

const normalizeText = (value?: string) => {
  const normalized = value?.trim();
  return normalized || undefined;
};

export const toOptionalNumber = (value?: string) => {
  if (!value) return undefined;
  return parseFormattedNumber(value);
};

const toRequiredNumber = (value?: string) => parseFormattedNumber(value) || 0;

export const getEmployeeLabel = (employee: Employee) =>
  employee.fullName || employee.employeeCode || employee.email || String(employee.id);

export const getPpeItemLabel = (item: PpeItem) => {
  const name = item.itemName || item.itemCode || String(item.id);
  return item.itemCode ? `${item.itemCode} - ${name}` : name;
};

export const buildEmployeeOptions = (employees: Employee[]): AppSelectOption[] =>
  employees
    .filter((employee) => employee.id !== undefined && employee.id !== null)
    .map((employee) => ({
      value: String(employee.id),
      label: getEmployeeLabel(employee)
    }));

export const buildPpeItemOptions = (items: PpeItem[]): AppSelectOption[] =>
  items
    .filter((item) => item.id !== undefined && item.id !== null)
    .map((item) => ({
      value: String(item.id),
      label: getPpeItemLabel(item)
    }));

export const buildPpeItemHistorySearchBody = (
  filter: PpeItemHistoryFilterForm,
  page: number
): SearchPpeItemHistoryReq => ({
  page: page - K_SIZE_1,
  size: DEFAULT_PAGE_SIZE,
  ...(toOptionalNumber(filter.ppeItemId) ? { ppeItemId: toOptionalNumber(filter.ppeItemId) } : {}),
  ...(toOptionalNumber(filter.employeeId)
    ? { employeeId: toOptionalNumber(filter.employeeId) }
    : {}),
  ...(normalizeText(formatPpeItemHistoryDate(filter.exportDate))
    ? { exportDate: normalizeText(formatPpeItemHistoryDate(filter.exportDate)) }
    : {}),
  ...(normalizeText(filter.type) ? { type: normalizeText(filter.type) } : {}),
  ...(toOptionalNumber(filter.exportEmployeeId)
    ? { exportEmployeeId: toOptionalNumber(filter.exportEmployeeId) }
    : {})
});

export const buildPpeItemHistoryFormValues = (history: PpeItemHistory): PpeItemHistoryForm => ({
  ppeItemId:
    history.ppeItemId !== undefined && history.ppeItemId !== null ? String(history.ppeItemId) : '',
  employeeId:
    history.employeeId !== undefined && history.employeeId !== null
      ? String(history.employeeId)
      : '',
  exportDate: formatPpeItemHistoryDate(history.exportDate),
  quantity:
    history.quantity !== undefined && history.quantity !== null ? String(history.quantity) : '',
  note: history.note || '',
  type: history.type || PPE_ITEM_HISTORY_TYPE.BAN_GIAO,
  exportEmployeeId:
    history.exportEmployeeId !== undefined && history.exportEmployeeId !== null
      ? String(history.exportEmployeeId)
      : ''
});

export const buildCreatePpeItemHistoryBody = (
  data: PpeItemHistoryForm
): CreatePpeItemHistoryReq => ({
  ppeItemId: toRequiredNumber(data.ppeItemId),
  employeeId: toRequiredNumber(data.employeeId),
  exportEmployeeId: toRequiredNumber(data.exportEmployeeId),
  exportDate: normalizeText(formatPpeItemHistoryDate(data.exportDate)),
  quantity: toOptionalNumber(data.quantity),
  note: normalizeText(data.note),
  type: normalizeText(data.type)
});

export const buildUpdatePpeItemHistoryBody = (
  id: number,
  data: PpeItemHistoryForm
): UpdatePpeItemHistoryReq => ({
  id,
  ...buildCreatePpeItemHistoryBody(data)
});
