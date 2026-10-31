import { MAX_UPLOAD_FILE_SIZE } from 'utils/upload';

export const validateDocumentFile = (file: Pick<File, 'name' | 'size'>) => {
  if (!/\.(pdf|doc|docx|xls|xlsx|jpg|jpeg|png)$/i.test(file.name)) {
    return 'Chỉ hỗ trợ PDF, DOC, DOCX, XLS, XLSX, JPG, PNG';
  }
  if (file.size > MAX_UPLOAD_FILE_SIZE) return 'Dung lượng mỗi tệp không được vượt quá 10MB';
  return '';
};
