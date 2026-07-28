import { DEFAULT_PAGE_SIZE, K_SIZE_1 } from '@constant';
import { showToast } from 'components/toast';
import { TYPE_TOAST } from 'components/toast/type';
import {
  Bill,
  BillDetail,
  BillNoticeType,
  BillPayStatus,
  BillStatus,
  CreateBillForPeriodReq,
  SearchBillsReq
} from 'model/bill';
import { ErrorBase } from 'model/common';
import { Customer } from 'model/customer';
import { useCallback, useEffect, useMemo, useState } from 'react';
import billServices from 'services/bill-services';
import customerServices from 'services/customer-services';

export interface BillFilter {
  periodCode: string;
  customerId: string;
  meterNumber: string;
  status: string;
  payStatus: string;
}

export const DEFAULT_BILL_FILTER: BillFilter = {
  periodCode: '',
  customerId: '',
  meterNumber: '',
  status: '',
  payStatus: ''
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

const buildSearchBody = (filter: BillFilter, page: number): SearchBillsReq => ({
  page: page - K_SIZE_1,
  size: DEFAULT_PAGE_SIZE,
  periodCode: filter.periodCode.trim() || undefined,
  customerId: filter.customerId ? Number(filter.customerId) : undefined,
  meterNumber: filter.meterNumber.trim() || undefined,
  status: (filter.status || undefined) as BillStatus | undefined,
  payStatus: (filter.payStatus || undefined) as BillPayStatus | undefined
});

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

export default function useElectricityNoticeCspk() {
  const [filter, setFilter] = useState<BillFilter>(DEFAULT_BILL_FILTER);
  const [filterApplied, setFilterApplied] = useState<BillFilter>(DEFAULT_BILL_FILTER);
  const [currentPage, setCurrentPage] = useState(K_SIZE_1);
  const [bills, setBills] = useState<Bill[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [detail, setDetail] = useState<BillDetail>();
  const [detailOpen, setDetailOpen] = useState(false);
  const [customerOptions, setCustomerOptions] = useState<{ value: string; label: string }[]>([]);
  const [customerLoading, setCustomerLoading] = useState(false);

  const fetchBills = useCallback(async (page: number, appliedFilter: BillFilter) => {
    setLoading(true);
    const response = await billServices.searchBills(buildSearchBody(appliedFilter, page));
    setLoading(false);

    if (hasApiError(response)) {
      setBills([]);
      setTotal(0);
      showToast({
        type: TYPE_TOAST.ERROR,
        content: getErrorMessage(response, 'Tải danh sách hóa đơn thất bại')
      });
      return;
    }

    setBills(response.data?.items || []);
    setTotal(response.data?.total || 0);
  }, []);

  useEffect(() => {
    fetchBills(currentPage, filterApplied);
  }, [currentPage, fetchBills, filterApplied]);

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
          .filter((customer: Customer) => Boolean(customer.id))
          .map((customer: Customer) => ({
            value: String(customer.id),
            label:
              [customer.customerCode, customer.fullName].filter(Boolean).join(' - ') ||
              String(customer.id)
          }))
      );
    };

    fetchCustomers();

    return () => {
      isMounted = false;
    };
  }, []);

  const onChangeFilter = useCallback((key: keyof BillFilter, value: string) => {
    setFilter((previous) => ({ ...previous, [key]: value }));
  }, []);

  const onApplyFilter = useCallback(() => {
    setFilterApplied(filter);
    setCurrentPage(K_SIZE_1);
  }, [filter]);

  const onResetFilter = useCallback(() => {
    setFilter(DEFAULT_BILL_FILTER);
    setFilterApplied(DEFAULT_BILL_FILTER);
    setCurrentPage(K_SIZE_1);
  }, []);

  const refresh = useCallback(() => {
    fetchBills(currentPage, filterApplied);
  }, [currentPage, fetchBills, filterApplied]);

  const onCreateBill = useCallback(
    async (body: CreateBillForPeriodReq) => {
      setActionLoading(true);
      const response = await billServices.createBillForPeriod(body);
      setActionLoading(false);

      if (hasApiError(response)) {
        showToast({
          type: TYPE_TOAST.ERROR,
          content: getErrorMessage(response, 'Tính hóa đơn thất bại')
        });
        return false;
      }

      showToast({ type: TYPE_TOAST.SUCCESS, content: 'Tính hóa đơn thành công' });
      refresh();
      return true;
    },
    [refresh]
  );

  const onOpenDetail = useCallback(async (bill: Bill) => {
    setActionLoading(true);
    const response = await billServices.getBillDetail({ billId: bill.id });
    setActionLoading(false);

    if (hasApiError(response) || !response.data) {
      showToast({
        type: TYPE_TOAST.ERROR,
        content: getErrorMessage(response, 'Tải chi tiết hóa đơn thất bại')
      });
      return;
    }

    setDetail(response.data);
    setDetailOpen(true);
  }, []);

  const onConfirmBill = useCallback(
    async (bill: Bill) => {
      setActionLoading(true);
      const response = await billServices.confirmBill({ billId: bill.id });
      setActionLoading(false);

      if (hasApiError(response)) {
        showToast({
          type: TYPE_TOAST.ERROR,
          content: getErrorMessage(response, 'Xác nhận hóa đơn thất bại')
        });
        return;
      }

      const mailMessage = response.data?.mailSent
        ? ' Hóa đơn đã được gửi email.'
        : response.data?.mailNote
          ? ` ${response.data.mailNote}`
          : '';
      showToast({
        type: TYPE_TOAST.SUCCESS,
        content: `Xác nhận hóa đơn thành công.${mailMessage}`
      });
      refresh();
    },
    [refresh]
  );

  const onExportNotice = useCallback(async (bill: Bill, type: BillNoticeType) => {
    setActionLoading(true);
    const response = await billServices.exportBillNotice({ billId: bill.id, type });
    setActionLoading(false);

    if (!response.data) {
      showToast({
        type: TYPE_TOAST.ERROR,
        content: getErrorMessage(response, 'Xuất thông báo thất bại')
      });
      return;
    }

    const extension = type === 'BOTH' ? 'zip' : 'pdf';
    downloadBlob(
      response.data,
      response.fileName || `thong-bao-${type.toLowerCase()}-${bill.id}.${extension}`
    );
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
    bills,
    total,
    loading,
    actionLoading,
    currentPage,
    pagination,
    detail,
    detailOpen,
    customerOptions,
    customerLoading,
    onChangeFilter,
    onApplyFilter,
    onResetFilter,
    onCreateBill,
    onOpenDetail,
    onCloseDetail: () => setDetailOpen(false),
    onConfirmBill,
    onExportNotice
  };
}
