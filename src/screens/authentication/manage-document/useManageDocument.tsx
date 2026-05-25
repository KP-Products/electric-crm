import { DEFAULT_PAGE_SIZE, K_SIZE_1 } from '@constant';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  DELETE_DOCUMENT,
  GET_DOCUMENT_DETAIL,
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
import { ENVConfig } from 'config/env';
import { ErrorBase } from 'model/common';
import {
  DeleteDocumentReq,
  DocumentDetailData,
  DocumentDetailRes,
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
import { useAppTranslation } from 'utils/i18n';
import { z } from 'zod';

const DOCUMENT_STATUS = {
  HOP_LE: 'HOP_LE',
  CAN_BO_SUNG: 'CAN_BO_SUNG',
  HET_HAN: 'HET_HAN'
};

const attachDocumentSchema = z.object({
  ownerType: z.string().trim().min(K_SIZE_1, { message: 'Vui lòng nhập loại chủ sở hữu' }),
  ownerId: z.string().trim().min(K_SIZE_1, { message: 'Vui lòng nhập mã chủ sở hữu' }),
  docType: z.string().trim().min(K_SIZE_1, { message: 'Vui lòng nhập loại tài liệu' }),
  status: z.string().trim(),
  note: z.string().trim()
});

const updateDocumentSchema = z.object({
  status: z.string().trim(),
  note: z.string().trim()
});

const getDocumentLink = (
  document?: DocumentDetailData | DocumentItem | DocumentDetailRes | null
): string | undefined => {
  if (!document) return undefined;
  if (typeof document === 'string') return document;

  if ('data' in document && document.data) {
    const nestedLink: string | undefined = getDocumentLink(document.data);
    if (nestedLink) return nestedLink;
  }

  return (
    document.viewUrl ||
    document.downloadUrl ||
    document.fileUrl ||
    document.url ||
    document.link ||
    document.path
  );
};

const buildDocumentViewUrl = (viewUrl?: string): string | undefined => {
  if (!viewUrl) return undefined;

  try {
    return new URL(viewUrl).toString();
  } catch {
    const baseUrl = ENVConfig.API_URL || window.location.origin;
    return new URL(viewUrl, baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`).toString();
  }
};

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
      status: ''
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

  const buildSearchBody = useCallback(
    (filter: DocumentFilterForm, page: number): SearchDocumentReq => {
      const normalizedFilter = Object.fromEntries(
        Object.entries(filter)
          .map(([key, value]) => [key, value.trim()])
          .filter(([, value]) => Boolean(value))
      );

      return {
        page: page - K_SIZE_1,
        size: DEFAULT_PAGE_SIZE,
        ...normalizedFilter
      };
    },
    []
  );

  const fetchList = useCallback(
    (page: number) => {
      dispatch({
        type: SEARCH_DOCUMENT,
        payload: {
          body: buildSearchBody(filterApplied, page),
          onFailed: () => {
            showToast({
              type: TYPE_TOAST.ERROR,
              content: 'Tải danh sách tài liệu thất bại'
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
      content:
        error?.businessErrorMessage || error?.systemErrorMessage || 'Đính kèm tài liệu thất bại'
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
        note: data.note || undefined
      };

      dispatch({
        type: UPDATE_DOCUMENT,
        payload: {
          body,
          onSuccess: onUpdateSuccess,
          onFailed: (error?: ErrorBase) => {
            showToast({
              type: TYPE_TOAST.ERROR,
              content:
                error?.businessErrorMessage ||
                error?.systemErrorMessage ||
                'Cập nhật tài liệu thất bại'
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
                      content:
                        error?.businessErrorMessage ||
                        error?.systemErrorMessage ||
                        'Xoá tài liệu thất bại'
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

  const openDocumentLink = useCallback((link?: string, targetWindow?: Window | null) => {
    const viewUrl = buildDocumentViewUrl(link);

    if (!viewUrl) {
      targetWindow?.close();
      showToast({
        type: TYPE_TOAST.INFO,
        content: 'Chưa có đường dẫn xem tài liệu'
      });
      return;
    }

    if (targetWindow) {
      targetWindow.location.href = viewUrl;
      return;
    }

    window.open(viewUrl, '_blank', 'noopener,noreferrer');
  }, []);

  const onView = useCallback(
    (document: DocumentItem) => {
      const targetWindow = window.open('about:blank', '_blank');
      if (targetWindow) {
        targetWindow.opener = null;
      }

      const availableLink = getDocumentLink(document);
      if (availableLink) {
        openDocumentLink(availableLink, targetWindow);
        return;
      }

      dispatch({
        type: GET_DOCUMENT_DETAIL,
        payload: {
          body: { id: document.id },
          onSuccess: (response: DocumentDetailRes) => {
            openDocumentLink(getDocumentLink(response), targetWindow);
          },
          onFailed: (error?: ErrorBase) => {
            targetWindow?.close();
            showToast({
              type: TYPE_TOAST.ERROR,
              content:
                error?.businessErrorMessage ||
                error?.systemErrorMessage ||
                'Lấy đường dẫn tài liệu thất bại'
            });
          }
        }
      });
    },
    [openDocumentLink]
  );

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
    handleAttachSubmit,
    handleUpdateSubmit,
    onCloseAttach,
    onOpenUpdate,
    onCloseUpdate,
    onDelete,
    onView
  };
}
