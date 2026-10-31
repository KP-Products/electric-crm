import { K_SIZE_1 } from '@constant';
import { zodResolver } from '@hookform/resolvers/zod';
import { GET_CONTRACT_DETAIL } from '@redux-action-type/contract';
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
import documentServices from 'services/document-services';
import { DOCUMENT_OWNER_TYPE, DOCUMENT_TYPE } from 'model/document';
import { hasApiError } from 'utils/api-response';
import { getVoltageLevelLabel } from 'screens/authentication/meter-management/utils/constant';
import { z } from 'zod';
import {
  buildContractFormValues,
  buildCopyContractFormValues,
  buildCreateContractBody,
  buildUpdateContractBody,
  CONTRACT_DATE_FORMAT,
  ContractForm,
  DEFAULT_CONTRACT_FORM,
  EMPTY_CONTRACT_METER_LINE,
  formatContractDate,
  getContractErrorMessage,
  getContractId,
  isContractDateBefore,
  isValidContractDate
} from '../utils';
import useCustomerLookup from './useCustomerLookup';

const optionalTextSchema = z.preprocess((value) => value ?? '', z.string().trim());

const meterLineSchema = z.object({
  meterId: z.string().trim().min(K_SIZE_1, { message: 'Chọn công tơ' }),
  feederId: z.string().trim().min(K_SIZE_1, { message: 'Chọn lộ' }),
  installationDate: z
    .string()
    .trim()
    .min(K_SIZE_1, { message: 'Chọn ngày lắp đặt' })
    .refine((value) => !value || isValidContractDate(value), {
      message: 'Ngày lắp đặt không hợp lệ'
    })
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
  const [metersLoaded, setMetersLoaded] = useState(false);
  const [meterError, setMeterError] = useState('');
  const [feederError, setFeederError] = useState('');
  const [feederLoading, setFeederLoading] = useState(true);
  const [feedersLoaded, setFeedersLoaded] = useState(false);
  const [meterRetry, setMeterRetry] = useState(0);
  const [feederRetry, setFeederRetry] = useState(0);
  const submittingRef = useRef<boolean>(false);
  const mountedRef = useRef(true);
  const [saving, setSaving] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [savedContractId, setSavedContractId] = useState<string>();
  const [documentRevision, setDocumentRevision] = useState(0);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const form = useForm<ContractForm>({
    mode: 'onChange',
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
  const { customerOptions, onOpenCustomerDropdown, customerDropdownRender } = useCustomerLookup({
    pinnedIds: pinnedCustomerIds,
    showErrorToast: true
  });

  useEffect(() => {
    let isActive = true;
    setFeederLoading(true);
    setFeedersLoaded(false);
    setFeederError('');
    contractServices.getFeeders().then((response) => {
      if (!isActive) return;
      setFeederLoading(false);
      if (!Array.isArray(response?.data)) {
        setFeederError(getContractErrorMessage(response as ErrorBase, 'Tải danh sách lộ thất bại'));
        return;
      }
      setFeeders(response.data);
      setFeedersLoaded(true);
    });
    return () => {
      isActive = false;
    };
  }, [feederRetry]);

  // Công tơ còn trống của khách hàng đang chọn (kèm công tơ của chính HĐ khi sửa).
  const editingContractId = isEditMode ? getContractId(selectedContract) : '';
  useEffect(() => {
    let isActive = true;
    setMetersLoaded(false);
    setMeterError('');
    if (!selectedCustomerId) {
      setMeterLoading(false);
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
        if (!Array.isArray(response?.data)) {
          setMeterError(
            getContractErrorMessage(response as ErrorBase, 'Tải danh sách công tơ thất bại')
          );
          return;
        }
        setAvailableMeters(response.data);
        setMetersLoaded(true);
      });
    return () => {
      isActive = false;
    };
  }, [editingContractId, selectedCustomerId, meterRetry]);

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

  /** Điền lộ và ngày lắp tương ứng khi chọn hoặc đổi công tơ. */
  const onSelectMeter = useCallback(
    (index: number, meterId: string) => {
      const meter = meterById.get(meterId);
      if (!meter) return;
      form.setValue(`meters.${index}.feederId`, meter.feederId || '', {
        shouldValidate: true,
        shouldDirty: true
      });
      const date =
        formatContractDate(meter.installationDate) || form.getValues('effectiveDate') || '';
      form.setValue(`meters.${index}.installationDate`, date, {
        shouldValidate: true,
        shouldDirty: true
      });
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

  const onChangeCustomer = useCallback(
    (customerId: number) => {
      if (customerId === selectedCustomerId) return;
      meterLines.replace([{ ...EMPTY_CONTRACT_METER_LINE }]);
      setAvailableMeters([]);
      setMetersLoaded(false);
    },
    [meterLines, selectedCustomerId]
  );

  const onBack = useCallback(() => {
    router.push(ROUTES.MANAGE_CONTRACT);
  }, [router]);

  const resetContractForm = useCallback(
    (contract: Contract) => {
      setSelectedContract(contract);
      form.reset(
        isCopyMode ? buildCopyContractFormValues(contract) : buildContractFormValues(contract)
      );
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
          if (!mountedRef.current) return;
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
          if (!mountedRef.current) return;
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

  const onSubmit = useCallback(
    async (data: ContractForm) => {
      if (submittingRef.current || !mountedRef.current) return;
      if (!savedContractId) {
        if (!metersLoaded || meterLoading || !feedersLoaded || feederLoading) return;
        if (data.meters.some((line) => !meterById.has(line.meterId))) {
          showToast({
            type: TYPE_TOAST.ERROR,
            content: 'Vui lòng chọn lại công tơ hợp lệ cho khách hàng'
          });
          return;
        }
      }
      submittingRef.current = true;
      setSaving(true);
      try {
        let contractId = savedContractId || (isEditMode ? getContractId(selectedContract) : '');
        if (isEditMode && !contractId) {
          showToast({ type: TYPE_TOAST.ERROR, content: 'Không tìm thấy ID hợp đồng để cập nhật' });
          return;
        }
        if (!savedContractId && (!isEditMode || form.formState.isDirty)) {
          const response = isEditMode
            ? await contractServices.updateContract(buildUpdateContractBody(contractId, data))
            : await contractServices.createContract(buildCreateContractBody(data));
          if (!mountedRef.current) return;
          if (hasApiError(response) || !response.data) {
            showToast({
              type: TYPE_TOAST.ERROR,
              content: getContractErrorMessage(response, 'Lưu hợp đồng thất bại')
            });
            return;
          }
          contractId = contractId || getContractId(response.data);
          if (!contractId) {
            // Avoid creating a second contract if the successful response omitted its ID.
            setSavedContractId('');
            showToast({
              type: TYPE_TOAST.ERROR,
              content:
                'Hợp đồng đã lưu nhưng API không trả ID. Vui lòng mở lại hợp đồng từ danh sách để tải tài liệu.'
            });
            onBack();
            return;
          }
          form.reset(data);
        }
        setSavedContractId(contractId);
        const failedFiles: File[] = [];
        for (const file of files) {
          if (!mountedRef.current) return;
          try {
            const response = await documentServices.uploadDocument({
              ownerType: DOCUMENT_OWNER_TYPE.CONTRACT,
              ownerId: contractId,
              docType: DOCUMENT_TYPE.HD,
              file
            });
            if (hasApiError(response) || !response.data?.id) failedFiles.push(file);
          } catch {
            failedFiles.push(file);
          }
        }
        if (!mountedRef.current) return;
        setFiles(failedFiles);
        setDocumentRevision((value) => value + 1);
        if (failedFiles.length) {
          showToast({
            type: TYPE_TOAST.ERROR,
            content:
              'Hợp đồng đã lưu. Một số tài liệu tải lên thất bại, vui lòng bấm Thử lại tài liệu.'
          });
          return;
        }
        showToast({
          type: TYPE_TOAST.SUCCESS,
          content: isEditMode ? 'Cập nhật hợp đồng thành công' : 'Thêm mới hợp đồng thành công'
        });
        onBack();
      } catch {
        if (mountedRef.current)
          showToast({ type: TYPE_TOAST.ERROR, content: 'Lưu hợp đồng thất bại' });
      } finally {
        submittingRef.current = false;
        if (mountedRef.current) setSaving(false);
      }
    },
    [
      savedContractId,
      files,
      isEditMode,
      selectedContract,
      form,
      metersLoaded,
      meterLoading,
      feedersLoaded,
      feederLoading,
      meterById,
      onBack
    ]
  );

  return {
    files,
    onFilesChange: setFiles,
    documentOwnerId: savedContractId || (isEditMode ? getContractId(selectedContract) : undefined),
    savedContractId,
    documentRevision,
    saving,
    dateApiFormat: CONTRACT_DATE_FORMAT,
    form,
    isCopyMode,
    detailLoading,
    customerOptions,
    onOpenCustomerDropdown,
    customerDropdownRender,
    meterLineFields: meterLines.fields,
    meterLoading,
    meterError,
    metersEmpty: metersLoaded && availableMeters.length === 0,
    feederLoading,
    feederError,
    feedersLoaded,
    feedersEmpty: feedersLoaded && feeders.length === 0,
    onRetryMeters: () => setMeterRetry((value) => value + 1),
    onRetryFeeders: () => setFeederRetry((value) => value + 1),
    feederOptions,
    getMeterOptionsForLine,
    metersLoaded,
    onChangeCustomer,
    onSelectMeter,
    onAddMeterLine,
    onRemoveMeterLine,
    selectedContract,
    onBack,
    onSubmit
  };
}
