import { MeterVerificationConfig } from 'model/meter-verification';
import moment from 'moment';
import { API_DATE_INPUT_FORMATS, FORMAT_DATE_API } from 'utils/date';

export const METER_VERIFICATION_CONFIG_STORAGE_KEY = 'electric-crm:meter-verification-config';
export const DATE_API_FORMAT = FORMAT_DATE_API;

export const EQUIPMENT_TYPE_OPTIONS = [
  { value: 'METER_1P_ELECTRONIC', label: 'Công tơ 1 pha điện tử' },
  { value: 'METER_3P_ELECTRONIC', label: 'Công tơ 3 pha điện tử' },
  { value: 'METER_3P_MECHANICAL', label: 'Công tơ 3 pha điện cơ' },
  { value: 'TU', label: 'TU (biến áp đo lường)' },
  { value: 'TI', label: 'TI (biến dòng đo lường)' }
];

export const RESULT_STATUS_OPTIONS = [
  { value: 'PASS', label: 'Đạt' },
  { value: 'FAILED', label: 'Không đạt' },
  { value: 'PENDING', label: 'Chờ kết quả' }
];

export const RESULT_STATUS_LABEL_MAP: Record<string, string> = {
  PASS: 'Đạt',
  PASSED: 'Đạt',
  FAILED: 'Không đạt',
  FAIL: 'Không đạt',
  PENDING: 'Chờ kết quả'
};

export const DEFAULT_VERIFICATION_CONFIGS: MeterVerificationConfig[] = EQUIPMENT_TYPE_OPTIONS.map(
  (option) => ({
    equipmentType: option.value,
    label: option.label,
    cycleMonths: 36,
    warningDays: 30,
    effectiveDate: moment().format(DATE_API_FORMAT)
  })
);

export const getEquipmentTypeLabel = (equipmentType?: string) =>
  EQUIPMENT_TYPE_OPTIONS.find((option) => option.value === equipmentType)?.label ||
  equipmentType ||
  '-';

export const getResultStatusLabel = (status?: string) =>
  status ? RESULT_STATUS_LABEL_MAP[status] || status : '-';

export const calculateNextVerificationDate = (verificationDate: string, cycleMonths?: number) => {
  if (!verificationDate || !cycleMonths) return '';
  const date = moment(verificationDate, API_DATE_INPUT_FORMATS, true);
  return date.isValid() ? date.add(cycleMonths, 'months').format(DATE_API_FORMAT) : '';
};

export const getConfigByType = (configs: MeterVerificationConfig[], equipmentType?: string) =>
  configs.find((config) => config.equipmentType === equipmentType) || configs[0];
