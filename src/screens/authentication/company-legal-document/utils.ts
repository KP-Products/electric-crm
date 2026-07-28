import { TYPE_STATUS } from 'components/status';
import { type AppSelectOption } from 'components/select';
import { ErrorBase } from 'model/common';
import { Employee } from 'model/employee';
import { CompanyLegalDocumentAttachmentFile } from 'services/company-legal-document-services';
import { FORMAT_DATE_API } from 'utils/date';
import {
  DOCUMENT_TYPE as COMPANY_LEGAL_DOCUMENT_TYPE,
  DOCUMENT_TYPE_FILTER_OPTIONS as COMPANY_LEGAL_DOCUMENT_TYPE_FILTER_OPTIONS,
  DOCUMENT_TYPE_OPTIONS as COMPANY_LEGAL_DOCUMENT_TYPE_OPTIONS,
  getDocumentTypeLabel as getCompanyLegalDocumentTypeLabel,
  normalizeDocumentType as normalizeCompanyLegalDocumentType
} from 'utils/document-type';
import { MAX_UPLOAD_FILE_SIZE } from 'utils/upload';

export const DATE_API_FORMAT = FORMAT_DATE_API;
export const ACCEPTED_ATTACHMENT_EXTENSIONS = [
  'pdf',
  'doc',
  'docx',
  'xls',
  'xlsx',
  'jpg',
  'jpeg',
  'png'
];
export const MAX_ATTACHMENT_FILE_SIZE = MAX_UPLOAD_FILE_SIZE;
export const ACCEPTED_ATTACHMENT_TEXT = ACCEPTED_ATTACHMENT_EXTENSIONS.map((extension) =>
  extension.toUpperCase()
).join(', ');

export {
  COMPANY_LEGAL_DOCUMENT_TYPE,
  COMPANY_LEGAL_DOCUMENT_TYPE_FILTER_OPTIONS,
  COMPANY_LEGAL_DOCUMENT_TYPE_OPTIONS,
  getCompanyLegalDocumentTypeLabel,
  normalizeCompanyLegalDocumentType
};

export const COMPANY_LEGAL_DOCUMENT_STATUS = {
  ACTIVE: 'ACTIVE',
  ARCHIVED: 'ARCHIVED'
} as const;

export const COMPANY_LEGAL_DOCUMENT_STATUS_OPTIONS: AppSelectOption[] = [
  { value: COMPANY_LEGAL_DOCUMENT_STATUS.ACTIVE, label: 'Đang hiệu lực' },
  { value: COMPANY_LEGAL_DOCUMENT_STATUS.ARCHIVED, label: 'Đã lưu trữ' }
];

export const COMPANY_LEGAL_DOCUMENT_STATUS_FILTER_OPTIONS: AppSelectOption[] = [
  { value: '', label: '-- Tất cả --' },
  ...COMPANY_LEGAL_DOCUMENT_STATUS_OPTIONS
];

export const getCompanyLegalDocumentStatusLabel = (value?: string) =>
  String(
    COMPANY_LEGAL_DOCUMENT_STATUS_OPTIONS.find((option) => option.value === value)?.label ||
      value ||
      ''
  );

const normalizeLookupKey = (value?: string) =>
  value
    ?.trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '') || '';

const COMPANY_LEGAL_DOCUMENT_STATUS_ALIAS_MAP: Record<string, string> = {
  ACTIVE: COMPANY_LEGAL_DOCUMENT_STATUS.ACTIVE,
  DANG_HIEU_LUC: COMPANY_LEGAL_DOCUMENT_STATUS.ACTIVE,
  CON_HIEU_LUC: COMPANY_LEGAL_DOCUMENT_STATUS.ACTIVE,
  HIEU_LUC: COMPANY_LEGAL_DOCUMENT_STATUS.ACTIVE,
  ARCHIVED: COMPANY_LEGAL_DOCUMENT_STATUS.ARCHIVED,
  DA_LUU_TRU: COMPANY_LEGAL_DOCUMENT_STATUS.ARCHIVED,
  LUU_TRU: COMPANY_LEGAL_DOCUMENT_STATUS.ARCHIVED,
  HET_HIEU_LUC: COMPANY_LEGAL_DOCUMENT_STATUS.ARCHIVED,
  INACTIVE: COMPANY_LEGAL_DOCUMENT_STATUS.ARCHIVED
};

