import { K_SIZE_1 } from '@constant';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  CREATE_OPERATION_CONTRACT,
  GET_OPERATION_CONTRACT_DETAIL,
  UPDATE_OPERATION_CONTRACT
} from '@redux-action-type/operation-contract';
import { dispatch } from '@redux-common';
import { selectOperationContractLoadingDetail } from '@redux-selector/operation-contract';
import { showToast } from 'components/toast';
import { TYPE_TOAST } from 'components/toast/type';
import { ROUTES } from 'config/routes';
import { ErrorBase } from 'model/common';
import { OperationContract, OperationContractRes } from 'model/operation-contract';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { z } from 'zod';
import {
  buildCreateOperationContractBody,
  buildOperationContractFormValues,
  buildUpdateOperationContractBody,
  DEFAULT_OPERATION_CONTRACT_FORM,
  getOperationContractErrorMessage,
  getOperationContractId,
  isOperationContractDateBefore,
  OPERATION_CONTRACT_DATE_FORMAT,
  OperationContractForm,
  toAmount
} from '../utils';
import useCustomerLookup from 'screens/authentication/manage-contract/hooks/useCustomerLookup';
import { DOCUMENT_OWNER_TYPE } from 'model/document';
import { uploadOwnerDocuments } from 'utils/document-upload';

const optionalTextSchema = z.preprocess((value) => value ?? '', z.string().trim());

const operationContractSchema = z
  .object({
    contractNumber: z.string().trim().min(K_SIZE_1, { message: 'Vui lòng nhập số hợp đồng' }),
    contractName: z.string().trim().min(K_SIZE_1, { message: 'Vui lòng nhập tên hợp đồng' }),
    customerId: z.number({ message: 'Vui lòng chọn khách hàng' }).int().positive({
      message: 'Vui lòng chọn khách hàng'
    }),
    contractValue: z
      .string()
      .trim()
      .min(K_SIZE_1, { message: 'Vui lòng nhập giá trị hợp đồng' })
      .refine((value) => (toAmount(value) ?? 0) > 0, {
        message: 'Giá trị hợp đồng phải lớn hơn 0'
      }),
    discountPercent: optionalTextSchema.refine(
      (value) => {
        if (!value) return true;
        const percent = toAmount(value);
        return percent !== null && percent >= 0 && percent <= 100;
      },
      { message: 'Chiết khấu từ 0 đến 100%' }
    ),
    contractType: z.string().trim().min(K_SIZE_1, { message: 'Vui lòng nhập loại hợp đồng' }),
    signedDate: z.string().trim().min(K_SIZE_1, { message: 'Vui lòng chọn ngày ký' }),
    effectiveDate: z.string().trim().min(K_SIZE_1, { message: 'Vui lòng chọn ngày hiệu lực' }),
    expiryDate: optionalTextSchema,
    status: optionalTextSchema,
    note: optionalTextSchema
  })
  .superRefine((data, context) => {
    if (isOperationContractDateBefore(data.effectiveDate, data.signedDate)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Ngày hiệu lực không được trước ngày ký',
        path: ['effectiveDate']
      });
    }

    if (isOperationContractDateBefore(data.expiryDate, data.effectiveDate)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Ngày hết hạn không được trước ngày hiệu lực',
        path: ['expiryDate']
      });
    }
  });

interface UseOperationContractFormProps {
  isEditMode: boolean;
}

