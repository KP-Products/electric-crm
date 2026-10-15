import { DEFAULT_PAGE_SIZE, K_SIZE_0, K_SIZE_1, MAX_PAGE_SIZE, NULL_VALUE } from '@constant';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  CREATE_METER_CHANGE_EVENT,
  DELETE_METER_CHANGE_EVENT,
  GET_METER_CHANGE_EVENT_DETAIL,
  SEARCH_METER_CHANGE_EVENT,
  UPDATE_METER_CHANGE_EVENT
} from '@redux-action-type/meter-change-event';
import { dispatch } from '@redux-common';
import {
  selectMeterChangeEventList,
  selectMeterChangeEventLoadingDetail,
  selectMeterChangeEventLoadingList,
  selectMeterChangeEventTotal
} from '@redux-selector/meter-change-event';
import { showDialog } from 'components/dialog';
import { TYPE_ACTION, TYPE_MESSAGE } from 'components/dialog/type';
import { showToast } from 'components/toast';
import { TYPE_TOAST } from 'components/toast/type';
import { ErrorBase } from 'model/common';
import { MeasuringDevice } from 'model/measuring-device';
import { normalizeMeterSearchItem } from 'model/meter';
import {
  CreateMeterChangeEventReq,
  MeterChangeDetailInput,
  MeterChangeEventRes,
  MeterChangeEventWithDetails,
  SearchMeterChangeEventsReq,
  UpdateMeterChangeEventReq
} from 'model/meter-change-event';
import moment from 'moment';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';
import { useSelector } from 'react-redux';
import meterChangeEventServices from 'services/meter-change-event-services';
import measuringDeviceServices from 'services/measuring-device-services';
import meterServices from 'services/meter-services';
import { FORMAT_DATE_TIME_DOWNLOAD } from 'utils/date';
import { useAppTranslation } from 'utils/i18n';
import { parseFormattedNumber } from 'utils/number-input';
import { z } from 'zod';
import useCustomerLookup from '../manage-contract/hooks/useCustomerLookup';
import {
  DATE_API_FORMAT,
  displayEventDate,
  displayEventDateTime,
  escapeHtml,
  EVENT_STATUS_LABEL_MAP,
  getEventStatusLabel,
  getEventTypeLabel,
  METER_CHANGE_EVENT_TYPE,
  METER_CHANGE_EXPORT_FILE_EXT,
  METER_CHANGE_EXPORT_FILE_PREFIX,
  METER_CHANGE_STATUS,
  normalizeEventDateForForm,
  sanitizeExcelCellValue
} from './utils';

export interface MeterChangeEventFilter {
  eventNo: string;
  eventType: string;
  customerId: string;
  status: string;
}

const DEFAULT_FILTER: MeterChangeEventFilter = {
  eventNo: '',
  eventType: '',
  customerId: '',
  status: ''
};

const optionalTextSchema = z.preprocess((value) => value ?? '', z.string().trim());

const parseNumberInput = (value?: string) => {
  const rawValue = String(value ?? '').trim();
  if (!rawValue) return undefined;

  const parsed = parseFormattedNumber(rawValue);
  return parsed !== undefined && parsed >= K_SIZE_0 ? parsed : undefined;
};

const toOptionalCustomerId = (value?: string | number) => {
  const customerId = Number(value);
  return Number.isInteger(customerId) && customerId > K_SIZE_0 ? customerId : undefined;
};

const isValidNonNegativeNumber = (value: string) => {
  if (!value) return true;
  const parsedValue = parseNumberInput(value);
  return parsedValue !== undefined;
};

const detailSchema = z
  .object({
    oldDeviceId: optionalTextSchema,
    newDeviceId: optionalTextSchema,
    removeReading: optionalTextSchema.refine(isValidNonNegativeNumber, {
      message: 'Chỉ số tại thời điểm tháo không hợp lệ'
    }),
    installReading: optionalTextSchema.refine(isValidNonNegativeNumber, {
      message: 'Chỉ số tại thời điểm lắp không hợp lệ'
    }),
    multiplier: optionalTextSchema.refine(isValidNonNegativeNumber, {
      message: 'Hệ số nhân không hợp lệ'
    }),
    note: optionalTextSchema
  })
  .superRefine((data, context) => {
    if (!data.oldDeviceId && !data.newDeviceId) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['oldDeviceId'],
        message: 'Vui lòng nhập thiết bị cũ hoặc thiết bị mới'
      });
    }
  });

