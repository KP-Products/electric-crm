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
import { useCallback, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { DebugUtils } from 'utils/debug-utils';
import { normalizeDateToApi } from 'utils/date';
import { TypedT, useAppTranslation } from 'utils/i18n/useAppTranslation';
import { z } from 'zod';
import {
  isMeterInstalled,
  METER_STATUS,
  normalizeMeterType,
  normalizeMeterStatus,
  normalizeUsagePurpose,
  normalizeVoltageType
} from '../utils/constant';

const optionalString = z.preprocess(
  (value) => (value === null || value === undefined ? '' : value),
  z.string().trim()
);

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
      meterType: optionalString,
      manufacturer: optionalString,
      purchaseDate: optionalString,
      installationDate: optionalString,
      inspectionDate: optionalString,
      inspectionExpiryDate: optionalString,
      voltageType: optionalString,
      customerId: optionalString,
      feederId: optionalString,
      usagePurpose: optionalString,
      multiplier: z
        .string()
        .trim()
        .refine((value) => !value || /^\d+(\.\d+)?$/.test(value), {
          message: 'Hệ số nhân phải là số dương'
        })
    })
    .superRefine((data, ctx) => {
      if (!isMeterInstalled(data.status)) return;

      const requiredInstalledFields: { field: keyof typeof data; label: string }[] = [
        { field: 'installationDate', label: 'Ngày lắp' },
        { field: 'voltageType', label: 'Cấp điện áp' },
        { field: 'customerId', label: 'Khách hàng' },
        { field: 'feederId', label: 'Lộ điện' },
        { field: 'usagePurpose', label: 'Mục đích sử dụng' },
        { field: 'multiplier', label: 'Hệ số nhân' }
      ];

      requiredInstalledFields.forEach(({ field, label }) => {
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
  status: METER_STATUS.IN_STOCK,
  meterType: '',
  manufacturer: '',
  purchaseDate: '',
  installationDate: '',
  inspectionDate: '',
  inspectionExpiryDate: '',
  voltageType: '',
  customerId: '',
  feederId: '',
  usagePurpose: '',
  multiplier: '1'
};

export default function useManageMeterForm({ isAddMode, isView }: ManageMeterFormProps) {
  const { t } = useAppTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const meterList = useSelector(selectMeterList);
  const loading = useSelector(selectMeterLoadingDetail);

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

  const mapMeterToForm = useCallback(
    (meter: Meter): MeterForm => ({
      meterCode: meter.meterCode || '',
      status: normalizeMeterStatus(meter.status),
      meterType: normalizeMeterType(meter.meterType),
      manufacturer: meter.manufacturer || '',
      purchaseDate: normalizeDateToApi(meter.purchaseDate),
      installationDate: normalizeDateToApi(meter.installationDate),
      inspectionDate: normalizeDateToApi(meter.inspectionDate),
      inspectionExpiryDate: normalizeDateToApi(meter.inspectionExpiryDate),
      voltageType: normalizeVoltageType(meter.voltageType || meter.voltageLevel),
      customerId: meter.customerId || '',
      feederId: meter.feederId || meter.feederName || '',
      usagePurpose: normalizeUsagePurpose(meter.usagePurpose),
      multiplier:
        meter.multiplier !== undefined && meter.multiplier !== null ? String(meter.multiplier) : '1'
    }),
    []
  );

  useEffect(() => {
    if (isAddMode) {
      userForm.reset(defaultMeterFormValues);
      return;
    }

    if (!id) {
      router.replace(ROUTES.METER_MANAGEMENT);
      return;
    }

    const meterDetail = meterList.find((meter) => meter.meterId === id || meter.id === id);
    if (meterDetail) {
      userForm.reset(mapMeterToForm(meterDetail));
      return;
    }

    dispatch({
      type: METER_DETAIL,
      payload: {
        body: { id, meterId: id },
        onSuccess: (res: GetMeterDetailRes) => {
          const meter = normalizeMeterSearchItem(res.data);
          if (meter) userForm.reset(mapMeterToForm(meter));
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
    const installed = isMeterInstalled(data.status);
    const feeder = installed ? data.feederId.trim() : undefined;
    const voltageType = installed ? data.voltageType : undefined;

    return {
      meterCode: data.meterCode.trim(),
      status: data.status,
      meterType: data.meterType || undefined,
      manufacturer: data.manufacturer || undefined,
      purchaseDate: normalizeDateToApi(data.purchaseDate) || undefined,
      inspectionDate: normalizeDateToApi(data.inspectionDate) || undefined,
      inspectionExpiryDate: normalizeDateToApi(data.inspectionExpiryDate) || undefined,
      installationDate: installed
        ? normalizeDateToApi(data.installationDate) || undefined
        : undefined,
      voltageType,
      voltageLevel: voltageType,
      customerId: installed ? data.customerId.trim() || undefined : undefined,
      feederId: feeder,
      feederName: feeder,
      usagePurpose: installed ? data.usagePurpose || undefined : undefined,
      multiplier: data.multiplier ? Number(data.multiplier) : undefined,
      initialReading: 0
    };
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
          id,
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
    loading,
    onBack,
    onEdit
  };
}
