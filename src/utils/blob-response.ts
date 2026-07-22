import { ErrorBase } from 'model/common';

export interface BlobFileResponse {
  blob: Blob;
  contentType?: string;
  fileName?: string;
}

const getBlobContentType = (response: BlobFileResponse) =>
  (response.contentType || response.blob.type || '').toLowerCase();

export const getFileNameFromDisposition = (contentDisposition?: string) => {
  if (!contentDisposition) return undefined;

  const utf8FileName = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i)?.[1];
  if (utf8FileName) return decodeURIComponent(utf8FileName);

  return contentDisposition.match(/filename="?([^";]+)"?/i)?.[1];
};

export const isJsonContentType = (contentType: string) => {
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

export const isBlobFileResponse = (response: unknown): response is BlobFileResponse => {
  const fileResponse = response as BlobFileResponse | undefined;
  if (!fileResponse?.blob || !(fileResponse.blob instanceof Blob)) return false;

  return !isJsonContentType(getBlobContentType(fileResponse));
};

export const canViewBlobInline = (response: BlobFileResponse, allowedContentTypes: string[]) => {
  const normalizedContentType = getBlobContentType(response).split(';')[0]?.trim();
  return allowedContentTypes.includes(normalizedContentType);
};

export const getBlobResponseError = async (response: unknown) => {
  const fileResponse = response as BlobFileResponse | undefined;
  if (!fileResponse?.blob || !(fileResponse.blob instanceof Blob)) return response;

  const contentType = getBlobContentType(fileResponse);
  const shouldParseBlob = !contentType || isJsonContentType(contentType);
  if (!shouldParseBlob) return undefined;

  try {
    const text = await fileResponse.blob.text();
    const parsed = JSON.parse(text);
    if (isJsonContentType(contentType) || looksLikeApiError(parsed)) return parsed;
    return undefined;
  } catch {
    return isJsonContentType(contentType) ? response : undefined;
  }
};

export const downloadBlobResponse = (response: BlobFileResponse, fileName: string) => {
  const downloadUrl = URL.createObjectURL(response.blob);
  const link = window.document.createElement('a');
  link.href = downloadUrl;
  link.download = response.fileName || fileName;
  window.document.body.appendChild(link);
  link.click();
  window.document.body.removeChild(link);
  URL.revokeObjectURL(downloadUrl);
};