const meterChangeEventSchema = z.object({
  eventNo: z.string().trim().min(K_SIZE_1, { message: 'Vui lòng nhập mã sự kiện' }),
  eventType: z.string().trim().min(K_SIZE_1, { message: 'Vui lòng chọn loại sự kiện' }),
  customerId: optionalTextSchema,
  eventDate: z
    .string()
    .trim()
    .min(K_SIZE_1, { message: 'Vui lòng chọn thời gian sự kiện' })
    .refine((value) => moment(value, DATE_API_FORMAT, true).isValid(), {
      message: 'Thời gian sự kiện không hợp lệ'
    }),
  reason: optionalTextSchema,
  status: z.string().trim().min(K_SIZE_1, { message: 'Vui lòng chọn trạng thái' }),
  note: optionalTextSchema,
  details: z.array(detailSchema).min(K_SIZE_1, { message: 'Vui lòng nhập chi tiết thiết bị' })
});

export type MeterChangeEventForm = z.infer<typeof meterChangeEventSchema>;
export type MeterChangeDetailForm = MeterChangeEventForm['details'][number];

const createDefaultDetailForm = (): MeterChangeDetailForm => ({
  oldDeviceId: '',
  newDeviceId: '',
  removeReading: '',
  installReading: '',
  multiplier: '1',
  note: ''
});

const buildFormValues = (record?: MeterChangeEventWithDetails): MeterChangeEventForm => {
  const event = record?.event;
  const details = record?.details?.length
    ? record.details.map((detail) => ({
        oldDeviceId: detail.oldDeviceId || '',
        newDeviceId: detail.newDeviceId || '',
        removeReading:
          detail.removeReading !== undefined && detail.removeReading !== null
            ? String(detail.removeReading)
            : '',
        installReading:
          detail.installReading !== undefined && detail.installReading !== null
            ? String(detail.installReading)
            : '',
        multiplier:
          detail.multiplier !== undefined && detail.multiplier !== null
            ? String(detail.multiplier)
            : '1',
        note: detail.note || ''
      }))
    : [createDefaultDetailForm()];

  return {
    eventNo: event?.eventNo || '',
    eventType: event?.eventType || METER_CHANGE_EVENT_TYPE.REPLACE,
    customerId: event?.customerId !== undefined ? String(event.customerId) : '',
    eventDate: normalizeEventDateForForm(event?.eventDate) || moment().format(DATE_API_FORMAT),
    reason: event?.reason || '',
    status: event?.status || METER_CHANGE_STATUS.DRAFT,
    note: event?.note || '',
    details
  };
};

const getErrorMessage = (
  error?: ErrorBase & { message?: string },
  fallback = 'Thao tác thất bại'
) =>
  error?.businessErrorMessage ||
  error?.systemErrorMessage ||
  error?.detailMessage ||
  error?.message ||
  fallback;

const getRecordId = (record?: MeterChangeEventWithDetails) => record?.event?.id;

const getMeasuringDeviceValue = (device: MeasuringDevice) =>
  String(device.deviceId ?? device.id ?? device.deviceCode ?? device.code ?? '');

const getMeasuringDeviceLabel = (device: MeasuringDevice) =>
  device.deviceCode ||
  device.code ||
  device.serialNumber ||
  device.deviceName ||
  device.name ||
  getMeasuringDeviceValue(device);

type DeviceSource = 'METER' | 'MEASURING_DEVICE';

interface DeviceOption {
  value: string;
  label: string;
  source: DeviceSource;
}

const normalizeText = (value?: string) => {
  const normalized = value?.trim();
  return normalized || undefined;
};

