import { K_SIZE_1 } from '@constant';
import { zodResolver } from '@hookform/resolvers/zod';
import { ADD_METER, EDIT_METER, METER_DETAIL } from '@redux-action-type/meter';
import { dispatch } from '@redux-common';
import { selectMeterList, selectMeterLoadingDetail } from '@redux-selector/meter';
import { showToast } from 'components/toast';
import { TYPE_TOAST } from 'components/toast/type';
import { ROUTES } from 'config/routes';
import { ErrorBase } from 'model/common';
import {
  AddMeterReq,
  EditMeterReq,
  GetMeterDetailRes,
  Meter,
  normalizeMeterSearchItem
} from 'model/meter';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { DebugUtils } from 'utils/debug-utils';
import { normalizeDateToApi } from 'utils/date';
import { TypedT, useAppTranslation } from 'utils/i18n/useAppTranslation';
import { z } from 'zod';
import {
  METER_TYPE,
  METER_STATUS,
  normalizeMeterType,
  normalizeMeterStatus,
  normalizeVoltageLevel
} from '../utils/constant';
import useMeterLookup from '../../manage-contract/hooks/useMeterLookup';

const optionalString = z.preprocess(
  (value) => (value === null || value === undefined ? '' : value),
  z.string().trim()
);

const normalizeNumberInput = (value: string) => {
  const normalizedValue = value.trim().replace(/\s/g, '');
  if (normalizedValue.includes(',')) {
    return normalizedValue.replace(/\./g, '').replace(',', '.');
  }
  return normalizedValue;
};

const parseNumberInput = (value: string) => Number(normalizeNumberInput(value));

const shouldSelectParentMeter = (meterType?: string) =>
  meterType === METER_TYPE.CUSTOMER || meterType === METER_TYPE.CONG_TO_TONG;

const meterSchema = (t: TypedT) => {
  return z
    .object({
      meterCode: z
        .string()
        .trim()
        .min(K_SIZE_1, { message: t('validate:required', { name: 'Số công tơ' }) }),
      status: z
        .string()
        .trim()
        .min(K_SIZE_1, { message: t('validate:required', { name: 'Trạng thái' }) }),
      purchaseDate: optionalString,
      installationDate: optionalString,
      voltageLevel: optionalString,
      meterType: optionalString,
      parentId: optionalString,
      multiplier: z
        .string()
        .trim()
        .min(K_SIZE_1, { message: t('validate:required', { name: 'Hệ số nhân' }) })
        .refine(
          (value) => {
            const parsedValue = parseNumberInput(value);
            return Number.isFinite(parsedValue) && parsedValue > 0;
          },
          {
            message: 'Hệ số nhân phải lớn hơn 0'
          }
        ),
      initialReading: z
        .string()
        .trim()
        .min(K_SIZE_1, { message: t('validate:required', { name: 'Chỉ số đầu' }) })
        .refine(
          (value) => {
            const parsedValue = parseNumberInput(value);
            return Number.isFinite(parsedValue) && parsedValue >= 0;
          },
          {
            message: 'Chỉ số đầu không được âm'
          }
        )
    })
    .superRefine((data, ctx) => {
      const requiredFields: { field: keyof typeof data; label: string }[] = [
        { field: 'meterType', label: 'Loại công tơ' },
        { field: 'purchaseDate', label: 'Ngày mua' },
        { field: 'installationDate', label: 'Ngày lắp' },
        { field: 'voltageLevel', label: 'Cấp điện áp' }
      ];

      if (shouldSelectParentMeter(data.meterType) && !data.parentId) {
        requiredFields.push({ field: 'parentId', label: 'Công tơ cha/Lộ tổng' });
      }

      requiredFields.forEach(({ field, label }) => {
        if (!data[field]) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: [field],
            message: t('validate:required', { name: label })
          });
        }
      });
    });
};

export type MeterForm = z.infer<ReturnType<typeof meterSchema>>;

export interface ManageMeterFormProps {
  isAddMode: boolean;
  isView: boolean;
}

const defaultMeterFormValues: MeterForm = {
  meterCode: '',
  status: METER_STATUS.ACTIVE,
  meterType: '',
  parentId: '',
  purchaseDate: '',
  installationDate: '',
  voltageLevel: '',
  multiplier: '1',
  initialReading: '0'
};

