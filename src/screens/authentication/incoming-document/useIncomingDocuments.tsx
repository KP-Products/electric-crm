import { DEFAULT_PAGE_SIZE, K_SIZE_1 } from '@constant';
import {
  DELETE_INCOMING_DOCUMENT,
  SEARCH_INCOMING_DOCUMENTS
} from '@redux-action-type/incoming-document';
import { dispatch } from '@redux-common';
import {
  selectIncomingDocumentList,
  selectIncomingDocumentLoadingList,
  selectIncomingDocumentTotal
} from '@redux-selector/incoming-document';
import { showDialog } from 'components/dialog';
import { TYPE_ACTION, TYPE_MESSAGE } from 'components/dialog/type';
import { showToast } from 'components/toast';
import { TYPE_TOAST } from 'components/toast/type';
import { ROUTES } from 'config/routes';
import { ErrorBase } from 'model/common';
import { IncomingDocument, SearchIncomingDocumentsReq } from 'model/incoming-document';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import incomingDocumentServices from 'services/incoming-document-services';
import { useAppTranslation } from 'utils/i18n';
import {
  canViewAttachmentInline,
  getAttachmentFileName,
  getAttachmentResponseError,
  getErrorContent,
  isAttachmentFileResponse
} from './utils';

export interface IncomingDocumentFilterForm {
  incomingNumber: string;
  issuingAgency: string;
  documentType: string;
  urgencyLevel: string;
  confidentialityLevel: string;
}

const normalizeFilter = (filter: IncomingDocumentFilterForm) => ({
  incomingNumber: filter.incomingNumber.trim(),
  issuingAgency: filter.issuingAgency.trim(),
  documentType: filter.documentType.trim(),
  urgencyLevel: filter.urgencyLevel.trim(),
  confidentialityLevel: filter.confidentialityLevel.trim()
});