export const normalizeCompanyLegalDocumentStatus = (value?: string) =>
  COMPANY_LEGAL_DOCUMENT_STATUS_ALIAS_MAP[normalizeLookupKey(value)] || '';

export const getEmployeeLabel = (employee: Employee) =>
  employee.fullName || employee.employeeCode || employee.email || String(employee.id);

export const buildEmployeeOptions = (employees: Employee[]): AppSelectOption[] =>
  employees
    .filter((employee) => employee.id !== undefined && employee.id !== null)
    .map((employee) => ({
      value: String(employee.id),
      label: getEmployeeLabel(employee)
    }));

export const isAcceptedAttachmentFile = (file: File) => {
  const extension = file.name.split('.').pop()?.toLowerCase();
  return Boolean(extension && ACCEPTED_ATTACHMENT_EXTENSIONS.includes(extension));
};

export const getAttachmentFileName = (filePath?: string) =>
  filePath?.split(/[\\/]/).pop() || 'van-ban-phap-ly';

export const getErrorContent = (error: unknown, fallback: string) => {
  const apiError = error as (ErrorBase & { message?: string; detailMessage?: string }) | undefined;
  return (
    apiError?.businessErrorMessage ||
    apiError?.systemErrorMessage ||
    apiError?.detailMessage ||
    apiError?.message ||
    fallback
  );
};

const getAttachmentContentType = (response: CompanyLegalDocumentAttachmentFile) =>
  (response.contentType || response.blob.type || '').toLowerCase();

const isJsonContentType = (contentType: string) => {
  const normalizedContentType = contentType.split(';')[0]?.trim();
  return (
    normalizedContentType === 'application/json' ||
    normalizedContentType === 'text/json' ||
    normalizedContentType.endsWith('+json')
  );
};

const looksLikeApiError = (value: unknown) => {
  const error = value as
    | (ErrorBase & { error?: string; message?: string; status?: number })
    | null
    | undefined;

  return Boolean(
    error &&
      typeof error === 'object' &&
      (error.businessErrorMessage ||
        error.systemErrorMessage ||
        error.detailMessage ||
        error.message ||
        error.error ||
        error.status)
  );
};

export const isAttachmentFileResponse = (
  response: unknown
): response is CompanyLegalDocumentAttachmentFile => {
  const attachmentResponse = response as CompanyLegalDocumentAttachmentFile | undefined;
  if (!attachmentResponse?.blob || !(attachmentResponse.blob instanceof Blob)) return false;

  return !isJsonContentType(getAttachmentContentType(attachmentResponse));
};

export const getAttachmentResponseError = async (response: unknown) => {
  const attachmentResponse = response as CompanyLegalDocumentAttachmentFile | undefined;
  if (!attachmentResponse?.blob || !(attachmentResponse.blob instanceof Blob)) {
    return response;
  }

  const contentType = getAttachmentContentType(attachmentResponse);
  const shouldParseBlob = !contentType || isJsonContentType(contentType);
  if (!shouldParseBlob) return undefined;

  try {
    const text = await attachmentResponse.blob.text();
    const parsed = JSON.parse(text);
    if (isJsonContentType(contentType) || looksLikeApiError(parsed)) return parsed;
    return undefined;
  } catch {
    return isJsonContentType(contentType) ? response : undefined;
  }
};

export const getStatusType = (status?: string): TYPE_STATUS => {
  if (!status) return TYPE_STATUS.DEFAULT;
  if (status === COMPANY_LEGAL_DOCUMENT_STATUS.ACTIVE) return TYPE_STATUS.SUCCESS;
  if (status === COMPANY_LEGAL_DOCUMENT_STATUS.ARCHIVED) return TYPE_STATUS.DISABLED;

  const normalizedStatus = status.toLowerCase();
  if (
    normalizedStatus.includes('het') ||
    normalizedStatus.includes('hết') ||
    normalizedStatus.includes('luu tru') ||
    normalizedStatus.includes('lưu trữ') ||
    normalizedStatus.includes('inactive')
  ) {
    return TYPE_STATUS.DISABLED;
  }
  if (
    normalizedStatus.includes('con') ||
    normalizedStatus.includes('còn') ||
    normalizedStatus.includes('active')
  ) {
    return TYPE_STATUS.SUCCESS;
  }
  return TYPE_STATUS.DEFAULT;
};
