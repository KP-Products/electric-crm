import { DEFAULT_PAGE_SIZE, K_SIZE_1, NULL_VALUE } from '@constant';
import { AppSelectOption } from 'components/select';
import { TYPE_STATUS } from 'components/status';
import { ErrorBase } from 'model/common';
import {
  Contract,
  ContractMeterLine,
  ContractSearchReq,
  CreateContractReq,
  UpdateContractReq
} from 'model/contract';
import { Customer } from 'model/customer';
import { Meter } from 'model/meter';
import moment from 'moment';
import { API_DATE_INPUT_FORMATS, FORMAT_DATE_API, FORMAT_DATE_PARAMS } from 'utils/date';

export const CONTRACT_DATE_FORMAT = FORMAT_DATE_API;
export const CONTRACT_DOCUMENT_OWNER_TYPE = 'CONTRACT';

export const CONTRACT_STATUS = {
  ACTIVE: 'HIEU_LUC',
  EXPIRING_SOON: 'SAP_HET_HAN',
  EXPIRED: 'HET_HAN',
  SUSPENDED: 'TAM_NGUNG'
} as const;

export const CONTRACT_STATUS_OPTIONS: AppSelectOption[] = [
  { value: CONTRACT_STATUS.ACTIVE, label: 'Đang hiệu lực' },
  { value: CONTRACT_STATUS.EXPIRING_SOON, label: 'Sắp hết hạn' },
  { value: CONTRACT_STATUS.EXPIRED, label: 'Hết hiệu lực' },
  { value: CONTRACT_STATUS.SUSPENDED, label: 'Tạm ngưng' }
];

export interface ContractFilter {
  contractNumber: string;
  customerId?: number;
  meterId: string;
  status: string;
  signedDate: string;
  effectiveDate: string;
  expiryDate: string;
  createdBy: string;
}

export interface ContractForm {
  contractNumber: string;
  customerId?: number;
  meters: ContractMeterLine[];
  signedDate: string;
  effectiveDate: string;
  expiryDate: string;
  status: string;
  note: string;
}

export interface ContractStats {
  total: number;
  active: number;
  expiringSoon: number;
  expired: number;
}

export const DEFAULT_CONTRACT_FILTER: ContractFilter = {
  contractNumber: '',
  customerId: undefined,
  meterId: '',
  status: '',
  signedDate: '',
  effectiveDate: '',
  expiryDate: '',
  createdBy: ''
};

export const EMPTY_CONTRACT_METER_LINE: ContractMeterLine = {
  meterId: '',
  feederId: '',
  installationDate: ''
};

export const DEFAULT_CONTRACT_FORM: ContractForm = {
  contractNumber: '',
  customerId: undefined,
  meters: [EMPTY_CONTRACT_METER_LINE],
  signedDate: '',
  effectiveDate: '',
  expiryDate: '',
  status: CONTRACT_STATUS.ACTIVE,
  note: ''
};

const DATE_INPUT_FORMATS = API_DATE_INPUT_FORMATS;

const normalizeText = (value?: string) => {
  const normalized = value?.trim();
  return normalized || undefined;
};

const compactSearchBody = (body: ContractSearchReq): ContractSearchReq =>
  Object.fromEntries(
    Object.entries(body).filter(([, value]) => value !== undefined && value !== '')
  ) as ContractSearchReq;

const getDateValue = (date?: string | null) => {
  const normalized = date?.trim();
  if (!normalized) return null;

  const parsedDate = moment(normalized, DATE_INPUT_FORMATS, true);
  if (parsedDate.isValid()) return parsedDate;

  const fallbackDate = moment(normalized, moment.ISO_8601, true);
  return fallbackDate.isValid() ? fallbackDate : null;
};

export const isValidContractDate = (date?: string | null) => Boolean(getDateValue(date));

const isStatusIn = (status: string | undefined, values: string[]) => {
  if (!status) return false;
  const normalized = status.toUpperCase();
  return values.some((value) => value.toUpperCase() === normalized || value === status);
};

export const getContractErrorMessage = (
  error?: ErrorBase & { message?: string },
  fallback = 'Thao tác thất bại'
) =>
  error?.businessErrorMessage ||
  error?.systemErrorMessage ||
  error?.detailMessage ||
  error?.message ||
  fallback;

export const getContractId = (contract?: Contract) => contract?.id || contract?.contractId || '';