export default function useOperationContractForm({ isEditMode }: UseOperationContractFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const detailLoading = useSelector(selectOperationContractLoadingDetail);

  const [selectedContract, setSelectedContract] = useState<OperationContract>();
  const submittingRef = useRef<boolean>(false);

  const form = useForm<OperationContractForm>({
    mode: 'onTouched',
    defaultValues: DEFAULT_OPERATION_CONTRACT_FORM,
    resolver: zodResolver(operationContractSchema)
  });

  const [attachments, setAttachments] = useState<File[]>([]);
  const selectedCustomerId = form.watch('customerId');
  const pinnedCustomerIds = useMemo(
    () => [selectedContract?.customerId, selectedCustomerId],
    [selectedContract?.customerId, selectedCustomerId]
  );

  const { customerOptions, onOpenCustomerDropdown, customerDropdownRender } = useCustomerLookup({
    pinnedIds: pinnedCustomerIds,
    showErrorToast: true
  });

  /** Tải tài liệu đã chọn lên sau khi lưu HĐ; file lỗi báo riêng. */
  const uploadAttachments = useCallback(
    async (contractId?: string) => {
      if (!contractId || !attachments.length) return;
      const failed = await uploadOwnerDocuments(
        DOCUMENT_OWNER_TYPE.OPERATION_CONTRACT,
        contractId,
        attachments
      );
      if (failed.length) {
        showToast({
          type: TYPE_TOAST.ERROR,
          content: `Đã lưu hợp đồng nhưng tải lên thất bại: ${failed.join(', ')}`
        });
      }
    },
    [attachments]
  );

  const onBack = useCallback(() => {
    router.push(ROUTES.MANAGE_OPERATION_CONTRACT);
  }, [router]);

  const resetOperationContractForm = useCallback(
    (contract: OperationContract) => {
      setSelectedContract(contract);
      form.reset(buildOperationContractFormValues(contract));
    },
    [form]
  );

  useEffect(() => {
    if (!isEditMode) {
      form.reset(DEFAULT_OPERATION_CONTRACT_FORM);
      return;
    }

    if (!id) {
      showToast({ type: TYPE_TOAST.ERROR, content: 'Không tìm thấy hợp đồng vận hành cần sửa' });
      onBack();
      return;
    }

    dispatch({
      type: GET_OPERATION_CONTRACT_DETAIL,
      payload: {
        body: { id },
        onSuccess: (response: OperationContractRes) => {
          if (!response.data) return;
          resetOperationContractForm(response.data);
        },
        onFailed: (error?: ErrorBase) => {
          showToast({
            type: TYPE_TOAST.ERROR,
            content: getOperationContractErrorMessage(
              error,
              'Tải thông tin hợp đồng vận hành thất bại'
            )
          });
          onBack();
        }
      }
    });
  }, [form, id, isEditMode, onBack, resetOperationContractForm]);

  const onSubmitSuccess = useCallback(
    (content: string) => {
      submittingRef.current = false;
      showToast({ type: TYPE_TOAST.SUCCESS, content });
      onBack();
    },
    [onBack]
  );

  const onSubmitFailed = useCallback((error: ErrorBase | undefined, fallback: string) => {
    submittingRef.current = false;
    showToast({
      type: TYPE_TOAST.ERROR,
      content: getOperationContractErrorMessage(error, fallback)
    });
  }, []);

  const onSubmit = useCallback(
    (data: OperationContractForm) => {
      if (submittingRef.current) return;
      submittingRef.current = true;

      if (isEditMode) {
        const contractId = getOperationContractId(selectedContract);
        if (!contractId) {
          submittingRef.current = false;
          showToast({
            type: TYPE_TOAST.ERROR,
            content: 'Không tìm thấy ID hợp đồng vận hành để cập nhật'
          });
          return;
        }

        dispatch({
          type: UPDATE_OPERATION_CONTRACT,
          payload: {
            body: buildUpdateOperationContractBody(contractId, data),
            onSuccess: async () => {
              await uploadAttachments(contractId);
              onSubmitSuccess('Cập nhật hợp đồng vận hành thành công');
            },
            onFailed: (error?: ErrorBase) =>
              onSubmitFailed(error, 'Cập nhật hợp đồng vận hành thất bại')
          }
        });
        return;
      }

      dispatch({
        type: CREATE_OPERATION_CONTRACT,
        payload: {
          body: buildCreateOperationContractBody(data),
          onSuccess: async (response?: OperationContractRes) => {
            await uploadAttachments(response?.data?.contractId);
            onSubmitSuccess('Thêm mới hợp đồng vận hành thành công');
          },
          onFailed: (error?: ErrorBase) =>
            onSubmitFailed(error, 'Thêm mới hợp đồng vận hành thất bại')
        }
      });
    },
    [isEditMode, onSubmitFailed, onSubmitSuccess, selectedContract, uploadAttachments]
  );

  return {
    dateApiFormat: OPERATION_CONTRACT_DATE_FORMAT,
    form,
    detailLoading,
    customerOptions,
    onOpenCustomerDropdown,
    customerDropdownRender,
    attachments,
    setAttachments,
    selectedContract,
    onBack,
    onSubmit
  };
}
