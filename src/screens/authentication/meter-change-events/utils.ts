import { FILE_EXT, NULL_VALUE } from '@constant';
import { TYPE_STATUS } from 'components/status';
import { MeterChangeEventWithDetails } from 'model/meter-change-event';
import moment from 'moment';
import { FORMAT_DATE_API, FORMAT_DATE_PARAMS } from 'utils/date';

export const EVENT_DATE_FORM_FORMAT = FORMAT_DATE_API;
export const DATE_API_FORMAT = `${FORMAT_DATE_API} HH:mm:ss`;
export const EVENT_DATE_DISPLAY_FORMAT = 'DD/MM/YYYY HH:mm:ss';
const DATE_SERVER_INPUT_FORMATS = [
  DATE_API_FORMAT,
  'DD/MM/YYYY HH:mm:ss',
  'DD-MM-YYYY HH:mm',
  'DD/MM/YYYY HH:mm',
  'DD-MM-YYYY',
  'DD/MM/YYYY',
  moment.ISO_8601
];
export const METER_CHANGE_EXPORT_FILE_PREFIX = 'METER_CHANGE_EVENT';
export const METER_CHANGE_EXPORT_FILE_EXT = FILE_EXT.EXCEL2;

export const METER_CHANGE_EVENT_TYPE = {
  REPLACE: 'THAY_THE',
  REMOVE: 'THAO_GO',
  INSTALL: 'LAP_MOI'
} as const;

export const METER_CHANGE_STATUS = {
  DRAFT: 'MOI_TAO',
  PENDING: 'CHO_PHE_DUYET',
  APPROVED: 'DA_PHE_DUYET',
  REJECTED: 'TU_CHOI'
} as const;

export const API_SUPPORTED_EVENT_TYPE_OPTIONS = [
  { value: METER_CHANGE_EVENT_TYPE.REPLACE, label: 'Thay thế công tơ' },
  { value: METER_CHANGE_EVENT_TYPE.INSTALL, label: 'Lắp mới TI/TU' },
  { value: METER_CHANGE_EVENT_TYPE.REMOVE, label: 'Tháo gỡ thiết bị' }
];
export const EVENT_TYPE_OPTIONS = API_SUPPORTED_EVENT_TYPE_OPTIONS;

export const EVENT_TYPE_LABEL_MAP: Record<string, string> = {
  THAY_THE: 'Thay thế công tơ',
  REPLACE: 'Thay thế công tơ',
  THAO_GO: 'Tháo gỡ thiết bị',
  REMOVE: 'Tháo gỡ thiết bị',
  LAP_MOI: 'Lắp mới TI/TU',
  INSTALL: 'Lắp mới TI/TU',
  KIEM_DINH_LAI: 'Kiểm định lại',
  REVERIFY: 'Kiểm định lại',
  VERIFICATION: 'Kiểm định lại'
};

export const EVENT_STATUS_OPTIONS = [
  { value: METER_CHANGE_STATUS.DRAFT, label: 'Nháp' },
  { value: METER_CHANGE_STATUS.PENDING, label: 'Chờ phê duyệt' },
  { value: METER_CHANGE_STATUS.APPROVED, label: 'Đã phê duyệt' },
  { value: METER_CHANGE_STATUS.REJECTED, label: 'Từ chối' }
];

export const EVENT_STATUS_LABEL_MAP: Record<string, string> = {
  DONE: 'Hoàn thành',
  MOI_TAO: 'Nháp',
  NHAP: 'Nháp',
  DRAFT: 'Nháp',
  NEW: 'Nháp',
  CHO_PHE_DUYET: 'Chờ phê duyệt',
  PENDING: 'Chờ phê duyệt',
  AWAITING_APPROVAL: 'Chờ phê duyệt',
  DA_PHE_DUYET: 'Đã phê duyệt',
  APPROVED: 'Đã phê duyệt',
  TU_CHOI: 'Từ chối',
  REJECTED: 'Từ chối',
  DENIED: 'Từ chối'
};

