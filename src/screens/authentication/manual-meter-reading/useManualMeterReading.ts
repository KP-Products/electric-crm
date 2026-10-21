import { CONSTANTS, DEFAULT_PAGE_SIZE, K_SIZE_0, K_SIZE_1, K_SIZE_5 } from '@constant';
import type { AppSelectOption } from 'components/select';
import { hideDialog, showDialog } from 'components/dialog';
import { TYPE_ACTION, TYPE_MESSAGE } from 'components/dialog/type';
import { showToast } from 'components/toast';
import { TYPE_TOAST } from 'components/toast/type';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { debounce } from 'lodash';
import {
  MeterReading,
  MeterSearchForReadingRow,
  PrepareReadingRow,
  ReadingItem,
  ReadingPeriodDetail,
  ReadingPeriodSaveMode,
  ReadingPeriodStatus,
  ReadingPhoto
} from 'model/manual-meter-reading';
import { Customer } from 'model/customer';
import { Meter, normalizeMeterSearchItem } from 'model/meter';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import customerServices from 'services/customer-services';
import evnReadingBatchServices from 'services/evn-reading-batch-services';
import manualMeterReadingServices from 'services/manual-meter-reading-services';
import meterServices from 'services/meter-services';
import { METER_TYPE } from '../meter-management/utils/constant';
import { FORMAT_DATE_API } from 'utils/date';
import { parseFormattedNumber } from 'utils/number-input';
import { getUploadFileSizeError, isValidUploadFileSize } from 'utils/upload';

dayjs.extend(customParseFormat);

export type ManualReadingStatus = 'NOT_ENTERED' | ReadingPeriodStatus;

export interface ManualReadingFilter {
  keyword: string;
  searchBy: string;
  customerCode: string;
  periodCode: string;
  readingDate: string;
}

export interface ManualReadingRegister {
  id: string;
  tou: string;
  label: string;
  oldIndex: number;
  newIndex: string;
  multiplier: number;
}

export interface ManualReadingUploadedPhoto extends ReadingPhoto {
  previewUrl?: string;
}

export interface ManualReadingPendingPhoto {
  uid: string;
  name: string;
  file: File;
  previewUrl: string;
}

export interface ManualReadingMeter {
  id: string;
  periodId?: number;
  customerId?: number;
  meterCode: string;
  serialNo: string;
  customerCode: string;
  customerName: string;
  address: string;
  voltageLevel?: string;
  meterType?: string;
  multiplier: number;
  status: ManualReadingStatus;
  registers: ManualReadingRegister[];
  reactiveIndex: string;
  reactiveUnitPrice: string;
  note: string;
  uploadedPhotos: ManualReadingUploadedPhoto[];
  pendingPhotos: ManualReadingPendingPhoto[];
}

const MANUAL_READING_TYPE_INPUT = 'MANUAL';
const MAX_READING_PHOTOS = K_SIZE_5;
const SEARCH_BY_OPTIONS = [
  { value: 'CUSTOMER_CODE', label: 'Mã khách hàng' },
  { value: 'CUSTOMER_NAME', label: 'Tên khách hàng' },
  { value: 'METER_CODE', label: 'Mã công tơ' }
];

const SEARCH_LOOKUP_FIELD_META = {
  CUSTOMER_CODE: {
    label: 'Mã khách hàng',
    placeholder: 'Chọn mã khách hàng'
  },
  CUSTOMER_NAME: {
    label: 'Tên khách hàng',
    placeholder: 'Chọn tên khách hàng'
  },
  METER_CODE: {
    label: 'Mã công tơ',
    placeholder: 'Chọn mã công tơ'
  }
} as const;

const TOU_REGISTERS = [
  { tou: 'CD', label: 'T1 - Cao điểm' },
  { tou: 'BT', label: 'T2 - Bình thường' },
  { tou: 'TD', label: 'T3 - Thấp điểm' }
];

const DEFAULT_FILTER: ManualReadingFilter = {
  keyword: '',
  searchBy: 'CUSTOMER_CODE',
  customerCode: '',
  periodCode: dayjs().format('MM/YYYY'),
  readingDate: dayjs().format(FORMAT_DATE_API)
};

const PERIOD_OPTIONS = Array.from({ length: 12 }, (_, index) => {
  const value = dayjs().subtract(index, 'month').format('MM/YYYY');
  return { value, label: value };
});

const SUCCESS_MESSAGES = ['success', 'ok'];
const SUCCESS_CODE_STATUSES = ['0', '00', '000', '0000', '00000', '000000', '200', '201', '204'];

const normalizeApiText = (value?: unknown) =>
  String(value || '')
    .trim()
    .toLowerCase();

const hasApiError = (response?: any) => {
  if (!response) return true;

  const status = Number(response.status ?? response.statusCode);
  const codeStatus = normalizeApiText(response.codeStatus);
  const message = normalizeApiText(response.message);

  if (
    (Number.isFinite(status) && status >= 400) ||
    response.businessErrorMessage ||
    response.systemErrorMessage ||
    response.detailMessage ||
    response.error
  ) {
    return true;
  }

  if (SUCCESS_MESSAGES.includes(message)) return false;

  return Boolean(
    codeStatus &&
      !SUCCESS_CODE_STATUSES.includes(codeStatus) &&
      !codeStatus.startsWith('2') &&
      codeStatus !== 'success'
  );
};

const getErrorMessage = (error?: any, fallback = 'Thao tác thất bại') => {
  const message =
    error?.businessErrorMessage ||
    error?.systemErrorMessage ||
    error?.detailMessage ||
    error?.message;
  return message && !SUCCESS_MESSAGES.includes(normalizeApiText(message)) ? message : fallback;
};

const optionalValue = (value?: string) => {
  const trimmedValue = value?.trim();
  return trimmedValue || undefined;
};

const getSearchLookupFieldMeta = (searchBy?: string) =>
  SEARCH_LOOKUP_FIELD_META[searchBy as keyof typeof SEARCH_LOOKUP_FIELD_META] ||
  SEARCH_LOOKUP_FIELD_META.CUSTOMER_CODE;

const getSearchMeterParamsByField = (searchBy: string, searchValue?: string) => {
  const normalizedValue = optionalValue(searchValue);

  return {
    customerCode: searchBy === 'CUSTOMER_CODE' ? normalizedValue : undefined,
    customerName: searchBy === 'CUSTOMER_NAME' ? normalizedValue : undefined,
    meterCode: searchBy === 'METER_CODE' ? normalizedValue : undefined
  };
};

