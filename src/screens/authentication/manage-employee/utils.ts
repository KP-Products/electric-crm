import { TYPE_STATUS } from 'components/status';
import { type AppSelectOption } from 'components/select';
import { ErrorBase } from 'model/common';
import { EMPLOYEE_GENDER, EMPLOYMENT_STATUS, EMPLOYMENT_TYPE, Employee } from 'model/employee';
import { CURRENCY_VND, NULL_VALUE } from 'utils/constant';
import { formatCurrency } from 'utils/math';

export const DATE_API_FORMAT = 'YYYY-MM-DD';

export const EMPLOYEE_GENDER_OPTIONS: AppSelectOption[] = [
  { value: '', label: '-- Tất cả --' },
  { value: EMPLOYEE_GENDER.MALE, label: 'Nam' },
  { value: EMPLOYEE_GENDER.FEMALE, label: 'Nữ' },
  { value: EMPLOYEE_GENDER.OTHER, label: 'Khác' }
];

export const EMPLOYMENT_STATUS_OPTIONS: AppSelectOption[] = [
  { value: '', label: '-- Tất cả --' },
  { value: EMPLOYMENT_STATUS.ACTIVE, label: 'Đang làm việc' },
  { value: EMPLOYMENT_STATUS.PROBATION, label: 'Thử việc' },
  { value: EMPLOYMENT_STATUS.RESIGNED, label: 'Đã nghỉ việc' },
  { value: EMPLOYMENT_STATUS.SUSPENDED, label: 'Tạm nghỉ' }
];

export const EMPLOYMENT_TYPE_OPTIONS: AppSelectOption[] = [
  { value: '', label: '-- Tất cả --' },
  { value: EMPLOYMENT_TYPE.FULL_TIME, label: 'Full-time' },
  { value: EMPLOYMENT_TYPE.PART_TIME, label: 'Part-time' },
  { value: EMPLOYMENT_TYPE.CONTRACT, label: 'Hợp đồng' },
  { value: EMPLOYMENT_TYPE.SEASONAL, label: 'Thời vụ' }
];

export const SALARY_CHANGE_TYPE_LABEL_MAP: Record<string, string> = {
  SALARY_INCREASE: 'Tăng lương',
  SALARY_DECREASE: 'Giảm lương',
  PROMOTION: 'Thăng chức',
  ADJUSTMENT: 'Điều chỉnh'
};

export const ACCEPTED_AVATAR_EXTENSIONS = ['jpg', 'jpeg', 'png'];
export const ACCEPTED_CONTRACT_EXTENSIONS = ['pdf', 'doc', 'docx'];
export const MAX_AVATAR_FILE_SIZE = 5 * 1024 * 1024;
export const MAX_CONTRACT_FILE_SIZE = 10 * 1024 * 1024;
export const INLINE_CONTRACT_MIME_TYPES = ['application/pdf'];
export const INLINE_AVATAR_MIME_TYPES = ['image/jpeg', 'image/png'];

const ACCEPTED_AVATAR_MIME_TYPES = ['image/jpeg', 'image/png'];
const ACCEPTED_CONTRACT_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/octet-stream'
];
const FILE_SIGNATURE_READ_SIZE = 8;
const ZIP_SIGNATURES = [
  [0x50, 0x4b, 0x03, 0x04],
  [0x50, 0x4b, 0x05, 0x06],
  [0x50, 0x4b, 0x07, 0x08]
];
const OLE_SIGNATURE = [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1];
const ACCEPTED_FILE_SIGNATURES: Record<string, number[][]> = {
  jpg: [[0xff, 0xd8, 0xff]],
  jpeg: [[0xff, 0xd8, 0xff]],
  png: [[0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]],
  pdf: [[0x25, 0x50, 0x44, 0x46]],
  doc: [OLE_SIGNATURE],
  docx: ZIP_SIGNATURES
};

export const displayText = (value?: string | number | null) => {
  if (value === undefined || value === null || value === '') return NULL_VALUE;
  return String(value);
};

export const optionalString = (value?: string | null) => {
  const normalizedValue = value?.trim();
  return normalizedValue || undefined;
};

