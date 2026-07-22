import { TYPE_STATUS } from 'components/status';
import { ErrorBase } from 'model/common';
import { CompanyLegalDocumentAttachmentFile } from 'services/company-legal-document-services';

export const DATE_API_FORMAT = 'YYYY-MM-DD';
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
export const MAX_ATTACHMENT_FILE_SIZE = 10 * 1024 * 1024;
export const ACCEPTED_ATTACHMENT_TEXT = ACCEPTED_ATTACHMENT_EXTENSIONS.map((extension) =>
  extension.toUpperCase()
).join(', ');

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
  const normalizedStatus = status.toLowerCase();
  if (
    normalizedStatus.includes('het') ||
    normalizedStatus.includes('hết') ||
    normalizedStatus.includes('inactive')
  ) {
    return TYPE_STATUS.ERROR;
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
