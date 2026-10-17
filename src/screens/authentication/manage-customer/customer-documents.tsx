'use client';

import { Button, Popconfirm, Spin, Upload } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import ButtonBase from 'components/button';
import { DocumentItem, DOCUMENT_OWNER_TYPE } from 'model/document';
import { useEffect, useRef, useState } from 'react';
import documentServices from 'services/document-services';
import {
  downloadBlobResponse,
  getBlobResponseError,
  isBlobFileResponse
} from 'utils/blob-response';
import { showToast } from 'components/toast';
import { TYPE_TOAST } from 'components/toast/type';
import { customerDocumentOwnerId, validateCustomerFile } from './create-utils';
import { getCustomerErrorMessage, hasApiError } from './useManageCustomer';

export default function CustomerDocuments({
  customerId,
  files,
  onFilesChange,
  disabled = false,
  revision = 0
}: {
  customerId: number;
  files?: File[];
  onFilesChange?: (files: File[]) => void;
  disabled?: boolean;
  revision?: number;
}) {
  const deletingRef = useRef(false);
  const [deletingId, setDeletingId] = useState<string>();
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setFailed(false);
    setDocuments([]);
    const load = async () => {
      try {
        const response = await documentServices.listDocuments({
          ownerType: DOCUMENT_OWNER_TYPE.CUSTOMER,
          ownerId: customerDocumentOwnerId(customerId)
        });
        if (!active) return;
        if (hasApiError(response) || !Array.isArray(response.data)) setFailed(true);
        else setDocuments(response.data);
      } catch {
        if (active) setFailed(true);
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, [customerId, revision, retry]);

  const download = async (document: DocumentItem) => {
    const response = await documentServices.downloadDocumentFile(document.id);
    if ((await getBlobResponseError(response)) || !isBlobFileResponse(response)) {
      showToast({ type: TYPE_TOAST.ERROR, content: 'Tải tài liệu thất bại' });
      return;
    }
    downloadBlobResponse(response, document.originalFileName);
  };

  const deleteDocument = async (document: DocumentItem) => {
    if (disabled || !onFilesChange || deletingRef.current) return;
    deletingRef.current = true;
    setDeletingId(document.id);
    try {
      const response = await documentServices.deleteDocument({ id: document.id });
      if (hasApiError(response)) {
        showToast({
          type: TYPE_TOAST.ERROR,
          content: getCustomerErrorMessage(response, 'Xóa tài liệu thất bại')
        });
        return;
      }
      setDocuments((items) => items.filter((item) => item.id !== document.id));
      showToast({ type: TYPE_TOAST.SUCCESS, content: 'Xóa tài liệu thành công' });
    } catch {
      showToast({ type: TYPE_TOAST.ERROR, content: 'Xóa tài liệu thất bại' });
    } finally {
      deletingRef.current = false;
      setDeletingId(undefined);
    }
  };

  return (
    <section className="mt-16 border-t border-color-300 pt-16">
      <h3 className="mb-12 font-semibold">Tài liệu đính kèm</h3>
      {loading ? (
        <Spin size="small" />
      ) : failed ? (
        <div>
          Không tải được tài liệu.{' '}
          <Button onClick={() => setRetry((value) => value + 1)}>Thử lại</Button>
        </div>
      ) : documents.length ? (
        <ul className="mb-12">
          {documents.map((document) => (
            <li key={document.id} className="flex items-center justify-between gap-8">
              <Button type="link" onClick={() => void download(document)}>
                {document.originalFileName}
              </Button>
              {onFilesChange && (
                <Popconfirm
                  title="Xóa tài liệu đính kèm?"
                  description={`Tài liệu “${document.originalFileName}” sẽ được xóa ngay sau khi xác nhận.`}
                  okText="Xóa"
                  cancelText="Hủy"
                  okButtonProps={{ danger: true, loading: deletingId === document.id, disabled }}
                  disabled={disabled || Boolean(deletingId)}
                  onConfirm={() => deleteDocument(document)}
                >
                  <span className="inline-flex">
                    <ButtonBase
                      type="whiteGhost"
                      classNames="!text-error-600 !inline-flex items-center justify-center !p-0 [&>span]:flex [&>span]:items-center [&>span]:justify-center"
                      styles={{ width: 32 }}
                      disabled={disabled || Boolean(deletingId)}
                      customContent={
                        deletingId === document.id ? (
                          <Spin size="small" />
                        ) : (
                          <DeleteOutlined
                            aria-label={`Xóa tài liệu ${document.originalFileName}`}
                          />
                        )
                      }
                    />
                  </span>
                </Popconfirm>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <div className="mb-12 text-color-600">Chưa có tài liệu đính kèm</div>
      )}
      {files && onFilesChange && (
        <Upload.Dragger
          multiple
          disabled={disabled}
          accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
          fileList={files.map((file, index) => ({ uid: String(index), name: file.name }))}
          beforeUpload={(file, batch) => {
            if (file === batch[0]) {
              const valid = batch.filter((item) => {
                const error = validateCustomerFile(item);
                if (error) showToast({ type: TYPE_TOAST.ERROR, content: `${item.name}: ${error}` });
                return !error;
              });
              onFilesChange([...files, ...valid]);
            }
            return false;
          }}
          onRemove={(file) => {
            onFilesChange(files.filter((_, index) => String(index) !== file.uid));
            return true;
          }}
        >
          <div>
            Kéo thả file vào đây hoặc <span className="text-primary-600">Chọn tệp</span>
          </div>
          <div className="mt-4 text-12 text-color-500">
            PDF, DOC, DOCX, XLS, XLSX, JPG, PNG (Tối đa 10MB/tệp)
          </div>
        </Upload.Dragger>
      )}
    </section>
  );
}