export const formatContractDate = (date?: string | null, outputFormat = CONTRACT_DATE_FORMAT) => {
  const parsedDate = getDateValue(date);
  if (parsedDate) return parsedDate.format(outputFormat);
  return date?.trim() || '';
};

export const renderContractDate = (date?: string | null) =>
  date ? formatContractDate(date, FORMAT_DATE_PARAMS) || NULL_VALUE : NULL_VALUE;

export const isContractDateBefore = (nextDate?: string, previousDate?: string) => {
  const next = getDateValue(nextDate);
  const previous = getDateValue(previousDate);
  return Boolean(next && previous && next.isBefore(previous, 'day'));
};

/** Sao chép HĐ không chép công tơ (1 công tơ chỉ thuộc 1 HĐ) → bắt đầu bằng 1 dòng trống. */
export const buildContractFormValues = (contract?: Contract, withMeters = true): ContractForm => ({
  contractNumber: contract?.contractNumber || '',
  customerId: contract?.customerId,
  meters:
    withMeters && contract?.meters?.length
      ? contract.meters.map((meter) => ({
          meterId: meter.meterId,
          feederId: meter.feederId || '',
          installationDate: formatContractDate(meter.installationDate)
        }))
      : [EMPTY_CONTRACT_METER_LINE],
  signedDate: formatContractDate(contract?.signedDate),
  effectiveDate: formatContractDate(contract?.effectiveDate || contract?.signedDate),
  expiryDate: formatContractDate(contract?.expiryDate),
  status: contract?.status || CONTRACT_STATUS.ACTIVE,
  note: contract?.note || ''
});

export const buildCopyContractFormValues = (contract: Contract): ContractForm => ({
  ...buildContractFormValues(contract, false),
  contractNumber: ''
});

export const buildSearchContractBody = (
  filter: ContractFilter,
  page: number,
  size = DEFAULT_PAGE_SIZE
): ContractSearchReq =>
  compactSearchBody({
    page: page - K_SIZE_1,
    size,
    contractNumber: normalizeText(filter.contractNumber),
    customerId: filter.customerId,
    meterId: normalizeText(filter.meterId),
    status: normalizeText(filter.status),
    signedDate: normalizeText(formatContractDate(filter.signedDate)),
    effectiveDate: normalizeText(formatContractDate(filter.effectiveDate)),
    expiryDate: normalizeText(formatContractDate(filter.expiryDate)),
    createdBy: normalizeText(filter.createdBy)
  });

export const buildCreateContractBody = (data: ContractForm): CreateContractReq => ({
  contractNumber: data.contractNumber.trim(),
  customerId: data.customerId as number,
  meters: data.meters.map((meter) => ({
    meterId: meter.meterId,
    feederId: meter.feederId,
    installationDate: formatContractDate(meter.installationDate)
  })),
  signedDate: formatContractDate(data.signedDate),
  effectiveDate: formatContractDate(data.effectiveDate),
  expiryDate: normalizeText(formatContractDate(data.expiryDate)),
  status: normalizeText(data.status),
  note: normalizeText(data.note)
});

export const buildUpdateContractBody = (id: string, data: ContractForm): UpdateContractReq => ({
  id,
  ...buildCreateContractBody(data)
});

export const getContractStats = (rows: Contract[], total = rows.length): ContractStats => {
  const now = moment().startOf('day');
  const activeStatuses = ['HIEU_LUC', 'ACTIVE', 'ĐANG HIỆU LỰC', 'HIỆU LỰC'];
  const expiringStatuses = ['SAP_HET_HAN', 'EXPIRING_SOON', 'SẮP HẾT HẠN'];
  const expiredStatuses = ['HET_HAN', 'HET_HIEU_LUC', 'EXPIRED', 'INACTIVE', 'HẾT HIỆU LỰC'];

  return rows.reduce<ContractStats>(
    (acc, contract) => {
      const expiryDate = getDateValue(contract.expiryDate);
      const daysUntilExpiry = expiryDate ? expiryDate.diff(now, 'days') : undefined;

      if (
        isStatusIn(contract.status, expiringStatuses) ||
        (daysUntilExpiry !== undefined && daysUntilExpiry >= 0 && daysUntilExpiry <= 30)
      ) {
        acc.expiringSoon += 1;
      } else if (
        isStatusIn(contract.status, expiredStatuses) ||
        (daysUntilExpiry !== undefined && daysUntilExpiry < 0)
      ) {
        acc.expired += 1;
      } else if (isStatusIn(contract.status, activeStatuses)) {
        acc.active += 1;
      }

      return acc;
    },
    { total, active: 0, expiringSoon: 0, expired: 0 }
  );
};

