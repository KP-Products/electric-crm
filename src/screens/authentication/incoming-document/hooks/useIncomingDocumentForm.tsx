import { CONSTANTS, DEFAULT_PAGE_SIZE, K_SIZE_0, K_SIZE_1 } from '@constant';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  CREATE_INCOMING_DOCUMENT,
  DELETE_INCOMING_DOCUMENT_ATTACHMENT,
  GET_INCOMING_DOCUMENT_DETAIL,
  UPDATE_INCOMING_DOCUMENT,
  UPLOAD_INCOMING_DOCUMENT_ATTACHMENT
} from '@redux-action-type/incoming-document';
import { dispatch } from '@redux-common';
import { selectToken, selectUserInfo } from '@redux-selector/auth';
import { selectIncomingDocumentLoadingDetail } from '@redux-selector/incoming-document';
import CustomDropSearchMore from 'components/select/CustomDropSearchMore';
import { AppSelectOption } from 'components/select';
import { showDialog } from 'components/dialog';
import { TYPE_ACTION, TYPE_MESSAGE } from 'components/dialog/type';
import { showToast } from 'components/toast';
import { TYPE_TOAST } from 'components/toast/type';
import { ROUTES } from 'config/routes';
import { debounce } from 'lodash';
import { ErrorBase } from 'model/common';
import { Employee } from 'model/employee';
import {
  CreateIncomingDocumentReq,
  IncomingDocument,
  IncomingDocumentRes,
  UpdateIncomingDocumentReq
} from 'model/incoming-document';
import { useRouter, useSearchParams } from 'next/navigation';
import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import employeeServices from 'services/employee-services';
import incomingDocumentServices from 'services/incoming-document-services';
import { getAuthUserId } from 'utils/auth';
import { normalizeDateToApi } from 'utils/date';
import { isFormattedIntegerInput, parseFormattedIntegerNumber } from 'utils/number-input';
import { z } from 'zod';
import {
  buildEmployeeSelectOptions,
  getEmployeeSelectLabel
} from 'screens/authentication/manage-employee/utils';
import {
  canViewAttachmentInline,
  DATE_API_FORMAT,
  getAttachmentFileName,
  getAttachmentResponseError,
  getErrorContent,
  isAttachmentFileResponse,
  normalizeIncomingDocumentType
} from '../utils';

const optionalDateSchema = z
  .string()
  .nullable()
  .transform((value) => value?.trim() || '');

const requiredDateSchema = z
  .string()
  .nullable()
  .transform((value) => value?.trim() || '')
  .refine((value) => Boolean(value), { message: 'Vui lòng chọn ngày văn bản' });

const numericStringSchema = (message: string) =>
  z.string().trim().refine(isFormattedIntegerInput, {
    message
  });

const incomingDocumentSchema = z.object({
  incomingNumber: z.string().trim().min(K_SIZE_1, { message: 'Vui lòng nhập số đến' }),
  incomingDate: optionalDateSchema,
  documentNumber: z.string().trim(),
  documentDate: requiredDateSchema,
  issuingAgency: z.string().trim().min(K_SIZE_1, { message: 'Vui lòng nhập cơ quan ban hành' }),
  documentType: z.string().trim(),
  summary: z.string().trim().min(K_SIZE_1, { message: 'Vui lòng nhập trích yếu nội dung' }),
  urgencyLevel: z.string().trim(),
  confidentialityLevel: z.string().trim(),
  pageCount: numericStringSchema('Số trang phải là số nguyên dương'),
  dueDate: optionalDateSchema,
  approvedBy: numericStringSchema('Người duyệt phải là ID dạng số'),
  approvalDate: optionalDateSchema,
  approvalNote: z.string().trim(),
  note: z.string().trim()
});

export type IncomingDocumentForm = z.infer<typeof incomingDocumentSchema>;

const optionalString = (value?: string | null) => {
  const normalizedValue = value?.trim();
  return normalizedValue || undefined;
};

const optionalNumber = (value?: string) => {
  const normalizedValue = optionalString(value);
  return normalizedValue ? parseFormattedIntegerNumber(normalizedValue) : undefined;
};

const optionalDate = (value?: string | null) => optionalString(normalizeDateToApi(value));

const toDatePickerValue = (value?: string | null) => normalizeDateToApi(value);

interface UseIncomingDocumentFormProps {
  isEditMode: boolean;
}

