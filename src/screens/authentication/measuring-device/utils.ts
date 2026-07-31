import { DEFAULT_PAGE_SIZE, K_SIZE_1, NULL_VALUE } from '@constant';
import { TYPE_STATUS } from 'components/status';
import { ErrorBase } from 'model/common';
import {
  CreateMeasuringDeviceReq,
  MeasuringDevice,
  SearchMeasuringDevicesReq,
  UpdateMeasuringDeviceReq
} from 'model/measuring-device';
import moment from 'moment';
import { API_DATE_INPUT_FORMATS, FORMAT_DATE_API, FORMAT_DATE_PARAMS } from 'utils/date';
import type { MeasuringDeviceFilter, MeasuringDeviceForm } from './hooks/useMeasuringDeviceForm';

export const DEVICE_TYPE_OPTIONS = [
  { value: 'TU', label: 'TU (biến áp đo lường)' },
  { value: 'TI', label: 'TI (biến dòng đo lường)' }
];

export const DEVICE_STATUS_OPTIONS = [
  { value: 'DANG_SU_DUNG', label: 'Đang sử dụng' },
  { value: 'LUU_KHO', label: 'Lưu kho' },
  { value: 'NGUNG_SU_DUNG', label: 'Ngừng sử dụng' }
];

const statusLabels: Record<string, string> = {
  DANG_SU_DUNG: 'Đang sử dụng',
  ACTIVE: 'Đang sử dụng',
  USING: 'Đang sử dụng',
  LUU_KHO: 'Lưu kho',
  IN_STOCK: 'Lưu kho',
  STOCK: 'Lưu kho',
  NGUNG_SU_DUNG: 'Ngừng sử dụng',
  INACTIVE: 'Ngừng sử dụng'
};
const statusTypes: Record<string, TYPE_STATUS> = {
  DANG_SU_DUNG: TYPE_STATUS.SUCCESS,
  ACTIVE: TYPE_STATUS.SUCCESS,
  USING: TYPE_STATUS.SUCCESS,
  LUU_KHO: TYPE_STATUS.PENDING,
  IN_STOCK: TYPE_STATUS.PENDING,
  STOCK: TYPE_STATUS.PENDING,
  NGUNG_SU_DUNG: TYPE_STATUS.DISABLED,
  INACTIVE: TYPE_STATUS.DISABLED
};

const normalized = (value?: string) => value?.trim() || undefined;
const dateForForm = (value?: string) => {
  if (!value) return '';
  const parsed = moment(value, API_DATE_INPUT_FORMATS, true);
  return parsed.isValid() ? parsed.format(FORMAT_DATE_API) : value;
};
const dateForDisplay = (value?: string) => {
  if (!value) return NULL_VALUE;
  const parsed = moment(value, API_DATE_INPUT_FORMATS, true);
  return parsed.isValid() ? parsed.format(FORMAT_DATE_PARAMS) : value;
};

export const defaultDeviceFilter: MeasuringDeviceFilter = {
  deviceCode: '',
  serialNumber: '',
  deviceType: '',
  status: ''
};
export const defaultDeviceForm: MeasuringDeviceForm = {
  deviceCode: '',
  serialNumber: '',
  deviceType: '',
  manufacturer: '',
  model: '',
  ratio: '',
  accuracyClass: '',
  purchaseDate: '',
  installedDate: '',
  inspectionDate: '',
  inspectionDueDate: '',
  status: 'DANG_SU_DUNG',
  note: ''
};
export const getDeviceStatusLabel = (status?: string) =>
  status ? statusLabels[status] || status : NULL_VALUE;
export const getDeviceStatusType = (status?: string) =>
  status ? statusTypes[status] || TYPE_STATUS.DEFAULT : TYPE_STATUS.DEFAULT;
export const getDeviceTypeLabel = (type?: string) =>
  DEVICE_TYPE_OPTIONS.find((item) => item.value === type)?.label || type || NULL_VALUE;
export const renderDeviceDate = dateForDisplay;
export const getDeviceError = (error?: ErrorBase, fallback = 'Có lỗi xảy ra') =>
  error?.businessErrorMessage || error?.systemErrorMessage || error?.detailMessage || fallback;

export const buildSearchBody = (
  filter: MeasuringDeviceFilter,
  page: number
): SearchMeasuringDevicesReq => ({
  page: page - K_SIZE_1,
  size: DEFAULT_PAGE_SIZE,
  deviceCode: normalized(filter.deviceCode),
  serialNumber: normalized(filter.serialNumber),
  deviceType: normalized(filter.deviceType) as 'TU' | 'TI' | undefined,
  status: normalized(filter.status)
});

export const toForm = (device: MeasuringDevice): MeasuringDeviceForm => ({
  deviceCode: device.deviceCode || '',
  serialNumber: device.serialNumber || '',
  deviceType: device.deviceType || '',
  manufacturer: device.manufacturer || '',
  model: device.model || '',
  ratio: device.ratio || '',
  accuracyClass: device.accuracyClass || '',
  purchaseDate: dateForForm(device.purchaseDate),
  installedDate: dateForForm(device.installedDate),
  inspectionDate: dateForForm(device.inspectionDate),
  inspectionDueDate: dateForForm(device.inspectionDueDate),
  status: device.status || 'DANG_SU_DUNG',
  note: device.note || ''
});

const requestBody = (data: MeasuringDeviceForm): CreateMeasuringDeviceReq => ({
  deviceCode: data.deviceCode.trim(),
  ratio: data.ratio.trim(),
  serialNumber: normalized(data.serialNumber),
  deviceType: normalized(data.deviceType) as 'TU' | 'TI' | undefined,
  manufacturer: normalized(data.manufacturer),
  model: normalized(data.model),
  accuracyClass: normalized(data.accuracyClass),
  purchaseDate: normalized(data.purchaseDate),
  installedDate: normalized(data.installedDate),
  inspectionDate: normalized(data.inspectionDate),
  inspectionDueDate: normalized(data.inspectionDueDate),
  status: normalized(data.status),
  note: normalized(data.note)
});
export const buildCreateBody = requestBody;
export const buildUpdateBody = (
  id: number,
  data: MeasuringDeviceForm
): UpdateMeasuringDeviceReq => ({ id, ...requestBody(data) });