function buildUniqueLookupOptions<T>(
  rows: T[],
  getValue: (row: T) => string | number | undefined | null
): AppSelectOption[] {
  const optionMap = new Map<string, AppSelectOption>();

  rows.forEach((row) => {
    const value = String(getValue(row) ?? '').trim();
    if (!value || optionMap.has(value)) return;

    optionMap.set(value, {
      value,
      label: value,
      data: row
    });
  });

  return Array.from(optionMap.values());
}

const buildCustomerLookupOptions = (customers: Customer[], searchBy: string): AppSelectOption[] =>
  buildUniqueLookupOptions(customers, (customer) =>
    searchBy === 'CUSTOMER_NAME' ? customer.fullName : customer.customerCode
  );

const buildMeterLookupOptions = (meters: Meter[]): AppSelectOption[] =>
  buildUniqueLookupOptions(meters, (meter) => meter.meterCode);

const toNumber = (value?: string | number) => {
  return parseFormattedNumber(value);
};

const getRegisterRawKwh = (register: ManualReadingRegister) => {
  const newIndex = toNumber(register.newIndex);
  if (newIndex === undefined) return undefined;
  return newIndex - register.oldIndex;
};

const isRegisterValid = (register: ManualReadingRegister) => {
  const rawKwh = getRegisterRawKwh(register);
  return rawKwh !== undefined && rawKwh >= K_SIZE_0;
};

const getTouLabel = (tou?: string) => {
  const normalizedTou = String(tou || '').toUpperCase();
  return TOU_REGISTERS.find((item) => item.tou === normalizedTou)?.label || normalizedTou || 'TOU';
};

const buildDefaultRegisters = (multiplier: number): ManualReadingRegister[] =>
  TOU_REGISTERS.map((register) => ({
    id: register.tou,
    tou: register.tou,
    label: register.label,
    oldIndex: K_SIZE_0,
    newIndex: '',
    multiplier
  }));

const mapMeterSearchRowToManualMeter = (row: MeterSearchForReadingRow): ManualReadingMeter => {
  const meterCode = row.meterCode || row.meterId || '';
  const multiplier = row.multiplier || K_SIZE_1;

  return {
    id: row.meterId || meterCode,
    customerId: row.customerId,
    meterCode,
    serialNo: meterCode,
    customerCode: row.customerCode || '',
    customerName: row.customerName || '',
    address: '',
    voltageLevel: row.voltageLevel,
    meterType: row.meterType,
    multiplier,
    status: getManualReadingStatus(row.inputStatus || row.status),
    registers: buildDefaultRegisters(multiplier),
    reactiveIndex: '',
    reactiveUnitPrice: '',
    note: '',
    uploadedPhotos: [],
    pendingPhotos: []
  };
};

const mapReadingsToRegisters = (
  readings: MeterReading[] | undefined,
  multiplier: number
): ManualReadingRegister[] => {
  if (!readings?.length) return buildDefaultRegisters(multiplier);

  return readings.map((reading) => ({
    id: reading.tou,
    tou: reading.tou,
    label: getTouLabel(reading.tou),
    oldIndex: toNumber(reading.oldIndex) ?? K_SIZE_0,
    newIndex:
      reading.newIndex === undefined || reading.newIndex === null ? '' : String(reading.newIndex),
    multiplier
  }));
};

// Chỉ số cũ của kỳ mới do BE tính (/reading-periods/prepare): chỉ số mới của kỳ gần nhất trước
// đó (mọi nguồn nhập: tay, đo xa, theo lộ); công tơ chưa có kỳ nào thì lấy chỉ số đầu cấu hình
// trên công tơ theo từng khung giờ.
const mapPreparedRowsToRegisters = (
  rows: PrepareReadingRow[] | undefined,
  multiplier: number
): ManualReadingRegister[] => {
  if (!rows?.length) return buildDefaultRegisters(multiplier);

  const rowByTou = new Map(rows.map((row) => [String(row.tou || '').toUpperCase(), row]));

  return TOU_REGISTERS.map((register) => {
    const oldIndex = toNumber(rowByTou.get(register.tou)?.oldIndex ?? undefined) ?? K_SIZE_0;

    return {
      id: register.tou,
      tou: register.tou,
      label: register.label,
      oldIndex,
      newIndex: '',
      multiplier
    };
  });
};

const mapPeriodDetailToMeter = (
  meter: ManualReadingMeter,
  detail?: ReadingPeriodDetail,
  photos?: ManualReadingUploadedPhoto[]
): ManualReadingMeter => {
  const period = detail?.period;
  const nextPhotos = photos || meter.uploadedPhotos;

  if (!period) {
    return {
      ...meter,
      uploadedPhotos: nextPhotos
    };
  }

  return {
    ...meter,
    periodId: period.id,
    customerId: period.customerId || meter.customerId,
    meterCode: period.meterNumber || meter.meterCode,
    serialNo: period.meterNumber || meter.serialNo,
    status: period.status ? getManualReadingStatus(period.status) : meter.status,
    registers: mapReadingsToRegisters(detail?.readings, meter.multiplier),
    reactiveIndex:
      period.reactiveEnergyIndex === undefined || period.reactiveEnergyIndex === null
        ? meter.reactiveIndex
        : String(period.reactiveEnergyIndex),
    uploadedPhotos: nextPhotos,
    pendingPhotos: []
  };
};

const mapPreparedToNewPeriodMeter = (
  meter: ManualReadingMeter,
  rows?: PrepareReadingRow[]
): ManualReadingMeter => {
  return {
    ...meter,
    periodId: undefined,
    status: 'NOT_ENTERED',
    registers: mapPreparedRowsToRegisters(rows, meter.multiplier),
    reactiveIndex: '',
    uploadedPhotos: [],
    pendingPhotos: []
  };
};

const getPeriodDateRange = (periodCode: string) => {
  const monthPeriod = dayjs(periodCode, 'MM/YYYY', true);
  const codePeriodMatch = /^KY-(\d{4})-(\d{2})$/.exec(periodCode);
  const start = codePeriodMatch
    ? dayjs(`${codePeriodMatch[1]}-${codePeriodMatch[2]}-01`)
    : monthPeriod.isValid()
      ? monthPeriod.startOf('month')
      : undefined;

  if (!start?.isValid()) {
    return {
      label: '',
      from: '',
      to: ''
    };
  }

  const end = start.endOf('month');
  return {
    label: `${periodCode} (${start.format('DD/MM/YYYY')} - ${end.format('DD/MM/YYYY')})`,
    from: start.format(FORMAT_DATE_API),
    to: end.format(FORMAT_DATE_API)
  };
};

