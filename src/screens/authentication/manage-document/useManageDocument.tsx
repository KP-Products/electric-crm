import { DEFAULT_PAGE_SIZE, K_SIZE_1 } from '@constant';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  DELETE_DOCUMENT,
  LIST_DOCUMENTS_BY_UNIT,
  SEARCH_DOCUMENT,
  UPDATE_DOCUMENT,
  UPLOAD_DOCUMENT
} from '@redux-action-type/document';
import { dispatch } from '@redux-common';
import {
  selectDocumentList,
  selectDocumentLoadingDetail,
  selectDocumentLoadingList,
  selectDocumentTotal
} from '@redux-selector/document';
import { showDialog } from 'components/dialog';
import { TYPE_ACTION, TYPE_MESSAGE } from 'components/dialog/type';
import { showToast } from 'components/toast';
import { TYPE_TOAST } from 'components/toast/type';
import { ErrorBase } from 'model/common';
import {
  DeleteDocumentReq,
  DOCUMENT_STATUS,
  DocumentItem,
  SearchDocumentReq,
  UpdateDocumentReq,
  UploadDocumentReq
} from 'model/document';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import type {
  DocumentFilterDrawerRef,
  DocumentFilterForm
} from 'screens/authentication/manage-document/components/DocumentFilterDrawer';
import {
  canViewBlobInline,
  downloadBlobResponse,
  getBlobResponseError,
  isBlobFileResponse
} from 'utils/blob-response';
import documentServices from 'services/document-services';
import useOperationUnitLookup from 'screens/authentication/manage-operation-contract/hooks/useOperationUnitLookup';
import { useAppTranslation } from 'utils/i18n';
import { z } from 'zod';
import useDocumentOwnerLookup from './useDocumentOwnerLookup';

const SUCCESS_MESSAGES = ['success', 'ok'];
const INLINE_DOCUMENT_MIME_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];

const normalizeApiText = (value?: unknown) =>
  String(value || '')
    .trim()
    .toLowerCase();

const getDocumentErrorMessage = (
  error?: ErrorBase & { message?: string },
  fallback = 'Thao tác thất bại'
) => {
  const message =
    error?.businessErrorMessage ||
    error?.systemErrorMessage ||
    error?.detailMessage ||
    error?.message;
  const normalizedMessage = normalizeApiText(message);

  return message && !SUCCESS_MESSAGES.includes(normalizedMessage) ? message : fallback;
};

const attachDocumentSchema = z.object({
  ownerType: z.string().trim().min(K_SIZE_1, { message: 'Vui lòng nhập loại chủ sở hữu' }),
  ownerId: z
    .string()
    .trim()
    .min(K_SIZE_1, { message: 'Vui lòng nhập ID chủ sở hữu' })
    .uuid({ message: 'ID chủ sở hữu không hợp lệ' }),
  docType: z.string().trim().min(K_SIZE_1, { message: 'Vui lòng nhập loại tài liệu' }),
  status: z.string().trim(),
  note: z.string().trim()
});

const updateDocumentSchema = z.object({
  status: z.string().trim(),
  note: z.string().trim()
});

const getDownloadFileName = (document: DocumentItem, fileName?: string) =>
  fileName || document.originalFileName || 'ho-so-giay-to';

type DocumentByUnitClientFilter = Partial<Omit<SearchDocumentReq, 'page' | 'size'>>;

export type AttachDocumentForm = z.infer<typeof attachDocumentSchema>;
export type UpdateDocumentForm = z.infer<typeof updateDocumentSchema>;

