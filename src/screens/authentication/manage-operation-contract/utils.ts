import { DEFAULT_PAGE_SIZE, K_SIZE_1, NULL_VALUE } from '@constant';
import { AppSelectOption } from 'components/select';
import { TYPE_STATUS } from 'components/status';
import { ErrorBase } from 'model/common';
import {
  CreateOperationContractReq,
  OperationContract,
  SearchOperationContractsReq,
  UpdateOperationContractReq
} from 'model/operation-contract';
import { OperationUnit } from 'model/operation-unit';
import moment from 'moment';
import { API_DATE_INPUT_FORMATS, FORMAT_DATE_API, FORMAT_DATE_PARAMS } from 'utils/date';

export const OPERATION_CONTRACT_DATE_FORMAT = FORMAT_DATE_API;
export const OPERATION_CONTRACT_DEFAULT_TYPE = 'VẬN HÀNH';
export const OPERATION_CONTRACT_DOCUMENT_OWNER_TYPE = 'OPERATION_CONTRACT';

export const OPERATION_CONTRACT_STATUS = {
  ACTIVE: 'ACTIVE',
  EXPIRING_SOON: 'EXPIRING_SOON',
  EXPIRED: 'EXPIRED',
  SUSPENDED: 'SUSPENDED'
} as const;

export const OPERATION_CONTRACT_STATUS_OPTIONS: AppSelectOption[] = [
  { value: OPERATION_CONTRACT_STATUS.ACTIVE, label: 'Đang hiệu lực' },
  { value: OPERATION_CONTRACT_STATUS.EXPIRING_SOON, label: 'Sắp hết hạn' },
  { value: OPERATION_CONTRACT_STATUS.EXPIRED, label: 'Hết hiệu lực' },
  { value: OPERATION_CONTRACT_STATUS.SUSPENDED, label: 'Tạm ngưng' }
];

export interface OperationContractFilter {
  contractNumber: string;
  contractName: string;
  customerId: string;
  contractType: string;
  status: string;
}

export interface OperationContractForm {
  contractNumber: string;
  contractName: string;
  customerId?: number;
  contractValue: string;
  discountPercent: string;
  contractType: string;
  signedDate: string;
  effectiveDate: string;
  expiryDate: string;
  status: string;
  note: string;
}

export const DEFAULT_OPERATION_CONTRACT_FILTER: OperationContractFilter = {
  contractNumber: '',
  contractName: '',
  customerId: '',
  contractType: '',
  status: ''
};

export const DEFAULT_OPERATION_CONTRACT_FORM: OperationContractForm = {
  contractNumber: '',
  contractName: '',
  customerId: undefined,
  contractValue: '',
  discountPercent: '',
  contractType: OPERATION_CONTRACT_DEFAULT_TYPE,
  signedDate: '',
  effectiveDate: '',
  expiryDate: '',
  status: OPERATION_CONTRACT_STATUS.ACTIVE,
  note: ''
};

const DATE_INPUT_FORMATS = API_DATE_INPUT_FORMATS;

const normalizeText = (value?: string) => {
  const normalized = value?.trim();
  return normalized || undefined;
};

/** "120.000.000" / "120,000,000" / "5,5" → số; trống → null. */
export const toAmount = (value?: string | number | null) => {
  if (value === undefined || value === null) return null;
  const text = String(value).trim();
  if (!text) return null;
  const normalized = /^[0-9.]+,[0-9]{1,2}$/.test(text)
    ? text.replace(/\./g, '').replace(',', '.')
    : text.replace(/[^0-9.]/g, '');
  const amount = Number(normalized);
  return Number.isFinite(amount) ? amount : null;
};

export const formatVnd = (value?: number | null) =>
  value === undefined || value === null
    ? NULL_VALUE
    : `${Math.round(value).toLocaleString('vi-VN')} đ`;

