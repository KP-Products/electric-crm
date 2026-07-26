import { TYPE_STATUS } from 'components/status';
import { Meter } from 'model/meter';

export const METER_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE'
} as const;

export const METER_STATUS_OPTIONS = [
  { value: METER_STATUS.ACTIVE, label: 'Hoạt động' },
  { value: METER_STATUS.INACTIVE, label: 'Không hoạt động' }
];

export const METER_STATUS_LABEL_MAP: Record<string, string> = {
  ACTIVE: 'Hoạt động',
  INACTIVE: 'Không hoạt động',
  IN_STOCK: 'Lưu kho',
  STOCK: 'Lưu kho',
  STORAGE: 'Lưu kho',
  WAREHOUSE: 'Lưu kho',
  NEW: 'Lưu kho',
  INSTALLED: 'Đã lắp',
  USING: 'Đã lắp'
};

export const METER_STATUS_TYPE_MAP: Record<string, TYPE_STATUS> = {
  ACTIVE: TYPE_STATUS.SUCCESS,
  INACTIVE: TYPE_STATUS.DISABLED,
  IN_STOCK: TYPE_STATUS.PENDING,
  STOCK: TYPE_STATUS.PENDING,
  STORAGE: TYPE_STATUS.PENDING,
  WAREHOUSE: TYPE_STATUS.PENDING,
  NEW: TYPE_STATUS.PENDING,
  INSTALLED: TYPE_STATUS.SUCCESS,
  USING: TYPE_STATUS.SUCCESS
};

export const METER_TYPE = {
  FEEDER: 'FEEDER',
  CUSTOMER: 'CUSTOMER'
} as const;

export const METER_TYPE_OPTIONS = [
  { value: METER_TYPE.FEEDER, label: 'Lộ tổng' },
  { value: METER_TYPE.CUSTOMER, label: 'Khách hàng' }
];

export const METER_TYPE_LABEL_MAP: Record<string, string> = {
  FEEDER: 'Lộ tổng',
  CUSTOMER: 'Khách hàng',
  LO_TONG: 'Lộ tổng',
  CONG_TO_KHACH_HANG: 'Khách hàng'
};

export const VOLTAGE_LEVEL_OPTIONS = [
  { value: 'HA_AP', label: 'Hạ áp' },
  { value: 'TRUNG_AP', label: 'Trung áp' },
  { value: 'CAO_AP', label: 'Cao áp' }
];

export const VOLTAGE_LEVEL_LABEL_MAP: Record<string, string> = {
  HA_AP: 'Hạ áp',
  TRUNG_AP: 'Trung áp',
  CAO_AP: 'Cao áp'
};

export const VOLTAGE_TYPE_OPTIONS = [
  { value: '1P2W', label: '1P2W' },
  { value: '3P3W', label: '3P3W' },
  { value: '3P4W', label: '3P4W' }
];

export const VOLTAGE_TYPE_LABEL_MAP: Record<string, string> = {
  '1P2W': '1P2W',
  '3P3W': '3P3W',
  '3P4W': '3P4W'
};

export const getMeterRecordId = (meter?: Meter) => meter?.meterId || meter?.id || '';

export const getMeterStatusLabel = (status?: string) =>
  status ? METER_STATUS_LABEL_MAP[status] || status : '-';

export const getMeterStatusType = (status?: string) =>
  status ? METER_STATUS_TYPE_MAP[status] || TYPE_STATUS.DEFAULT : TYPE_STATUS.DEFAULT;

export const normalizeMeterStatus = (status?: string) => {
  if (!status) return METER_STATUS.ACTIVE;
  if (['INSTALLED', 'USING'].includes(status)) return METER_STATUS.ACTIVE;
  if (['IN_STOCK', 'STOCK', 'STORAGE', 'WAREHOUSE', 'NEW'].includes(status)) {
    return METER_STATUS.INACTIVE;
  }
  return status;
};

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

export const getVoltageLevelLabel = (voltageLevel?: string) =>
  voltageLevel ? VOLTAGE_LEVEL_LABEL_MAP[voltageLevel] || voltageLevel : '-';

export const normalizeVoltageLevel = (voltageLevel?: string) => {
  if (!voltageLevel) return '';
  const label = VOLTAGE_LEVEL_LABEL_MAP[voltageLevel];
  return (
    VOLTAGE_LEVEL_OPTIONS.find((option) => option.label === label || option.value === voltageLevel)
      ?.value || voltageLevel
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
