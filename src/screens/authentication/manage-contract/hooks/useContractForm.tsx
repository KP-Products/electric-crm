import { K_SIZE_1 } from '@constant';
import { zodResolver } from '@hookform/resolvers/zod';
import { CREATE_CONTRACT, GET_CONTRACT_DETAIL, UPDATE_CONTRACT } from '@redux-action-type/contract';
import { dispatch } from '@redux-common';
import { selectContractLoadingDetail } from '@redux-selector/contract';
import { showToast } from 'components/toast';
import { TYPE_TOAST } from 'components/toast/type';
import { ROUTES } from 'config/routes';
import { ErrorBase } from 'model/common';
import { Contract, ContractRes } from 'model/contract';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { getVoltageLevelLabel } from 'screens/authentication/meter-management/utils/constant';
import { z } from 'zod';
import {
  buildContractFormValues,
  buildCreateContractBody,
  buildUpdateContractBody,
  CONTRACT_DATE_FORMAT,
  ContractForm,
  DEFAULT_CONTRACT_FORM,
  getContractErrorMessage,
  getContractId,
  isContractDateBefore
} from '../utils';
import useCustomerLookup from './useCustomerLookup';
import useMeterLookup from './useMeterLookup';

const optionalTextSchema = z.preprocess((value) => value ?? '', z.string().trim());

const contractSchema = z
  .object({
    contractNumber: z.string().trim().min(K_SIZE_1, { message: 'Vui lòng nhập số hợp đồng' }),
    customerId: z.string().trim().min(K_SIZE_1, { message: 'Vui lòng chọn khách hàng' }),
    meterId: z.string().trim().min(K_SIZE_1, { message: 'Vui lòng chọn công tơ' }),
    signedDate: z.string().trim().min(K_SIZE_1, { message: 'Vui lòng chọn ngày ký kết' }),
    effectiveDate: z.string().trim().min(K_SIZE_1, { message: 'Vui lòng chọn ngày hiệu lực' }),
    expiryDate: optionalTextSchema,
    status: z.string().trim().min(K_SIZE_1, { message: 'Vui lòng chọn trạng thái' }),
    note: optionalTextSchema
  })
  .superRefine((data, context) => {
    if (isContractDateBefore(data.effectiveDate, data.signedDate)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Ngày hiệu lực không được trước ngày ký kết',
        path: ['effectiveDate']
      });
    }

    if (isContractDateBefore(data.expiryDate, data.effectiveDate)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Ngày hết hiệu lực không được trước ngày hiệu lực',
        path: ['expiryDate']
      });
    }
  });

interface UseContractFormProps {
  isEditMode: boolean;
}

