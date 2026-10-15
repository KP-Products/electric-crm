import { K_SIZE_1 } from '@constant';
import { zodResolver } from '@hookform/resolvers/zod';
import { CREATE_CONTRACT, GET_CONTRACT_DETAIL, UPDATE_CONTRACT } from '@redux-action-type/contract';
import { dispatch } from '@redux-common';
import { selectContractLoadingDetail } from '@redux-selector/contract';
import { AppSelectOption } from 'components/select';
import { showToast } from 'components/toast';
import { TYPE_TOAST } from 'components/toast/type';
import { ROUTES } from 'config/routes';
import { ErrorBase } from 'model/common';
import { AvailableMeter, Contract, ContractRes } from 'model/contract';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import contractServices from 'services/contract-services';
import { getVoltageLevelLabel } from 'screens/authentication/meter-management/utils/constant';
import { z } from 'zod';
import {
  buildContractFormValues,
  buildCreateContractBody,
  buildUpdateContractBody,
  CONTRACT_DATE_FORMAT,
  ContractForm,
  DEFAULT_CONTRACT_FORM,
  EMPTY_CONTRACT_METER_LINE,
  formatContractDate,
  getContractErrorMessage,
  getContractId,
  isContractDateBefore
} from '../utils';
import useCustomerLookup from './useCustomerLookup';

const optionalTextSchema = z.preprocess((value) => value ?? '', z.string().trim());

const meterLineSchema = z.object({
  meterId: z.string().trim().min(K_SIZE_1, { message: 'Chọn công tơ' }),
  feederId: z.string().trim().min(K_SIZE_1, { message: 'Chọn lộ' }),
  installationDate: z.string().trim().min(K_SIZE_1, { message: 'Chọn ngày lắp đặt' })
});

const contractSchema = z
  .object({
    contractNumber: z.string().trim().min(K_SIZE_1, { message: 'Vui lòng nhập số hợp đồng' }),
    customerId: z.number().int().positive({ message: 'Vui lòng chọn khách hàng' }),
    meters: z.array(meterLineSchema).min(K_SIZE_1, { message: 'Thêm ít nhất 1 công tơ' }),
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

    const seen = new Set<string>();
    data.meters.forEach((line, index) => {
      if (!line.meterId) return;
      if (seen.has(line.meterId)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Công tơ đã được chọn ở dòng khác',
          path: ['meters', index, 'meterId']
        });
      }
      seen.add(line.meterId);
    });
  });