export default function useIncomingDocuments() {
  const { t } = useAppTranslation();
  const router = useRouter();
  const incomingDocumentList = useSelector(selectIncomingDocumentList);
  const total = useSelector(selectIncomingDocumentTotal);
  const listLoading = useSelector(selectIncomingDocumentLoadingList);

  const [currentPage, setCurrentPage] = useState<number>(K_SIZE_1);
  const defaultFilter: IncomingDocumentFilterForm = useMemo(
    () => ({
      incomingNumber: '',
      issuingAgency: '',
      documentType: '',
      urgencyLevel: '',
      confidentialityLevel: ''
    }),
    []
  );
  const [filter, setFilter] = useState<IncomingDocumentFilterForm>(defaultFilter);
  const [filterApplied, setFilterApplied] = useState<IncomingDocumentFilterForm>(defaultFilter);

  const buildSearchBody = useCallback(
    (appliedFilter: IncomingDocumentFilterForm, page: number): SearchIncomingDocumentsReq => {
      const normalizedFilter = normalizeFilter(appliedFilter);

      return {
        page: page - K_SIZE_1,
        size: DEFAULT_PAGE_SIZE,
        incomingNumber: normalizedFilter.incomingNumber || undefined,
        issuingAgency: normalizedFilter.issuingAgency || undefined,
        documentType: normalizedFilter.documentType || undefined,
        urgencyLevel: normalizedFilter.urgencyLevel || undefined,
        confidentialityLevel: normalizedFilter.confidentialityLevel || undefined
      };
    },
    []
  );

  const fetchList = useCallback(
    (page: number) => {
      dispatch({
        type: SEARCH_INCOMING_DOCUMENTS,
        payload: {
          body: buildSearchBody(filterApplied, page),
          onFailed: (error?: ErrorBase) => {
            showToast({
              type: TYPE_TOAST.ERROR,
              content: getErrorContent(error, 'Tải danh sách văn bản đến thất bại')
            });
          }
        }
      });
    },
    [buildSearchBody, filterApplied]
  );

  useEffect(() => {
    fetchList(currentPage);
  }, [currentPage, fetchList]);

  const pagination = useMemo(
    () => ({
      current: currentPage,
      total,
      pageSize: DEFAULT_PAGE_SIZE,
      onChange: (page: number) => setCurrentPage(page),
      showSizeChanger: false
    }),
    [currentPage, total]
  );

  const onApplyFilter = useCallback(() => {
    setFilterApplied(normalizeFilter(filter));
    setCurrentPage(K_SIZE_1);
  }, [filter]);

  const onResetFilter = useCallback(
    (key?: keyof IncomingDocumentFilterForm) => {
      if (key) {
        setFilter((prev) => ({ ...prev, [key]: '' }));
        setFilterApplied((prev) => ({ ...prev, [key]: '' }));
      } else {
        setFilter(defaultFilter);
        setFilterApplied(defaultFilter);
      }
      setCurrentPage(K_SIZE_1);
    },
    [defaultFilter]
  );

  const onChangeFilter = useCallback((key: keyof IncomingDocumentFilterForm, value: string) => {
    setFilter((prev) => ({ ...prev, [key]: value }));
  }, []);

  const refreshAfterMutation = useCallback(() => {
    if (currentPage === K_SIZE_1) {
      fetchList(K_SIZE_1);
      return;
    }
    setCurrentPage(K_SIZE_1);
  }, [currentPage, fetchList]);

  const onOpenCreate = useCallback(() => {
    router.push(ROUTES.INCOMING_DOCUMENT_ADD);
  }, [router]);

  const onOpenUpdate = useCallback(
    (document: IncomingDocument) => {
      router.push(`${ROUTES.INCOMING_DOCUMENT_EDIT}?id=${document.id}`);
    },
    [router]
  );

  const onDeleteSuccess = useCallback(() => {
    refreshAfterMutation();
    showToast({
      type: TYPE_TOAST.SUCCESS,
      content: 'Xoá văn bản đến thành công'
    });
  }, [refreshAfterMutation]);

  const onDelete = useCallback(
    (document: IncomingDocument) => {
      showDialog({
        title: t('common:delete_confirm'),
        content: (
          <>
            Bạn có chắc chắn xoá văn bản đến <strong>{document.incomingNumber}</strong> này?
          </>
        ),
        type: TYPE_MESSAGE.ALERT,
        actions: [
          {
            title: t('common:agree'),
            type: TYPE_ACTION.PRIMARY,
            onPress: () => {
              dispatch({
                type: DELETE_INCOMING_DOCUMENT,
                payload: {
                  body: { id: document.id },
                  onSuccess: onDeleteSuccess,
                  onFailed: (error?: ErrorBase) => {
                    showToast({
                      type: TYPE_TOAST.ERROR,
                      content: getErrorContent(error, 'Xoá văn bản đến thất bại')
                    });
                  }
                }
              });
            }
          },
          {
            title: t('common:cancel'),
            type: TYPE_ACTION.SECONDARY
          }
        ]
      });
    },
    [onDeleteSuccess, t]
  );

  const ensureAttachment = useCallback((document: IncomingDocument) => {
    if (document.filePath) return true;
    showToast({
      type: TYPE_TOAST.INFO,
      content: 'Văn bản đến chưa có file văn bản'
    });
    return false;
  }, []);

  const onViewAttachment = useCallback(
    async (document: IncomingDocument) => {
      if (!ensureAttachment(document)) return;

      const targetWindow = window.open('about:blank', '_blank');
      if (targetWindow) {
        targetWindow.opener = null;
      }

      const response = await incomingDocumentServices.viewIncomingDocumentAttachment(document.id);

      const attachmentError = await getAttachmentResponseError(response);
      if (attachmentError || !isAttachmentFileResponse(response)) {
        targetWindow?.close();
        showToast({
          type: TYPE_TOAST.ERROR,
          content: getErrorContent(attachmentError || response, 'Xem file văn bản thất bại')
        });
        return;
      }

      if (!canViewAttachmentInline(response)) {
        targetWindow?.close();
        showToast({
          type: TYPE_TOAST.INFO,
          content: 'Định dạng file này chỉ hỗ trợ tải xuống'
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
    },
    [ensureAttachment]
  );

  const onDownloadAttachment = useCallback(
    async (document: IncomingDocument) => {
      if (!ensureAttachment(document)) return;

      const response = await incomingDocumentServices.downloadIncomingDocumentAttachment(
        document.id
      );

      const attachmentError = await getAttachmentResponseError(response);
      if (attachmentError || !isAttachmentFileResponse(response)) {
        showToast({
          type: TYPE_TOAST.ERROR,
          content: getErrorContent(attachmentError || response, 'Tải file văn bản thất bại')
        });
        return;
      }

      const downloadUrl = URL.createObjectURL(response.blob);
      const link = window.document.createElement('a');
      link.href = downloadUrl;
      link.download = getAttachmentFileName(document.filePath);
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);
    },
    [ensureAttachment]
  );

  return {
    t,
    incomingDocumentList,
    total,
    listLoading,
    currentPage,
    pagination,
    filter,
    filterApplied,
    onChangeFilter,
    onApplyFilter,
    onResetFilter,
    onOpenCreate,
    onOpenUpdate,
    onDelete,
    onViewAttachment,
    onDownloadAttachment
  };
}