export const optionalNumber = (value?: string | number | null) => {
  if (value === undefined || value === null || value === '') return undefined;
  const numberValue = Number(String(value).replaceAll(',', '').trim());
  return Number.isFinite(numberValue) ? numberValue : undefined;
};

export const toDatePickerValue = (value?: string | null) =>
  optionalString(value)?.slice(0, 10) || '';

export const getEmployeeGenderLabel = (value?: string) =>
  String(EMPLOYEE_GENDER_OPTIONS.find((option) => option.value === value)?.label || value || '');

export const getEmploymentStatusLabel = (value?: string) =>
  String(EMPLOYMENT_STATUS_OPTIONS.find((option) => option.value === value)?.label || value || '');

export const getEmploymentTypeLabel = (value?: string) =>
  String(EMPLOYMENT_TYPE_OPTIONS.find((option) => option.value === value)?.label || value || '');

export const getEmploymentStatusType = (value?: string): TYPE_STATUS => {
  if (value === EMPLOYMENT_STATUS.ACTIVE) return TYPE_STATUS.SUCCESS;
  if (value === EMPLOYMENT_STATUS.PROBATION) return TYPE_STATUS.PENDING;
  if (value === EMPLOYMENT_STATUS.RESIGNED) return TYPE_STATUS.DISABLED;
  if (value === EMPLOYMENT_STATUS.SUSPENDED) return TYPE_STATUS.ERROR;
  return TYPE_STATUS.DEFAULT;
};

export const getEmployeeDisplayName = (employee?: Employee) =>
  employee?.fullName || employee?.employeeCode || NULL_VALUE;

export const getEmployeeInitials = (employee?: Employee) => {
  const normalizedName = getEmployeeDisplayName(employee).split(/\s+/).filter(Boolean);
  if (!normalizedName.length || normalizedName[0] === NULL_VALUE) return 'NS';

  return normalizedName
    .slice(-2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();
};

export const formatSalary = (value?: number) => {
  if (value === undefined || value === null) return NULL_VALUE;
  return formatCurrency(value, ',', CURRENCY_VND, true) || NULL_VALUE;
};

export const getEmployeeErrorContent = (error: unknown, fallback: string) => {
  const apiError = error as (ErrorBase & { message?: string; detailMessage?: string }) | undefined;
  return (
    apiError?.businessErrorMessage ||
    apiError?.systemErrorMessage ||
    apiError?.detailMessage ||
    apiError?.message ||
    fallback
  );
};

const getFileExtension = (fileName?: string) => fileName?.split('.').pop()?.toLowerCase() || '';

const isAcceptedExtension = (fileName: string, extensions: string[]) =>
  extensions.includes(getFileExtension(fileName));

const isAcceptedMimeType = (file: File, mimeTypes: string[]) => {
  const mimeType = file.type.toLowerCase();
  if (!mimeType) return true;
  return mimeTypes.includes(mimeType);
};

export const isAcceptedAvatarFile = (file: File) =>
  isAcceptedExtension(file.name, ACCEPTED_AVATAR_EXTENSIONS) &&
  isAcceptedMimeType(file, ACCEPTED_AVATAR_MIME_TYPES);

export const isAcceptedContractFile = (file: File) =>
  isAcceptedExtension(file.name, ACCEPTED_CONTRACT_EXTENSIONS) &&
  isAcceptedMimeType(file, ACCEPTED_CONTRACT_MIME_TYPES);

const startsWithSignature = (bytes: Uint8Array, signature: number[]) =>
  signature.every((byte, index) => bytes[index] === byte);

export const hasAcceptedFileSignature = async (file: File) => {
  const extension = getFileExtension(file.name);
  const signatures = ACCEPTED_FILE_SIGNATURES[extension];
  if (!signatures?.length) return false;

  const buffer = await file.slice(0, FILE_SIGNATURE_READ_SIZE).arrayBuffer();
  const bytes = new Uint8Array(buffer);
  return signatures.some((signature) => startsWithSignature(bytes, signature));
};

export const getContractFileName = (employee?: Employee, fallback?: string) =>
  employee?.contractFileName ||
  employee?.contractFilePath?.split(/[\\/]/).pop() ||
  fallback ||
  'hop-dong-lao-dong';
