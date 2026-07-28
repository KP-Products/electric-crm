import { CONSTANTS, DEFAULT_PAGE_SIZE, K_SIZE_0, K_SIZE_1 } from '@constant';
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
import type { AppSelectOption } from 'components/select';
import { showToast } from 'components/toast';
import { TYPE_TOAST } from 'components/toast/type';
import { debounce } from 'lodash';
import { ROUTES } from 'config/routes';
import {
  CompanyLegalDocument,
  CompanyLegalDocumentRes,
  CreateCompanyLegalDocumentReq,
  UpdateCompanyLegalDocumentReq
} from 'model/company-legal-document';
import { ErrorBase } from 'model/common';
import { Employee } from 'model/employee';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { selectToken, selectUserInfo } from '@redux-selector/auth';
import companyLegalDocumentServices from 'services/company-legal-document-services';
import employeeServices from 'services/employee-services';
import { getAuthUserId } from 'utils/auth';
import { normalizeDateToApi } from 'utils/date';
import { z } from 'zod';
import {
  buildEmployeeOptions,
  COMPANY_LEGAL_DOCUMENT_STATUS,
  DATE_API_FORMAT,
  getAttachmentResponseError,
  getAttachmentFileName,
  getEmployeeLabel,
  getErrorContent,
  isAttachmentFileResponse,
  normalizeCompanyLegalDocumentStatus,
  normalizeCompanyLegalDocumentType
} from '../utils';

const optionalDateSchema = z
  .string()
  .nullable()
  .transform((value) => value?.trim() || '');