const buildDetailRequests = (details: MeterChangeDetailForm[]): MeterChangeDetailInput[] =>
  details.map((detail) => ({
    oldDeviceId: normalizeText(detail.oldDeviceId),
    newDeviceId: normalizeText(detail.newDeviceId),
    removeReading: parseNumberInput(detail.removeReading),
    installReading: parseNumberInput(detail.installReading),
    multiplier: parseNumberInput(detail.multiplier),
    note: normalizeText(detail.note)
  }));

const getEventDisplayValue = (record: MeterChangeEventWithDetails, key: string) => {
  const event = record.event;

  switch (key) {
    case 'eventNo':
      return event?.eventNo || NULL_VALUE;
    case 'eventType':
      return getEventTypeLabel(event?.eventType);
    case 'customerId':
      return event?.customerId || NULL_VALUE;
    case 'eventDate':
      return displayEventDate(event?.eventDate);
    case 'status':
      return getEventStatusLabel(event?.status);
    case 'performedBy':
      return event?.performedBy || NULL_VALUE;
    case 'approvedBy':
      return event?.approvedBy || NULL_VALUE;
    case 'approvedAt':
      return displayEventDateTime(event?.approvedAt);
    default:
      return NULL_VALUE;
  }
};

export default function useMeterChangeEvents() {
  const { t } = useAppTranslation();
  const meterChangeEventList = useSelector(selectMeterChangeEventList);
  const total = useSelector(selectMeterChangeEventTotal);
  const listLoading = useSelector(selectMeterChangeEventLoadingList);
  const detailLoading = useSelector(selectMeterChangeEventLoadingDetail);

  const [currentPage, setCurrentPage] = useState<number>(K_SIZE_1);
  const [filter, setFilter] = useState<MeterChangeEventFilter>(DEFAULT_FILTER);
  const [filterApplied, setFilterApplied] = useState<MeterChangeEventFilter>(DEFAULT_FILTER);
  const [openForm, setOpenForm] = useState<boolean>(false);
  const [openDetail, setOpenDetail] = useState<boolean>(false);
  const [selectedEvent, setSelectedEvent] = useState<MeterChangeEventWithDetails>();
  const [selectedDetail, setSelectedDetail] = useState<MeterChangeEventWithDetails>();
  const [exportLoading, setExportLoading] = useState<boolean>(false);
  const [oldDeviceOptions, setOldDeviceOptions] = useState<DeviceOption[]>([]);
  const [oldDeviceLoading, setOldDeviceLoading] = useState<boolean>(false);
  const [hasLoadedOldDevices, setHasLoadedOldDevices] = useState<boolean>(false);
  const submittingRef = useRef<boolean>(false);
  const oldDeviceRequestIdRef = useRef<number>(K_SIZE_0);

  const form = useForm<MeterChangeEventForm>({
    mode: 'onTouched',
    defaultValues: buildFormValues(),
    resolver: zodResolver(meterChangeEventSchema)
  });
  const selectedCustomerId = form.watch('customerId');
  const detailForms = useWatch({ control: form.control, name: 'details' });
  const pinnedCustomerIds = useMemo(
    () => [selectedEvent?.event?.customerId, toOptionalCustomerId(selectedCustomerId)],
    [selectedCustomerId, selectedEvent?.event?.customerId]
  );

  const detailFieldArray = useFieldArray({
    control: form.control,
    name: 'details'
  });
  const { customerOptions, onOpenCustomerDropdown, customerDropdownRender } = useCustomerLookup({
    pinnedIds: pinnedCustomerIds,
    showErrorToast: true
  });

  const loadOldDeviceOptions = useCallback(async () => {
    if (hasLoadedOldDevices || oldDeviceLoading) return;

    const requestId = oldDeviceRequestIdRef.current + K_SIZE_1;
    oldDeviceRequestIdRef.current = requestId;
    setOldDeviceLoading(true);

    const [metersResponse, measuringDevicesResponse] = await Promise.all([
      meterServices.getMeterSearchList({ page: K_SIZE_0, size: MAX_PAGE_SIZE }),
      measuringDeviceServices.searchMeasuringDevices({ page: K_SIZE_0, size: MAX_PAGE_SIZE })
    ]);

    if (requestId !== oldDeviceRequestIdRef.current) return;

    setOldDeviceLoading(false);
    setHasLoadedOldDevices(true);

    const optionsByValue = new Map<string, DeviceOption>();
    (metersResponse?.data?.items || []).forEach((item) => {
      const meter = normalizeMeterSearchItem(item);
      if (!meter) return;

      const value = String(meter?.meterId || meter?.id || '');
      if (!value) return;
      optionsByValue.set(value, {
        value,
        label: `Công tơ · ${meter.meterCode || value}`,
        source: 'METER'
      });
    });
    (measuringDevicesResponse?.data?.items || []).forEach((device) => {
      const value = getMeasuringDeviceValue(device);
      if (!value || optionsByValue.has(value)) return;
      optionsByValue.set(value, {
        value,
        label: `Thiết bị đo · ${getMeasuringDeviceLabel(device)}`,
        source: 'MEASURING_DEVICE'
      });
    });
    setOldDeviceOptions(Array.from(optionsByValue.values()));

    if (!metersResponse?.data && !measuringDevicesResponse?.data) {
      showToast({
        type: TYPE_TOAST.ERROR,
        content: 'Tải danh sách thiết bị cũ thất bại'
      });
    }
  }, [hasLoadedOldDevices, oldDeviceLoading]);

  const onOpenOldDeviceDropdown = useCallback(
    (open?: boolean) => {
      if (open) loadOldDeviceOptions();
    },
    [loadOldDeviceOptions]
  );

  const newDeviceOptionsByRow = useMemo(
    () =>
      (detailForms || []).map((detail) => {
        const oldDeviceId = String(detail?.oldDeviceId || '');
        const oldDevice = oldDeviceOptions.find((option) => option.value === oldDeviceId);
        if (!oldDevice) return [];

        return oldDeviceOptions.filter(
          (option) => option.source === oldDevice.source && option.value !== oldDeviceId
        );
      }),
    [detailForms, oldDeviceOptions]
  );

  const onChangeOldDevice = useCallback(
    (index: number, value: string | number) => {
      if (detailForms?.[index]?.oldDeviceId === String(value)) return;

      form.setValue(`details.${index}.newDeviceId`, '', {
        shouldDirty: true,
        shouldValidate: true
      });
    },
    [detailForms, form]
  );

  const buildSearchBody = useCallback(
    (
      appliedFilter: MeterChangeEventFilter,
      page: number,
      size = DEFAULT_PAGE_SIZE
    ): SearchMeterChangeEventsReq => ({
      page: page - K_SIZE_1,
      size,
      eventNo: normalizeText(appliedFilter.eventNo),
      eventType: normalizeText(appliedFilter.eventType),
      customerId: toOptionalCustomerId(appliedFilter.customerId),
      status: normalizeText(appliedFilter.status)
    }),
    []
  );

  const fetchList = useCallback(
    (page: number) => {
      dispatch({
        type: SEARCH_METER_CHANGE_EVENT,
        payload: {
          body: buildSearchBody(filterApplied, page),
          onFailed: (error?: ErrorBase) => {
            showToast({
              type: TYPE_TOAST.ERROR,
              content: getErrorMessage(error, 'Tải danh sách biến động thất bại')
            });
          }
        }
      });
    },
    [buildSearchBody, filterApplied]
  );

  useEffect(() => {
    fetchList(currentPage);
  }, [currentPage, fetchList]);

  const pagination = useMemo(
    () => ({
      current: currentPage,
      total,
      pageSize: DEFAULT_PAGE_SIZE,
      onChange: (page: number) => setCurrentPage(page),
      showSizeChanger: false
    }),
    [currentPage, total]
  );

  const refreshFirstPage = useCallback(() => {
    if (currentPage === K_SIZE_1) {
      fetchList(K_SIZE_1);
      return;
    }
    setCurrentPage(K_SIZE_1);
  }, [currentPage, fetchList]);

  const refreshAfterDelete = useCallback(() => {
    if (meterChangeEventList.length === K_SIZE_1 && currentPage > K_SIZE_1) {
      setCurrentPage(currentPage - K_SIZE_1);
      return;
    }
    fetchList(currentPage);
  }, [currentPage, fetchList, meterChangeEventList.length]);

  const onChangeFilter = useCallback(
    (
      key: keyof MeterChangeEventFilter,
      value: MeterChangeEventFilter[keyof MeterChangeEventFilter]
    ) => {
      setFilter((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const onApplyFilter = useCallback(() => {
    setFilterApplied(filter);
    setCurrentPage(K_SIZE_1);
  }, [filter]);

  const onResetFilter = useCallback((key?: keyof MeterChangeEventFilter) => {
    if (key) {
      setFilter((prev) => ({ ...prev, [key]: DEFAULT_FILTER[key] }));
      setFilterApplied((prev) => ({ ...prev, [key]: DEFAULT_FILTER[key] }));
    } else {
      setFilter(DEFAULT_FILTER);
      setFilterApplied(DEFAULT_FILTER);
    }
    setCurrentPage(K_SIZE_1);
  }, []);

  const fetchDetail = useCallback(
    (
      record: MeterChangeEventWithDetails,
      onSuccess?: (data: MeterChangeEventWithDetails) => void
    ) => {
      const id = getRecordId(record);
      if (!id) {
        showToast({ type: TYPE_TOAST.ERROR, content: 'Không tìm thấy ID phiếu biến động' });
        return;
      }

      dispatch({
        type: GET_METER_CHANGE_EVENT_DETAIL,
        payload: {
          body: { id },
          onSuccess: (response: MeterChangeEventRes) => {
            if (response.data) onSuccess?.(response.data);
          },
          onFailed: (error?: ErrorBase) => {
            showToast({
              type: TYPE_TOAST.ERROR,
              content: getErrorMessage(error, 'Tải chi tiết biến động thất bại')
            });
          }
        }
      });
    },
    []
  );

  const onOpenCreate = useCallback(() => {
    setSelectedEvent(undefined);
    form.reset(buildFormValues());
    setOpenForm(true);
  }, [form]);

  const onOpenUpdate = useCallback(
    (record: MeterChangeEventWithDetails) => {
      const id = getRecordId(record);
      if (!id) {
        showToast({ type: TYPE_TOAST.ERROR, content: 'Không tìm thấy ID phiếu biến động' });
        return;
      }

      setSelectedEvent(record);
      form.reset(buildFormValues(record));
      setOpenForm(true);
      fetchDetail(record, (detail) => {
        setSelectedEvent(detail);
        form.reset(buildFormValues(detail));
      });
    },
    [fetchDetail, form]
  );

  const onCloseForm = useCallback(() => {
    setOpenForm(false);
    setSelectedEvent(undefined);
    submittingRef.current = false;
    form.reset(buildFormValues());
  }, [form]);

  const onOpenDetail = useCallback(
    (record: MeterChangeEventWithDetails) => {
      const id = getRecordId(record);
      if (!id) {
        showToast({ type: TYPE_TOAST.ERROR, content: 'Không tìm thấy ID phiếu biến động' });
        return;
      }

      setSelectedDetail(record);
      setOpenDetail(true);
      fetchDetail(record, setSelectedDetail);
    },
    [fetchDetail]
  );

  const onCloseDetail = useCallback(() => {
    setOpenDetail(false);
    setSelectedDetail(undefined);
  }, []);

  const buildCreateBody = useCallback(
    (data: MeterChangeEventForm): CreateMeterChangeEventReq => ({
      eventNo: data.eventNo.trim(),
      eventType: data.eventType,
      customerId: toOptionalCustomerId(data.customerId),
      eventDate: data.eventDate,
      reason: normalizeText(data.reason),
      status: normalizeText(data.status),
      note: normalizeText(data.note),
      details: buildDetailRequests(data.details)
    }),
    []
  );

  const buildUpdateBody = useCallback(
    (id: number, data: MeterChangeEventForm): UpdateMeterChangeEventReq => ({
      id,
      eventType: data.eventType,
      customerId: toOptionalCustomerId(data.customerId),
      eventDate: data.eventDate,
      reason: normalizeText(data.reason),
      status: normalizeText(data.status),
      note: normalizeText(data.note),
      details: buildDetailRequests(data.details)
    }),
    []
  );

  const onSubmitSuccess = useCallback(
    (content: string, response?: { data?: { warnings?: string[] } }) => {
      submittingRef.current = false;
      onCloseForm();
      refreshFirstPage();
      showToast({ type: TYPE_TOAST.SUCCESS, content });
      // Thay công tơ: BE cảnh báo khi công tơ cũ không thuộc hợp đồng nào đang hiệu lực.
      const warnings = response?.data?.warnings || [];
      if (warnings.length) {
        showToast({ type: TYPE_TOAST.WARNING, content: warnings.join('; ') });
      }
    },
    [onCloseForm, refreshFirstPage]
  );

  const onSubmit = useCallback(
    (data: MeterChangeEventForm) => {
      if (submittingRef.current) return;
      submittingRef.current = true;

      const selectedEventId = getRecordId(selectedEvent);
      if (selectedEventId) {
        dispatch({
          type: UPDATE_METER_CHANGE_EVENT,
          payload: {
            body: buildUpdateBody(selectedEventId, data),
            onSuccess: (response?: { data?: { warnings?: string[] } }) =>
              onSubmitSuccess('Cập nhật biến động thiết bị thành công', response),
            onFailed: (error?: ErrorBase) => {
              submittingRef.current = false;
              showToast({
                type: TYPE_TOAST.ERROR,
                content: getErrorMessage(error, 'Cập nhật biến động thiết bị thất bại')
              });
            }
          }
        });
        return;
      }

      dispatch({
        type: CREATE_METER_CHANGE_EVENT,
        payload: {
          body: buildCreateBody(data),
          onSuccess: (response?: { data?: { warnings?: string[] } }) =>
            onSubmitSuccess('Thêm mới biến động thiết bị thành công', response),
          onFailed: (error?: ErrorBase) => {
            submittingRef.current = false;
            showToast({
              type: TYPE_TOAST.ERROR,
              content: getErrorMessage(error, 'Thêm mới biến động thiết bị thất bại')
            });
          }
        }
      });
    },
    [buildCreateBody, buildUpdateBody, onSubmitSuccess, selectedEvent]
  );

  const onDelete = useCallback(
    (record: MeterChangeEventWithDetails) => {
      const id = getRecordId(record);
      if (!id) {
        showToast({ type: TYPE_TOAST.ERROR, content: 'Không tìm thấy ID phiếu biến động' });
        return;
      }

      showDialog({
        title: t('common:delete_confirm'),
        content: `Bạn có chắc chắn xoá biến động ${record.event?.eventNo || id}?`,
        type: TYPE_MESSAGE.ALERT,
        actions: [
          {
            title: t('common:agree'),
            type: TYPE_ACTION.PRIMARY,
            onPress: () => {
              dispatch({
                type: DELETE_METER_CHANGE_EVENT,
                payload: {
                  body: { id },
                  onSuccess: () => {
                    refreshAfterDelete();
                    showToast({
                      type: TYPE_TOAST.SUCCESS,
                      content: 'Xoá biến động thiết bị thành công'
                    });
                  },
                  onFailed: (error?: ErrorBase) => {
                    showToast({
                      type: TYPE_TOAST.ERROR,
                      content: getErrorMessage(error, 'Xoá biến động thiết bị thất bại')
                    });
                  }
                }
              });
            }
          },
          {
            title: t('common:cancel'),
            type: TYPE_ACTION.SECONDARY
          }
        ]
      });
    },
    [refreshAfterDelete, t]
  );

  const onPlaceholderAction = useCallback((actionName: string) => {
    showToast({
      type: TYPE_TOAST.INFO,
      content: `${actionName} sẽ được kết nối API sau`
    });
  }, []);

  const exportRowsToExcel = useCallback((rows: MeterChangeEventWithDetails[]) => {
    const columns = [
      ['eventNo', 'Mã sự kiện'],
      ['eventType', 'Loại sự kiện'],
      ['customerId', 'Khách hàng'],
      ['eventDate', 'Thời gian sự kiện'],
      ['status', 'Trạng thái'],
      ['performedBy', 'Người thực hiện'],
      ['approvedBy', 'Phê duyệt bởi'],
      ['approvedAt', 'Ngày phê duyệt']
    ];

    const getSafeExcelCellValue = (value: string | number) =>
      escapeHtml(String(sanitizeExcelCellValue(String(value))));
    const headerHtml = columns
      .map(([, label]) => `<th>${getSafeExcelCellValue(label)}</th>`)
      .join('');
    const bodyHtml = rows
      .map(
        (row) =>
          `<tr>${columns
            .map(([key]) => `<td>${getSafeExcelCellValue(getEventDisplayValue(row, key))}</td>`)
            .join('')}</tr>`
      )
      .join('');
    const html = `<html><head><meta charset="UTF-8" /></head><body><table border="1"><thead><tr>${headerHtml}</tr></thead><tbody>${bodyHtml}</tbody></table></body></html>`;
    const blob = new Blob(['\ufeff', html], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${METER_CHANGE_EXPORT_FILE_PREFIX}_${moment().format(
      FORMAT_DATE_TIME_DOWNLOAD
    )}.${METER_CHANGE_EXPORT_FILE_EXT}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  }, []);

  const onExport = useCallback(async () => {
    setExportLoading(true);
    const response = await meterChangeEventServices.searchMeterChangeEvents(
      buildSearchBody(filterApplied, K_SIZE_1, MAX_PAGE_SIZE)
    );
    setExportLoading(false);

    if (!response?.data) {
      showToast({
        type: TYPE_TOAST.ERROR,
        content: getErrorMessage(response, 'Xuất Excel danh sách biến động thất bại')
      });
      return;
    }

    exportRowsToExcel(response.data.items || []);
    showToast({
      type: TYPE_TOAST.SUCCESS,
      content: 'Xuất Excel danh sách biến động thành công'
    });
  }, [buildSearchBody, exportRowsToExcel, filterApplied]);

  const summary = useMemo(() => {
    const counters = {
      totalInPage: meterChangeEventList.length,
      approved: K_SIZE_0,
      pending: K_SIZE_0,
      rejected: K_SIZE_0
    };

    meterChangeEventList.forEach((record) => {
      const label = getEventStatusLabel(record.event?.status);
      if (label === EVENT_STATUS_LABEL_MAP.DA_PHE_DUYET) counters.approved += K_SIZE_1;
      if (label === EVENT_STATUS_LABEL_MAP.CHO_PHE_DUYET) counters.pending += K_SIZE_1;
      if (label === EVENT_STATUS_LABEL_MAP.TU_CHOI) counters.rejected += K_SIZE_1;
    });

    return counters;
  }, [meterChangeEventList]);

  return {
    t,
    meterChangeEventList,
    total,
    summary,
    listLoading,
    detailLoading,
    exportLoading,
    currentPage,
    pagination,
    filter,
    filterApplied,
    openForm,
    openDetail,
    selectedEvent,
    selectedDetail,
    customerOptions,
    oldDeviceOptions,
    newDeviceOptionsByRow,
    form,
    detailFieldArray,
    onOpenCustomerDropdown,
    onOpenOldDeviceDropdown,
    onChangeOldDevice,
    customerDropdownRender,
    onChangeFilter,
    onApplyFilter,
    onResetFilter,
    onOpenCreate,
    onOpenUpdate,
    onCloseForm,
    onOpenDetail,
    onCloseDetail,
    onSubmit,
    onDelete,
    onPlaceholderAction,
    onExport,
    createDefaultDetailForm
  };
}