export default function useManageDocument() {
  const { t } = useAppTranslation();
  const documentList = useSelector(selectDocumentList);
  const total = useSelector(selectDocumentTotal);
  const listLoading = useSelector(selectDocumentLoadingList);
  const detailLoading = useSelector(selectDocumentLoadingDetail);

  const [currentPage, setCurrentPage] = useState<number>(K_SIZE_1);
  const [openAttach, setOpenAttach] = useState<boolean>(false);
  const [openUpdate, setOpenUpdate] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File>();
  const [selectedDocument, setSelectedDocument] = useState<DocumentItem>();
  const filterDrawerRef = useRef<DocumentFilterDrawerRef>(null);

  const defaultFilter: DocumentFilterForm = useMemo(
    () => ({
      keyword: '',
      ownerType: '',
      ownerId: '',
      docType: '',
      status: '',
      operationUnitId: ''
    }),
    []
  );
  const [filterApplied, setFilterApplied] = useState<DocumentFilterForm>(defaultFilter);

  const attachForm = useForm<AttachDocumentForm>({
    mode: 'onTouched',
    defaultValues: {
      ownerType: '',
      ownerId: '',
      docType: '',
      status: DOCUMENT_STATUS.HOP_LE,
      note: ''
    },
    resolver: zodResolver(attachDocumentSchema)
  });

  const updateForm = useForm<UpdateDocumentForm>({
    mode: 'onTouched',
    defaultValues: {
      status: DOCUMENT_STATUS.HOP_LE,
      note: ''
    },
    resolver: zodResolver(updateDocumentSchema)
  });

  const selectedAttachOwnerType = attachForm.watch('ownerType');
  const previousAttachOwnerTypeRef = useRef<string>();
  const { ownerOptions, resetOwnerOptions, onOpenOwnerDropdown, ownerDropdownRender } =
    useDocumentOwnerLookup(selectedAttachOwnerType);
  const {
    operationUnitOptions,
    operationUnitLoading,
    getOperationUnitDisplay,
    onOpenOperationUnitDropdown,
    operationUnitDropdownRender
  } = useOperationUnitLookup({
    autoLoad: false,
    pinnedIds: [filterApplied.operationUnitId]
  });

  useEffect(() => {
    const previousOwnerType = previousAttachOwnerTypeRef.current;
    if (previousOwnerType === undefined) {
      previousAttachOwnerTypeRef.current = selectedAttachOwnerType;
      return;
    }

    if (previousOwnerType !== selectedAttachOwnerType) {
      attachForm.setValue('ownerId', '', { shouldDirty: true });
      resetOwnerOptions();
      previousAttachOwnerTypeRef.current = selectedAttachOwnerType;
    }
  }, [attachForm, resetOwnerOptions, selectedAttachOwnerType]);

  const buildNormalizedFilter = useCallback(
    (filter: DocumentFilterForm, excludedKeys: Array<keyof DocumentFilterForm>) =>
      Object.fromEntries(
        Object.entries(filter)
          .filter(([key]) => !excludedKeys.includes(key as keyof DocumentFilterForm))
          .map(([key, value]) => [key, value.trim()])
          .filter(([, value]) => Boolean(value))
      ),
    []
  );

  const buildByUnitClientFilter = useCallback(
    (filter: DocumentFilterForm): DocumentByUnitClientFilter =>
      buildNormalizedFilter(filter, ['operationUnitId']) as DocumentByUnitClientFilter,
    [buildNormalizedFilter]
  );

  const buildSearchBody = useCallback(
    (filter: DocumentFilterForm, page: number): SearchDocumentReq => {
      const normalizedFilter = buildNormalizedFilter(filter, ['operationUnitId']);

      return {
        page: page - K_SIZE_1,
        size: DEFAULT_PAGE_SIZE,
        ...normalizedFilter
      };
    },
    [buildNormalizedFilter]
  );

  const fetchList = useCallback(
    (page: number) => {
      const operationUnitId = filterApplied.operationUnitId.trim();
      if (operationUnitId) {
        dispatch({
          type: LIST_DOCUMENTS_BY_UNIT,
          payload: {
            body: { operationUnitId },
            clientFilter: buildByUnitClientFilter(filterApplied),
            onFailed: (error?: ErrorBase) => {
              showToast({
                type: TYPE_TOAST.ERROR,
                content: getDocumentErrorMessage(
                  error,
                  'Tải danh sách tài liệu theo đơn vị vận hành thất bại'
                )
              });
            }
          }
        });
        return;
      }

      dispatch({
        type: SEARCH_DOCUMENT,
        payload: {
          body: buildSearchBody(filterApplied, page),
          onFailed: (error?: ErrorBase) => {
            showToast({
              type: TYPE_TOAST.ERROR,
              content: getDocumentErrorMessage(error, 'Tải danh sách tài liệu thất bại')
            });
          }
        }
      });
    },
    [buildByUnitClientFilter, buildSearchBody, filterApplied]
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

  const onApplyFilter = useCallback((data: DocumentFilterForm) => {
    setFilterApplied(data);
    setCurrentPage(K_SIZE_1);
  }, []);

  const onResetFilter = useCallback(
    (key?: keyof DocumentFilterForm) => {
      if (key) {
        setFilterApplied((prev) => ({ ...prev, [key]: '' }));
      } else {
        setFilterApplied(defaultFilter);
      }
      setCurrentPage(K_SIZE_1);
    },
    [defaultFilter]
  );

  const onCloseAttach = useCallback(() => {
    setOpenAttach(false);
    setSelectedFile(undefined);
    attachForm.reset();
  }, [attachForm]);

  const onAttachSuccess = useCallback(() => {
    onCloseAttach();
    if (currentPage === K_SIZE_1) {
      fetchList(K_SIZE_1);
    } else {
      setCurrentPage(K_SIZE_1);
    }
    showToast({
      type: TYPE_TOAST.SUCCESS,
      content: 'Đính kèm tài liệu thành công'
    });
  }, [currentPage, fetchList, onCloseAttach]);

  const onAttachFailed = useCallback((error?: ErrorBase) => {
    showToast({
      type: TYPE_TOAST.ERROR,
      content: getDocumentErrorMessage(error, 'Đính kèm tài liệu thất bại')
    });
  }, []);

  const handleAttachSubmit = useCallback(
    (data: AttachDocumentForm) => {
      if (!selectedFile) {
        showToast({
          type: TYPE_TOAST.ERROR,
          content: 'Vui lòng chọn tài liệu'
        });
        return;
      }

      const body: UploadDocumentReq = {
        ownerType: data.ownerType,
        ownerId: data.ownerId,
        docType: data.docType,
        status: data.status || undefined,
        note: data.note || undefined,
        file: selectedFile
      };

      dispatch({
        type: UPLOAD_DOCUMENT,
        payload: {
          body,
          onSuccess: onAttachSuccess,
          onFailed: onAttachFailed
        }
      });
    },
    [onAttachFailed, onAttachSuccess, selectedFile]
  );

  const onOpenUpdate = useCallback(
    (document: DocumentItem) => {
      setSelectedDocument(document);
      updateForm.reset({
        status: document.status || DOCUMENT_STATUS.HOP_LE,
        note: document.note || ''
      });
      setOpenUpdate(true);
    },
    [updateForm]
  );

  const onCloseUpdate = useCallback(() => {
    setOpenUpdate(false);
    setSelectedDocument(undefined);
    updateForm.reset({
      status: DOCUMENT_STATUS.HOP_LE,
      note: ''
    });
  }, [updateForm]);

  const onUpdateSuccess = useCallback(() => {
    onCloseUpdate();
    fetchList(currentPage);
    showToast({
      type: TYPE_TOAST.SUCCESS,
      content: 'Cập nhật tài liệu thành công'
    });
  }, [currentPage, fetchList, onCloseUpdate]);

  const handleUpdateSubmit = useCallback(
    (data: UpdateDocumentForm) => {
      if (!selectedDocument) return;

      const body: UpdateDocumentReq = {
        id: selectedDocument.id,
        status: data.status || undefined,
        note: data.note.trim()
      };

      dispatch({
        type: UPDATE_DOCUMENT,
        payload: {
          body,
          onSuccess: onUpdateSuccess,
          onFailed: (error?: ErrorBase) => {
            showToast({
              type: TYPE_TOAST.ERROR,
              content: getDocumentErrorMessage(error, 'Cập nhật tài liệu thất bại')
            });
          }
        }
      });
    },
    [onUpdateSuccess, selectedDocument]
  );

  const onDeleteSuccess = useCallback(() => {
    fetchList(currentPage);
    showToast({
      type: TYPE_TOAST.SUCCESS,
      content: 'Xoá tài liệu thành công'
    });
  }, [currentPage, fetchList]);

  const onDelete = useCallback(
    (document: DocumentItem) => {
      showDialog({
        title: t('common:delete_confirm'),
        content: (
          <>
            Bạn có chắc chắn xoá tài liệu <strong>{document.originalFileName}</strong> này?
          </>
        ),
        type: TYPE_MESSAGE.ALERT,
        actions: [
          {
            title: t('common:agree'),
            type: TYPE_ACTION.PRIMARY,
            onPress: () => {
              const body: DeleteDocumentReq = { id: document.id };
              dispatch({
                type: DELETE_DOCUMENT,
                payload: {
                  body,
                  onSuccess: onDeleteSuccess,
                  onFailed: (error?: ErrorBase) => {
                    showToast({
                      type: TYPE_TOAST.ERROR,
                      content: getDocumentErrorMessage(error, 'Xoá tài liệu thất bại')
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

  const onView = useCallback(async (document: DocumentItem) => {
    const targetWindow = window.open('about:blank', '_blank');
    if (targetWindow) {
      targetWindow.opener = null;
    }

    const response = await documentServices.viewDocumentFile(document.id);
    const fileError = await getBlobResponseError(response);
    if (fileError || !isBlobFileResponse(response)) {
      targetWindow?.close();
      showToast({
        type: TYPE_TOAST.ERROR,
        content: getDocumentErrorMessage(fileError as ErrorBase, 'Xem tài liệu thất bại')
      });
      return;
    }

    if (!canViewBlobInline(response, INLINE_DOCUMENT_MIME_TYPES)) {
      targetWindow?.close();
      downloadBlobResponse(response, getDownloadFileName(document, response.fileName));
      showToast({
        type: TYPE_TOAST.INFO,
        content: 'Định dạng này không hỗ trợ xem trực tiếp, hệ thống đã tải file xuống'
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
  }, []);

  const onDownload = useCallback(async (document: DocumentItem) => {
    const response = await documentServices.downloadDocumentFile(document.id);
    const fileError = await getBlobResponseError(response);
    if (fileError || !isBlobFileResponse(response)) {
      showToast({
        type: TYPE_TOAST.ERROR,
        content: getDocumentErrorMessage(fileError as ErrorBase, 'Tải tài liệu thất bại')
      });
      return;
    }

    downloadBlobResponse(response, getDownloadFileName(document, response.fileName));
  }, []);

  return {
    t,
    documentList,
    total,
    listLoading,
    detailLoading,
    currentPage,
    pagination,
    defaultFilter,
    filterApplied,
    filterDrawerRef,
    onApplyFilter,
    onResetFilter,
    openAttach,
    setOpenAttach,
    openUpdate,
    selectedFile,
    setSelectedFile,
    selectedDocument,
    attachForm,
    updateForm,
    selectedAttachOwnerType,
    ownerOptions,
    onOpenOwnerDropdown,
    ownerDropdownRender,
    operationUnitOptions,
    operationUnitLoading,
    getOperationUnitDisplay,
    onOpenOperationUnitDropdown,
    operationUnitDropdownRender,
    handleAttachSubmit,
    handleUpdateSubmit,
    onCloseAttach,
    onOpenUpdate,
    onCloseUpdate,
    onDelete,
    onView,
    onDownload
  };
}
