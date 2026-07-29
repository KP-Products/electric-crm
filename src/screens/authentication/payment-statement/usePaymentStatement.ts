'use client';

import { showDialog } from 'components/dialog';
import { TYPE_ACTION, TYPE_MESSAGE } from 'components/dialog/type';
import { showToast } from 'components/toast';
import { TYPE_TOAST } from 'components/toast/type';
import dayjs from 'dayjs';
import { PaymentStatementRow, SearchPaymentStatementsReq } from 'model/payment-statement';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import paymentStatementServices from 'services/payment-statement-services';

export interface PaymentStatementFilters {
  periodCode: string;
  customerCode: string;
  invoiceNo: string;
  paymentDateFrom?: string;
  paymentDateTo?: string;
}

const DEFAULT_FILTERS = (): PaymentStatementFilters => ({
  periodCode: dayjs().format('MM/YYYY'),
  customerCode: '',
  invoiceNo: ''
});

const getErrorMessage = (error: any, fallback: string) =>
  error?.businessErrorMessage ||
  error?.systemErrorMessage ||
  error?.detailMessage ||
  error?.message ||
  fallback;

const downloadBlob = (blob: Blob, fileName: string) => {
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(link.href);
};

export default function usePaymentStatement() {
  const [filters, setFilters] = useState<PaymentStatementFilters>(DEFAULT_FILTERS);
  const [rows, setRows] = useState<PaymentStatementRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(20);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const initialized = useRef(false);

  const request = useMemo<SearchPaymentStatementsReq>(
    () => ({
      ...filters,
      paymentDateFrom: filters.paymentDateFrom || undefined,
      paymentDateTo: filters.paymentDateTo || undefined,
      page: page - 1,
      size
    }),
    [filters, page, size]
  );

  const search = useCallback(
    async (nextPage = page, nextFilters = filters, nextSize = size) => {
      setLoading(true);
      const response = await paymentStatementServices.search({
        ...nextFilters,
        paymentDateFrom: nextFilters.paymentDateFrom || undefined,
        paymentDateTo: nextFilters.paymentDateTo || undefined,
        page: nextPage - 1,
        size: nextSize
      });
      setLoading(false);
      if (!response?.data) {
        showToast({
          type: TYPE_TOAST.ERROR,
          content: getErrorMessage(response, 'Không tải được danh sách thanh toán')
        });
        return;
      }
      setRows(response.data.items || []);
      setTotal(response.data.total || 0);
    },
    [filters, page, size]
  );

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    search(1);
  }, [search]); // initial SRS default period

  const onSearch = useCallback(() => {
    setPage(1);
    search(1);
  }, [search]);
  const onPageChange = useCallback(
    (nextPage: number, nextSize?: number) => {
      const appliedSize = nextSize || size;
      if (appliedSize !== size) setSize(appliedSize);
      setPage(nextPage);
      search(nextPage, filters, appliedSize);
    },
    [filters, search, size]
  );

  const reset = useCallback(() => {
    const defaults = DEFAULT_FILTERS();
    setFilters(defaults);
    setPage(1);
    search(1, defaults);
  }, [search]);

  const remove = useCallback(
    (row: PaymentStatementRow) => {
      showDialog({
        title: 'Xóa giao dịch thanh toán',
        content: `Bạn có chắc muốn xóa giao dịch ${row.transactionNo || row.payId}? Hệ thống sẽ hoàn lại trạng thái gạch nợ của các hóa đơn liên quan.`,
        type: TYPE_MESSAGE.CONFIRM,
        actions: [
          { title: 'Hủy', type: TYPE_ACTION.SECONDARY },
          {
            title: 'Xóa',
            type: TYPE_ACTION.PRIMARY,
            onPress: async () => {
              const response = await paymentStatementServices.remove({ payId: row.payId });
              if (
                response?.businessErrorMessage ||
                response?.systemErrorMessage ||
                response?.detailMessage
              ) {
                showToast({
                  type: TYPE_TOAST.ERROR,
                  content: getErrorMessage(response, 'Không thể xóa giao dịch')
                });
                return;
              }
              showToast({ type: TYPE_TOAST.SUCCESS, content: 'Đã xóa giao dịch thanh toán' });
              search(page);
            }
          }
        ]
      });
    },
    [page, search]
  );

  const exportExcel = useCallback(async () => {
    setExporting(true);
    const response = await paymentStatementServices.export(request);
    setExporting(false);
    if (!response.data) {
      showToast({
        type: TYPE_TOAST.ERROR,
        content: getErrorMessage(response, 'Không xuất được Excel')
      });
      return;
    }
    downloadBlob(response.data, response.fileName || 'danh-sach-thanh-toan.xlsx');
  }, [request]);

  return {
    filters,
    setFilters,
    rows,
    total,
    page,
    size,
    loading,
    exporting,
    search,
    onSearch,
    onPageChange,
    reset,
    remove,
    exportExcel,
    getErrorMessage,
    refresh: () => search(page)
  };
}