const getCustomerIdForRequest = (meter: ManualReadingMeter) => {
  if (meter.customerId !== undefined && meter.customerId !== null) {
    return meter.customerId;
  }

  return undefined;
};

const getManualReadingStatus = (status?: string): ManualReadingStatus => {
  switch (status?.toUpperCase()) {
    case 'CONFIRMED':
    case 'DA_CHOT':
      return 'CONFIRMED';
    case 'SAVED':
    case 'COMPLETED':
    case 'ENTERED':
    case 'IMPORTED':
      return 'SAVED';
    case 'DRAFT':
      return 'DRAFT';
    case 'REJECTED':
      return 'REJECTED';
    default:
      return 'NOT_ENTERED';
  }
};

const buildReadingItems = (meter: ManualReadingMeter): ReadingItem[] =>
  meter.registers.map((register) => {
    const newIndex = toNumber(register.newIndex) || K_SIZE_0;
    const energyRaw = newIndex - register.oldIndex;

    return {
      tou: register.tou || register.id,
      oldIndex: register.oldIndex,
      newIndex,
      energyRaw,
      energyAdjusted: energyRaw * register.multiplier
    };
  });

const updateMeter = (
  meters: ManualReadingMeter[],
  meterId: string,
  updater: (meter: ManualReadingMeter) => ManualReadingMeter
) => meters.map((meter) => (meter.id === meterId ? updater(meter) : meter));

