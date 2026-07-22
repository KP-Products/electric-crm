import { K_SIZE_1 } from '@constant';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  CREATE_COMPANY_LEGAL_DOCUMENT,
  DELETE_COMPANY_LEGAL_DOCUMENT_ATTACHMENT,
  GET_COMPANY_LEGAL_DOCUMENT_DETAIL,
  UPDATE_COMPANY_LEGAL_DOCUMENT,
  UPLOAD_COMPANY_LEGAL_DOCUMENT_ATTACHMENT
} from '@redux-action-type/company-legal-document';
import { dispatch } from '@redux-common';
import { selectCompanyLegalDocumentLoadingDetail } from '@redux-selector/company-legal-document';
import { showDialog } from 'components/dialog';
import { TYPE_ACTION, TYPE_MESSAGE } from 'components/dialog/type';
import { showToast } from 'components/toast';
import { TYPE_TOAST } from 'components/toast/type';
import { ROUTES } from 'config/routes';
import {
  CompanyLegalDocument,
  CompanyLegalDocumentRes,
  CreateCompanyLegalDocumentReq,
  UpdateCompanyLegalDocumentReq
} from 'model/company-legal-document';
import { ErrorBase } from 'model/common';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import companyLegalDocumentServices from 'services/company-legal-document-services';
import { z } from 'zod';
import {
  DATE_API_FORMAT,
  getAttachmentResponseError,
  getAttachmentFileName,
  getErrorContent,
  isAttachmentFileResponse
} from '../utils';

const optionalDateSchema = z
  .string()
  .nullable()
  .transform((value) => value?.trim() || '');

const companyLegalDocumentSchema = z.object({
  documentNumber: z.string().trim(),
  documentName: z.string().trim().min(K_SIZE_1, { message: 'Vui lòng nhập tên văn bản' }),
  documentType: z.string().trim().min(K_SIZE_1, { message: 'Vui lòng nhập loại văn bản' }),
  documentDate: optionalDateSchema,
  effectiveDate: optionalDateSchema,
  expiryDate: optionalDateSchema,
  summary: z.string().trim(),
  draftedBy: z
    .string()
    .trim()
    .refine((value) => !value || /^\d+$/.test(value), {
      message: 'Người soạn thảo phải là ID dạng số'
    }),
  approvedBy: z
    .string()
    .trim()
    .refine((value) => !value || /^\d+$/.test(value), {
      message: 'Người ký duyệt phải là ID dạng số'
    }),
  status: z.string().trim(),
  note: z.string().trim()
});

export type CompanyLegalDocumentForm = z.infer<typeof companyLegalDocumentSchema>;

const optionalString = (value?: string | null) => {
  const normalizedValue = value?.trim();
  return normalizedValue || undefined;
};

const optionalNumber = (value?: string) => {
  const normalizedValue = optionalString(value);
  return normalizedValue ? Number(normalizedValue) : undefined;
};

interface UseCompanyLegalDocumentFormProps {
  isEditMode: boolean;
}

