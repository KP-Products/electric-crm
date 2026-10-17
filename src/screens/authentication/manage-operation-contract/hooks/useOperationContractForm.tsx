import { zodResolver } from '@hookform/resolvers/zod';
import { showToast } from 'components/toast';
import { TYPE_TOAST } from 'components/toast/type';
import { ROUTES } from 'config/routes';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import operationContractServices from 'services/operation-contract-services';
import documentServices from 'services/document-services';
import { hasApiError } from 'utils/api-response';
import { isFormattedIntegerInput, parseFormattedIntegerNumber } from 'utils/number-input';
import { validateCustomerFile } from '../../manage-customer/create-utils';
import useCustomerLookup from '../../manage-contract/hooks/useCustomerLookup';
import {
  buildCreateOperationContractBody,
  buildOperationContractFormValues,
  buildUpdateOperationContractBody,
  DEFAULT_OPERATION_CONTRACT_FORM,
  getOperationContractErrorMessage,
  isOperationContractDateBefore,
  OPERATION_CONTRACT_DATE_FORMAT,
  OperationContractForm,
  OPERATION_CONTRACT_DOCUMENT_OWNER_TYPE
} from '../utils';

export const operationContractSchema = z
  .object({
    contractNumber: z.string().trim().min(1, 'Vui lòng nhập số hợp đồng'),
    contractName: z.string().trim().min(1, 'Vui lòng nhập tên hợp đồng'),
    customerId: z
      .number({ required_error: 'Vui lòng chọn khách hàng' })
      .int()
      .positive()
      .max(Number.MAX_SAFE_INTEGER),
    contractValue: z
      .string()
      .trim()
      .refine(
        (value) =>
          value !== '' &&
          isFormattedIntegerInput(value) &&
          Number.isSafeInteger(parseFormattedIntegerNumber(value)) &&
          (parseFormattedIntegerNumber(value) ?? 0) > 0,
        'Giá trị hợp đồng phải lớn hơn 0 và trong giới hạn cho phép'
      ),
    discountPercent: z
      .string()
      .trim()
      .refine(
        (value) =>
          !value || (Number.isFinite(Number(value)) && Number(value) >= 0 && Number(value) <= 100),
        'Chiết khấu phải từ 0 đến 100%'
      ),
    contractType: z.string().trim().min(1, 'Vui lòng chọn loại hợp đồng'),
    signedDate: z.string().trim().min(1, 'Vui lòng chọn ngày ký'),
    effectiveDate: z.string().trim().min(1, 'Vui lòng chọn ngày hiệu lực'),
    expiryDate: z.string(),
    status: z.string(),
    note: z.string().max(500, 'Ghi chú không được quá 500 ký tự')
  })
  .superRefine((data, context) => {
    if (isOperationContractDateBefore(data.effectiveDate, data.signedDate))
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Ngày hiệu lực không được trước ngày ký',
        path: ['effectiveDate']
      });
    if (isOperationContractDateBefore(data.expiryDate, data.effectiveDate))
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Ngày hết hạn không được trước ngày hiệu lực',
        path: ['expiryDate']
      });
  });

