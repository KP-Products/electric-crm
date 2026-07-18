import { TYPE_STATUS } from 'components/status';
import { Meter } from 'model/meter';
import moment from 'moment';

export const METER_STATUS = {
  IN_STOCK: 'IN_STOCK',
  INSTALLED: 'INSTALLED'
} as const;

export const METER_STATUS_OPTIONS = [
  { value: METER_STATUS.IN_STOCK, label: 'Lưu kho' },
  { value: METER_STATUS.INSTALLED, label: 'Đã lắp' }
];

export const METER_STATUS_LABEL_MAP: Record<string, string> = {
  IN_STOCK: 'Lưu kho',
  STOCK: 'Lưu kho',
  STORAGE: 'Lưu kho',
  WAREHOUSE: 'Lưu kho',
  NEW: 'Lưu kho',
  INSTALLED: 'Đã lắp',
  ACTIVE: 'Đã lắp',
  USING: 'Đã lắp'
};

export const METER_STATUS_TYPE_MAP: Record<string, TYPE_STATUS> = {
  IN_STOCK: TYPE_STATUS.PENDING,
  STOCK: TYPE_STATUS.PENDING,
  STORAGE: TYPE_STATUS.PENDING,
  WAREHOUSE: TYPE_STATUS.PENDING,
  NEW: TYPE_STATUS.PENDING,
  INSTALLED: TYPE_STATUS.SUCCESS,
  ACTIVE: TYPE_STATUS.SUCCESS,
  USING: TYPE_STATUS.SUCCESS
};

export const METER_TYPE_OPTIONS = [
  { value: 'ELECTRONIC', label: 'Điện tử' },
  { value: 'MECHANICAL', label: 'Cơ' },
  { value: 'REMOTE', label: 'Đo xa' },
  { value: 'ONE_PHASE', label: '1 pha' },
  { value: 'THREE_PHASE', label: '3 pha' }
];

export const METER_TYPE_LABEL_MAP: Record<string, string> = {
  ELECTRONIC: 'Điện tử',
  MECHANICAL: 'Cơ',
  REMOTE: 'Đo xa',
  ONE_PHASE: '1 pha',
  THREE_PHASE: '3 pha',
  'Điện tử': 'Điện tử',
  Cơ: 'Cơ',
  'Đo xa': 'Đo xa',
  '1 pha': '1 pha',
  '3 pha': '3 pha'
};

export const VOLTAGE_TYPE_OPTIONS = [
  { value: 'LOW_VOLTAGE', label: 'Hạ áp' },
  { value: 'MEDIUM_VOLTAGE', label: 'Trung áp' }
];

export const VOLTAGE_TYPE_LABEL_MAP: Record<string, string> = {
  LOW_VOLTAGE: 'Hạ áp',
  LOW: 'Hạ áp',
  LV: 'Hạ áp',
  HA_AP: 'Hạ áp',
  'Hạ áp': 'Hạ áp',
  MEDIUM_VOLTAGE: 'Trung áp',
  MEDIUM: 'Trung áp',
  MV: 'Trung áp',
  TRUNG_AP: 'Trung áp',
  'Trung áp': 'Trung áp'
};

export const USAGE_PURPOSE_OPTIONS = [
  { value: 'KINH_DOANH', label: 'Điện kinh doanh' },
  { value: 'SAN_XUAT', label: 'Điện sản xuất' }
];

export const USAGE_PURPOSE_LABEL_MAP: Record<string, string> = {
  KINH_DOANH: 'Điện kinh doanh',
  BUSINESS: 'Điện kinh doanh',
  'Kinh doanh': 'Điện kinh doanh',
  'Điện kinh doanh': 'Điện kinh doanh',
  SAN_XUAT: 'Điện sản xuất',
  PRODUCTION: 'Điện sản xuất',
  'Sản xuất': 'Điện sản xuất',
  'Điện sản xuất': 'Điện sản xuất'
};

export const INSPECTION_STATUS_LABEL_MAP = {
  missing: 'Chưa có hạn kiểm định',
  normal: 'Còn hạn',
  expiring: 'Sắp hết hạn',
  overdue: 'Quá hạn'
} as const;

export const INSPECTION_STATUS_TYPE_MAP: Record<
  keyof typeof INSPECTION_STATUS_LABEL_MAP,
  TYPE_STATUS
> = {
  missing: TYPE_STATUS.DEFAULT,
  normal: TYPE_STATUS.SUCCESS,
  expiring: TYPE_STATUS.PENDING,
  overdue: TYPE_STATUS.ERROR
};

export const getMeterRecordId = (meter?: Meter) => meter?.meterId || meter?.id || '';

export const getMeterStatusLabel = (status?: string) =>
  status ? METER_STATUS_LABEL_MAP[status] || status : '-';

export const getMeterStatusType = (status?: string) =>
  status ? METER_STATUS_TYPE_MAP[status] || TYPE_STATUS.DEFAULT : TYPE_STATUS.DEFAULT;

export const isMeterInstalled = (status?: string) =>
  Boolean(status && ['INSTALLED', 'ACTIVE', 'USING'].includes(status));

export const normalizeMeterStatus = (status?: string) =>
  isMeterInstalled(status) ? METER_STATUS.INSTALLED : METER_STATUS.IN_STOCK;

export const getMeterTypeLabel = (meterType?: string) =>
  meterType ? METER_TYPE_LABEL_MAP[meterType] || meterType : '-';

export const normalizeMeterType = (meterType?: string) => {
  if (!meterType) return '';
  const label = METER_TYPE_LABEL_MAP[meterType];
  return (
    METER_TYPE_OPTIONS.find((option) => option.label === label || option.value === meterType)
      ?.value || meterType
  );
};

export const getVoltageTypeLabel = (voltageType?: string) =>
  voltageType ? VOLTAGE_TYPE_LABEL_MAP[voltageType] || voltageType : '-';

export const normalizeVoltageType = (voltageType?: string) => {
  if (!voltageType) return '';
  const label = VOLTAGE_TYPE_LABEL_MAP[voltageType];
  return (
    VOLTAGE_TYPE_OPTIONS.find((option) => option.label === label || option.value === voltageType)
      ?.value || voltageType
  );
};

export const getUsagePurposeLabel = (usagePurpose?: string) =>
  usagePurpose ? USAGE_PURPOSE_LABEL_MAP[usagePurpose] || usagePurpose : '-';

export const normalizeUsagePurpose = (usagePurpose?: string) => {
  if (!usagePurpose) return '';
  const label = USAGE_PURPOSE_LABEL_MAP[usagePurpose];
  return (
    USAGE_PURPOSE_OPTIONS.find((option) => option.label === label || option.value === usagePurpose)
      ?.value || usagePurpose
  );
};

export const getInspectionStatus = (inspectionExpiryDate?: string) => {
  if (!inspectionExpiryDate) return 'missing';
  const expiry = moment(inspectionExpiryDate);
  if (!expiry.isValid()) return 'missing';

  const remainingDays = expiry.startOf('day').diff(moment().startOf('day'), 'days');
  if (remainingDays < 0) return 'overdue';
  if (remainingDays <= 30) return 'expiring';
  return 'normal';
};
