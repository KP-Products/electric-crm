import { TYPE_STATUS } from 'components/status';
import { type AppSelectOption } from 'components/select';
import { ErrorBase } from 'model/common';
import { IncomingDocumentAttachmentFile } from 'services/incoming-document-services';
import { FORMAT_DATE_API } from 'utils/date';
import {
  DOCUMENT_TYPE as INCOMING_DOCUMENT_TYPE,
  DOCUMENT_TYPE_FILTER_OPTIONS as INCOMING_DOCUMENT_TYPE_FILTER_OPTIONS,
  DOCUMENT_TYPE_OPTIONS as INCOMING_DOCUMENT_TYPE_OPTIONS,
  getDocumentTypeLabel as getIncomingDocumentTypeLabel,
  normalizeDocumentType as normalizeIncomingDocumentType
} from 'utils/document-type';
import { MAX_UPLOAD_FILE_SIZE } from 'utils/upload';

export const DATE_API_FORMAT = FORMAT_DATE_API;
export {
  INCOMING_DOCUMENT_TYPE,
  INCOMING_DOCUMENT_TYPE_FILTER_OPTIONS,
  INCOMING_DOCUMENT_TYPE_OPTIONS,
  getIncomingDocumentTypeLabel,
  normalizeIncomingDocumentType
};
export const ACCEPTED_ATTACHMENT_EXTENSIONS = ['pdf', 'doc', 'docx', 'xls', 'png'];
export const MAX_ATTACHMENT_FILE_SIZE = MAX_UPLOAD_FILE_SIZE;
export const ACCEPTED_ATTACHMENT_TEXT = ACCEPTED_ATTACHMENT_EXTENSIONS.map((extension) =>
  extension.toUpperCase()
).join(', ');

const GENERIC_ATTACHMENT_MIME_TYPES = ['application/octet-stream'];
const FILE_SIGNATURE_READ_SIZE = 8;
const ACCEPTED_ATTACHMENT_MIME_TYPES: Record<string, string[]> = {
  pdf: ['application/pdf'],
  doc: ['application/msword'],
  docx: ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  xls: ['application/vnd.ms-excel'],
  png: ['image/png']
};
const INLINE_ATTACHMENT_MIME_TYPES = ['application/pdf', 'image/png'];
const ZIP_SIGNATURES = [
  [0x50, 0x4b, 0x03, 0x04],
  [0x50, 0x4b, 0x05, 0x06],
  [0x50, 0x4b, 0x07, 0x08]
];
const OLE_SIGNATURE = [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1];
const ACCEPTED_ATTACHMENT_SIGNATURES: Record<string, number[][]> = {
  pdf: [[0x25, 0x50, 0x44, 0x46]],
  doc: [OLE_SIGNATURE],
  docx: ZIP_SIGNATURES,
  xls: [OLE_SIGNATURE],
  png: [[0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]]
};

export const URGENCY_LEVEL_OPTIONS: AppSelectOption[] = [
  { value: '', label: 'Tất cả' },
  { value: 'NORMAL', label: 'Thường' },
  { value: 'URGENT', label: 'Khẩn' },
  { value: 'EXPRESS', label: 'Hỏa tốc' }
];

export const CONFIDENTIALITY_LEVEL_OPTIONS: AppSelectOption[] = [
  { value: '', label: 'Tất cả' },
  { value: 'NORMAL', label: 'Thường' },
  { value: 'CONFIDENTIAL', label: 'Mật' },
  { value: 'SECRET', label: 'Tối mật' }
];

export const getUrgencyLevelLabel = (value?: string) =>
  String(URGENCY_LEVEL_OPTIONS.find((option) => option.value === value)?.label || value || '');

export const getConfidentialityLevelLabel = (value?: string) =>
  String(
    CONFIDENTIALITY_LEVEL_OPTIONS.find((option) => option.value === value)?.label || value || ''
  );

export const getUrgencyLevelStatusType = (value?: string): TYPE_STATUS => {
  if (value === 'EXPRESS') return TYPE_STATUS.ERROR;
  if (value === 'URGENT') return TYPE_STATUS.PENDING;
  if (value === 'NORMAL') return TYPE_STATUS.SUCCESS;
  return TYPE_STATUS.DEFAULT;
};

export const getConfidentialityLevelStatusType = (value?: string): TYPE_STATUS => {
  if (value === 'SECRET') return TYPE_STATUS.ERROR;
  if (value === 'CONFIDENTIAL') return TYPE_STATUS.PENDING;
  if (value === 'NORMAL') return TYPE_STATUS.SUCCESS;
  return TYPE_STATUS.DEFAULT;
};

export const getAttachmentExtension = (fileName?: string) =>
  fileName?.split('.').pop()?.toLowerCase() || '';

export const isAcceptedAttachmentExtension = (fileName?: string) => {
  const extension = getAttachmentExtension(fileName);
  return Boolean(extension && ACCEPTED_ATTACHMENT_EXTENSIONS.includes(extension));
};

export const isAcceptedAttachmentMimeType = (file: File) => {
  const extension = getAttachmentExtension(file.name);
  if (!extension || !isAcceptedAttachmentExtension(file.name)) return false;

  const mimeType = file.type.toLowerCase();
  if (!mimeType || GENERIC_ATTACHMENT_MIME_TYPES.includes(mimeType)) return true;

  return ACCEPTED_ATTACHMENT_MIME_TYPES[extension]?.includes(mimeType) || false;
};

export const isAcceptedAttachmentFile = (file: File) =>
  isAcceptedAttachmentExtension(file.name) && isAcceptedAttachmentMimeType(file);

const startsWithSignature = (bytes: Uint8Array, signature: number[]) =>
  signature.every((byte, index) => bytes[index] === byte);

export const hasAcceptedAttachmentSignature = async (file: File) => {
  const extension = getAttachmentExtension(file.name);
  const signatures = ACCEPTED_ATTACHMENT_SIGNATURES[extension];
  if (!signatures?.length) return false;

  const buffer = await file.slice(0, FILE_SIGNATURE_READ_SIZE).arrayBuffer();
  const bytes = new Uint8Array(buffer);
  return signatures.some((signature) => startsWithSignature(bytes, signature));
};

export const getAttachmentFileName = (filePath?: string) =>
  filePath?.split(/[\\/]/).pop() || 'van-ban-den';

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

const getAttachmentContentType = (response: IncomingDocumentAttachmentFile) =>
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
): response is IncomingDocumentAttachmentFile => {
  const attachmentResponse = response as IncomingDocumentAttachmentFile | undefined;
  if (!attachmentResponse?.blob || !(attachmentResponse.blob instanceof Blob)) return false;

  return !isJsonContentType(getAttachmentContentType(attachmentResponse));
};

export const canViewAttachmentInline = (response: IncomingDocumentAttachmentFile) => {
  const normalizedContentType = getAttachmentContentType(response).split(';')[0]?.trim();
  return INLINE_ATTACHMENT_MIME_TYPES.includes(normalizedContentType);
};

export const getAttachmentResponseError = async (response: unknown) => {
  const attachmentResponse = response as IncomingDocumentAttachmentFile | undefined;
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