export default function useOperationContractForm({ isEditMode }: { isEditMode: boolean }) {
  const router = useRouter();
  const id = useSearchParams().get('id');
  const [detailLoading, setDetailLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [savedId, setSavedId] = useState<string>();
  const [files, setFiles] = useState<File[]>([]);
  const submittingRef = useRef(false);
  const mountedRef = useRef(true);
  const form = useForm<OperationContractForm>({
    mode: 'onChange',
    defaultValues: DEFAULT_OPERATION_CONTRACT_FORM,
    resolver: zodResolver(operationContractSchema)
  });
  const customerId = form.watch('customerId');
  const { customerOptions, onOpenCustomerDropdown, customerDropdownRender } = useCustomerLookup({
    pinnedIds: customerId ? [customerId] : [],
    showErrorToast: true
  });
  const onBack = useCallback(() => {
    if (!submittingRef.current) router.push(ROUTES.MANAGE_OPERATION_CONTRACT);
  }, [router]);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);
  useEffect(() => {
    if (!isEditMode) return;
    let active = true;
    const load = async () => {
      if (!id) {
        onBack();
        return;
      }
      setDetailLoading(true);
      const response = await operationContractServices.getOperationContractDetail({ id });
      if (!active) return;
      setDetailLoading(false);
      if (hasApiError(response) || !response.data?.contractId) {
        showToast({
          type: TYPE_TOAST.ERROR,
          content: getOperationContractErrorMessage(response, 'Tải hợp đồng thất bại')
        });
        onBack();
        return;
      }
      form.reset(buildOperationContractFormValues(response.data));
    };
    void load();
    return () => {
      active = false;
    };
  }, [id, isEditMode, form, onBack]);

  const addFile = (file: File) => {
    const error = validateCustomerFile(file);
    if (error) {
      showToast({ type: TYPE_TOAST.ERROR, content: error });
      return;
    }
    setFiles((previous) => [...previous, file]);
  };
  const removeFile = (index: number) =>
    setFiles((previous) => previous.filter((_, i) => i !== index));
  const onSubmit = async (data: OperationContractForm) => {
    if (submittingRef.current || detailLoading) return;
    submittingRef.current = true;
    setSaving(true);
    try {
      let contractId = savedId || (isEditMode ? id : undefined);
      if ((!isEditMode && !savedId) || (isEditMode && form.formState.isDirty)) {
        const response =
          isEditMode && contractId
            ? await operationContractServices.updateOperationContract(
                buildUpdateOperationContractBody(contractId, data)
              )
            : await operationContractServices.createOperationContract(
                buildCreateOperationContractBody(data)
              );
        if (!mountedRef.current) return;
        if (hasApiError(response) || !response.data?.contractId)
          throw new Error(getOperationContractErrorMessage(response, 'Lưu hợp đồng thất bại'));
        contractId = response.data.contractId;
        setSavedId(contractId);
        form.reset(data);
      }
      if (!contractId) throw new Error('Không tìm thấy ID hợp đồng');
      const failed: File[] = [];
      for (const file of files) {
        if (!mountedRef.current) return;
        try {
          const response = await documentServices.uploadDocument({
            ownerType: OPERATION_CONTRACT_DOCUMENT_OWNER_TYPE,
            ownerId: contractId,
            docType: 'HD',
            file
          });
          if (hasApiError(response) || !response.data?.id) failed.push(file);
        } catch {
          failed.push(file);
        }
      }
      if (!mountedRef.current) return;
      setFiles(failed);
      if (failed.length) {
        showToast({
          type: TYPE_TOAST.WARNING,
          content: 'Hợp đồng đã lưu. Một số tài liệu tải lên thất bại; bấm Lưu để thử lại.'
        });
        return;
      }
      showToast({
        type: TYPE_TOAST.SUCCESS,
        content: isEditMode ? 'Cập nhật hợp đồng thành công' : 'Thêm mới hợp đồng thành công'
      });
      router.push(ROUTES.MANAGE_OPERATION_CONTRACT);
    } catch (error) {
      if (mountedRef.current)
        showToast({
          type: TYPE_TOAST.ERROR,
          content: error instanceof Error ? error.message : 'Lưu hợp đồng thất bại'
        });
    } finally {
      submittingRef.current = false;
      if (mountedRef.current) setSaving(false);
    }
  };
  return {
    dateApiFormat: OPERATION_CONTRACT_DATE_FORMAT,
    form,
    detailLoading: detailLoading || saving,
    savedId,
    files,
    addFile,
    removeFile,
    customerOptions,
    onOpenCustomerDropdown,
    customerDropdownRender,
    onBack,
    onSubmit
  };
}