const companyLegalDocumentSchema = z.object({
  documentNumber: z.string().trim(),
  documentName: z.string().trim().min(K_SIZE_1, { message: 'Vui lòng nhập tên văn bản' }),
  documentType: z
    .string()
    .trim()
    .refine((value) => Boolean(normalizeCompanyLegalDocumentType(value)), {
      message: 'Vui lòng chọn loại văn bản'
    }),
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
  status: z
    .string()
    .trim()
    .refine((value) => Boolean(normalizeCompanyLegalDocumentStatus(value)), {
      message: 'Vui lòng chọn trạng thái'
    }),
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
  const userInfo = useSelector(selectUserInfo);
  const token = useSelector(selectToken);
  const [selectedDocument, setSelectedDocument] = useState<CompanyLegalDocument>();
  const [selectedFile, setSelectedFile] = useState<File>();
  const [submitLocked, setSubmitLocked] = useState(false);
  const [employeeSearch, setEmployeeSearch] = useState<string>('');
  const [employeeOptionsLoading, setEmployeeOptionsLoading] = useState<boolean>(false);
  const [employeeLabelMap, setEmployeeLabelMap] = useState<Record<string, string>>({});
  const [searchedEmployeeOptions, setSearchedEmployeeOptions] = useState<AppSelectOption[]>([]);
  const employeeSearchRequestRef = useRef<number>(K_SIZE_0);

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
      status: COMPANY_LEGAL_DOCUMENT_STATUS.ACTIVE,
      note: ''
    }),
    []
  );

  const form = useForm<CompanyLegalDocumentForm>({
    mode: 'onTouched',
    defaultValues: defaultFormValues,
    resolver: zodResolver(companyLegalDocumentSchema)
  });

  const draftedByValue = form.watch('draftedBy');
  const approvedByValue = form.watch('approvedBy');
  const creatorId = useMemo(() => getAuthUserId(userInfo, token), [token, userInfo]);

  const onBack = useCallback(() => {
    router.push(ROUTES.COMPANY_LEGAL_DOCUMENTS);
  }, [router]);

  const upsertEmployeeLabels = useCallback((employeeItems: Employee[]) => {
    setEmployeeLabelMap((prev) => {
      let hasChange = false;
      const next = { ...prev };

      employeeItems.forEach((employee) => {
        if (employee?.id === undefined || employee.id === null) return;
        const key = String(employee.id);
        const label = getEmployeeLabel(employee);
        if (next[key] === label) return;
        next[key] = label;
        hasChange = true;
      });

      return hasChange ? next : prev;
    });
  }, []);

  const upsertDocumentEmployeeLabels = useCallback((document: CompanyLegalDocument) => {
    setEmployeeLabelMap((prev) => {
      let hasChange = false;
      const next = { ...prev };

      const addLabel = (employeeId?: number, employeeName?: string) => {
        if (employeeId === undefined || employeeId === null || !employeeName) return;
        const key = String(employeeId);
        if (next[key] === employeeName) return;
        next[key] = employeeName;
        hasChange = true;
      };

      addLabel(document.draftedBy, document.draftedByName);
      addLabel(document.approvedBy, document.approvedByName);

      return hasChange ? next : prev;
    });
  }, []);

  const employeeOptions = useMemo<AppSelectOption[]>(() => {
    const optionMap = new Map<string, AppSelectOption>();

    searchedEmployeeOptions.forEach((option) => {
      optionMap.set(String(option.value), option);
    });

    const addKnownEmployeeOption = (employeeId?: string | number) => {
      if (employeeId === undefined || employeeId === null || employeeId === '') return;
      const key = String(employeeId);
      const label = employeeLabelMap[key];
      if (!label || optionMap.has(key)) return;
      optionMap.set(key, { value: key, label });
    };

    addKnownEmployeeOption(draftedByValue);
    addKnownEmployeeOption(approvedByValue);
    addKnownEmployeeOption(selectedDocument?.draftedBy);
    addKnownEmployeeOption(selectedDocument?.approvedBy);

    return Array.from(optionMap.values());
  }, [
    approvedByValue,
    draftedByValue,
    employeeLabelMap,
    searchedEmployeeOptions,
    selectedDocument?.approvedBy,
    selectedDocument?.draftedBy
  ]);

  const fetchEmployeeOptions = useCallback(
    async (keyword = '') => {
      const requestNo = employeeSearchRequestRef.current + K_SIZE_1;
      employeeSearchRequestRef.current = requestNo;
      setEmployeeOptionsLoading(true);

      const normalizedKeyword = keyword.trim();
      const response = await employeeServices.searchEmployees({
        page: K_SIZE_0,
        size: DEFAULT_PAGE_SIZE,
        ...(normalizedKeyword ? { fullName: normalizedKeyword } : {})
      });

      if (employeeSearchRequestRef.current !== requestNo) return;
      setEmployeeOptionsLoading(false);

      if (!response || !response.data) {
        setSearchedEmployeeOptions([]);
        return;
      }

      const employeeItems = response.data.items || [];
      upsertEmployeeLabels(employeeItems);
      setSearchedEmployeeOptions(buildEmployeeOptions(employeeItems));
    },
    [upsertEmployeeLabels]
  );

  const debouncedFetchEmployeeOptions = useMemo(
    () => debounce(fetchEmployeeOptions, CONSTANTS.TIME_DEBOUNCE),
    [fetchEmployeeOptions]
  );

  const onSearchEmployees = useCallback(
    (keyword: string) => {
      setEmployeeSearch(keyword);
      debouncedFetchEmployeeOptions(keyword);
    },
    [debouncedFetchEmployeeOptions]
  );

  const onOpenEmployeeDropdown = useCallback(() => {
    void fetchEmployeeOptions(employeeSearch);
  }, [employeeSearch, fetchEmployeeOptions]);

  const fillForm = useCallback(
    (document: CompanyLegalDocument) => {
      upsertDocumentEmployeeLabels(document);
      form.reset({
        documentNumber: document.documentNumber || '',
        documentName: document.documentName || '',
        documentType: normalizeCompanyLegalDocumentType(document.documentType),
        documentDate: normalizeDateToApi(document.documentDate),
        effectiveDate: normalizeDateToApi(document.effectiveDate),
        expiryDate: normalizeDateToApi(document.expiryDate),
        summary: document.summary || '',
        draftedBy:
          document.draftedBy !== undefined && document.draftedBy !== null
            ? String(document.draftedBy)
            : '',
        approvedBy:
          document.approvedBy !== undefined && document.approvedBy !== null
            ? String(document.approvedBy)
            : '',
        status: normalizeCompanyLegalDocumentStatus(document.status),
        note: document.note || ''
      });
    },
    [form, upsertDocumentEmployeeLabels]
  );

  useEffect(() => {
    return () => {
      debouncedFetchEmployeeOptions.cancel();
    };
  }, [debouncedFetchEmployeeOptions]);

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
      documentType: normalizeCompanyLegalDocumentType(data.documentType),
      documentDate: optionalString(normalizeDateToApi(data.documentDate)),
      effectiveDate: optionalString(normalizeDateToApi(data.effectiveDate)),
      expiryDate: optionalString(normalizeDateToApi(data.expiryDate)),
      summary: optionalString(data.summary),
      draftedBy: optionalNumber(data.draftedBy),
      approvedBy: optionalNumber(data.approvedBy),
      status: optionalString(normalizeCompanyLegalDocumentStatus(data.status)),
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

      const createBody: CreateCompanyLegalDocumentReq = {
        ...body,
        ...(creatorId ? { createdBy: creatorId } : {})
      };

      dispatch({
        type: CREATE_COMPANY_LEGAL_DOCUMENT,
        payload: {
          body: createBody,
          onSuccess: (response: CompanyLegalDocumentRes) => {
            const savedId = response.data?.id;
            if (!savedId) {
              if (selectedFile) {
                setSubmitLocked(true);
                showToast({
                  type: TYPE_TOAST.ERROR,
                  content:
                    'Tạo văn bản thành công nhưng không tìm thấy ID để tải file. Vui lòng quay lại danh sách kiểm tra văn bản vừa tạo.'
                });
                return;
              }
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
    [
      buildSubmitBody,
      creatorId,
      isEditMode,
      onSubmitSuccess,
      selectedDocument,
      selectedFile,
      uploadAttachmentAfterSave
    ]
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
    submitLocked,
    employeeOptions,
    employeeSearch,
    employeeOptionsLoading,
    setSelectedFile,
    onSearchEmployees,
    onOpenEmployeeDropdown,
    onBack,
    onSubmit,
    onDeleteAttachment,
    onViewAttachment,
    onDownloadAttachment
  };
}
