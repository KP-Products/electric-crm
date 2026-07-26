import { K_SIZE_0 } from '@constant';
import { showToast } from 'components/toast';
import { TYPE_TOAST } from 'components/toast/type';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { FORMAT_DATE_API } from 'utils/date';
import { getUploadFileSizeError, isValidUploadFileSize } from 'utils/upload';

dayjs.extend(customParseFormat);

export type ManualReadingStatus = 'NOT_ENTERED' | 'DRAFT' | 'SAVED';

export interface ManualReadingFilter {
  keyword: string;
  searchBy: string;
  customerCode: string;
  periodCode: string;
  readingDate: string;
}

export interface ManualReadingRegister {
  id: string;
  label: string;
  oldIndex: number;
  newIndex: string;
  multiplier: number;
}

export interface ManualReadingMeter {
  id: string;
  meterCode: string;
  serialNo: string;
  customerCode: string;
  customerName: string;
  address: string;
  multiplier: number;
  status: ManualReadingStatus;
  registers: ManualReadingRegister[];
  reactiveIndex: string;
  reactiveUnitPrice: string;
  note: string;
  photoName?: string;
  photoPreviewUrl?: string;
}

export interface ManualReadingSummary {
  totalMeters: number;
  notEntered: number;
  saved: number;
  totalAdjustedKwh: number;
}

const DEFAULT_FILTER: ManualReadingFilter = {
  keyword: '',
  searchBy: 'CUSTOMER_CODE',
  customerCode: '1001',
  periodCode: '07/2026',
  readingDate: '22-07-2026'
};

const MOCK_METERS: ManualReadingMeter[] = [
  {
    id: 'ct-11',
    meterCode: 'CT-11',
    serialNo: '19001234',
    customerCode: '1001',
    customerName: 'Khách hàng 1001',
    address: '123 Đường Láng, Đống Đa, Hà Nội',
    multiplier: 1,
    status: 'DRAFT',
    registers: [
      { id: 'peak', label: 'T1 - Cao điểm', oldIndex: 1250, newIndex: '1380', multiplier: 1 },
      { id: 'normal', label: 'T2 - Bình thường', oldIndex: 2340, newIndex: '2520', multiplier: 1 },
      { id: 'offPeak', label: 'T3 - Thấp điểm', oldIndex: 890, newIndex: '1000', multiplier: 1 }
    ],
    reactiveIndex: '150',
    reactiveUnitPrice: '',
    note: '',
    photoName: 'cong-to-ct11.jpg'
  },
  {
    id: 'ct-12',
    meterCode: 'CT-12',
    serialNo: '19001235',
    customerCode: '1001',
    customerName: 'Khách hàng 1001',
    address: '123 Đường Láng, Đống Đa, Hà Nội',
    multiplier: 1,
    status: 'NOT_ENTERED',
    registers: [
      { id: 'peak', label: 'T1 - Cao điểm', oldIndex: 940, newIndex: '', multiplier: 1 },
      { id: 'normal', label: 'T2 - Bình thường', oldIndex: 1860, newIndex: '', multiplier: 1 },
      { id: 'offPeak', label: 'T3 - Thấp điểm', oldIndex: 760, newIndex: '', multiplier: 1 }
    ],
    reactiveIndex: '',
    reactiveUnitPrice: '',
    note: ''
  },
  {
    id: 'ct-13',
    meterCode: 'CT-13',
    serialNo: '19001236',
    customerCode: '1001',
    customerName: 'Khách hàng 1001',
    address: '123 Đường Láng, Đống Đa, Hà Nội',
    multiplier: 1,
    status: 'SAVED',
    registers: [
      { id: 'peak', label: 'T1 - Cao điểm', oldIndex: 1540, newIndex: '1620', multiplier: 1 },
      { id: 'normal', label: 'T2 - Bình thường', oldIndex: 2760, newIndex: '2910', multiplier: 1 },
      { id: 'offPeak', label: 'T3 - Thấp điểm', oldIndex: 1040, newIndex: '1120', multiplier: 1 }
    ],
    reactiveIndex: '96',
    reactiveUnitPrice: '',
    note: 'Đã đối soát ảnh công tơ',
    photoName: 'ct13-072026.jpg'
  }
];