export default function useManageMeterForm({ isAddMode, isView }: ManageMeterFormProps) {
  const { t } = useAppTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const meterList = useSelector(selectMeterList);
  const loading = useSelector(selectMeterLoadingDetail);
  const [selectedMeter, setSelectedMeter] = useState<Meter>();

  const id = searchParams.get('id') || '';

  const action = useMemo(
    () => (isAddMode ? t('common:add_new') : isView ? t('common:view_detail') : t('common:edit')),
    [t, isAddMode, isView]
  );

  const userForm = useForm<MeterForm>({
    mode: 'onTouched',
    defaultValues: defaultMeterFormValues,
    resolver: zodResolver(meterSchema(t))
  });

  const selectedMeterType = userForm.watch('meterType');
  const selectedParentId = userForm.watch('parentId');
  const showParentMeterField = shouldSelectParentMeter(selectedMeterType);
  const pinnedParentIds = useMemo(
    () => [selectedMeter?.parentId, selectedParentId],
    [selectedMeter?.parentId, selectedParentId]
  );

  const {
    meterOptions: parentMeterOptions,
    onOpenMeterDropdown: onOpenParentMeterDropdown,
    meterDropdownRender: parentMeterDropdownRender
  } = useMeterLookup({
    autoLoad: false,
    pinnedIds: pinnedParentIds,
    showErrorToast: true,
    meterType: METER_TYPE.FEEDER
  });

  useEffect(() => {
    if (!showParentMeterField && selectedParentId) {
      userForm.setValue('parentId', '', { shouldDirty: false, shouldValidate: true });
    }
  }, [showParentMeterField, selectedParentId, userForm]);

  const mapMeterToForm = useCallback(
    (meter: Meter): MeterForm => ({
      meterCode: meter.meterCode || '',
      status: normalizeMeterStatus(meter.status),
      meterType: normalizeMeterType(meter.meterType),
      parentId: meter.parentId || '',
      purchaseDate: normalizeDateToApi(meter.purchaseDate),
      installationDate: normalizeDateToApi(meter.installationDate),
      voltageLevel: normalizeVoltageLevel(meter.voltageLevel),
      multiplier:
        meter.multiplier !== undefined && meter.multiplier !== null
          ? String(meter.multiplier)
          : '1',
      initialReading:
        meter.initialReading !== undefined && meter.initialReading !== null
          ? String(meter.initialReading)
          : '0'
    }),
    []
  );

  useEffect(() => {
    if (isAddMode) {
      setSelectedMeter(undefined);
      userForm.reset(defaultMeterFormValues);
      return;
    }

    if (!id) {
      router.replace(ROUTES.METER_MANAGEMENT);
      return;
    }

    const meterDetail = meterList.find((meter) => meter.meterId === id || meter.id === id);
    if (meterDetail) {
      setSelectedMeter(meterDetail);
      userForm.reset(mapMeterToForm(meterDetail));
      return;
    }

    dispatch({
      type: METER_DETAIL,
      payload: {
        body: { meterId: id },
        onSuccess: (res: GetMeterDetailRes) => {
          const meter = normalizeMeterSearchItem(res.data);
          if (meter) {
            setSelectedMeter(meter);
            userForm.reset(mapMeterToForm(meter));
          }
        },
        onFailed: (error?: ErrorBase) => {
          showToast({
            type: TYPE_TOAST.ERROR,
            content:
              error?.businessErrorMessage ||
              error?.systemErrorMessage ||
              'Tải thông tin công tơ thất bại'
          });
          router.replace(ROUTES.METER_MANAGEMENT);
        }
      }
    });
  }, [id, isAddMode, mapMeterToForm, meterList, router, userForm]);

  const onSubmitSuccess = useCallback(
    (res: any) => {
      DebugUtils.logS(res);
      router.push(ROUTES.METER_MANAGEMENT);
      showToast({
        type: TYPE_TOAST.SUCCESS,
        content: action + ' công tơ thành công'
      });
    },
    [router, action]
  );

  const onSubmitFailed = useCallback(
    (error?: ErrorBase) => {
      showToast({
        type: TYPE_TOAST.ERROR,
        content:
          error?.businessErrorMessage || error?.systemErrorMessage || action + ' công tơ thất bại'
      });
    },
    [action]
  );

  const buildSubmitBody = useCallback((data: MeterForm): AddMeterReq => {
    const body: AddMeterReq = {
      meterCode: data.meterCode.trim(),
      status: data.status,
      meterType: data.meterType || undefined,
      parentId: shouldSelectParentMeter(data.meterType) ? data.parentId || undefined : undefined,
      purchaseDate: normalizeDateToApi(data.purchaseDate) || undefined,
      installationDate: normalizeDateToApi(data.installationDate) || undefined,
      voltageLevel: data.voltageLevel || undefined,
      multiplier: parseNumberInput(data.multiplier),
      initialReading: parseNumberInput(data.initialReading)
    };

    return body;
  }, []);

  const onSubmit = useCallback(
    (data: MeterForm) => {
      DebugUtils.logS(data);
      if (isAddMode) {
        const body = buildSubmitBody(data);
        dispatch({
          type: ADD_METER,
          payload: {
            body,
            onSuccess: onSubmitSuccess,
            onFailed: onSubmitFailed
          }
        });
      } else if (id) {
        const body: EditMeterReq = {
          ...buildSubmitBody(data),
          meterId: id
        };
        dispatch({
          type: EDIT_METER,
          payload: {
            body,
            onSuccess: onSubmitSuccess,
            onFailed: onSubmitFailed
          }
        });
      }
    },
    [buildSubmitBody, onSubmitSuccess, onSubmitFailed, isAddMode, id]
  );

  const onBack = useCallback(() => router.back(), [router]);

  const onEdit = useCallback(
    () => router.push(`${ROUTES.MANAGE_METER_EDIT}?id=${id}`),
    [router, id]
  );

  return {
    t,
    action,
    onSubmit,
    userForm,
    selectedMeter,
    parentMeterOptions,
    onOpenParentMeterDropdown,
    parentMeterDropdownRender,
    showParentMeterField,
    loading,
    onBack,
    onEdit
  };
}