export const EVENT_STATUS_TYPE_MAP: Record<string, TYPE_STATUS> = {
  DONE: TYPE_STATUS.DONE,
  MOI_TAO: TYPE_STATUS.DEFAULT,
  NHAP: TYPE_STATUS.DEFAULT,
  DRAFT: TYPE_STATUS.DEFAULT,
  NEW: TYPE_STATUS.DEFAULT,
  CHO_PHE_DUYET: TYPE_STATUS.PENDING,
  PENDING: TYPE_STATUS.PENDING,
  AWAITING_APPROVAL: TYPE_STATUS.PENDING,
  DA_PHE_DUYET: TYPE_STATUS.SUCCESS,
  APPROVED: TYPE_STATUS.SUCCESS,
  TU_CHOI: TYPE_STATUS.ERROR,
  REJECTED: TYPE_STATUS.ERROR,
  DENIED: TYPE_STATUS.ERROR
};

export const getEventTypeLabel = (eventType?: string) =>
  eventType ? EVENT_TYPE_LABEL_MAP[eventType] || eventType : NULL_VALUE;

export const getEventStatusLabel = (status?: string) =>
  status ? EVENT_STATUS_LABEL_MAP[status.trim().toUpperCase()] || status : NULL_VALUE;

export const getEventStatusType = (status?: string) =>
  status
    ? EVENT_STATUS_TYPE_MAP[status.trim().toUpperCase()] || TYPE_STATUS.DEFAULT
    : TYPE_STATUS.DEFAULT;

export const getEventRecordId = (record?: MeterChangeEventWithDetails) =>
  record?.event?.id ? String(record.event.id) : '';

export const displayText = (value?: string | number | null) => {
  if (value === undefined || value === null || value === '') return NULL_VALUE;
  return String(value);
};

const parseMeterChangeDate = (date: string) =>
  moment(date, DATE_SERVER_INPUT_FORMATS, true).isValid()
    ? moment(date, DATE_SERVER_INPUT_FORMATS, true)
    : moment(date);

const displayMeterChangeDate = (date: string, format: string) => {
  const parsedDate = parseMeterChangeDate(date);
  return parsedDate.isValid() ? parsedDate.format(format) : NULL_VALUE;
};

export const displayEventDate = (date?: string) =>
  date ? displayMeterChangeDate(date, FORMAT_DATE_PARAMS) : NULL_VALUE;

export const displayEventDateTime = (date?: string) =>
  date ? displayMeterChangeDate(date, EVENT_DATE_DISPLAY_FORMAT) : NULL_VALUE;

export const normalizeEventDateForForm = (date?: string) => {
  if (!date) return '';
  const parsedDate = parseMeterChangeDate(date);
  return parsedDate.isValid() ? parsedDate.format(EVENT_DATE_FORM_FORMAT) : '';
};

export const buildEventDateForSubmit = (date: string, timeSource: string) => {
  const selectedDate = moment(date, EVENT_DATE_FORM_FORMAT, true);
  const time = parseMeterChangeDate(timeSource);
  return selectedDate
    .hour(time.hour())
    .minute(time.minute())
    .second(time.second())
    .format(DATE_API_FORMAT);
};

export const getStatusGroup = (status?: string) => {
  const normalizedStatus = status || '';
  if (['DA_PHE_DUYET', 'APPROVED'].includes(normalizedStatus)) return METER_CHANGE_STATUS.APPROVED;
  if (['TU_CHOI', 'REJECTED', 'DENIED'].includes(normalizedStatus)) {
    return METER_CHANGE_STATUS.REJECTED;
  }
  if (['CHO_PHE_DUYET', 'PENDING', 'AWAITING_APPROVAL'].includes(normalizedStatus)) {
    return METER_CHANGE_STATUS.PENDING;
  }
  return METER_CHANGE_STATUS.DRAFT;
};

export const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

export const sanitizeExcelCellValue = (value: string) => {
  const normalizedValue = value.trimStart();
  return /^[=+\-@]/.test(normalizedValue) ? `'${value}` : value;
};
