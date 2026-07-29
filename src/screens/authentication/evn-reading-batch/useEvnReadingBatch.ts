import { DEFAULT_PAGE_SIZE, K_SIZE_1 } from '@constant';
import { showToast } from 'components/toast';
import { TYPE_TOAST } from 'components/toast/type';
import dayjs from 'dayjs';
import { ErrorBase } from 'model/common';
import {
  EvnReadingBatch,
  EvnReadingBatchStatus,
  SearchEvnReadingBatchesReq
} from 'model/evn-reading-batch';
import { Meter, normalizeMeterSearchItem } from 'model/meter';
import { useCallback, useEffect, useMemo, useState } from 'react';
import evnReadingBatchServices from 'services/evn-reading-batch-services';
import meterServices from 'services/meter-services';
import { METER_TYPE } from '../meter-management/utils/constant';

export interface EvnReadingBatchFilter {
  meterCode: string;
  status: string;
  from: string;
  to: string;
}

export interface EvnBatchForm {
  masterMeterId: string;
  readingDate: string;
  note: string;
}

export const DEFAULT_EVN_READING_BATCH_FILTER: EvnReadingBatchFilter = {
  meterCode: '',
  status: '',
  from: '',
  to: ''
};

export const DEFAULT_EVN_BATCH_FORM: EvnBatchForm = {
  masterMeterId: '',
  readingDate: dayjs().format('YYYY-MM-DD'),
  note: ''
};

const getErrorMessage = (error?: ErrorBase, fallback = 'Thao tác thất bại') =>
  error?.businessErrorMessage ||
  error?.systemErrorMessage ||
  error?.detailMessage ||
  error?.message ||
  fallback;

const hasApiError = (response?: ErrorBase & { codeStatus?: string; error?: unknown }) => {
  if (!response) return true;
  if (
    response.businessErrorMessage ||
    response.systemErrorMessage ||
    response.detailMessage ||
    response.error
  ) {
    return true;
  }
  const status = String(response.codeStatus || '')
    .trim()
    .toLowerCase();
  return Boolean(status && !['success', 'ok', '0', '200', '201', '204'].includes(status));
};

const buildSearchRequest = (
  filter: EvnReadingBatchFilter,
  page: number
): SearchEvnReadingBatchesReq => ({
  page: page - K_SIZE_1,
  size: DEFAULT_PAGE_SIZE,
  meterCode: filter.meterCode.trim() || undefined,
  status: (filter.status || undefined) as EvnReadingBatchStatus | undefined,
  from: filter.from ? normalizeDateForApi(filter.from) : undefined,
  to: filter.to ? normalizeDateForApi(filter.to) : undefined
});

const normalizeDateForApi = (value: string) => {
  const isoDate = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (isoDate) return `${isoDate[3]}-${isoDate[2]}-${isoDate[1]}`;
  return value;
};

const downloadBlob = (blob: Blob, fileName: string) => {
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.URL.revokeObjectURL(url);
};