const SEARCH_BY_OPTIONS = [
  { value: 'CUSTOMER_CODE', label: 'Mã khách hàng' },
  { value: 'CUSTOMER_NAME', label: 'Tên khách hàng' },
  { value: 'METER_CODE', label: 'Mã công tơ' }
];

const PERIOD_OPTIONS = [
  { value: '07/2026', label: '07/2026' },
  { value: '06/2026', label: '06/2026' },
  { value: '05/2026', label: '05/2026' }
];

const toNumber = (value?: string | number) => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : undefined;
  const normalized = String(value ?? '')
    .replace(/\s/g, '')
    .replace(/\./g, '')
    .replace(',', '.');
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const normalizeKeyword = (value?: string | number) =>
  String(value ?? '')
    .trim()
    .toLowerCase();

const getRegisterRawKwh = (register: ManualReadingRegister) => {
  const newIndex = toNumber(register.newIndex);
  if (newIndex === undefined) return undefined;
  return newIndex - register.oldIndex;
};

const isRegisterValid = (register: ManualReadingRegister) => {
  const rawKwh = getRegisterRawKwh(register);
  return rawKwh !== undefined && rawKwh >= K_SIZE_0;
};

export const getMeterReadingMetrics = (meter?: ManualReadingMeter) => {
  if (!meter) {
    return {
      completedRegisters: K_SIZE_0,
      totalRawKwh: K_SIZE_0,
      totalAdjustedKwh: K_SIZE_0,
      effectiveIndex: K_SIZE_0,
      hasInvalidReading: false,
      canSave: false
    };
  }

  const registerMetrics = meter.registers.map((register) => {
    const rawKwh = getRegisterRawKwh(register);
    return {
      rawKwh,
      adjustedKwh: rawKwh === undefined ? undefined : rawKwh * register.multiplier,
      newIndex: toNumber(register.newIndex),
      valid: isRegisterValid(register)
    };
  });

  const completedRegisters = registerMetrics.filter(
    (metric) => metric.newIndex !== undefined
  ).length;
  const totalRawKwh = registerMetrics.reduce(
    (sum, metric) => sum + (metric.rawKwh && metric.rawKwh > K_SIZE_0 ? metric.rawKwh : K_SIZE_0),
    K_SIZE_0
  );
  const totalAdjustedKwh = registerMetrics.reduce(
    (sum, metric) =>
      sum + (metric.adjustedKwh && metric.adjustedKwh > K_SIZE_0 ? metric.adjustedKwh : K_SIZE_0),
    K_SIZE_0
  );
  const effectiveIndex = registerMetrics.reduce(
    (sum, metric) => sum + (metric.newIndex || K_SIZE_0),
    K_SIZE_0
  );
  const hasInvalidReading = registerMetrics.some(
    (metric) => metric.newIndex !== undefined && !metric.valid
  );

  return {
    completedRegisters,
    totalRawKwh,
    totalAdjustedKwh,
    effectiveIndex,
    hasInvalidReading,
    canSave: completedRegisters === meter.registers.length && !hasInvalidReading
  };
};

export const getStatusMeta = (status: ManualReadingStatus) => {
  switch (status) {
    case 'SAVED':
      return {
        label: 'Đã nhập',
        type: 'saved' as const
      };
    case 'DRAFT':
      return {
        label: 'Chưa nhập',
        type: 'draft' as const
      };
    default:
      return {
        label: 'Chưa nhập',
        type: 'notEntered' as const
      };
  }
};

const updateMeter = (
  meters: ManualReadingMeter[],
  meterId: string,
  updater: (meter: ManualReadingMeter) => ManualReadingMeter
) => meters.map((meter) => (meter.id === meterId ? updater(meter) : meter));