export const getMeterReadingMetrics = (meter?: ManualReadingMeter) => {
  if (!meter) {
    return {
      completedRegisters: K_SIZE_0,
      totalRawKwh: K_SIZE_0,
      totalAdjustedKwh: K_SIZE_0,
      effectiveIndex: K_SIZE_0,
      oldEffectiveIndex: K_SIZE_0,
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
  const oldEffectiveIndex = meter.registers.reduce(
    (sum, register) => sum + register.oldIndex,
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
    oldEffectiveIndex,
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
    case 'CONFIRMED':
      return {
        label: 'Đã xác nhận',
        type: 'confirmed' as const
      };
    case 'REJECTED':
      return {
        label: 'Bị từ chối',
        type: 'rejected' as const
      };
    case 'DRAFT':
      return {
        label: 'Nháp',
        type: 'draft' as const
      };
    default:
      return {
        label: 'Chưa nhập',
        type: 'notEntered' as const
      };
  }
};

export interface ManualMeterReadingOptions {
  scope?: 'customer' | 'feeder';
  feederId?: string;
}

export default function useManualMeterReading(options: ManualMeterReadingOptions = {}) {
  const isFeederScope = options.scope === 'feeder';
  const objectUrlsRef = useRef<Set<string>>(new Set());
  const searchLookupRequestIdRef = useRef<number>(K_SIZE_0);
  const meterSearchRequestIdRef = useRef<number>(K_SIZE_0);
  const initialFilter = useMemo<ManualReadingFilter>(
    () =>
      isFeederScope
        ? { ...DEFAULT_FILTER, searchBy: 'FEEDER', customerCode: options.feederId || '' }
        : DEFAULT_FILTER,
    [isFeederScope, options.feederId]
  );
  const [filterDraft, setFilterDraft] = useState<ManualReadingFilter>(initialFilter);
  const [filterApplied, setFilterApplied] = useState<ManualReadingFilter>(initialFilter);
  const [meters, setMeters] = useState<ManualReadingMeter[]>([]);
  const [selectedMeterId, setSelectedMeterId] = useState<string>('');
  const [changedMeterIds, setChangedMeterIds] = useState<Set<string>>(new Set());
  const [loadingMeters, setLoadingMeters] = useState<boolean>(false);
  const [loadingDetail, setLoadingDetail] = useState<boolean>(false);
  const [savingConfirm, setSavingConfirm] = useState<boolean>(false);
  const [searchLookupOptions, setSearchLookupOptions] = useState<AppSelectOption[]>([]);
  const [searchLookupSearch, setSearchLookupSearch] = useState<string>('');
  const [searchLookupLoading, setSearchLookupLoading] = useState<boolean>(false);
  const [selectedFeeder, setSelectedFeeder] = useState<Meter>();

  const filteredMeters = meters;
  const hasUnsyncedFilter = useMemo(
    () =>
      filterDraft.keyword !== filterApplied.keyword ||
      filterDraft.searchBy !== filterApplied.searchBy ||
      filterDraft.customerCode !== filterApplied.customerCode ||
      filterDraft.periodCode !== filterApplied.periodCode ||
      filterDraft.readingDate !== filterApplied.readingDate,
    [filterApplied, filterDraft]
  );

  const searchLookupField = useMemo(
    () =>
      isFeederScope
        ? { label: 'Lộ', placeholder: 'Chọn hoặc nhập mã lộ, tên lộ' }
        : getSearchLookupFieldMeta(filterDraft.searchBy),
    [filterDraft.searchBy, isFeederScope]
  );

  useEffect(() => {
    if (!isFeederScope || !filterApplied.customerCode) {
      setSelectedFeeder(undefined);
      return;
    }

    const selectedOption = searchLookupOptions.find(
      (option) => String(option.value) === filterApplied.customerCode
    );
    const feederFromLookup = selectedOption?.data as Meter | undefined;
    if (feederFromLookup?.meterCode) {
      setSelectedFeeder(feederFromLookup);
      return;
    }

    let isActive = true;
    const loadSelectedFeeder = async () => {
      const response = await meterServices.getMeterDetail({ meterId: filterApplied.customerCode });
      if (!isActive) return;

      setSelectedFeeder(normalizeMeterSearchItem(response?.data));
    };

    void loadSelectedFeeder();

    return () => {
      isActive = false;
    };
  }, [filterApplied.customerCode, isFeederScope, searchLookupOptions]);

  const fetchSearchLookupOptions = useCallback(
    async (searchBy: string, search = '') => {
      const requestId = searchLookupRequestIdRef.current + K_SIZE_1;
      searchLookupRequestIdRef.current = requestId;
      setSearchLookupLoading(true);

      if (isFeederScope || searchBy === 'METER_CODE') {
        const normalizedSearch = optionalValue(search);
        const lookupMeterType = isFeederScope ? METER_TYPE.FEEDER : METER_TYPE.CUSTOMER;
        const response = await meterServices.getMeterSearchList({
          page: K_SIZE_0,
          size: DEFAULT_PAGE_SIZE,
          meterCodeContains: normalizedSearch,
          filter: normalizedSearch,
          meterType: lookupMeterType
        });

        if (requestId !== searchLookupRequestIdRef.current) return;
        setSearchLookupLoading(false);

        if (hasApiError(response) || !response.data) {
          setSearchLookupOptions([]);
          return;
        }

        const meters = (response.data.items || [])
          .map(normalizeMeterSearchItem)
          .filter((meter): meter is Meter => Boolean(meter?.meterType === lookupMeterType));
        setSearchLookupOptions(
          isFeederScope
            ? meters.map((meter) => ({
                value: String(meter.id || meter.meterId),
                label: [meter.meterCode, meter.customerName].filter(Boolean).join(' - '),
                data: meter
              }))
            : buildMeterLookupOptions(meters)
        );
        return;
      }

      const response = await customerServices.searchCustomer({
        page: K_SIZE_0,
        size: DEFAULT_PAGE_SIZE,
        customerCodeContains: searchBy === 'CUSTOMER_CODE' ? optionalValue(search) : undefined,
        fullNameContains: searchBy === 'CUSTOMER_NAME' ? optionalValue(search) : undefined
      });

      if (requestId !== searchLookupRequestIdRef.current) return;
      setSearchLookupLoading(false);

      if (hasApiError(response) || !response.data) {
        setSearchLookupOptions([]);
        return;
      }

      setSearchLookupOptions(buildCustomerLookupOptions(response.data.items || [], searchBy));
    },
    [isFeederScope]
  );

  const debouncedFetchSearchLookupOptions = useMemo(
    () => debounce(fetchSearchLookupOptions, CONSTANTS.TIME_DEBOUNCE),
    [fetchSearchLookupOptions]
  );

  const createObjectUrl = useCallback((blob: Blob | File) => {
    const objectUrl = URL.createObjectURL(blob);
    objectUrlsRef.current.add(objectUrl);
    return objectUrl;
  }, []);

  const revokeObjectUrl = useCallback((objectUrl?: string) => {
    if (!objectUrl) return;
    URL.revokeObjectURL(objectUrl);
    objectUrlsRef.current.delete(objectUrl);
  }, []);

  useEffect(
    () => () => {
      objectUrlsRef.current.forEach((objectUrl) => URL.revokeObjectURL(objectUrl));
      objectUrlsRef.current.clear();
    },
    []
  );

  useEffect(
    () => () => {
      debouncedFetchSearchLookupOptions.cancel();
    },
    [debouncedFetchSearchLookupOptions]
  );

  const selectedMeter = useMemo(
    () =>
      selectedMeterId ? filteredMeters.find((meter) => meter.id === selectedMeterId) : undefined,
    [filteredMeters, selectedMeterId]
  );

  const selectedMeterMetrics = useMemo(
    () => getMeterReadingMetrics(selectedMeter),
    [selectedMeter]
  );

  const periodInfo = useMemo(() => {
    const range = getPeriodDateRange(filterApplied.periodCode || DEFAULT_FILTER.periodCode);
    const readingDate = dayjs(filterApplied.readingDate, FORMAT_DATE_API);

    return {
      ...range,
      readingDate: readingDate.isValid() ? readingDate.format('DD/MM/YYYY') : ''
    };
  }, [filterApplied.periodCode, filterApplied.readingDate]);

  const loadPhotoPreviews = useCallback(
    async (photos: ReadingPhoto[]): Promise<ManualReadingUploadedPhoto[]> => {
      const previewPhotos = await Promise.all(
        photos.map(async (photo) => {
          if (!photo.id) return photo;

          const response = await manualMeterReadingServices.viewReadingPhoto(photo.id);
          if (!response?.data) return photo;

          return {
            ...photo,
            previewUrl: createObjectUrl(response.data)
          };
        })
      );

      return previewPhotos;
    },
    [createObjectUrl]
  );

  const fetchPreparedRows = useCallback(async (meter: ManualReadingMeter, periodCode: string) => {
    const response = await manualMeterReadingServices.prepareReadingPeriod({
      meterNumber: meter.meterCode,
      periodCode
    });
    return hasApiError(response) ? undefined : response.data?.rows;
  }, []);

  const fetchMeterPeriod = useCallback(
    async (meter: ManualReadingMeter, appliedFilter: ManualReadingFilter) => {
      if (!meter.meterCode || !appliedFilter.periodCode) return;

      setLoadingDetail(true);
      const searchResponse = await manualMeterReadingServices.searchReadingPeriods({
        page: K_SIZE_0,
        size: K_SIZE_1,
        meterNumber: meter.meterCode,
        periodCode: appliedFilter.periodCode,
        typeInput: MANUAL_READING_TYPE_INPUT
      });

      if (hasApiError(searchResponse)) {
        setLoadingDetail(false);
        showToast({
          type: TYPE_TOAST.ERROR,
          content: getErrorMessage(searchResponse, 'Tải kỳ ghi chỉ số thất bại')
        });
        return;
      }

      const period = searchResponse.data?.items?.[K_SIZE_0];
      if (!period?.id) {
        const preparedRows = await fetchPreparedRows(meter, appliedFilter.periodCode);
        setMeters((prev) =>
          updateMeter(prev, meter.id, (item) => mapPreparedToNewPeriodMeter(item, preparedRows))
        );
        setLoadingDetail(false);
        return;
      }

      const detailResponse = await manualMeterReadingServices.getReadingPeriod({ id: period.id });
      const photoResponse = await manualMeterReadingServices.listReadingPhotos({
        periodId: period.id
      });

      const photos =
        !hasApiError(photoResponse) && Array.isArray(photoResponse.data)
          ? await loadPhotoPreviews(photoResponse.data)
          : undefined;
      const detail =
        !hasApiError(detailResponse) && detailResponse.data
          ? detailResponse.data
          : { period, readings: [] };

      setMeters((prev) =>
        updateMeter(prev, meter.id, (item) => mapPeriodDetailToMeter(item, detail, photos))
      );
      setLoadingDetail(false);
    },
    [fetchPreparedRows, loadPhotoPreviews]
  );

  const fetchMeterStatuses = useCallback(
    async (meterList: ManualReadingMeter[], appliedFilter: ManualReadingFilter) => {
      const response = await manualMeterReadingServices.searchReadingPeriods({
        page: K_SIZE_0,
        size: DEFAULT_PAGE_SIZE,
        periodCode: appliedFilter.periodCode,
        typeInput: MANUAL_READING_TYPE_INPUT
      });
      if (hasApiError(response)) return meterList;

      const statusByMeterNumber = new Map(
        (response.data?.items || [])
          .filter((period) => Boolean(period.meterNumber))
          .map((period) => [period.meterNumber, getManualReadingStatus(period.status)])
      );

      return meterList.map((meter) => ({
        ...meter,
        status: statusByMeterNumber.get(meter.meterCode) || 'NOT_ENTERED'
      }));
    },
    []
  );

  const fetchMeters = useCallback(
    async (nextFilter: ManualReadingFilter) => {
      const requestId = meterSearchRequestIdRef.current + K_SIZE_1;
      meterSearchRequestIdRef.current = requestId;
      setChangedMeterIds(new Set());
      setLoadingMeters(true);
      const keyword = optionalValue(nextFilter.keyword);
      const searchValue = optionalValue(nextFilter.customerCode) || keyword;
      const response = isFeederScope
        ? await evnReadingBatchServices.metersByFeeder({ masterMeterId: nextFilter.customerCode })
        : await manualMeterReadingServices.searchMetersForReading({
            page: K_SIZE_0,
            size: DEFAULT_PAGE_SIZE,
            ...getSearchMeterParamsByField(nextFilter.searchBy, searchValue)
          });
      if (requestId !== meterSearchRequestIdRef.current) return;

      if (hasApiError(response) || !response.data) {
        setLoadingMeters(false);
        setMeters([]);
        setSelectedMeterId('');
        showToast({
          type: TYPE_TOAST.ERROR,
          content: getErrorMessage(response, 'Tải danh sách công tơ thất bại')
        });
        return;
      }

      const rows = isFeederScope
        ? Array.isArray(response.data)
          ? response.data
          : []
        : !Array.isArray(response.data)
          ? response.data.items || []
          : [];
      const nextMeters = await fetchMeterStatuses(
        rows.map(mapMeterSearchRowToManualMeter),
        nextFilter
      );
      if (requestId !== meterSearchRequestIdRef.current) return;
      setLoadingMeters(false);
      setMeters(nextMeters);

      const firstMeter = nextMeters[K_SIZE_0];
      setSelectedMeterId(firstMeter?.id || '');
      if (firstMeter) {
        await fetchMeterPeriod(firstMeter, nextFilter);
      }
    },
    [fetchMeterPeriod, fetchMeterStatuses, isFeederScope]
  );

  useEffect(() => {
    if (!isFeederScope || initialFilter.customerCode) {
      fetchMeters(initialFilter);
      return;
    }

    const loadFirstFeeder = async () => {
      setLoadingMeters(true);
      const response = await meterServices.getMeterSearchList({
        page: K_SIZE_0,
        size: DEFAULT_PAGE_SIZE,
        meterType: METER_TYPE.FEEDER
      });

      if (hasApiError(response) || !response.data?.items?.length) {
        setLoadingMeters(false);
        setMeters([]);
        setSelectedMeterId('');
        showToast({
          type: TYPE_TOAST.ERROR,
          content: getErrorMessage(response, 'Không tìm thấy lộ để nhập chỉ số')
        });
        return;
      }

      const feeders = (response.data.items || [])
        .map(normalizeMeterSearchItem)
        .filter(Boolean) as Meter[];
      const firstFeeder = feeders[K_SIZE_0];
      const feederId = String(firstFeeder?.id || firstFeeder?.meterId || '');
      if (!feederId) {
        setLoadingMeters(false);
        return;
      }

      const nextFilter = { ...initialFilter, customerCode: feederId };
      setSearchLookupOptions(
        feeders.map((meter) => ({
          value: String(meter.id || meter.meterId),
          label: [meter.meterCode, meter.customerName].filter(Boolean).join(' - '),
          data: meter
        }))
      );
      setFilterDraft(nextFilter);
      setFilterApplied(nextFilter);
      await fetchMeters(nextFilter);
    };

    void loadFirstFeeder();
  }, [fetchMeters, initialFilter, isFeederScope]);

  const onSearchLookupOptions = useCallback(
    (search: string) => {
      setSearchLookupSearch(search);
      debouncedFetchSearchLookupOptions(isFeederScope ? 'FEEDER' : filterDraft.searchBy, search);
    },
    [debouncedFetchSearchLookupOptions, filterDraft.searchBy, isFeederScope]
  );

  const onOpenSearchLookupDropdown = useCallback(
    (open?: boolean) => {
      if (open && !searchLookupOptions.length && !searchLookupLoading) {
        fetchSearchLookupOptions(
          isFeederScope ? 'FEEDER' : filterDraft.searchBy,
          searchLookupSearch
        );
      }
    },
    [
      fetchSearchLookupOptions,
      filterDraft.searchBy,
      isFeederScope,
      searchLookupLoading,
      searchLookupOptions.length,
      searchLookupSearch
    ]
  );

  // Đổi kỳ: tải lại trạng thái các công tơ đang hiển thị + dữ liệu công tơ đang chọn theo kỳ mới
  // (không bắt bấm Tìm kiếm — trước đây chọn công tơ vẫn ra dữ liệu của kỳ cũ).
  const reloadForPeriod = useCallback(
    async (nextFilter: ManualReadingFilter) => {
      if (!meters.length) return;
      const requestId = meterSearchRequestIdRef.current + K_SIZE_1;
      meterSearchRequestIdRef.current = requestId;
      setChangedMeterIds(new Set());
      setLoadingMeters(true);
      const nextMeters = await fetchMeterStatuses(meters, nextFilter);
      if (requestId !== meterSearchRequestIdRef.current) return;
      setLoadingMeters(false);
      setMeters(nextMeters);
      const current =
        nextMeters.find((meter) => meter.id === selectedMeterId) || nextMeters[K_SIZE_0];
      setSelectedMeterId(current?.id || '');
      if (current) {
        await fetchMeterPeriod(current, nextFilter);
      }
    },
    [fetchMeterPeriod, fetchMeterStatuses, meters, selectedMeterId]
  );

  const onChangeFilter = useCallback(
    (key: keyof ManualReadingFilter, value: string) => {
      // Kỳ / ngày ghi áp dụng ngay (giữ nguyên bộ lọc khách hàng đã tìm).
      if (key === 'periodCode' || key === 'readingDate') {
        if (filterDraft[key] === value && filterApplied[key] === value) return;
        const nextApplied = { ...filterApplied, [key]: value };
        const apply = () => {
          setFilterDraft((prev) => ({ ...prev, [key]: value }));
          setFilterApplied(nextApplied);
          if (key === 'periodCode') {
            void reloadForPeriod(nextApplied);
          }
        };
        // Đổi kỳ khi đã có danh sách công tơ: xác nhận trước khi tải dữ liệu kỳ mới; Hủy thì ô kỳ
        // giữ nguyên kỳ cũ (giá trị ô bám theo filterDraft chưa đổi).
        if (key !== 'periodCode' || !meters.length) {
          apply();
          return;
        }
        const unsaved = changedMeterIds.size;
        showDialog({
          title: 'Đổi kỳ ghi chỉ số',
          content: unsaved
            ? `Có ${unsaved} công tơ đã sửa chưa lưu ở kỳ ${filterApplied.periodCode}. Chuyển sang kỳ ${value} sẽ bỏ các thay đổi này và tải dữ liệu kỳ ${value}. Bạn có muốn tiếp tục?`
            : `Chuyển sang kỳ ${value} và tải dữ liệu chỉ số kỳ ${value} cho các công tơ đang hiển thị?`,
          type: TYPE_MESSAGE.CONFIRM,
          disableTouchOutSide: true,
          actions: [
            { title: 'Đồng ý', type: TYPE_ACTION.PRIMARY, onPress: apply },
            { title: 'Hủy', type: TYPE_ACTION.SECONDARY }
          ]
        });
        return;
      }

      const clearStaleMeterData = () => {
        meterSearchRequestIdRef.current += K_SIZE_1;
        setSelectedMeterId('');
        setLoadingDetail(false);
      };

      if (key === 'searchBy') {
        searchLookupRequestIdRef.current += K_SIZE_1;
        debouncedFetchSearchLookupOptions.cancel();
        setSearchLookupSearch('');
        setSearchLookupOptions([]);
        setSearchLookupLoading(false);
        if (filterDraft.searchBy === value && !filterDraft.customerCode) return;
        clearStaleMeterData();
        setFilterDraft((prev) => ({ ...prev, searchBy: value, customerCode: '' }));
        return;
      }

      if (filterDraft[key] === value) return;
      clearStaleMeterData();
      setFilterDraft((prev) => ({ ...prev, [key]: value }));
    },
    [
      changedMeterIds,
      debouncedFetchSearchLookupOptions,
      filterApplied,
      filterDraft,
      meters.length,
      reloadForPeriod
    ]
  );

  const onApplyFilter = useCallback(async () => {
    setFilterApplied(filterDraft);
    await fetchMeters(filterDraft);
  }, [fetchMeters, filterDraft]);

  const onResetFilter = useCallback(async () => {
    searchLookupRequestIdRef.current += K_SIZE_1;
    debouncedFetchSearchLookupOptions.cancel();
    setSearchLookupSearch('');
    setSearchLookupOptions([]);
    setSearchLookupLoading(false);
    setFilterDraft(initialFilter);
    setFilterApplied(initialFilter);
    await fetchMeters(initialFilter);
  }, [debouncedFetchSearchLookupOptions, fetchMeters, initialFilter]);

  const onSelectMeter = useCallback(
    (meterId: string) => {
      setSelectedMeterId(meterId);
      const meter = meters.find((item) => item.id === meterId);
      if (meter) {
        fetchMeterPeriod(meter, filterApplied);
      }
    },
    [fetchMeterPeriod, filterApplied, meters]
  );

  const onChangeRegister = useCallback((meterId: string, registerId: string, value: string) => {
    setChangedMeterIds((previous) => new Set(previous).add(meterId));
    setMeters((prev) =>
      updateMeter(prev, meterId, (meter) => ({
        ...meter,
        status: meter.status === 'SAVED' || meter.status === 'CONFIRMED' ? 'DRAFT' : meter.status,
        registers: meter.registers.map((register) =>
          register.id === registerId ? { ...register, newIndex: value } : register
        )
      }))
    );
  }, []);

  const onChangeReactiveIndex = useCallback((meterId: string, value: string) => {
    setChangedMeterIds((previous) => new Set(previous).add(meterId));
    setMeters((prev) =>
      updateMeter(prev, meterId, (meter) => ({
        ...meter,
        status: meter.status === 'SAVED' || meter.status === 'CONFIRMED' ? 'DRAFT' : meter.status,
        reactiveIndex: value
      }))
    );
  }, []);

  const onChangeReactiveUnitPrice = useCallback((meterId: string, value: string) => {
    setChangedMeterIds((previous) => new Set(previous).add(meterId));
    setMeters((prev) =>
      updateMeter(prev, meterId, (meter) => ({
        ...meter,
        status: meter.status === 'SAVED' || meter.status === 'CONFIRMED' ? 'DRAFT' : meter.status,
        reactiveUnitPrice: value
      }))
    );
  }, []);

  const onChangeNote = useCallback((meterId: string, value: string) => {
    setChangedMeterIds((previous) => new Set(previous).add(meterId));
    setMeters((prev) =>
      updateMeter(prev, meterId, (meter) => ({
        ...meter,
        status: meter.status === 'SAVED' || meter.status === 'CONFIRMED' ? 'DRAFT' : meter.status,
        note: value
      }))
    );
  }, []);

  const onSelectPhoto = useCallback(
    (meterId: string, file: File) => {
      if (!isValidUploadFileSize(file)) {
        showToast({
          type: TYPE_TOAST.ERROR,
          content: getUploadFileSizeError('ảnh chụp công tơ')
        });
        return;
      }

      if (!['image/jpeg', 'image/png'].includes(file.type)) {
        showToast({
          type: TYPE_TOAST.ERROR,
          content: 'Vui lòng chọn ảnh JPG hoặc PNG'
        });
        return;
      }

      const meter = meters.find((item) => item.id === meterId);
      const photoCount =
        (meter?.uploadedPhotos.length || K_SIZE_0) + (meter?.pendingPhotos.length || K_SIZE_0);
      if (photoCount >= MAX_READING_PHOTOS) {
        showToast({
          type: TYPE_TOAST.ERROR,
          content: `Chỉ được upload tối đa ${MAX_READING_PHOTOS} ảnh công tơ`
        });
        return;
      }

      const previewUrl = createObjectUrl(file);
      const pendingPhoto: ManualReadingPendingPhoto = {
        uid: `${file.name}-${file.lastModified}-${Date.now()}`,
        name: file.name,
        file,
        previewUrl
      };

      setMeters((prev) =>
        updateMeter(prev, meterId, (item) => ({
          ...item,
          status: item.status === 'SAVED' || item.status === 'CONFIRMED' ? 'DRAFT' : item.status,
          pendingPhotos: [...item.pendingPhotos, pendingPhoto]
        }))
      );
      setChangedMeterIds((previous) => new Set(previous).add(meterId));
      showToast({ type: TYPE_TOAST.SUCCESS, content: 'Đã chọn ảnh công tơ' });
    },
    [createObjectUrl, meters]
  );

  const onRemovePendingPhoto = useCallback(
    (meterId: string, uid: string) => {
      const meter = meters.find((item) => item.id === meterId);
      const pendingPhoto = meter?.pendingPhotos.find((photo) => photo.uid === uid);
      revokeObjectUrl(pendingPhoto?.previewUrl);

      setMeters((prev) =>
        updateMeter(prev, meterId, (item) => ({
          ...item,
          pendingPhotos: item.pendingPhotos.filter((photo) => photo.uid !== uid)
        }))
      );
      setChangedMeterIds((previous) => new Set(previous).add(meterId));
    },
    [meters, revokeObjectUrl]
  );

  const onRemoveUploadedPhoto = useCallback(
    async (meterId: string, id: number) => {
      const meter = meters.find((item) => item.id === meterId);
      const uploadedPhoto = meter?.uploadedPhotos.find((photo) => photo.id === id);
      const response = await manualMeterReadingServices.deleteReadingPhoto({ id });
      if (hasApiError(response)) {
        showToast({
          type: TYPE_TOAST.ERROR,
          content: getErrorMessage(response, 'Xóa ảnh công tơ thất bại')
        });
        return;
      }

      revokeObjectUrl(uploadedPhoto?.previewUrl);
      setMeters((prev) =>
        updateMeter(prev, meterId, (item) => ({
          ...item,
          uploadedPhotos: item.uploadedPhotos.filter((photo) => photo.id !== id)
        }))
      );
    },
    [meters, revokeObjectUrl]
  );

  const onClearSelectedMeter = useCallback(() => {
    if (!selectedMeter) return;

    selectedMeter.pendingPhotos.forEach((photo) => revokeObjectUrl(photo.previewUrl));
    setMeters((prev) =>
      updateMeter(prev, selectedMeter.id, (meter) => ({
        ...meter,
        status: 'NOT_ENTERED',
        registers: meter.registers.map((register) => ({ ...register, newIndex: '' })),
        reactiveIndex: '',
        reactiveUnitPrice: '',
        note: '',
        pendingPhotos: []
      }))
    );
    setChangedMeterIds((previous) => new Set(previous).add(selectedMeter.id));
  }, [revokeObjectUrl, selectedMeter]);

  const uploadPendingPhoto = useCallback(async (meter: ManualReadingMeter, periodId: number) => {
    if (!meter.pendingPhotos.length) return meter;

    const uploadedPhotos = [...meter.uploadedPhotos];
    const failedPendingPhotos: ManualReadingPendingPhoto[] = [];

    for (const pendingPhoto of meter.pendingPhotos) {
      const response = await manualMeterReadingServices.uploadReadingPhoto({
        periodId,
        file: pendingPhoto.file
      });

      if (hasApiError(response) || !response.data) {
        failedPendingPhotos.push(pendingPhoto);
        continue;
      }

      uploadedPhotos.push({
        ...response.data,
        previewUrl: pendingPhoto.previewUrl
      });
    }

    if (failedPendingPhotos.length) {
      showToast({
        type: TYPE_TOAST.WARNING,
        content: `Đã upload ${meter.pendingPhotos.length - failedPendingPhotos.length}/${
          meter.pendingPhotos.length
        } ảnh công tơ`
      });
    }

    return {
      ...meter,
      uploadedPhotos,
      pendingPhotos: failedPendingPhotos
    };
  }, []);

  const saveMeterToServer = useCallback(
    async (meter: ManualReadingMeter, saveMode: ReadingPeriodSaveMode, showSuccess = true) => {
      if (hasUnsyncedFilter) {
        showToast({
          type: TYPE_TOAST.ERROR,
          content: 'Bộ lọc đã thay đổi. Vui lòng tìm kiếm lại trước khi lưu'
        });
        return false;
      }

      const metrics = getMeterReadingMetrics(meter);
      if (!metrics.canSave) {
        showToast({
          type: TYPE_TOAST.ERROR,
          content: 'Vui lòng nhập đủ chỉ số mới và đảm bảo chỉ số mới không nhỏ hơn chỉ số cũ'
        });
        return false;
      }

      if (!periodInfo.from || !periodInfo.to || !filterApplied.readingDate) {
        showToast({
          type: TYPE_TOAST.ERROR,
          content: 'Vui lòng chọn kỳ ghi chỉ số và ngày ghi chỉ số'
        });
        return false;
      }

      const customerId = getCustomerIdForRequest(meter);
      if (customerId === undefined) {
        showToast({
          type: TYPE_TOAST.ERROR,
          content: 'Không xác định được khách hàng của công tơ'
        });
        return false;
      }

      const readings = buildReadingItems(meter);
      const reactiveEnergyIndex = toNumber(meter.reactiveIndex);
      let savedMeter: ManualReadingMeter | undefined;

      if (meter.periodId) {
        const response = await manualMeterReadingServices.updateReadingPeriod({
          id: meter.periodId,
          periodCode: filterApplied.periodCode,
          periodFrom: periodInfo.from,
          periodTo: periodInfo.to,
          readingDate: filterApplied.readingDate,
          readings,
          reactiveEnergyIndex,
          note: optionalValue(meter.note)
        });

        if (hasApiError(response) || !response.data) {
          showToast({
            type: TYPE_TOAST.ERROR,
            content: getErrorMessage(response, 'Cập nhật chỉ số công tơ thất bại')
          });
          return false;
        }

        savedMeter = mapPeriodDetailToMeter(meter, response.data);
      } else {
        const response = await manualMeterReadingServices.createReadingPeriod({
          meterNumber: meter.meterCode,
          customerId,
          periodCode: filterApplied.periodCode,
          periodFrom: periodInfo.from,
          periodTo: periodInfo.to,
          readingDate: filterApplied.readingDate,
          saveMode,
          readings,
          reactiveEnergyIndex,
          note: optionalValue(meter.note)
        });

        if (hasApiError(response) || !response.data?.period) {
          showToast({
            type: TYPE_TOAST.ERROR,
            content: getErrorMessage(response, 'Lưu chỉ số công tơ thất bại')
          });
          return false;
        }

        savedMeter = mapPeriodDetailToMeter(meter, {
          period: response.data.period,
          readings: response.data.readings
        });
      }

      if (savedMeter.periodId) {
        savedMeter = await uploadPendingPhoto(savedMeter, savedMeter.periodId);
      }

      setMeters((prev) => updateMeter(prev, meter.id, () => savedMeter as ManualReadingMeter));

      if (showSuccess) {
        showToast({
          type: TYPE_TOAST.SUCCESS,
          content: saveMode === 'DRAFT' ? 'Đã lưu nháp chỉ số công tơ' : 'Đã lưu chỉ số công tơ'
        });
      }

      return true;
    },
    [
      filterApplied.periodCode,
      filterApplied.readingDate,
      hasUnsyncedFilter,
      periodInfo.from,
      periodInfo.to,
      uploadPendingPhoto
    ]
  );

  const saveSelectedChangedMeter = useCallback(
    async (saveMode: ReadingPeriodSaveMode) => {
      if (hasUnsyncedFilter) {
        showToast({
          type: TYPE_TOAST.ERROR,
          content: 'Bộ lọc đã thay đổi. Vui lòng tìm kiếm lại trước khi lưu'
        });
        return false;
      }

      const meter = meters.find((item) => item.id === selectedMeterId);
      if (!meter) {
        showToast({ type: TYPE_TOAST.ERROR, content: 'Vui lòng chọn công tơ cần lưu' });
        return false;
      }

      if (!changedMeterIds.has(meter.id)) {
        showToast({ type: TYPE_TOAST.WARNING, content: 'Công tơ chưa có thay đổi để lưu' });
        return false;
      }

      const saved = await saveMeterToServer(meter, saveMode);
      if (saved) {
        setChangedMeterIds((previous) => {
          const next = new Set(previous);
          next.delete(meter.id);
          return next;
        });
      }
      return saved;
    },
    [changedMeterIds, hasUnsyncedFilter, meters, saveMeterToServer, selectedMeterId]
  );

  const onSave = useCallback(() => {
    showDialog({
      title: 'Xác nhận lưu chỉ số',
      content: 'Bạn có chắc chắn muốn lưu chỉ số công tơ này?',
      type: TYPE_MESSAGE.CONFIRM,
      disableTouchOutSide: true,
      actions: [
        {
          title: 'Lưu',
          type: TYPE_ACTION.PRIMARY,
          stopHide: true,
          onPress: async () => {
            setSavingConfirm(true);
            const saved = await saveSelectedChangedMeter('DRAFT');
            setSavingConfirm(false);
            if (saved) hideDialog();
          }
        },
        { title: 'Hủy', type: TYPE_ACTION.SECONDARY }
      ]
    });
  }, [saveSelectedChangedMeter]);

  const onSelectMeterWithUnsavedCheck = useCallback(
    (meterId: string) => {
      if (meterId === selectedMeterId) return;

      const currentMeter = meters.find((meter) => meter.id === selectedMeterId);
      if (!currentMeter || !changedMeterIds.has(currentMeter.id)) {
        onSelectMeter(meterId);
        return;
      }

      showDialog({
        title: 'Dữ liệu chưa được lưu',
        content: `Công tơ ${currentMeter.meterCode} có thay đổi chưa được lưu. Bạn có muốn lưu nháp không?`,
        type: TYPE_MESSAGE.CONFIRM,
        disableTouchOutSide: true,
        actions: [
          {
            title: 'Lưu nháp',
            type: TYPE_ACTION.PRIMARY,
            stopHide: true,
            onPress: async () => {
              setSavingConfirm(true);
              const saved = await saveSelectedChangedMeter('DRAFT');
              setSavingConfirm(false);
              if (saved) {
                hideDialog();
                onSelectMeter(meterId);
              }
            }
          },
          {
            title: 'Không lưu',
            type: TYPE_ACTION.SECONDARY,
            stopHide: true,
            onPress: async () => {
              currentMeter.pendingPhotos.forEach((photo) => revokeObjectUrl(photo.previewUrl));
              setChangedMeterIds((previous) => {
                const next = new Set(previous);
                next.delete(currentMeter.id);
                return next;
              });
              setMeters((previous) =>
                updateMeter(previous, currentMeter.id, (meter) => ({
                  ...meter,
                  pendingPhotos: []
                }))
              );
              await fetchMeterPeriod(currentMeter, filterApplied);
              hideDialog();
              onSelectMeter(meterId);
            }
          },
          { title: 'Hủy', type: TYPE_ACTION.LINK }
        ]
      });
    },
    [
      changedMeterIds,
      fetchMeterPeriod,
      filterApplied,
      meters,
      onSelectMeter,
      revokeObjectUrl,
      saveSelectedChangedMeter,
      selectedMeterId
    ]
  );

  return {
    filterDraft,
    filterApplied,
    filteredMeters,
    selectedMeter,
    selectedMeterId,
    selectedMeterMetrics,
    periodInfo,
    searchByOptions: isFeederScope ? [{ value: 'FEEDER', label: 'Lộ' }] : SEARCH_BY_OPTIONS,
    searchLookupField,
    searchLookupOptions,
    searchLookupSearch,
    searchLookupLoading,
    selectedFeederCode: selectedFeeder?.meterCode || '',
    selectedFeederName: selectedFeeder?.customerName || '',
    periodOptions: PERIOD_OPTIONS,
    maxPhotoCount: MAX_READING_PHOTOS,
    hasUnsyncedFilter,
    loadingMeters,
    loadingDetail,
    savingConfirm,
    onSearchLookupOptions,
    onOpenSearchLookupDropdown,
    onChangeFilter,
    onApplyFilter,
    onResetFilter,
    onSelectMeter,
    onSelectMeterWithUnsavedCheck,
    onChangeRegister,
    onChangeReactiveIndex,
    onChangeReactiveUnitPrice,
    onChangeNote,
    onSelectPhoto,
    onRemovePendingPhoto,
    onRemoveUploadedPhoto,
    onClearSelectedMeter,
    onSave
  };
}