const toMeterOption = (meter: AvailableMeter): AppSelectOption => ({
  value: meter.meterId,
  label: [meter.meterCode, meter.voltageLevel ? getVoltageLevelLabel(meter.voltageLevel) : '']
    .filter(Boolean)
    .join(' - '),
  rawData: meter
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
  const [availableMeters, setAvailableMeters] = useState<AvailableMeter[]>([]);
  const [feeders, setFeeders] = useState<AvailableMeter[]>([]);
  const [meterLoading, setMeterLoading] = useState<boolean>(false);
  const submittingRef = useRef<boolean>(false);

  const form = useForm<ContractForm>({
    mode: 'onTouched',
    defaultValues: DEFAULT_CONTRACT_FORM,
    resolver: zodResolver(contractSchema)
  });
  const meterLines = useFieldArray({ control: form.control, name: 'meters' });

  const selectedCustomerId = form.watch('customerId');
  const watchedMeters = form.watch('meters');
  const pinnedCustomerIds = useMemo(
    () => [selectedContract?.customerId, selectedCustomerId],
    [selectedContract?.customerId, selectedCustomerId]
  );
  const isCopyCustomerUnchanged = useMemo(
    () => isCopyMode && (!selectedContract || selectedCustomerId === selectedContract.customerId),
    [isCopyMode, selectedContract, selectedCustomerId]
  );

  const { customerOptions, onOpenCustomerDropdown, customerDropdownRender } = useCustomerLookup({
    pinnedIds: pinnedCustomerIds,
    showErrorToast: true
  });

  // Lộ: tải 1 lần.
  useEffect(() => {
    let isActive = true;
    contractServices.getFeeders().then((response) => {
      if (!isActive) return;
      if (!response?.data) {
        showToast({
          type: TYPE_TOAST.ERROR,
          content: getContractErrorMessage(response as ErrorBase, 'Tải danh sách lộ thất bại')
        });
        return;
      }
      setFeeders(Array.isArray(response.data) ? response.data : []);
    });
    return () => {
      isActive = false;
    };
  }, []);

  // Công tơ còn trống của khách hàng đang chọn (kèm công tơ của chính HĐ khi sửa).
  const editingContractId = isEditMode ? getContractId(selectedContract) : '';
  useEffect(() => {
    let isActive = true;
    if (!selectedCustomerId) {
      setAvailableMeters([]);
      return;
    }
    setMeterLoading(true);
    contractServices
      .getAvailableMeters({
        customerId: selectedCustomerId,
        contractId: editingContractId || undefined
      })
      .then((response) => {
        if (!isActive) return;
        setMeterLoading(false);
        if (!response?.data) {
          showToast({
            type: TYPE_TOAST.ERROR,
            content: getContractErrorMessage(
              response as ErrorBase,
              'Tải danh sách công tơ thất bại'
            )
          });
          return;
        }
        setAvailableMeters(Array.isArray(response.data) ? response.data : []);
      });
    return () => {
      isActive = false;
    };
  }, [editingContractId, selectedCustomerId]);

  const feederOptions = useMemo(
    () => feeders.map((feeder) => ({ value: feeder.meterId, label: feeder.meterCode || '' })),
    [feeders]
  );
  const meterById = useMemo(() => {
    const map = new Map<string, AvailableMeter>();
    availableMeters.forEach((meter) => map.set(meter.meterId, meter));
    return map;
  }, [availableMeters]);

  /** Mỗi dòng chỉ thấy công tơ chưa được chọn ở dòng khác. */
  const getMeterOptionsForLine = useCallback(
    (index: number) => {
      const usedElsewhere = new Set(
        (watchedMeters || [])
          .filter((_, lineIndex) => lineIndex !== index)
          .map((line) => line.meterId)
          .filter(Boolean)
      );
      return availableMeters
        .filter((meter) => !usedElsewhere.has(meter.meterId))
        .map(toMeterOption);
    },
    [availableMeters, watchedMeters]
  );

  /** Chọn công tơ → điền sẵn lộ hiện tại và ngày lắp (hoặc ngày hiệu lực HĐ) nếu dòng còn trống. */
  const onSelectMeter = useCallback(
    (index: number, meterId: string) => {
      const meter = meterById.get(meterId);
      if (!meter) return;
      const line = form.getValues(`meters.${index}`);
      if (!line.feederId && meter.feederId) {
        form.setValue(`meters.${index}.feederId`, meter.feederId, { shouldValidate: true });
      }
      if (!line.installationDate) {
        const date =
          formatContractDate(meter.installationDate) || form.getValues('effectiveDate') || '';
        if (date) {
          form.setValue(`meters.${index}.installationDate`, date, { shouldValidate: true });
        }
      }
    },
    [form, meterById]
  );

  const onAddMeterLine = useCallback(() => {
    meterLines.append({ ...EMPTY_CONTRACT_METER_LINE });
  }, [meterLines]);

  const onRemoveMeterLine = useCallback(
    (index: number) => {
      meterLines.remove(index);
    },
    [meterLines]
  );

  const getMeterInfo = useCallback(
    (meterId?: string) => (meterId ? meterById.get(meterId) : undefined),
    [meterById]
  );

  const onBack = useCallback(() => {
    router.push(ROUTES.MANAGE_CONTRACT);
  }, [router]);

  const resetContractForm = useCallback(
    (contract: Contract) => {
      setSelectedContract(contract);
      form.reset(buildContractFormValues(contract, !isCopyMode));
      void form.trigger();
    },
    [form, isCopyMode]
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
    customerOptions,
    onOpenCustomerDropdown,
    customerDropdownRender,
    meterLineFields: meterLines.fields,
    meterLoading,
    feederOptions,
    getMeterOptionsForLine,
    getMeterInfo,
    onSelectMeter,
    onAddMeterLine,
    onRemoveMeterLine,
    selectedContract,
    onBack,
    onSubmit
  };
}
