import { DEFAULT_PAGE_SIZE, K_SIZE_1, NULL_VALUE } from '@constant';
import { TYPE_STATUS } from 'components/status';
import { ErrorBase } from 'model/common';
import {
  ElectricalDeviceVerificationStatus,
  SearchInspectionLocationsReq
} from 'model/electrical-device';
import moment from 'moment';
import { API_DATE_INPUT_FORMATS, FORMAT_DATE_API, FORMAT_DATE_PARAMS } from 'utils/date';

export interface ElectricalDeviceVerificationFilter {
  locationId: string;
  locationName: string;
  deviceType: string;
  verificationStatus: string;
  verificationDateFrom: string;
  verificationDateTo: string;
  nextVerificationDateFrom: string;
  nextVerificationDateTo: string;
}

export const DEFAULT_FILTER: ElectricalDeviceVerificationFilter = {
  locationId: '',
  locationName: '',
  deviceType: '',
  verificationStatus: '',
  verificationDateFrom: '',
  verificationDateTo: '',
  nextVerificationDateFrom: '',
  nextVerificationDateTo: ''
};

export const VERIFICATION_STATUS_OPTIONS = [
  { value: 'OVERDUE', label: 'Quá hạn' },
  { value: 'DUE_SOON', label: 'Sắp hết hạn' },
  { value: 'VALID', label: 'Còn hạn' }
];

export const LOCATION_TYPE_OPTIONS = [
  { value: 'METERING_STATION', label: 'Trạm đo đếm' },
  { value: 'RMU_CABINET', label: 'Tủ RMU' },
  { value: 'OTHER', label: 'Khác' }
];

const optional = (value: string) => value.trim() || undefined;

export const buildLocationSearchBody = (
  filter: ElectricalDeviceVerificationFilter,
  page: number
): SearchInspectionLocationsReq => {
  const numericId = Number(filter.locationId);
  return {
    page: page - K_SIZE_1,
    size: DEFAULT_PAGE_SIZE,
    ...(Number.isInteger(numericId) && numericId > 0 ? { id: numericId } : {}),
    locationName: optional(filter.locationName),
    deviceType: optional(filter.deviceType),
    verificationStatus: optional(filter.verificationStatus) as
      | ElectricalDeviceVerificationStatus
      | undefined,
    verificationDateFrom: optional(filter.verificationDateFrom),
    verificationDateTo: optional(filter.verificationDateTo),
    nextVerificationDateFrom: optional(filter.nextVerificationDateFrom),
    nextVerificationDateTo: optional(filter.nextVerificationDateTo)
  };
};

export const formatInspectionDate = (value?: string) => {
  if (!value) return NULL_VALUE;
  const parsed = moment(value, API_DATE_INPUT_FORMATS, true);
  return parsed.isValid() ? parsed.format(FORMAT_DATE_PARAMS) : value;
};

export const normalizeInspectionDate = (value?: string) => {
  if (!value) return undefined;
  const parsed = moment(value, API_DATE_INPUT_FORMATS, true);
  return parsed.isValid() ? parsed.format(FORMAT_DATE_API) : value;
};

export const getVerificationStatusLabel = (status?: string) => {
  if (status === 'OVERDUE') return 'Quá hạn';
  if (status === 'DUE_SOON') return 'Sắp hết hạn';
  if (status === 'VALID') return 'Còn hạn';
  return 'Chưa có hạn kiểm định';
};

export const getVerificationStatusType = (status?: string) => {
  if (status === 'OVERDUE') return TYPE_STATUS.ERROR;
  if (status === 'DUE_SOON') return TYPE_STATUS.PENDING;
  if (status === 'VALID') return TYPE_STATUS.SUCCESS;
  return TYPE_STATUS.DEFAULT;
};

export const getElectricalDeviceError = (error?: ErrorBase, fallback = 'Có lỗi xảy ra') =>
  error?.businessErrorMessage ||
  error?.systemErrorMessage ||
  error?.detailMessage ||
  error?.message ||
  fallback;

export const hasVerificationRequirement = (value?: boolean | string) =>
  value === true ||
  ['1', 'true'].includes(
    String(value || '')
      .trim()
      .toLowerCase()
  );