export default function useContractForm({ isEditMode }: UseContractFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const copyId = searchParams.get('copyId');
  const isCopyMode = !isEditMode && Boolean(copyId);
  const detailLoading = useSelector(selectContractLoadingDetail);

  const [selectedContract, setSelectedContract] = useState<Contract>();
  const submittingRef = useRef<boolean>(false);

  const form = useForm<ContractForm>({
    mode: 'onTouched',
    defaultValues: DEFAULT_CONTRACT_FORM,
    resolver: zodResolver(contractSchema)
  });

  const selectedCustomerId = form.watch('customerId');
  const selectedMeterId = form.watch('meterId');
  const pinnedCustomerIds = useMemo(
    () => [selectedContract?.customerId, selectedCustomerId],
    [selectedContract?.customerId, selectedCustomerId]
  );
  const pinnedMeterIds = useMemo(
    () => [selectedContract?.meterId, selectedMeterId],
    [selectedContract?.meterId, selectedMeterId]
  );
  const isCopyCustomerUnchanged = useMemo(
    () => isCopyMode && (!selectedContract || selectedCustomerId === selectedContract.customerId),
    [isCopyMode, selectedContract, selectedCustomerId]
  );

  const { customerOptions, onOpenCustomerDropdown, customerDropdownRender } = useCustomerLookup({
    pinnedIds: pinnedCustomerIds,
    showErrorToast: true
  });

  const { meterOptions, getMeterById, onOpenMeterDropdown, meterDropdownRender } = useMeterLookup({
    pinnedIds: pinnedMeterIds,
    showErrorToast: true
  });
  const selectedMeter = useMemo(
    () => (selectedMeterId ? getMeterById(selectedMeterId) : undefined),
    [getMeterById, selectedMeterId]
  );
  const selectedMeterMultiplier = useMemo(
    () =>
      selectedMeter?.multiplier !== undefined && selectedMeter.multiplier !== null
        ? String(selectedMeter.multiplier)
        : '',
    [selectedMeter]
  );
  const selectedMeterVoltageLevel = useMemo(
    () => (selectedMeter?.voltageLevel ? getVoltageLevelLabel(selectedMeter.voltageLevel) : ''),
    [selectedMeter?.voltageLevel]
  );
  const selectedMeterInitialReading = useMemo(
    () =>
      selectedMeter?.initialReading !== undefined && selectedMeter.initialReading !== null
        ? String(selectedMeter.initialReading)
        : '',
    [selectedMeter]
  );

  const onBack = useCallback(() => {
    router.push(ROUTES.MANAGE_CONTRACT);
  }, [router]);

  const resetContractForm = useCallback(
    (contract: Contract) => {
      setSelectedContract(contract);
      form.reset(buildContractFormValues(contract));
      void form.trigger();
    },
    [form]
  );

  useEffect(() => {
    if (!isEditMode && !isCopyMode) {
      setSelectedContract(undefined);
      form.reset(DEFAULT_CONTRACT_FORM);
      return;
    }

    const detailId = isEditMode ? id : copyId;
    if (!detailId) {
      showToast({
        type: TYPE_TOAST.ERROR,
        content: isEditMode
          ? 'Không tìm thấy hợp đồng cần sửa'
          : 'Không tìm thấy hợp đồng cần sao chép'
      });
      onBack();
      return;
    }

    dispatch({
      type: GET_CONTRACT_DETAIL,
      payload: {
        body: { id: detailId },
        onSuccess: (response: ContractRes) => {
          if (!response.data) {
            showToast({
              type: TYPE_TOAST.ERROR,
              content: isEditMode
                ? 'Không tìm thấy thông tin hợp đồng'
                : 'Không tìm thấy thông tin hợp đồng cần sao chép'
            });
            onBack();
            return;
          }
          resetContractForm(response.data);
        },
        onFailed: (error?: ErrorBase) => {
          showToast({
            type: TYPE_TOAST.ERROR,
            content: getContractErrorMessage(
              error,
              isEditMode
                ? 'Tải thông tin hợp đồng thất bại'
                : 'Tải thông tin hợp đồng cần sao chép thất bại'
            )
          });
          onBack();
        }
      }
    });
  }, [copyId, form, id, isCopyMode, isEditMode, onBack, resetContractForm]);

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
      content: getContractErrorMessage(error, fallback)
    });
  }, []);

  const onSubmit = useCallback(
    (data: ContractForm) => {
      if (submittingRef.current) return;
      submittingRef.current = true;

      if (isEditMode) {
        const contractId = getContractId(selectedContract);
        if (!contractId) {
          submittingRef.current = false;
          showToast({
            type: TYPE_TOAST.ERROR,
            content: 'Không tìm thấy ID hợp đồng để cập nhật'
          });
          return;
        }

        dispatch({
          type: UPDATE_CONTRACT,
          payload: {
            body: buildUpdateContractBody(contractId, data),
            onSuccess: () => onSubmitSuccess('Cập nhật hợp đồng thành công'),
            onFailed: (error?: ErrorBase) => onSubmitFailed(error, 'Cập nhật hợp đồng thất bại')
          }
        });
        return;
      }

      dispatch({
        type: CREATE_CONTRACT,
        payload: {
          body: buildCreateContractBody(data),
          onSuccess: () => onSubmitSuccess('Thêm mới hợp đồng thành công'),
          onFailed: (error?: ErrorBase) => onSubmitFailed(error, 'Thêm mới hợp đồng thất bại')
        }
      });
    },
    [isEditMode, onSubmitFailed, onSubmitSuccess, selectedContract]
  );

  return {
    dateApiFormat: CONTRACT_DATE_FORMAT,
    form,
    isCopyMode,
    isCopyCustomerUnchanged,
    detailLoading,
    selectedMeterId,
    selectedMeterMultiplier,
    selectedMeterVoltageLevel,
    selectedMeterInitialReading,
    customerOptions,
    meterOptions,
    onOpenCustomerDropdown,
    customerDropdownRender,
    onOpenMeterDropdown,
    meterDropdownRender,
    selectedContract,
    onBack,
    onSubmit
  };
}