export default function useEvnReadingBatch() {
  const [filter, setFilter] = useState(DEFAULT_EVN_READING_BATCH_FILTER);
  const [filterApplied, setFilterApplied] = useState(DEFAULT_EVN_READING_BATCH_FILTER);
  const [currentPage, setCurrentPage] = useState(K_SIZE_1);
  const [batches, setBatches] = useState<EvnReadingBatch[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [feederOptions, setFeederOptions] = useState<{ value: string; label: string }[]>([]);
  const [feedersLoading, setFeedersLoading] = useState(false);
  const [detail, setDetail] = useState<EvnReadingBatch>();
  const [childMeters, setChildMeters] = useState<Meter[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchBatches = useCallback(async (page: number, appliedFilter: EvnReadingBatchFilter) => {
    setLoading(true);
    const response = await evnReadingBatchServices.search(buildSearchRequest(appliedFilter, page));
    setLoading(false);
    if (hasApiError(response)) {
      setBatches([]);
      setTotal(0);
      showToast({
        type: TYPE_TOAST.ERROR,
        content: getErrorMessage(response, 'Tải danh sách lô chốt thất bại')
      });
      return;
    }
    setBatches(response.data?.items || []);
    setTotal(response.data?.total || 0);
  }, []);

  const refresh = useCallback(
    () => fetchBatches(currentPage, filterApplied),
    [currentPage, fetchBatches, filterApplied]
  );

  useEffect(() => {
    fetchBatches(currentPage, filterApplied);
  }, [currentPage, fetchBatches, filterApplied]);

  const loadFeederOptions = useCallback(async () => {
    setFeedersLoading(true);
    const responses = await Promise.all(
      [METER_TYPE.FEEDER, METER_TYPE.CONG_TO_TONG].map((meterType) =>
        meterServices.getMeterSearchList({
          page: 0,
          size: 100,
          meterType
        })
      )
    );
    setFeedersLoading(false);
    const successfulResponses = responses.filter((response) => !hasApiError(response));
    if (!successfulResponses.length) {
      showToast({
        type: TYPE_TOAST.ERROR,
        content: getErrorMessage(responses[0], 'Tải danh sách lộ thất bại')
      });
      return;
    }
    const options = successfulResponses
      .flatMap((response) => response.data?.items || [])
      .map(normalizeMeterSearchItem)
      .filter((meter): meter is Meter => Boolean(meter?.id || meter?.meterId))
      .map((meter) => ({
        value: meter.id || meter.meterId,
        label: [meter.meterCode, meter.customerName].filter(Boolean).join(' - ') || meter.meterId
      }));
    setFeederOptions(Array.from(new Map(options.map((option) => [option.value, option])).values()));
  }, []);

  const onOpenDetail = useCallback(async (batch: EvnReadingBatch) => {
    if (!batch.id) return;
    setDetail(batch);
    setChildMeters([]);
    setDetailLoading(true);
    const [detailResponse, metersResponse] = await Promise.all([
      evnReadingBatchServices.detail({ id: batch.id }),
      batch.masterMeterId
        ? evnReadingBatchServices.metersByFeeder({ masterMeterId: batch.masterMeterId })
        : Promise.resolve(undefined)
    ]);
    setDetailLoading(false);
    if (hasApiError(detailResponse) || !detailResponse.data) {
      showToast({
        type: TYPE_TOAST.ERROR,
        content: getErrorMessage(detailResponse, 'Tải chi tiết lô chốt thất bại')
      });
      return;
    }
    setDetail(detailResponse.data);
    if (metersResponse && !hasApiError(metersResponse)) {
      setChildMeters(
        (metersResponse.data || []).map((meter) => ({
          id: meter.meterId,
          meterId: meter.meterId,
          meterCode: meter.meterCode,
          meterType: meter.meterType,
          customerId: meter.customerId,
          customerName: meter.customerName,
          multiplier: meter.multiplier,
          voltageLevel: meter.voltageLevel,
          status: ''
        }))
      );
    }
  }, []);

  const runAction = useCallback(
    async (action: () => Promise<any>, successMessage: string) => {
      setActionLoading(true);
      const response = await action();
      setActionLoading(false);
      if (hasApiError(response)) {
        showToast({ type: TYPE_TOAST.ERROR, content: getErrorMessage(response) });
        return false;
      }
      showToast({ type: TYPE_TOAST.SUCCESS, content: successMessage });
      refresh();
      return true;
    },
    [refresh]
  );

  const onCreate = useCallback(
    (form: EvnBatchForm) => {
      if (!form.masterMeterId || !form.readingDate) {
        showToast({ type: TYPE_TOAST.ERROR, content: 'Vui lòng chọn lộ và ngày chốt' });
        return Promise.resolve(false);
      }
      return runAction(
        () =>
          evnReadingBatchServices.create({
            ...form,
            readingDate: normalizeDateForApi(form.readingDate),
            note: form.note.trim() || undefined
          }),
        'Đã tạo lô chốt nháp'
      );
    },
    [runAction]
  );

  const onUpdate = useCallback(
    (batch: EvnReadingBatch, form: Pick<EvnBatchForm, 'readingDate' | 'note'>) =>
      runAction(
        () =>
          evnReadingBatchServices.update({
            id: batch.id,
            readingDate: normalizeDateForApi(form.readingDate),
            note: form.note.trim() || undefined
          }),
        'Đã cập nhật lô chốt'
      ),
    [runAction]
  );

  const onDelete = useCallback(
    (id: number) => runAction(() => evnReadingBatchServices.delete({ id }), 'Đã xóa lô chốt'),
    [runAction]
  );
  const onSubmit = useCallback(
    (id: number) => runAction(() => evnReadingBatchServices.submit({ id }), 'Đã gửi lô chốt'),
    [runAction]
  );
  const onConfirm = useCallback(
    (id: number) =>
      runAction(() => evnReadingBatchServices.confirm({ id }), 'Đã chốt số điện với EVN'),
    [runAction]
  );
  const onReject = useCallback(
    (id: number, reason: string) =>
      runAction(() => evnReadingBatchServices.reject({ id, reason }), 'Đã từ chối lô chốt'),
    [runAction]
  );

  const onExport = useCallback(async (id: number) => {
    setActionLoading(true);
    const response = await evnReadingBatchServices.exportRecord({ id });
    setActionLoading(false);
    if (!response.data) {
      showToast({
        type: TYPE_TOAST.ERROR,
        content: getErrorMessage(response, 'Xuất biên bản chốt số thất bại')
      });
      return;
    }
    downloadBlob(response.data, response.fileName || `bien-ban-chot-so-evn-${id}.pdf`);
  }, []);

  const pagination = useMemo(
    () => ({
      current: currentPage,
      pageSize: DEFAULT_PAGE_SIZE,
      total,
      showSizeChanger: false,
      onChange: (page: number) => setCurrentPage(page)
    }),
    [currentPage, total]
  );

  return {
    filter,
    batches,
    total,
    loading,
    actionLoading,
    feederOptions,
    feedersLoading,
    detail,
    childMeters,
    detailLoading,
    currentPage,
    pagination,
    onChangeFilter: (key: keyof EvnReadingBatchFilter, value: string) =>
      setFilter((previous) => ({ ...previous, [key]: value })),
    onApplyFilter: () => {
      setFilterApplied(filter);
      setCurrentPage(K_SIZE_1);
    },
    onResetFilter: () => {
      setFilter(DEFAULT_EVN_READING_BATCH_FILTER);
      setFilterApplied(DEFAULT_EVN_READING_BATCH_FILTER);
      setCurrentPage(K_SIZE_1);
    },
    onLoadFeederOptions: loadFeederOptions,
    onOpenDetail,
    onCloseDetail: () => {
      setDetail(undefined);
      setChildMeters([]);
    },
    onCreate,
    onUpdate,
    onDelete,
    onSubmit,
    onConfirm,
    onReject,
    onExport
  };
}
