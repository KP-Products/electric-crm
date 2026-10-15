'use client';

import { DeleteOutlined, PaperClipOutlined } from '@ant-design/icons';
import { K_SIZE_24 } from '@constant';
import { Button, Upload } from 'antd';
import ButtonBase from 'components/button';
import { IconSvgLocal } from 'components/icon-vec-local';
import { TextBase } from 'components/text';
import { showToast } from 'components/toast';
import { TYPE_TOAST } from 'components/toast/type';
import { formatUploadFileSize } from 'utils/upload';

/** Định dạng tài liệu BE nhận (DocumentFormat): PDF, DOC, DOCX, XLS, XLSX, JPG, PNG — tối đa 10MB. */
export const DOCUMENT_ACCEPT = '.pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png';
export const DOCUMENT_ACCEPT_TEXT = 'PDF, DOC, DOCX, XLS, XLSX, JPG, PNG';
export const DOCUMENT_MAX_SIZE = 10 * 1024 * 1024;

const ACCEPTED_EXTENSIONS = DOCUMENT_ACCEPT.split(',');

const isAccepted = (file: File) => {
  const name = file.name.toLowerCase();
  return ACCEPTED_EXTENSIONS.some((ext) => name.endsWith(ext));
};

interface DocumentDropzoneProps {
  value: File[];
  onChange: (files: File[]) => void;
  disabled?: boolean;
}

/** Ô "Tài liệu đính kèm" kéo thả nhiều file; file giữ ở client, màn gọi tự upload khi lưu. */
const DocumentDropzone = ({ value, onChange, disabled }: DocumentDropzoneProps) => (
  <div>
    <Upload.Dragger
      multiple
      accept={DOCUMENT_ACCEPT}
      disabled={disabled}
      showUploadList={false}
      className="block overflow-hidden [&_.ant-upload-btn]:!p-0"
      beforeUpload={(file) => {
        if (!isAccepted(file)) {
          showToast({
            type: TYPE_TOAST.ERROR,
            content: `${file.name}: chỉ hỗ trợ ${DOCUMENT_ACCEPT_TEXT}`
          });
          return Upload.LIST_IGNORE;
        }
        if (file.size > DOCUMENT_MAX_SIZE) {
          showToast({ type: TYPE_TOAST.ERROR, content: `${file.name}: vượt quá 10MB` });
          return Upload.LIST_IGNORE;
        }
        onChange([...value, file]);
        return false;
      }}
    >
      <div className="flex min-h-[96px] flex-col items-center justify-center gap-8 p-12 text-center">
        <IconSvgLocal
          name="IC_UPLOAD_OUTLINE"
          height={K_SIZE_24}
          width={K_SIZE_24}
          classNames="text-primary-600"
        />
        <div className="flex flex-wrap items-center justify-center gap-8">
          <TextBase text="Kéo thả file vào đây hoặc" classNames="caption1" />
          <ButtonBase type="secondary" size={32} customContent="Chọn tệp" />
        </div>
        <TextBase
          text={`Hỗ trợ định dạng: ${DOCUMENT_ACCEPT_TEXT} (Tối đa 10MB)`}
          classNames="caption1 !text-color-700"
        />
      </div>
    </Upload.Dragger>
    {value.length > 0 && (
      <div className="mt-8 grid gap-8">
        {value.map((file, index) => (
          <div
            key={`${file.name}-${index}`}
            className="flex items-center justify-between gap-12 rounded-radius-m border border-color-300 px-12 py-8 text-12 text-color-800"
          >
            <span className="flex min-w-0 items-center gap-8">
              <PaperClipOutlined />
              <span className="truncate">{file.name}</span>
              <span className="text-color-600">{formatUploadFileSize(file.size)}</span>
            </span>
            <Button
              type="text"
              danger
              size="small"
              icon={<DeleteOutlined />}
              disabled={disabled}
              onClick={() => onChange(value.filter((_, i) => i !== index))}
            />
          </div>
        ))}
      </div>
    )}
  </div>
);

export default DocumentDropzone;