export default function useManualMeterReading() {
  const [filterDraft, setFilterDraft] = useState<ManualReadingFilter>(DEFAULT_FILTER);
  const [filterApplied, setFilterApplied] = useState<ManualReadingFilter>(DEFAULT_FILTER);
  const [meters, setMeters] = useState<ManualReadingMeter[]>(MOCK_METERS);
  const [selectedMeterId, setSelectedMeterId] = useState<string>(MOCK_METERS[0]?.id || '');
  const [savingDraft, setSavingDraft] = useState<boolean>(false);
  const [savingConfirm, setSavingConfirm] = useState<boolean>(false);

  const filteredMeters = useMemo(() => {
    const keyword = normalizeKeyword(filterApplied.keyword);
    const customerCode = normalizeKeyword(filterApplied.customerCode);

    return meters.filter((meter) => {
      const matchedCustomer =
        !customerCode || normalizeKeyword(meter.customerCode) === customerCode;
      const matchedKeyword =
        !keyword ||
        normalizeKeyword(meter.customerCode).includes(keyword) ||
        normalizeKeyword(meter.customerName).includes(keyword) ||
        normalizeKeyword(meter.meterCode).includes(keyword) ||
        normalizeKeyword(meter.serialNo).includes(keyword) ||
        normalizeKeyword(meter.address).includes(keyword);

      return matchedCustomer && matchedKeyword;
    });
  }, [filterApplied.customerCode, filterApplied.keyword, meters]);

  useEffect(() => {
    if (!filteredMeters.length) {
      setSelectedMeterId('');
      return;
    }

    if (!filteredMeters.some((meter) => meter.id === selectedMeterId)) {
      setSelectedMeterId(filteredMeters[K_SIZE_0].id);
    }
  }, [filteredMeters, selectedMeterId]);

  const selectedMeter = useMemo(
    () => filteredMeters.find((meter) => meter.id === selectedMeterId) || filteredMeters[K_SIZE_0],
    [filteredMeters, selectedMeterId]
  );

  const selectedMeterMetrics = useMemo(
    () => getMeterReadingMetrics(selectedMeter),
    [selectedMeter]
  );

  const summary = useMemo<ManualReadingSummary>(() => {
    const saved = meters.filter((meter) => meter.status === 'SAVED').length;
    return {
      totalMeters: meters.length,
      notEntered: meters.length - saved,
      saved,
      totalAdjustedKwh: meters.reduce(
        (sum, meter) => sum + getMeterReadingMetrics(meter).totalAdjustedKwh,
        K_SIZE_0
      )
    };
  }, [meters]);

  const periodInfo = useMemo(() => {
    const month = filterApplied.periodCode || DEFAULT_FILTER.periodCode;
    const [monthNumber, yearNumber] = month.split('/').map(Number);
    const start = dayjs(`${yearNumber}-${String(monthNumber).padStart(2, '0')}-01`);
    const end = start.endOf('month');
    const readingDate = dayjs(filterApplied.readingDate, FORMAT_DATE_API);

    return {
      label: `${month} (${start.format('DD/MM/YYYY')} - ${end.format('DD/MM/YYYY')})`,
      readingDate: readingDate.isValid() ? readingDate.format('DD/MM/YYYY') : ''
    };
  }, [filterApplied.periodCode, filterApplied.readingDate]);

  const onChangeFilter = useCallback((key: keyof ManualReadingFilter, value: string) => {
    setFilterDraft((prev) => ({ ...prev, [key]: value }));
  }, []);

  const onApplyFilter = useCallback(() => {
    setFilterApplied(filterDraft);
  }, [filterDraft]);

  const onResetFilter = useCallback(() => {
    setFilterDraft(DEFAULT_FILTER);
    setFilterApplied(DEFAULT_FILTER);
  }, []);

  const onChangeRegister = useCallback((meterId: string, registerId: string, value: string) => {
    setMeters((prev) =>
      updateMeter(prev, meterId, (meter) => ({
        ...meter,
        status: meter.status === 'SAVED' ? 'DRAFT' : meter.status,
        registers: meter.registers.map((register) =>
          register.id === registerId ? { ...register, newIndex: value } : register
        )
      }))
    );
  }, []);

  const onChangeReactiveIndex = useCallback((meterId: string, value: string) => {
    setMeters((prev) =>
      updateMeter(prev, meterId, (meter) => ({
        ...meter,
        status: meter.status === 'SAVED' ? 'DRAFT' : meter.status,
        reactiveIndex: value
      }))
    );
  }, []);

  const onChangeReactiveUnitPrice = useCallback((meterId: string, value: string) => {
    setMeters((prev) =>
      updateMeter(prev, meterId, (meter) => ({
        ...meter,
        status: meter.status === 'SAVED' ? 'DRAFT' : meter.status,
        reactiveUnitPrice: value
      }))
    );
  }, []);

  const onChangeNote = useCallback((meterId: string, value: string) => {
    setMeters((prev) =>
      updateMeter(prev, meterId, (meter) => ({
        ...meter,
        status: meter.status === 'SAVED' ? 'DRAFT' : meter.status,
        note: value
      }))
    );
  }, []);

  const onSelectPhoto = useCallback((meterId: string, file: File) => {
    if (!isValidUploadFileSize(file)) {
      showToast({
        type: TYPE_TOAST.ERROR,
        content: getUploadFileSizeError('ảnh chụp công tơ')
      });
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setMeters((prev) =>
      updateMeter(prev, meterId, (meter) => ({
        ...meter,
        status: meter.status === 'SAVED' ? 'DRAFT' : meter.status,
        photoName: file.name,
        photoPreviewUrl: previewUrl
      }))
    );
    showToast({ type: TYPE_TOAST.SUCCESS, content: 'Đã chọn ảnh công tơ' });
  }, []);

  const onRemovePhoto = useCallback((meterId: string) => {
    setMeters((prev) =>
      updateMeter(prev, meterId, (meter) => ({
        ...meter,
        photoName: undefined,
        photoPreviewUrl: undefined
      }))
    );
  }, []);

  const onClearSelectedMeter = useCallback(() => {
    if (!selectedMeter) return;

    setMeters((prev) =>
      updateMeter(prev, selectedMeter.id, (meter) => ({
        ...meter,
        status: 'NOT_ENTERED',
        registers: meter.registers.map((register) => ({ ...register, newIndex: '' })),
        reactiveIndex: '',
        reactiveUnitPrice: '',
        note: '',
        photoName: undefined,
        photoPreviewUrl: undefined
      }))
    );
  }, [selectedMeter]);

  const saveMeter = useCallback((meter: ManualReadingMeter, status: ManualReadingStatus) => {
    const metrics = getMeterReadingMetrics(meter);
    if (!metrics.canSave) {
      showToast({
        type: TYPE_TOAST.ERROR,
        content: 'Vui lòng nhập đủ chỉ số mới và đảm bảo chỉ số mới không nhỏ hơn chỉ số cũ'
      });
      return false;
    }

    setMeters((prev) => updateMeter(prev, meter.id, (item) => ({ ...item, status })));
    return true;
  }, []);

  const onSaveSelectedMeter = useCallback(() => {
    if (!selectedMeter) return;
    if (saveMeter(selectedMeter, 'SAVED')) {
      showToast({ type: TYPE_TOAST.SUCCESS, content: 'Đã lưu chỉ số cho công tơ' });
    }
  }, [saveMeter, selectedMeter]);

  const saveAllValidMeters = useCallback(
    (status: ManualReadingStatus) => {
      const validMeters = meters.filter((meter) => getMeterReadingMetrics(meter).canSave);
      if (!validMeters.length) {
        showToast({ type: TYPE_TOAST.ERROR, content: 'Không có công tơ hợp lệ để lưu' });
        return;
      }

      setMeters((prev) =>
        prev.map((meter) => (getMeterReadingMetrics(meter).canSave ? { ...meter, status } : meter))
      );
      showToast({
        type: TYPE_TOAST.SUCCESS,
        content:
          status === 'DRAFT'
            ? `Đã lưu nháp ${validMeters.length} công tơ`
            : `Đã xác nhận và lưu ${validMeters.length} công tơ`
      });
    },
    [meters]
  );

  const onSaveDraft = useCallback(() => {
    setSavingDraft(true);
    saveAllValidMeters('DRAFT');
    setSavingDraft(false);
  }, [saveAllValidMeters]);

  const onConfirmAndSave = useCallback(() => {
    setSavingConfirm(true);
    saveAllValidMeters('SAVED');
    setSavingConfirm(false);
  }, [saveAllValidMeters]);

  return {
    filterDraft,
    filterApplied,
    filteredMeters,
    selectedMeter,
    selectedMeterId,
    selectedMeterMetrics,
    summary,
    periodInfo,
    searchByOptions: SEARCH_BY_OPTIONS,
    periodOptions: PERIOD_OPTIONS,
    savingDraft,
    savingConfirm,
    onChangeFilter,
    onApplyFilter,
    onResetFilter,
    onSelectMeter: setSelectedMeterId,
    onChangeRegister,
    onChangeReactiveIndex,
    onChangeReactiveUnitPrice,
    onChangeNote,
    onSelectPhoto,
    onRemovePhoto,
    onClearSelectedMeter,
    onSaveSelectedMeter,
    onSaveDraft,
    onConfirmAndSave
  };
}
