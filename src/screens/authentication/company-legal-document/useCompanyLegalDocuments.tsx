import { DEFAULT_PAGE_SIZE, K_SIZE_1 } from '@constant';
import {
  DELETE_COMPANY_LEGAL_DOCUMENT,
  SEARCH_COMPANY_LEGAL_DOCUMENTS
} from '@redux-action-type/company-legal-document';
import { dispatch } from '@redux-common';
import {
  selectCompanyLegalDocumentList,
  selectCompanyLegalDocumentLoadingList,
  selectCompanyLegalDocumentTotal
} from '@redux-selector/company-legal-document';
import { showDialog } from 'components/dialog';
import { TYPE_ACTION, TYPE_MESSAGE } from 'components/dialog/type';
import { showToast } from 'components/toast';
import { TYPE_TOAST } from 'components/toast/type';
import { ROUTES } from 'config/routes';
import { CompanyLegalDocument, SearchCompanyLegalDocumentReq } from 'model/company-legal-document';
import { ErrorBase } from 'model/common';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import companyLegalDocumentServices from 'services/company-legal-document-services';
import { useAppTranslation } from 'utils/i18n';
import {
  getAttachmentResponseError,
  getAttachmentFileName,
  getErrorContent,
  isAttachmentFileResponse
} from './utils';

export interface CompanyLegalDocumentFilterForm {
  documentName: string;
  documentNumber: string;
  documentType: string;
  status: string;
}

const normalizeFilter = (filter: CompanyLegalDocumentFilterForm) => ({
  documentName: filter.documentName.trim(),
  documentNumber: filter.documentNumber.trim(),
  documentType: filter.documentType.trim(),
  status: filter.status.trim()
});

export default function useCompanyLegalDocuments() {
  const { t } = useAppTranslation();
  const router = useRouter();
  const companyLegalDocumentList = useSelector(selectCompanyLegalDocumentList);
  const total = useSelector(selectCompanyLegalDocumentTotal);
  const listLoading = useSelector(selectCompanyLegalDocumentLoadingList);

  const [currentPage, setCurrentPage] = useState<number>(K_SIZE_1);
  const defaultFilter: CompanyLegalDocumentFilterForm = useMemo(
    () => ({
      documentName: '',
      documentNumber: '',
      documentType: '',
      status: ''
    }),
    []
  );
  const [filter, setFilter] = useState<CompanyLegalDocumentFilterForm>(defaultFilter);
  const [filterApplied, setFilterApplied] = useState<CompanyLegalDocumentFilterForm>(defaultFilter);

  const buildSearchBody = useCallback(
    (
      appliedFilter: CompanyLegalDocumentFilterForm,
      page: number
    ): SearchCompanyLegalDocumentReq => {
      const normalizedFilter = normalizeFilter(appliedFilter);

      return {
        page: page - K_SIZE_1,
        size: DEFAULT_PAGE_SIZE,
        documentName: normalizedFilter.documentName || undefined,
        documentNumber: normalizedFilter.documentNumber || undefined,
        documentType: normalizedFilter.documentType || undefined,
        status: normalizedFilter.status || undefined
      };
    },
    []
  );

  const fetchList = useCallback(
    (page: number) => {
      dispatch({
        type: SEARCH_COMPANY_LEGAL_DOCUMENTS,
        payload: {
          body: buildSearchBody(filterApplied, page),
          onFailed: (error?: ErrorBase) => {
            showToast({
              type: TYPE_TOAST.ERROR,
              content: getErrorContent(error, 'Tải danh sách văn bản thất bại')
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
    setFilterApplied(filter);
    setCurrentPage(K_SIZE_1);
  }, [filter]);

  const onResetFilter = useCallback(
    (key?: keyof CompanyLegalDocumentFilterForm) => {
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

  const onChangeFilter = useCallback((key: keyof CompanyLegalDocumentFilterForm, value: string) => {
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
    router.push(ROUTES.COMPANY_LEGAL_DOCUMENT_ADD);
  }, [router]);

  const onOpenUpdate = useCallback(
    (document: CompanyLegalDocument) => {
      router.push(`${ROUTES.COMPANY_LEGAL_DOCUMENT_EDIT}?id=${document.id}`);
    },
    [router]
  );

  const onDeleteSuccess = useCallback(() => {
    refreshAfterMutation();
    showToast({
      type: TYPE_TOAST.SUCCESS,
      content: 'Xoá văn bản thành công'
    });
  }, [refreshAfterMutation]);

  const onDelete = useCallback(
    (document: CompanyLegalDocument) => {
      showDialog({
        title: t('common:delete_confirm'),
        content: (
          <>
            Bạn có chắc chắn xoá văn bản <strong>{document.documentName}</strong> này?
          </>
        ),
        type: TYPE_MESSAGE.ALERT,
        actions: [
          {
            title: t('common:agree'),
            type: TYPE_ACTION.PRIMARY,
            onPress: () => {
              dispatch({
                type: DELETE_COMPANY_LEGAL_DOCUMENT,
                payload: {
                  body: { id: document.id },
                  onSuccess: onDeleteSuccess,
                  onFailed: (error?: ErrorBase) => {
                    showToast({
                      type: TYPE_TOAST.ERROR,
                      content: getErrorContent(error, 'Xoá văn bản thất bại')
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

  const ensureAttachment = useCallback((document: CompanyLegalDocument) => {
    if (document.attachmentFilePath) return true;
    showToast({
      type: TYPE_TOAST.INFO,
      content: 'Văn bản chưa có file đính kèm'
    });
    return false;
  }, []);

  const onViewAttachment = useCallback(
    async (document: CompanyLegalDocument) => {
      if (!ensureAttachment(document)) return;

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
    },
    [ensureAttachment]
  );

  const onDownloadAttachment = useCallback(
    async (document: CompanyLegalDocument) => {
      if (!ensureAttachment(document)) return;

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
    },
    [ensureAttachment]
  );

  return {
    t,
    companyLegalDocumentList,
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