export const getOperationContractErrorMessage = (
  error?: ErrorBase & { message?: string },
  fallback = 'Thao tác thất bại'
) =>
  error?.businessErrorMessage ||
  error?.systemErrorMessage ||
  error?.detailMessage ||
  error?.message ||
  fallback;

export const getOperationContractId = (contract?: OperationContract) => contract?.contractId || '';

export const formatOperationContractDate = (
  date?: string | null,
  outputFormat = OPERATION_CONTRACT_DATE_FORMAT
) => {
  const normalized = date?.trim();
  if (!normalized) return '';

  const parsedDate = moment(normalized, DATE_INPUT_FORMATS, true);
  if (parsedDate.isValid()) return parsedDate.format(outputFormat);

  const fallbackDate = moment(normalized);
  return fallbackDate.isValid() ? fallbackDate.format(outputFormat) : normalized;
};

export const renderOperationContractDate = (date?: string | null) =>
  date ? formatOperationContractDate(date, FORMAT_DATE_PARAMS) || NULL_VALUE : NULL_VALUE;

export const isOperationContractDateBefore = (nextDate?: string, previousDate?: string) => {
  if (!nextDate || !previousDate) return false;
  const next = moment(nextDate, DATE_INPUT_FORMATS, true);
  const previous = moment(previousDate, DATE_INPUT_FORMATS, true);
  return next.isValid() && previous.isValid() && next.isBefore(previous, 'day');
};

export const buildOperationContractFormValues = (
  contract?: OperationContract
): OperationContractForm => ({
  contractNumber: contract?.contractNumber || '',
  contractName: contract?.contractName || '',
  customerId: contract?.customerId,
  contractValue: contract?.contractValue != null ? String(contract.contractValue) : '',
  discountPercent: contract?.discountPercent != null ? String(contract.discountPercent) : '',
  contractType: contract?.contractType || '',
  signedDate: formatOperationContractDate(contract?.signedDate),
  effectiveDate: formatOperationContractDate(contract?.effectiveDate),
  expiryDate: formatOperationContractDate(contract?.expiryDate),
  status: contract?.status || '',
  note: contract?.note || ''
});

export const buildSearchOperationContractsBody = (
  filter: OperationContractFilter,
  page: number,
  size = DEFAULT_PAGE_SIZE
): SearchOperationContractsReq => ({
  page: page - K_SIZE_1,
  size,
  contractNumber: normalizeText(filter.contractNumber),
  contractName: normalizeText(filter.contractName),
  customerId: filter.customerId ? Number(filter.customerId) : undefined,
  contractType: normalizeText(filter.contractType),
  status: normalizeText(filter.status)
});

export const buildCreateOperationContractBody = (
  data: OperationContractForm
): CreateOperationContractReq => ({
  contractNumber: data.contractNumber.trim(),
  contractName: data.contractName.trim(),
  customerId: data.customerId as number,
  contractValue: toAmount(data.contractValue) as number,
  discountPercent: toAmount(data.discountPercent),
  contractType: data.contractType.trim(),
  signedDate: formatOperationContractDate(data.signedDate),
  effectiveDate: formatOperationContractDate(data.effectiveDate),
  expiryDate: normalizeText(formatOperationContractDate(data.expiryDate)),
  status: normalizeText(data.status),
  note: normalizeText(data.note)
});

export const buildUpdateOperationContractBody = (
  id: string,
  data: OperationContractForm
): UpdateOperationContractReq => ({
  id,
  contractName: data.contractName.trim(),
  customerId: data.customerId,
  contractValue: toAmount(data.contractValue) as number,
  discountPercent: toAmount(data.discountPercent),
  contractType: normalizeText(data.contractType),
  signedDate: formatOperationContractDate(data.signedDate),
  effectiveDate: formatOperationContractDate(data.effectiveDate),
  expiryDate: normalizeText(formatOperationContractDate(data.expiryDate)),
  status: normalizeText(data.status),
  note: normalizeText(data.note)
});

