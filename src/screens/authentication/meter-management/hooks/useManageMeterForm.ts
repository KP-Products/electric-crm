import { K_SIZE_1 } from '@constant';
import { zodResolver } from '@hookform/resolvers/zod';
import { ADD_METER, EDIT_METER } from '@redux-action-type/meter';
import { dispatch } from '@redux-common';
import { selectMeterLoadingDetail } from '@redux-selector/meter';
import { showToast } from 'components/toast';
import { TYPE_TOAST } from 'components/toast/type';
import { ROUTES } from 'config/routes';
import { ErrorBase } from 'model/common';
import {
  AddMeterReq,
  EditMeterReq,
  MeterMultiplierHistory,
  Meter,
  normalizeMeterSearchItem
} from 'model/meter';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import meterServices from 'services/meter-services';
import { hasApiError } from 'utils/api-response';
import moment from 'moment';
import { API_DATE_INPUT_FORMATS } from 'utils/date';
import { normalizeDateToApi } from 'utils/date';
import { TypedT, useAppTranslation } from 'utils/i18n/useAppTranslation';
import { parseFormattedNumber } from 'utils/number-input';
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

const parseNumberInput = (value: string) => parseFormattedNumber(value) ?? Number.NaN;

const shouldSelectParentMeter = (meterType?: string) =>
  meterType === METER_TYPE.CUSTOMER || meterType === METER_TYPE.CONG_TO_TONG;

const readingSchema = z
  .string()
  .trim()
  .min(1, 'Vui lòng nhập chỉ số đầu')
  .refine((value) => {
    const parsed = parseNumberInput(value);
    return Number.isFinite(parsed) && parsed >= 0;
  }, 'Chỉ số đầu phải là số không âm');

export const meterSchema = (t: TypedT) => {
  return z
    .object({
      meterCode: z
        .string()
        .trim()
        .min(K_SIZE_1, { message: t('validate:required', { name: 'Số công tơ' }) })
        .max(50, 'Mã công tơ không được quá 50 ký tự'),
      status: z
        .string()
        .trim()
        .min(K_SIZE_1, { message: t('validate:required', { name: 'Trạng thái' }) }),
      purchaseDate: optionalString,
      installationDate: optionalString,
      multiplierEffectiveFrom: z
        .string()
        .trim()
        .min(1, 'Vui lòng chọn ngày bắt đầu')
        .refine(
          (value) => moment(value, API_DATE_INPUT_FORMATS, true).isValid(),
          'Ngày bắt đầu không hợp lệ'
        ),
      initialReadingCd: readingSchema,
      initialReadingTd: readingSchema,
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
        { field: 'voltageLevel', label: 'Cấp điện áp' }
      ];

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
  initialReading: '0',
  initialReadingCd: '0',
  initialReadingTd: '0',
  multiplierEffectiveFrom: ''
};

export default function useManageMeterForm({ isAddMode, isView }: ManageMeterFormProps) {
  const { t } = useAppTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const saving = useSelector(selectMeterLoadingDetail);
  const [fetching, setFetching] = useState(false);
  const [history, setHistory] = useState<MeterMultiplierHistory[]>([]);
  const [historyFailed, setHistoryFailed] = useState(false);
  const [reload, setReload] = useState(0);
  const submittingRef = useRef(false);
  const loading = saving || fetching;
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
    meterType: [METER_TYPE.FEEDER, METER_TYPE.CONG_TO_TONG]
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
      initialReadingCd: String(meter.initialReadingCd ?? 0),
      initialReadingTd: String(meter.initialReadingTd ?? 0),
      multiplierEffectiveFrom: '',
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

    let active = true;
    setFetching(true);
    setHistoryFailed(false);
    const load = async () => {
      const [detail, historyResponse] = await Promise.all([
        meterServices.getMeterDetail({ meterId: id }),
        meterServices.getMultiplierHistory({ meterId: id })
      ]);
      if (!active) return;
      setFetching(false);
      const meter = normalizeMeterSearchItem(detail.data);
      if (hasApiError(detail) || !meter) {
        showToast({ type: TYPE_TOAST.ERROR, content: 'Tải thông tin công tơ thất bại' });
        router.replace(ROUTES.METER_MANAGEMENT);
        return;
      }
      const failed = hasApiError(historyResponse) || !Array.isArray(historyResponse.data);
      const rows = failed ? [] : historyResponse.data || [];
      setHistoryFailed(failed);
      setHistory(rows);
      setSelectedMeter(meter);
      const current = [...rows].reverse().find((row) => !row.effectiveTo);
      userForm.reset({
        ...mapMeterToForm(meter),
        multiplierEffectiveFrom: normalizeDateToApi(current?.effectiveFrom)
      });
    };
    void load();
    return () => {
      active = false;
    };
  }, [id, isAddMode, mapMeterToForm, router, userForm, reload]);

  const onSubmitSuccess = useCallback(() => {
    submittingRef.current = false;
    router.push(ROUTES.METER_MANAGEMENT);
    showToast({
      type: TYPE_TOAST.SUCCESS,
      content: action + ' công tơ thành công'
    });
  }, [router, action]);

  const onSubmitFailed = useCallback(
    (error?: ErrorBase) => {
      submittingRef.current = false;
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
      initialReading: parseNumberInput(data.initialReading),
      initialReadingCd: parseNumberInput(data.initialReadingCd),
      initialReadingTd: parseNumberInput(data.initialReadingTd),
      multiplierEffectiveFrom: normalizeDateToApi(data.multiplierEffectiveFrom)
    };

    return body;
  }, []);

  const onSubmit = useCallback(
    (data: MeterForm) => {
      if (submittingRef.current || loading || isView || historyFailed) return;
      submittingRef.current = true;
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
        if (
          !userForm.formState.dirtyFields.multiplier &&
          !userForm.formState.dirtyFields.multiplierEffectiveFrom
        ) {
          delete body.multiplier;
          delete body.multiplierEffectiveFrom;
        }
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
    [
      buildSubmitBody,
      onSubmitSuccess,
      onSubmitFailed,
      isAddMode,
      id,
      loading,
      isView,
      historyFailed,
      userForm
    ]
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
    history,
    historyFailed,
    reloadHistory: () => setReload((value) => value + 1),
    parentMeterOptions: parentMeterOptions.filter((option) => String(option.value) !== id),
    onOpenParentMeterDropdown,
    parentMeterDropdownRender,
    showParentMeterField,
    loading,
    onBack,
    onEdit
  };
}