export const getContractStatusMeta = (status?: string | null) => {
  if (!status) return { label: NULL_VALUE, type: TYPE_STATUS.DEFAULT };

  const normalizedStatus = status.toUpperCase();
  const labelMap: Record<string, string> = {
    HIEU_LUC: 'Đang hiệu lực',
    ACTIVE: 'Đang hiệu lực',
    SAP_HET_HAN: 'Sắp hết hạn',
    EXPIRING_SOON: 'Sắp hết hạn',
    HET_HAN: 'Hết hiệu lực',
    HET_HIEU_LUC: 'Hết hiệu lực',
    EXPIRED: 'Hết hiệu lực',
    INACTIVE: 'Hết hiệu lực',
    TAM_NGUNG: 'Tạm ngưng',
    SUSPENDED: 'Tạm ngưng',
    'ĐANG HIỆU LỰC': 'Đang hiệu lực',
    'HIỆU LỰC': 'Đang hiệu lực',
    'SẮP HẾT HẠN': 'Sắp hết hạn',
    'HẾT HIỆU LỰC': 'Hết hiệu lực',
    'TẠM NGƯNG': 'Tạm ngưng'
  };

  const typeMap: Record<string, TYPE_STATUS> = {
    HIEU_LUC: TYPE_STATUS.SUCCESS,
    ACTIVE: TYPE_STATUS.SUCCESS,
    SAP_HET_HAN: TYPE_STATUS.PENDING,
    EXPIRING_SOON: TYPE_STATUS.PENDING,
    HET_HAN: TYPE_STATUS.ERROR,
    HET_HIEU_LUC: TYPE_STATUS.ERROR,
    EXPIRED: TYPE_STATUS.ERROR,
    INACTIVE: TYPE_STATUS.ERROR,
    TAM_NGUNG: TYPE_STATUS.DISABLED,
    SUSPENDED: TYPE_STATUS.DISABLED
  };

  return {
    label: labelMap[normalizedStatus] || labelMap[status] || status,
    type: typeMap[normalizedStatus] || typeMap[status] || TYPE_STATUS.DEFAULT
  };
};

export const getCustomerLabel = (customer?: Customer) => {
  if (!customer) return '';
  const name = customer.fullName || customer.customerCode || String(customer.id);
  return customer.customerCode ? `${customer.customerCode} - ${name}` : String(name);
};

export const buildCustomerOptions = (customers: Customer[]): AppSelectOption[] =>
  customers
    .filter((customer) => Boolean(customer.id))
    .map((customer) => ({
      value: customer.id,
      label: getCustomerLabel(customer),
      data: customer
    }));

export const buildCustomerLabelMap = (customers: Customer[]) =>
  Object.fromEntries(
    customers
      .filter((customer) => Boolean(customer.id))
      .map((customer) => [customer.id, getCustomerLabel(customer)])
  );

export const getMeterLabel = (meter?: Meter) => {
  if (!meter) return '';
  return meter.meterCode || meter.meterId || meter.id || '';
};

export const getContractMeterLabels = (contract: Contract, max = 2) => {
  const codes = (contract.meters || []).map((meter) => meter.meterCode || meter.meterId);
  return {
    text: codes.slice(0, max).join(', ') + (codes.length > max ? ` +${codes.length - max}` : ''),
    title: codes.join(', ')
  };
};

export const getMeterValue = (meter?: Meter) => meter?.meterId || meter?.id || '';

export const buildMeterOptions = (meters: Meter[]): AppSelectOption[] =>
  meters
    .filter((meter) => Boolean(getMeterValue(meter)))
    .map((meter) => ({
      value: getMeterValue(meter),
      label: getMeterLabel(meter),
      data: meter
    }));

export const buildMeterLabelMap = (meters: Meter[]) =>
  Object.fromEntries(
    meters
      .filter((meter) => Boolean(getMeterValue(meter)))
      .map((meter) => [getMeterValue(meter), getMeterLabel(meter)])
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
