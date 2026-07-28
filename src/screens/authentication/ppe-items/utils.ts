import { DEFAULT_PAGE_SIZE, K_SIZE_1, NULL_VALUE } from '@constant';
import { TYPE_STATUS } from 'components/status';
import { ErrorBase } from 'model/common';
import { CreatePpeItemReq, PpeItem, SearchPpeItemsReq, UpdatePpeItemReq } from 'model/ppe-item';
import moment from 'moment';
import { API_DATE_INPUT_FORMATS, FORMAT_DATE_API, FORMAT_DATE_PARAMS } from 'utils/date';
import type { PpeItemFilterForm, PpeItemForm } from './usePpeItems';

export const PPE_DATE_FORMAT = FORMAT_DATE_API;

const PPE_DATE_INPUT_FORMATS = API_DATE_INPUT_FORMATS;

export const PPE_ITEM_STATUS = {
  TRONG_KHO: 'TRONG_KHO'
} as const;

export const PPE_ITEM_STATUS_OPTIONS = [{ value: PPE_ITEM_STATUS.TRONG_KHO, label: 'Trong kho' }];

const PPE_ITEM_STATUS_LABEL_MAP: Record<string, string> = {
  TRONG_KHO: 'Trong kho',
  IN_STOCK: 'Trong kho',
  STOCK: 'Trong kho',
  DA_CAP: 'Đã cấp phát',
  DA_CAP_PHAT: 'Đã cấp phát',
  ISSUED: 'Đã cấp phát',
  HIEU_LUC: 'Hiệu lực',
  ACTIVE: 'Hiệu lực',
  HET_HIEU_LUC: 'Hết hiệu lực',
  INACTIVE: 'Hết hiệu lực'
};

const PPE_ITEM_STATUS_TYPE_MAP: Record<string, TYPE_STATUS> = {
  TRONG_KHO: TYPE_STATUS.PENDING,
  IN_STOCK: TYPE_STATUS.PENDING,
  STOCK: TYPE_STATUS.PENDING,
  DA_CAP: TYPE_STATUS.SUCCESS,
  DA_CAP_PHAT: TYPE_STATUS.SUCCESS,
  ISSUED: TYPE_STATUS.SUCCESS,
  HIEU_LUC: TYPE_STATUS.SUCCESS,
  ACTIVE: TYPE_STATUS.SUCCESS,
  HET_HIEU_LUC: TYPE_STATUS.ERROR,
  INACTIVE: TYPE_STATUS.ERROR
};

export const DEFAULT_PPE_ITEM_FORM_VALUES: PpeItemForm = {
  itemCode: '',
  itemName: '',
  category: '',
  unit: '',
  quantity: '',
  importDate: '',
  inputEmployeeId: '',
  status: PPE_ITEM_STATUS.TRONG_KHO,
  note: ''
};

export const DEFAULT_PPE_ITEM_FILTER: PpeItemFilterForm = {
  itemCode: '',
  itemName: '',
  status: ''
};

export const getPpeItemErrorMessage = (error?: ErrorBase, fallback = 'Có lỗi xảy ra') =>
  error?.businessErrorMessage || error?.systemErrorMessage || error?.detailMessage || fallback;

export const getPpeItemStatusLabel = (status?: string) =>
  status ? PPE_ITEM_STATUS_LABEL_MAP[status] || status : NULL_VALUE;

export const getPpeItemStatusType = (status?: string) =>
  status ? PPE_ITEM_STATUS_TYPE_MAP[status] || TYPE_STATUS.DEFAULT : TYPE_STATUS.DEFAULT;

const formatPpeItemDate = (date?: string, outputFormat = PPE_DATE_FORMAT) => {
  const normalized = date?.trim();
  if (!normalized) return '';

  const parsedDate = moment(normalized, PPE_DATE_INPUT_FORMATS, true);
  return parsedDate.isValid() ? parsedDate.format(outputFormat) : normalized;
};

export const renderPpeItemDate = (date?: string) =>
  date ? formatPpeItemDate(date, FORMAT_DATE_PARAMS) || NULL_VALUE : NULL_VALUE;

export const renderPpeItemNumber = (value?: number) =>
  value !== undefined && value !== null
    ? new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 3 }).format(value)
    : NULL_VALUE;

export const getPpeItemCreator = (item: PpeItem) => item.createBy || item.createdBy || NULL_VALUE;

export const getPpeItemInputEmployee = (item: PpeItem) =>
  item.inputEmployeeName ||
  item.inputEmployeeFullName ||
  (item.inputEmployeeId !== undefined && item.inputEmployeeId !== null
    ? String(item.inputEmployeeId)
    : '') ||
  getPpeItemCreator(item);

const normalizeText = (value?: string) => {
  const normalized = value?.trim();
  return normalized || undefined;
};

const toOptionalNumber = (value?: string) => {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

export const buildPpeItemSearchBody = (
  filter: PpeItemFilterForm,
  page: number
): SearchPpeItemsReq => ({
  page: page - K_SIZE_1,
  size: DEFAULT_PAGE_SIZE,
  ...(normalizeText(filter.itemCode) ? { itemCode: normalizeText(filter.itemCode) } : {}),
  ...(normalizeText(filter.itemName) ? { itemName: normalizeText(filter.itemName) } : {}),
  ...(normalizeText(filter.status) ? { status: normalizeText(filter.status) } : {})
});

export const buildPpeItemFormValues = (item: PpeItem): PpeItemForm => ({
  itemCode: item.itemCode || '',
  itemName: item.itemName || '',
  category: item.category || '',
  unit: item.unit || '',
  quantity: item.quantity !== undefined && item.quantity !== null ? String(item.quantity) : '',
  importDate: formatPpeItemDate(item.importDate),
  inputEmployeeId:
    item.inputEmployeeId !== undefined && item.inputEmployeeId !== null
      ? String(item.inputEmployeeId)
      : '',
  status: item.status || PPE_ITEM_STATUS.TRONG_KHO,
  note: item.note || ''
});

export const buildCreatePpeItemBody = (data: PpeItemForm): CreatePpeItemReq => ({
  itemCode: data.itemCode.trim(),
  itemName: data.itemName.trim(),
  category: normalizeText(data.category),
  unit: normalizeText(data.unit),
  quantity: toOptionalNumber(data.quantity),
  importDate: normalizeText(formatPpeItemDate(data.importDate)),
  inputEmployeeId: toOptionalNumber(data.inputEmployeeId),
  status: normalizeText(data.status),
  note: normalizeText(data.note)
});

export const buildUpdatePpeItemBody = (id: number, data: PpeItemForm): UpdatePpeItemReq => ({
  id,
  itemName: data.itemName.trim(),
  category: normalizeText(data.category),
  unit: normalizeText(data.unit),
  quantity: toOptionalNumber(data.quantity),
  importDate: normalizeText(formatPpeItemDate(data.importDate)),
  inputEmployeeId: toOptionalNumber(data.inputEmployeeId),
  status: normalizeText(data.status),
  note: normalizeText(data.note)
});
