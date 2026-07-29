import { DEFAULT_PAGE_SIZE, K_SIZE_1 } from '@constant';
import { showToast } from 'components/toast';
import { TYPE_TOAST } from 'components/toast/type';
import { ErrorBase } from 'model/common';
import { Customer } from 'model/customer';
import {
  ReadingPeriodDetail,
  ReadingReviewRow,
  ReadingPeriodStatus,
  ReviewReadingsReq
} from 'model/manual-meter-reading';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import customerServices from 'services/customer-services';
import manualMeterReadingServices from 'services/manual-meter-reading-services';

export interface ReadingApprovalFilter {
  periodCode: string;
  customerCode: string;
  status: string;
}

const DEFAULT_FILTER: ReadingApprovalFilter = {
  periodCode: '',
  customerCode: '',
  status: ''
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

  const codeStatus = String(response.codeStatus || '')
    .trim()
    .toLowerCase();
  return Boolean(codeStatus && !['success', 'ok', '0', '200', '201'].includes(codeStatus));
};

const buildReviewRequest = (filter: ReadingApprovalFilter, page: number): ReviewReadingsReq => ({
  page: page - K_SIZE_1,
  size: DEFAULT_PAGE_SIZE,
  periodCode: filter.periodCode.trim() || undefined,
  customerId: filter.customerCode ? Number(filter.customerCode) : undefined,
  status: (filter.status || undefined) as ReadingPeriodStatus | undefined
});

