export const MAX_UPLOAD_FILE_SIZE = 10 * 1024 * 1024;
export const MAX_UPLOAD_FILE_SIZE_TEXT = '10MB';

export const isValidUploadFileSize = (file?: File) =>
  Boolean(file && file.size <= MAX_UPLOAD_FILE_SIZE);

export const getUploadFileSizeError = (subject = 'file') =>
  `Dung lượng ${subject} không được vượt quá ${MAX_UPLOAD_FILE_SIZE_TEXT}`;

export const formatUploadFileSize = (size?: number) => {
  if (size === undefined || size === null) return '';
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`;
  return `${(size / 1024 / 1024).toFixed(2)} MB`;
};