export default function useIncomingDocumentForm({ isEditMode }: UseIncomingDocumentFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const detailLoading = useSelector(selectIncomingDocumentLoadingDetail);
  const userInfo = useSelector(selectUserInfo);
  const token = useSelector(selectToken);
  const [selectedDocument, setSelectedDocument] = useState<IncomingDocument>();
  const [selectedFile, setSelectedFile] = useState<File>();
  const [submitLocked, setSubmitLocked] = useState(false);
  const [searchedApproverOptions, setSearchedApproverOptions] = useState<AppSelectOption[]>([]);
  const [approverLabelMap, setApproverLabelMap] = useState<Record<string, string>>({});
  const [approverOptionsLoading, setApproverOptionsLoading] = useState<boolean>(false);
  const [approverSearch, setApproverSearch] = useState<string>('');
  const approverSearchRequestRef = useRef<number>(0);

  const defaultFormValues: IncomingDocumentForm = useMemo(
    () => ({
      incomingNumber: '',
      incomingDate: '',
      documentNumber: '',
      documentDate: '',
      issuingAgency: '',
      documentType: '',
      summary: '',
      urgencyLevel: '',
      confidentialityLevel: '',
      pageCount: '',
      dueDate: '',
      approvedBy: '',
      approvalDate: '',
      approvalNote: '',
      note: ''
    }),
    []
  );

  const form = useForm<IncomingDocumentForm>({
    mode: 'onTouched',
    defaultValues: defaultFormValues,
    resolver: zodResolver(incomingDocumentSchema)
  });

  const creatorId = useMemo(() => getAuthUserId(userInfo, token), [token, userInfo]);

  const approvedByValue = form.watch('approvedBy');

  const onBack = useCallback(() => {
    router.push(ROUTES.INCOMING_DOCUMENTS);
  }, [router]);

  const upsertApproverLabels = useCallback((employees: Employee[]) => {
    setApproverLabelMap((prev) => {
      const next = { ...prev };
      let changed = false;

      employees.forEach((employee) => {
        if (employee.id === undefined || employee.id === null) return;

        const key = String(employee.id);
        const label = getEmployeeSelectLabel(employee);
        if (next[key] === label) return;

        next[key] = label;
        changed = true;
      });

      return changed ? next : prev;
    });
  }, []);

  const approverOptions = useMemo<AppSelectOption[]>(() => {
    const optionMap = new Map<string, AppSelectOption>();

    searchedApproverOptions.forEach((option) => {
      optionMap.set(String(option.value), option);
    });

    if (approvedByValue) {
      const key = String(approvedByValue);
      optionMap.set(key, { value: key, label: approverLabelMap[key] || key });
    }

    return Array.from(optionMap.values());
  }, [approvedByValue, approverLabelMap, searchedApproverOptions]);

  const fetchApproverLabel = useCallback(
    async (employeeId: number) => {
      const response = await employeeServices.getEmployeeDetail({ id: employeeId });
      const employee = response?.data?.employee;
      if (employee) upsertApproverLabels([employee]);
    },
    [upsertApproverLabels]
  );

  const fetchApproverOptions = useCallback(
    async (keyword = '') => {
      const requestNo = approverSearchRequestRef.current + K_SIZE_1;
      approverSearchRequestRef.current = requestNo;
      setApproverOptionsLoading(true);

      const normalizedKeyword = keyword.trim();
      const response = await employeeServices.searchEmployees({
        page: K_SIZE_0,
        size: DEFAULT_PAGE_SIZE,
        ...(normalizedKeyword ? { fullName: normalizedKeyword } : {})
      });

      if (approverSearchRequestRef.current !== requestNo) return;
      setApproverOptionsLoading(false);

      if (!response || !response.data) {
        setSearchedApproverOptions([]);
        showToast({
          type: TYPE_TOAST.ERROR,
          content: getErrorContent(response, 'Tải danh sách người duyệt thất bại')
        });
        return;
      }

      const employees = Array.isArray(response.data.items) ? response.data.items : [];
      upsertApproverLabels(employees);
      setSearchedApproverOptions(buildEmployeeSelectOptions(employees));
    },
    [upsertApproverLabels]
  );

  const debouncedFetchApproverOptions = useMemo(
    () => debounce(fetchApproverOptions, CONSTANTS.TIME_DEBOUNCE),
    [fetchApproverOptions]
  );

  useEffect(
    () => () => {
      debouncedFetchApproverOptions.cancel();
    },
    [debouncedFetchApproverOptions]
  );

  useEffect(() => {
    fetchApproverOptions();
  }, [fetchApproverOptions]);

  useEffect(() => {
    const employeeId = Number(approvedByValue);
    if (!approvedByValue || Number.isNaN(employeeId) || approverLabelMap[String(approvedByValue)]) {
      return;
    }

    void fetchApproverLabel(employeeId);
  }, [approvedByValue, approverLabelMap, fetchApproverLabel]);

  const onSearchApproverOptions = useCallback(
    (keyword: string) => {
      setApproverSearch(keyword);
      debouncedFetchApproverOptions(keyword);
    },
    [debouncedFetchApproverOptions]
  );

  const onOpenApproverDropdown = useCallback(() => {
    if (!searchedApproverOptions.length && !approverOptionsLoading) {
      fetchApproverOptions(approverSearch);
    }
  }, [
    approverOptionsLoading,
    approverSearch,
    fetchApproverOptions,
    searchedApproverOptions.length
  ]);

  const renderApproverDropdown = useCallback(
    (menuInstance: ReactNode) => (
      <CustomDropSearchMore
        menuInstance={menuInstance}
        searchValue={approverSearch}
        onChangeSearch={onSearchApproverOptions}
        onMore={() => {}}
        totalList={approverOptions.length}
        total={approverOptions.length}
        loading={approverOptionsLoading}
      />
    ),
    [approverOptions.length, approverOptionsLoading, approverSearch, onSearchApproverOptions]
  );

  const fillForm = useCallback(
    (document: IncomingDocument) => {
      form.reset({
        incomingNumber: document.incomingNumber || '',
        incomingDate: toDatePickerValue(document.incomingDate),
        documentNumber: document.documentNumber || '',
        documentDate: toDatePickerValue(document.documentDate),
        issuingAgency: document.issuingAgency || '',
        documentType: normalizeIncomingDocumentType(document.documentType),
        summary: document.summary || '',
        urgencyLevel: document.urgencyLevel || '',
        confidentialityLevel: document.confidentialityLevel || '',
        pageCount:
          document.pageCount !== undefined && document.pageCount !== null
            ? String(document.pageCount)
            : '',
        dueDate: toDatePickerValue(document.dueDate),
        approvedBy:
          document.approvedBy !== undefined && document.approvedBy !== null
            ? String(document.approvedBy)
            : '',
        approvalDate: toDatePickerValue(document.approvalDate),
        approvalNote: document.approvalNote || '',
        note: document.note || ''
      });
    },
    [form]
  );

  useEffect(() => {
    if (!isEditMode) return;

    const numericId = Number(id);
    if (!id || Number.isNaN(numericId)) {
      showToast({ type: TYPE_TOAST.ERROR, content: 'Không tìm thấy văn bản đến cần cập nhật' });
      onBack();
      return;
    }

    dispatch({
      type: GET_INCOMING_DOCUMENT_DETAIL,
      payload: {
        body: { id: numericId },
        onSuccess: (response: IncomingDocumentRes) => {
          if (!response.data) return;
          setSelectedDocument(response.data);
          fillForm(response.data);
        },
        onFailed: (error?: ErrorBase) => {
          showToast({
            type: TYPE_TOAST.ERROR,
            content: getErrorContent(error, 'Tải thông tin văn bản đến thất bại')
          });
          onBack();
        }
      }
    });
  }, [fillForm, id, isEditMode, onBack]);

  const buildSubmitBody = useCallback(
    (data: IncomingDocumentForm): CreateIncomingDocumentReq => ({
      incomingNumber: data.incomingNumber.trim(),
      incomingDate: optionalDate(data.incomingDate),
      documentNumber: optionalString(data.documentNumber),
      documentDate: normalizeDateToApi(data.documentDate),
      issuingAgency: data.issuingAgency.trim(),
      documentType: optionalString(normalizeIncomingDocumentType(data.documentType)),
      summary: data.summary.trim(),
      urgencyLevel: optionalString(data.urgencyLevel),
      confidentialityLevel: optionalString(data.confidentialityLevel),
      pageCount: optionalNumber(data.pageCount),
      dueDate: optionalDate(data.dueDate),
      approvedBy: optionalNumber(data.approvedBy),
      approvalDate: optionalDate(data.approvalDate),
      approvalNote: optionalString(data.approvalNote),
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
        type: UPLOAD_INCOMING_DOCUMENT_ATTACHMENT,
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
    (data: IncomingDocumentForm) => {
      const body = buildSubmitBody(data);

      if (isEditMode) {
        if (!selectedDocument) {
          showToast({ type: TYPE_TOAST.ERROR, content: 'Không tìm thấy văn bản đến cần cập nhật' });
          return;
        }

        const updateBody: UpdateIncomingDocumentReq = {
          id: selectedDocument.id,
          ...body
        };
        dispatch({
          type: UPDATE_INCOMING_DOCUMENT,
          payload: {
            body: updateBody,
            onSuccess: (response: IncomingDocumentRes) => {
              uploadAttachmentAfterSave(
                response.data?.id || selectedDocument.id,
                'Cập nhật văn bản đến thành công',
                'Cập nhật văn bản đến thành công nhưng tải file thất bại'
              );
            },
            onFailed: (error?: ErrorBase) => {
              showToast({
                type: TYPE_TOAST.ERROR,
                content: getErrorContent(error, 'Cập nhật văn bản đến thất bại')
              });
            }
          }
        });
        return;
      }

      const createBody: CreateIncomingDocumentReq = {
        ...body,
        ...(creatorId ? { createdBy: creatorId } : {})
      };

      dispatch({
        type: CREATE_INCOMING_DOCUMENT,
        payload: {
          body: createBody,
          onSuccess: (response: IncomingDocumentRes) => {
            const savedId = response.data?.id;
            if (!savedId) {
              if (selectedFile) {
                setSubmitLocked(true);
                showToast({
                  type: TYPE_TOAST.ERROR,
                  content:
                    'Tạo văn bản đến thành công nhưng không tìm thấy ID để tải file. Vui lòng quay lại danh sách kiểm tra văn bản vừa tạo.'
                });
                return;
              }
              onSubmitSuccess('Tạo văn bản đến thành công');
              return;
            }
            uploadAttachmentAfterSave(
              savedId,
              'Tạo văn bản đến thành công',
              'Tạo văn bản đến thành công nhưng tải file thất bại'
            );
          },
          onFailed: (error?: ErrorBase) => {
            showToast({
              type: TYPE_TOAST.ERROR,
              content: getErrorContent(error, 'Tạo văn bản đến thất bại')
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
      type: DELETE_INCOMING_DOCUMENT_ATTACHMENT,
      payload: {
        body: { id: selectedDocument.id },
        onSuccess: () => {
          setSelectedDocument((prev) => (prev ? { ...prev, filePath: undefined } : prev));
          showToast({
            type: TYPE_TOAST.SUCCESS,
            content: 'Gỡ file văn bản thành công'
          });
        },
        onFailed: (error?: ErrorBase) => {
          showToast({
            type: TYPE_TOAST.ERROR,
            content: getErrorContent(error, 'Gỡ file văn bản thất bại')
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
          Bạn có chắc chắn gỡ file văn bản <strong>{selectedDocument.filePath}</strong> không?
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

  const ensureAttachment = useCallback((document?: IncomingDocument) => {
    if (document?.filePath) return true;
    showToast({
      type: TYPE_TOAST.INFO,
      content: 'Văn bản đến chưa có file văn bản'
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
  }, [ensureAttachment, selectedDocument]);

  const onDownloadAttachment = useCallback(async () => {
    const document = selectedDocument;
    if (!document || !ensureAttachment(document)) return;

    const response = await incomingDocumentServices.downloadIncomingDocumentAttachment(document.id);

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
  }, [ensureAttachment, selectedDocument]);

  const createdByDisplay =
    selectedDocument?.createdBy !== undefined && selectedDocument.createdBy !== null
      ? String(selectedDocument.createdBy)
      : userInfo?.fullName || userInfo?.username || '';

  return {
    dateApiFormat: DATE_API_FORMAT,
    form,
    detailLoading,
    selectedDocument,
    selectedFile,
    setSelectedFile,
    submitLocked,
    createdByDisplay,
    approverOptions,
    approverOptionsLoading,
    onOpenApproverDropdown,
    renderApproverDropdown,
    onBack,
    onSubmit,
    onDeleteAttachment,
    onViewAttachment,
    onDownloadAttachment
  };
}
