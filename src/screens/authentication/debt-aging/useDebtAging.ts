'use client';

import { showToast } from 'components/toast';
import { TYPE_TOAST } from 'components/toast/type';
import dayjs from 'dayjs';
import { DebtAgingRequest, DebtAgingRow, DebtAgingSummary } from 'model/debt-aging';
import { useCallback, useState } from 'react';
import debtAgingServices from 'services/debt-aging-services';

export interface DebtAgingFilters {
  periodFrom: string;
  periodTo: string;
  customerCode: string;
}

const DEFAULT_FILTERS = (): DebtAgingFilters => {
  const currentPeriod = dayjs().format('MM/YYYY');
  return { periodFrom: currentPeriod, periodTo: currentPeriod, customerCode: '' };
};

const getErrorMessage = (error: any, fallback: string) =>
  error?.businessErrorMessage ||
  error?.systemErrorMessage ||
  error?.detailMessage ||
  error?.message ||
  fallback;

const isValidPeriod = (period: string) => dayjs(period, 'MM/YYYY', true).isValid();

const toRequest = (filters: DebtAgingFilters): DebtAgingRequest => ({
  periodFrom: filters.periodFrom.trim(),
  periodTo: filters.periodTo.trim(),
  customerCode: filters.customerCode.trim() || undefined
});

const downloadBlob = (blob: Blob, fileName: string) => {
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(link.href);
};

export default function useDebtAging() {
  const [filters, setFilters] = useState<DebtAgingFilters>(DEFAULT_FILTERS);
  const [summary, setSummary] = useState<DebtAgingSummary>();
  const [rows, setRows] = useState<DebtAgingRow[]>([]);
  const [appliedRequest, setAppliedRequest] = useState<DebtAgingRequest>();
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [validationError, setValidationError] = useState('');

  const validate = useCallback((nextFilters: DebtAgingFilters) => {
    if (!isValidPeriod(nextFilters.periodFrom) || !isValidPeriod(nextFilters.periodTo)) {
      return 'Vui lòng chọn kỳ phát sinh từ và kỳ phát sinh đến';
    }
    if (dayjs(nextFilters.periodFrom, 'MM/YYYY').isAfter(dayjs(nextFilters.periodTo, 'MM/YYYY'))) {
      return 'Kỳ phát sinh từ không được lớn hơn kỳ phát sinh đến';
    }
    return '';
  }, []);

  const calculate = useCallback(async () => {
    const error = validate(filters);
    setValidationError(error);
    if (error) return;

    const request = toRequest(filters);
    setLoading(true);
    const response = await debtAgingServices.calculate(request);
    setLoading(false);
    if (!response?.data) {
      showToast({
        type: TYPE_TOAST.ERROR,
        content: getErrorMessage(response, 'Không thể tính tuổi nợ')
      });
      return;
    }

    setSummary(response.data.summary);
    setRows(response.data.rows || []);
    setAppliedRequest(request);
  }, [filters, validate]);

  const reset = useCallback(() => {
    setFilters(DEFAULT_FILTERS());
    setSummary(undefined);
    setRows([]);
    setAppliedRequest(undefined);
    setValidationError('');
  }, []);

  const exportExcel = useCallback(async () => {
    if (!appliedRequest) return;

    setExporting(true);
    const response = await debtAgingServices.exportExcel(appliedRequest);
    setExporting(false);
    if (!response?.data) {
      showToast({
        type: TYPE_TOAST.ERROR,
        content: getErrorMessage(response, 'Không thể xuất Excel')
      });
      return;
    }
    downloadBlob(response.data, response.fileName || 'ket-qua-tinh-tuoi-no.xlsx');
  }, [appliedRequest]);

  return {
    filters,
    setFilters,
    summary,
    rows,
    hasCalculated: Boolean(appliedRequest),
    loading,
    exporting,
    validationError,
    calculate,
    reset,
    exportExcel
  };
}
