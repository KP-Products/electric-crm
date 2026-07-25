import { DEFAULT_PAGE_SIZE, K_SIZE_0, K_SIZE_1 } from '@constant';
import { showToast } from 'components/toast';
import { TYPE_TOAST } from 'components/toast/type';
import {
  ManualMeterReadingRow,
  MeterReadingPeriod,
  SearchReadingPeriodsReq,
  UpdateReadingPeriodReq
} from 'model/manual-meter-reading';
import moment from 'moment';
import { useCallback, useEffect, useMemo, useState } from 'react';
import manualMeterReadingServices from 'services/manual-meter-reading-services';
import { FORMAT_DATE_API, displayDateFromServer, normalizeDateToApi } from 'utils/date';

export interface ManualMeterReadingFilter {
  keyword: string;
  area: string;
  status: string;
}

const DEFAULT_FILTER: ManualMeterReadingFilter = {
  keyword: '',
  area: '',
  status: ''
};

const toNumber = (value?: string | number) => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : undefined;
  const normalized = String(value ?? '')
    .replace(/\s/g, '')
    .replace(/\./g, '')
    .replace(',', '.');
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const formatDraftNumber = (value?: number) =>
  value === undefined || value === null || !Number.isFinite(value) ? '' : String(value);

const getErrorMessage = (error?: any, fallback = 'Thao tác thất bại') => {
  return (
    error?.businessErrorMessage ||
    error?.systemErrorMessage ||
    error?.detailMessage ||
    error?.message ||
    fallback
  );
};

const mapPeriodToRow = (period: MeterReadingPeriod): ManualMeterReadingRow => ({
  ...period,
  draftNewIndex: formatDraftNumber(period.newIndex),
  draftNote: period.note || '',
  draftPhotoName: period.photoOriginalFileName
});

export const getManualReadingMetrics = (row: ManualMeterReadingRow) => {
  const oldIndex = row.oldIndex || K_SIZE_0;
  const newIndex = toNumber(row.draftNewIndex);
  const multiplier = row.multiplier || K_SIZE_1;
  const energy = newIndex === undefined ? undefined : (newIndex - oldIndex) * multiplier;
  const abnormal =
    energy !== undefined && (energy < K_SIZE_0 || (oldIndex > K_SIZE_0 && energy > oldIndex * 3));

  return {
    oldIndex,
    newIndex,
    multiplier,
    energy,
    abnormal,
    recorded: newIndex !== undefined
  };
};