export const getOperationContractStatusMeta = (status?: string | null) => {
  if (!status) return { label: NULL_VALUE, type: TYPE_STATUS.DEFAULT };

  const normalizedStatus = status.toUpperCase();
  const labelMap: Record<string, string> = {
    ACTIVE: 'Đang hiệu lực',
    HIEU_LUC: 'Đang hiệu lực',
    EXPIRING_SOON: 'Sắp hết hạn',
    SAP_HET_HAN: 'Sắp hết hạn',
    EXPIRED: 'Hết hiệu lực',
    INACTIVE: 'Hết hiệu lực',
    HET_HIEU_LUC: 'Hết hiệu lực',
    HET_HAN: 'Hết hiệu lực',
    SUSPENDED: 'Tạm ngưng',
    TAM_NGUNG: 'Tạm ngưng',
    'ĐANG HIỆU LỰC': 'Đang hiệu lực',
    'SẮP HẾT HẠN': 'Sắp hết hạn',
    'HẾT HIỆU LỰC': 'Hết hiệu lực',
    'TẠM NGƯNG': 'Tạm ngưng'
  };

  const typeMap: Record<string, TYPE_STATUS> = {
    ACTIVE: TYPE_STATUS.SUCCESS,
    HIEU_LUC: TYPE_STATUS.SUCCESS,
    EXPIRING_SOON: TYPE_STATUS.PENDING,
    SAP_HET_HAN: TYPE_STATUS.PENDING,
    EXPIRED: TYPE_STATUS.ERROR,
    INACTIVE: TYPE_STATUS.ERROR,
    HET_HIEU_LUC: TYPE_STATUS.ERROR,
    HET_HAN: TYPE_STATUS.ERROR,
    SUSPENDED: TYPE_STATUS.DISABLED,
    TAM_NGUNG: TYPE_STATUS.DISABLED
  };

  return {
    label: labelMap[normalizedStatus] || labelMap[status] || status,
    type: typeMap[normalizedStatus] || typeMap[status] || TYPE_STATUS.DEFAULT
  };
};

export const getOperationUnitLabel = (operationUnit?: OperationUnit) => {
  if (!operationUnit) return '';
  const name = operationUnit.unitName || operationUnit.shortName || operationUnit.operationUnitId;
  return operationUnit.unitCode ? `${operationUnit.unitCode} - ${name}` : name;
};

export const buildOperationUnitOptions = (operationUnits: OperationUnit[]): AppSelectOption[] =>
  operationUnits
    .filter((operationUnit) => Boolean(operationUnit.operationUnitId))
    .map((operationUnit) => ({
      value: operationUnit.operationUnitId,
      label: getOperationUnitLabel(operationUnit),
      data: operationUnit
    }));

export const buildOperationUnitLabelMap = (operationUnits: OperationUnit[]) =>
  Object.fromEntries(
    operationUnits
      .filter((operationUnit) => Boolean(operationUnit.operationUnitId))
      .map((operationUnit) => [operationUnit.operationUnitId, getOperationUnitLabel(operationUnit)])
  );

export const displayText = (value?: string | number | null) => {
  if (value === undefined || value === null || value === '') return NULL_VALUE;
  return String(value);
};

export const sanitizeExcelValue = (value?: string | number | null) => {
  const stringValue = displayText(value);
  if (stringValue !== NULL_VALUE && /^[\t\r\n ]*[=+\-@]/.test(stringValue)) {
    return `'${stringValue}`;
  }
  return stringValue;
};

export const escapeHtml = (value?: string | number | null) =>
  sanitizeExcelValue(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

export const DOCUMENT_TYPE_LABEL_MAP: Record<string, string> = {
  CMND_CCCD: 'CMND/CCCD',
  DKKD: 'ĐKKD',
  HD: 'Hợp đồng',
  SO_DO_DIEN: 'Sơ đồ điện',
  KHAC: 'Khác'
};