export default function useReadingDataApproval() {
  const [filter, setFilter] = useState<ReadingApprovalFilter>(DEFAULT_FILTER);
  const [filterApplied, setFilterApplied] = useState<ReadingApprovalFilter>(DEFAULT_FILTER);
  const [currentPage, setCurrentPage] = useState(K_SIZE_1);
  const [rows, setRows] = useState<ReadingReviewRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedPeriodIds, setSelectedPeriodIds] = useState<number[]>([]);
  const [selectedRow, setSelectedRow] = useState<ReadingReviewRow>();
  const [detail, setDetail] = useState<ReadingPeriodDetail>();
  const [detailLoading, setDetailLoading] = useState(false);
  const [customerOptions, setCustomerOptions] = useState<{ value: string; label: string }[]>([]);
  const [customerLoading, setCustomerLoading] = useState(false);
  const detailRequestIdRef = useRef(0);

  const fetchRows = useCallback(async (page: number, appliedFilter: ReadingApprovalFilter) => {
    setLoading(true);
    const response = await manualMeterReadingServices.reviewReadings(
      buildReviewRequest(appliedFilter, page)
    );
    setLoading(false);

    if (hasApiError(response)) {
      setRows([]);
      setTotal(0);
      showToast({
        type: TYPE_TOAST.ERROR,
        content: getErrorMessage(response, 'Tải danh sách phê duyệt thất bại')
      });
      return;
    }

    setRows(response.data?.items || []);
    setTotal(response.data?.total || 0);
  }, []);

  useEffect(() => {
    fetchRows(currentPage, filterApplied);
  }, [currentPage, fetchRows, filterApplied]);

  useEffect(() => {
    let isMounted = true;

    const fetchCustomers = async () => {
      setCustomerLoading(true);
      const response = await customerServices.getCustomerList();
      if (!isMounted) return;

      setCustomerLoading(false);
      if (hasApiError(response)) {
        showToast({
          type: TYPE_TOAST.ERROR,
          content: getErrorMessage(response, 'Tải danh sách khách hàng thất bại')
        });
        return;
      }

      const customers = Array.isArray(response.data) ? response.data : [];
      setCustomerOptions(
        customers
          .filter((customer: Customer) => customer.id !== undefined)
          .map((customer: Customer) => ({
            value: String(customer.id),
            label: [customer.customerCode, customer.fullName].filter(Boolean).join(' - ')
          }))
      );
    };

    fetchCustomers();

    return () => {
      isMounted = false;
    };
  }, []);

  const refresh = useCallback(() => {
    setSelectedPeriodIds([]);
    setSelectedRow(undefined);
    setDetail(undefined);
    setDetailLoading(false);
    detailRequestIdRef.current += K_SIZE_1;
    fetchRows(currentPage, filterApplied);
  }, [currentPage, fetchRows, filterApplied]);

  const onChangeFilter = useCallback((key: keyof ReadingApprovalFilter, value: string) => {
    setFilter((previous) => ({ ...previous, [key]: value }));
  }, []);

  const onApplyFilter = useCallback(() => {
    setFilterApplied(filter);
    setCurrentPage(K_SIZE_1);
    setSelectedPeriodIds([]);
  }, [filter]);

  const onResetFilter = useCallback(() => {
    setFilter(DEFAULT_FILTER);
    setFilterApplied(DEFAULT_FILTER);
    setCurrentPage(K_SIZE_1);
    setSelectedPeriodIds([]);
  }, []);

  const onOpenDetail = useCallback(async (row: ReadingReviewRow) => {
    if (!row.periodId) return;

    const requestId = detailRequestIdRef.current + K_SIZE_1;
    detailRequestIdRef.current = requestId;
    setSelectedRow(row);
    setDetail(undefined);
    setDetailLoading(true);
    const response = await manualMeterReadingServices.getReadingPeriod({ id: row.periodId });
    if (detailRequestIdRef.current !== requestId) return;

    setDetailLoading(false);

    if (hasApiError(response) || !response.data) {
      showToast({
        type: TYPE_TOAST.ERROR,
        content: getErrorMessage(response, 'Tải chi tiết kỳ ghi thất bại')
      });
      return;
    }

    setDetail(response.data);
  }, []);

  const onConfirmPeriods = useCallback(
    async (periodIds: number[]) => {
      if (!periodIds.length) return false;

      setActionLoading(true);
      const response = await manualMeterReadingServices.confirmReadings({ periodIds });
      setActionLoading(false);

      if (hasApiError(response) || !Array.isArray(response.data) || !response.data.length) {
        showToast({
          type: TYPE_TOAST.ERROR,
          content: getErrorMessage(response, 'Phê duyệt số liệu thất bại')
        });
        return false;
      }

      const confirmedResults = response.data.filter(
        (item) => String(item.status || '').toUpperCase() === 'CONFIRMED'
      );
      const confirmedPeriodIds = new Set(confirmedResults.map((item) => item.periodId));
      const confirmedCount = periodIds.filter((periodId) =>
        confirmedPeriodIds.has(periodId)
      ).length;
      const mailFailed = confirmedResults.filter((item) => !item.mailSent).length;
      const failedCount = periodIds.length - confirmedCount;

      showToast({
        type: failedCount ? TYPE_TOAST.WARNING : TYPE_TOAST.SUCCESS,
        content: failedCount
          ? `Đã phê duyệt ${confirmedCount}/${periodIds.length} kỳ.`
          : mailFailed
            ? `Đã phê duyệt. ${mailFailed} kỳ chưa gửi được email.`
            : 'Phê duyệt số liệu thành công'
      });
      refresh();
      return true;
    },
    [refresh]
  );

  const onRejectPeriod = useCallback(
    async (periodId: number, reason: string) => {
      setActionLoading(true);
      const response = await manualMeterReadingServices.rejectReading({ periodId, reason });
      setActionLoading(false);

      if (hasApiError(response)) {
        showToast({
          type: TYPE_TOAST.ERROR,
          content: getErrorMessage(response, 'Từ chối số liệu thất bại')
        });
        return false;
      }

      showToast({
        type: TYPE_TOAST.SUCCESS,
        content: 'Đã từ chối số liệu. Lý do hiện chưa được API lưu lịch sử.'
      });
      refresh();
      return true;
    },
    [refresh]
  );

  const pageStats = useMemo(
    () => ({
      saved: rows.filter((row) => row.status === 'SAVED').length,
      confirmed: rows.filter((row) => row.status === 'CONFIRMED').length,
      rejected: rows.filter((row) => row.status === 'REJECTED').length,
      abnormal: rows.filter((row) => row.abnormal).length
    }),
    [rows]
  );

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
    rows,
    total,
    loading,
    actionLoading,
    currentPage,
    pagination,
    selectedPeriodIds,
    selectedRow,
    detail,
    detailLoading,
    customerOptions,
    customerLoading,
    pageStats,
    onChangeFilter,
    onApplyFilter,
    onResetFilter,
    onSetSelectedPeriodIds: setSelectedPeriodIds,
    onOpenDetail,
    onCloseDetail: () => {
      detailRequestIdRef.current += K_SIZE_1;
      setSelectedRow(undefined);
      setDetail(undefined);
      setDetailLoading(false);
    },
    onConfirmPeriods,
    onRejectPeriod
  };
}