export default function useManualMeterReading() {
  const [filter, setFilter] = useState<ManualMeterReadingFilter>(DEFAULT_FILTER);
  const [rows, setRows] = useState<ManualMeterReadingRow[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(K_SIZE_1);
  const [total, setTotal] = useState<number>(K_SIZE_0);
  const [loading, setLoading] = useState<boolean>(false);
  const [savingDraft, setSavingDraft] = useState<boolean>(false);
  const [savingConfirm, setSavingConfirm] = useState<boolean>(false);

  const buildSearchBody = useCallback(
    (page: number): SearchReadingPeriodsReq => ({
      page: page - K_SIZE_1,
      size: DEFAULT_PAGE_SIZE,
      periodCode: undefined
    }),
    []
  );

  const fetchReadingPeriods = useCallback(
    async (page = currentPage) => {
      setLoading(true);
      const response = await manualMeterReadingServices.searchReadingPeriods(buildSearchBody(page));
      setLoading(false);

      if (!response?.data) {
        showToast({
          type: TYPE_TOAST.ERROR,
          content: getErrorMessage(response, 'Tải danh sách chỉ số thủ công thất bại')
        });
        return;
      }

      setRows((response.data.items || []).map(mapPeriodToRow));
      setTotal(response.data.total || K_SIZE_0);
    },
    [buildSearchBody, currentPage]
  );

  useEffect(() => {
    fetchReadingPeriods(currentPage);
  }, [currentPage, fetchReadingPeriods]);

  const periodLabel = useMemo(() => {
    const firstRow = rows[0];
    if (!firstRow) return 'Chưa có kỳ ghi chỉ số';

    return `${firstRow.periodCode || 'Kỳ hiện tại'} | Hạn nhập: ${
      firstRow.periodTo ? displayDateFromServer(firstRow.periodTo) : '-'
    }`;
  }, [rows]);

  const filteredRows = useMemo(() => {
    const keyword = filter.keyword.trim().toLowerCase();

    return rows.filter((row) => {
      const metrics = getManualReadingMetrics(row);
      const matchedKeyword =
        !keyword ||
        row.meterNumber?.toLowerCase().includes(keyword) ||
        row.customerName?.toLowerCase().includes(keyword) ||
        String(row.customerId || '').includes(keyword);
      const matchedArea = !filter.area || row.areaName === filter.area;
      const matchedStatus =
        !filter.status ||
        (filter.status === 'UNRECORDED' && !metrics.recorded) ||
        (filter.status === 'RECORDED' && metrics.recorded && !metrics.abnormal) ||
        (filter.status === 'ABNORMAL' && metrics.abnormal);

      return matchedKeyword && matchedArea && matchedStatus;
    });
  }, [filter, rows]);

  const areaOptions = useMemo(() => {
    return Array.from(new Set(rows.map((row) => row.areaName).filter(Boolean))).map((area) => ({
      label: area as string,
      value: area as string
    }));
  }, [rows]);

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

  const onChangeFilter = useCallback((key: keyof ManualMeterReadingFilter, value: string) => {
    setFilter((prev) => ({ ...prev, [key]: value }));
  }, []);

  const onChangeReading = useCallback((id: number, value: string) => {
    setRows((prev) => prev.map((row) => (row.id === id ? { ...row, draftNewIndex: value } : row)));
  }, []);

  const onChangeNote = useCallback((id: number, value: string) => {
    setRows((prev) => prev.map((row) => (row.id === id ? { ...row, draftNote: value } : row)));
  }, []);

  const onSelectPhoto = useCallback((id: number, file: File) => {
    setRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, draftPhotoName: file.name } : row))
    );
    showToast({
      type: TYPE_TOAST.SUCCESS,
      content: 'Đã chọn ảnh công tơ'
    });
  }, []);

  const buildUpdateBody = useCallback(
    (row: ManualMeterReadingRow): UpdateReadingPeriodReq | null => {
      const metrics = getManualReadingMetrics(row);
      if (metrics.newIndex === undefined) return null;

      return {
        id: row.id,
        periodCode: row.periodCode,
        periodFrom: normalizeDateToApi(row.periodFrom),
        periodTo: normalizeDateToApi(row.periodTo),
        readingDate: normalizeDateToApi(row.readingDate) || moment().format(FORMAT_DATE_API)
      };
    },
    []
  );

  const saveRows = useCallback(
    async (saveMode: 'DRAFT' | 'CONFIRM') => {
      const targetRows = filteredRows
        .map((row) => buildUpdateBody(row))
        .filter(Boolean) as UpdateReadingPeriodReq[];

      if (!targetRows.length) {
        showToast({
          type: TYPE_TOAST.ERROR,
          content: 'Không có bản ghi hợp lệ để lưu'
        });
        return;
      }

      if (saveMode === 'DRAFT') {
        setSavingDraft(true);
      } else {
        setSavingConfirm(true);
      }

      let successCount = K_SIZE_0;
      let failedCount = K_SIZE_0;
      for (const body of targetRows) {
        const response = await manualMeterReadingServices.updateReadingPeriod(body);
        if (response?.data) {
          successCount += K_SIZE_1;
        } else {
          failedCount += K_SIZE_1;
        }
      }

      setSavingDraft(false);
      setSavingConfirm(false);

      if (successCount) {
        showToast({
          type: TYPE_TOAST.SUCCESS,
          content:
            saveMode === 'DRAFT'
              ? `Lưu nháp thành công ${successCount} bản ghi`
              : `Xác nhận và lưu thành công ${successCount} bản ghi`
        });
        fetchReadingPeriods(currentPage);
      }

      if (failedCount) {
        showToast({
          type: TYPE_TOAST.ERROR,
          content: `Có ${failedCount} bản ghi lưu thất bại`
        });
      }
    },
    [buildUpdateBody, currentPage, fetchReadingPeriods, filteredRows]
  );

  return {
    rows,
    filteredRows,
    filter,
    loading,
    savingDraft,
    savingConfirm,
    periodLabel,
    pagination,
    areaOptions,
    onChangeFilter,
    onChangeReading,
    onChangeNote,
    onSelectPhoto,
    onSaveDraft: () => saveRows('DRAFT'),
    onConfirmAndSave: () => saveRows('CONFIRM')
  };
}