export default function useCompanyLegalDocumentForm({
  isEditMode
}: UseCompanyLegalDocumentFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const detailLoading = useSelector(selectCompanyLegalDocumentLoadingDetail);
  const [selectedDocument, setSelectedDocument] = useState<CompanyLegalDocument>();
  const [selectedFile, setSelectedFile] = useState<File>();

  const defaultFormValues: CompanyLegalDocumentForm = useMemo(
    () => ({
      documentNumber: '',
      documentName: '',
      documentType: '',
      documentDate: '',
      effectiveDate: '',
      expiryDate: '',
      summary: '',
      draftedBy: '',
      approvedBy: '',
      status: 'Còn hiệu lực',
      note: ''
    }),
    []
  );

  const form = useForm<CompanyLegalDocumentForm>({
    mode: 'onTouched',
    defaultValues: defaultFormValues,
    resolver: zodResolver(companyLegalDocumentSchema)
  });

  const onBack = useCallback(() => {
    router.push(ROUTES.COMPANY_LEGAL_DOCUMENTS);
  }, [router]);

  const fillForm = useCallback(
    (document: CompanyLegalDocument) => {
      form.reset({
        documentNumber: document.documentNumber || '',
        documentName: document.documentName || '',
        documentType: document.documentType || '',
        documentDate: document.documentDate || '',
        effectiveDate: document.effectiveDate || '',
        expiryDate: document.expiryDate || '',
        summary: document.summary || '',
        draftedBy:
          document.draftedBy !== undefined && document.draftedBy !== null
            ? String(document.draftedBy)
            : '',
        approvedBy:
          document.approvedBy !== undefined && document.approvedBy !== null
            ? String(document.approvedBy)
            : '',
        status: document.status || '',
        note: document.note || ''
      });
    },
    [form]
  );

  useEffect(() => {
    if (!isEditMode) return;

    const numericId = Number(id);
    if (!id || Number.isNaN(numericId)) {
      showToast({ type: TYPE_TOAST.ERROR, content: 'Không tìm thấy văn bản cần cập nhật' });
      onBack();
      return;
    }

    dispatch({
      type: GET_COMPANY_LEGAL_DOCUMENT_DETAIL,
      payload: {
        body: { id: numericId },
        onSuccess: (response: CompanyLegalDocumentRes) => {
          if (!response.data) return;
          setSelectedDocument(response.data);
          fillForm(response.data);
        },
        onFailed: (error?: ErrorBase) => {
          showToast({
            type: TYPE_TOAST.ERROR,
            content: getErrorContent(error, 'Tải thông tin văn bản thất bại')
          });
          onBack();
        }
      }
    });
  }, [fillForm, id, isEditMode, onBack]);

  const buildSubmitBody = useCallback(
    (data: CompanyLegalDocumentForm): CreateCompanyLegalDocumentReq => ({
      documentNumber: optionalString(data.documentNumber),
      documentName: data.documentName.trim(),
      documentType: data.documentType.trim(),
      documentDate: optionalString(data.documentDate),
      effectiveDate: optionalString(data.effectiveDate),
      expiryDate: optionalString(data.expiryDate),
      summary: optionalString(data.summary),
      draftedBy: optionalNumber(data.draftedBy),
      approvedBy: optionalNumber(data.approvedBy),
      status: optionalString(data.status),
      note: optionalString(data.note)
    }),
    []
  );

  const onSubmitSuccess = useCallback(
    (content: string) => {
      showToast({
        type: TYPE_TOAST.SUCCESS,
        content
      });
      onBack();
    },
    [onBack]
  );

  const onSubmitWithAttachmentError = useCallback(
    (content: string) => {
      showToast({
        type: TYPE_TOAST.ERROR,
        content
      });
      onBack();
    },
    [onBack]
  );

  const uploadAttachmentAfterSave = useCallback(
    (documentId: number, successContent: string, failedContent: string) => {
      if (!selectedFile) {
        onSubmitSuccess(successContent);
        return;
      }

      dispatch({
        type: UPLOAD_COMPANY_LEGAL_DOCUMENT_ATTACHMENT,
        payload: {
          body: { id: documentId, file: selectedFile },
          onSuccess: () => onSubmitSuccess(successContent),
          onFailed: (error?: ErrorBase) => {
            onSubmitWithAttachmentError(getErrorContent(error, failedContent));
          }
        }
      });
    },
    [onSubmitSuccess, onSubmitWithAttachmentError, selectedFile]
  );

  const onSubmit = useCallback(
    (data: CompanyLegalDocumentForm) => {
      const body = buildSubmitBody(data);

      if (isEditMode && selectedDocument) {
        const updateBody: UpdateCompanyLegalDocumentReq = {
          id: selectedDocument.id,
          ...body
        };
        dispatch({
          type: UPDATE_COMPANY_LEGAL_DOCUMENT,
          payload: {
            body: updateBody,
            onSuccess: (response: CompanyLegalDocumentRes) => {
              uploadAttachmentAfterSave(
                response.data?.id || selectedDocument.id,
                'Cập nhật văn bản thành công',
                'Cập nhật văn bản thành công nhưng tải file thất bại'
              );
            },
            onFailed: (error?: ErrorBase) => {
              showToast({
                type: TYPE_TOAST.ERROR,
                content: getErrorContent(error, 'Cập nhật văn bản thất bại')
              });
            }
          }
        });
        return;
      }

      dispatch({
        type: CREATE_COMPANY_LEGAL_DOCUMENT,
        payload: {
          body,
          onSuccess: (response: CompanyLegalDocumentRes) => {
            const savedId = response.data?.id;
            if (!savedId) {
              onSubmitSuccess('Tạo văn bản thành công');
              return;
            }
            uploadAttachmentAfterSave(
              savedId,
              'Tạo văn bản thành công',
              'Tạo văn bản thành công nhưng tải file thất bại'
            );
          },
          onFailed: (error?: ErrorBase) => {
            showToast({
              type: TYPE_TOAST.ERROR,
              content: getErrorContent(error, 'Tạo văn bản thất bại')
            });
          }
        }
      });
    },
    [buildSubmitBody, isEditMode, onSubmitSuccess, selectedDocument, uploadAttachmentAfterSave]
  );

  const deleteAttachment = useCallback(() => {
    if (!selectedDocument) return;

    dispatch({
      type: DELETE_COMPANY_LEGAL_DOCUMENT_ATTACHMENT,
      payload: {
        body: { id: selectedDocument.id },
        onSuccess: () => {
          setSelectedDocument((prev) => (prev ? { ...prev, attachmentFilePath: undefined } : prev));
          showToast({
            type: TYPE_TOAST.SUCCESS,
            content: 'Gỡ file đính kèm thành công'
          });
        },
        onFailed: (error?: ErrorBase) => {
          showToast({
            type: TYPE_TOAST.ERROR,
            content: getErrorContent(error, 'Gỡ file đính kèm thất bại')
          });
        }
      }
    });
  }, [selectedDocument]);

  const onDeleteAttachment = useCallback(() => {
    if (!selectedDocument) return;

    showDialog({
      title: 'Xác nhận gỡ file',
      content: (
        <>
          Bạn có chắc chắn gỡ file đính kèm <strong>{selectedDocument.attachmentFilePath}</strong>{' '}
          không?
        </>
      ),
      type: TYPE_MESSAGE.ALERT,
      actions: [
        {
          title: 'Đồng ý',
          type: TYPE_ACTION.PRIMARY,
          onPress: deleteAttachment
        },
        {
          title: 'Hủy bỏ',
          type: TYPE_ACTION.SECONDARY
        }
      ]
    });
  }, [deleteAttachment, selectedDocument]);

  const ensureAttachment = useCallback((document?: CompanyLegalDocument) => {
    if (document?.attachmentFilePath) return true;
    showToast({
      type: TYPE_TOAST.INFO,
      content: 'Văn bản chưa có file đính kèm'
    });
    return false;
  }, []);

  const onViewAttachment = useCallback(async () => {
    const document = selectedDocument;
    if (!document || !ensureAttachment(document)) return;

    const targetWindow = window.open('about:blank', '_blank');
    if (targetWindow) {
      targetWindow.opener = null;
    }

    const response = await companyLegalDocumentServices.viewCompanyLegalDocumentAttachment(
      document.id
    );

    const attachmentError = await getAttachmentResponseError(response);
    if (attachmentError || !isAttachmentFileResponse(response)) {
      targetWindow?.close();
      showToast({
        type: TYPE_TOAST.ERROR,
        content: getErrorContent(attachmentError || response, 'Xem file đính kèm thất bại')
      });
      return;
    }

    const viewUrl = URL.createObjectURL(response.blob);
    if (targetWindow) {
      targetWindow.location.href = viewUrl;
    } else {
      window.open(viewUrl, '_blank', 'noopener,noreferrer');
    }
    window.setTimeout(() => URL.revokeObjectURL(viewUrl), 60000);
  }, [ensureAttachment, selectedDocument]);

  const onDownloadAttachment = useCallback(async () => {
    const document = selectedDocument;
    if (!document || !ensureAttachment(document)) return;

    const response = await companyLegalDocumentServices.downloadCompanyLegalDocumentAttachment(
      document.id
    );

    const attachmentError = await getAttachmentResponseError(response);
    if (attachmentError || !isAttachmentFileResponse(response)) {
      showToast({
        type: TYPE_TOAST.ERROR,
        content: getErrorContent(attachmentError || response, 'Tải file đính kèm thất bại')
      });
      return;
    }

    const downloadUrl = URL.createObjectURL(response.blob);
    const link = window.document.createElement('a');
    link.href = downloadUrl;
    link.download = getAttachmentFileName(document.attachmentFilePath);
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
    URL.revokeObjectURL(downloadUrl);
  }, [ensureAttachment, selectedDocument]);

  return {
    dateApiFormat: DATE_API_FORMAT,
    form,
    detailLoading,
    selectedDocument,
    selectedFile,
    setSelectedFile,
    onBack,
    onSubmit,
    onDeleteAttachment,
    onViewAttachment,
    onDownloadAttachment
  };
}
