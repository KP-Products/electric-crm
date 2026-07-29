'use client';

import { FileExcelOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { Divider, Space } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { AppDatePicker } from 'components/date-picker';
import { AppSelect, AppSelectOption } from 'components/select';
import AppTable from 'components/table';
import { showToast } from 'components/toast';
import { TYPE_TOAST } from 'components/toast/type';
import { TextBase } from 'components/text';
import ButtonBase from 'components/button';
import PageWithBreadcrumb from 'layout/AppLayout/PageWithBreadcumb';
import { ErrorBase } from 'model/common';
import { Customer } from 'model/customer';
import { DebtAgingRow, DebtAgingSummary, DebtPayStatus } from 'model/debt-aging';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import customerServices from 'services/customer-services';
import useDebtAging from './useDebtAging';

dayjs.extend(customParseFormat);

const DATE_FORMAT = 'DD/MM/YYYY';
const API_DATE_FORMATS = ['DD-MM-YYYY', 'DD-MM-YYYY HH:mm:ss', 'YYYY-MM-DD'];

const formatDate = (value?: string | null) =>
  value ? dayjs(value, API_DATE_FORMATS).format(DATE_FORMAT) : '-';

const formatMoney = (value?: number) =>
  value === undefined || value === null ? '-' : new Intl.NumberFormat('vi-VN').format(value);

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

const statusConfig: Record<DebtPayStatus, { label: string; className: string }> = {
  UNPAID: { label: 'Chưa thanh toán', className: 'bg-error-50 text-error-700' },
  PARTIAL: { label: 'Thanh toán một phần', className: 'bg-warning-50 text-warning-700' },
  PAID: { label: 'Đã thanh toán', className: 'bg-success-50 text-success-700' }
};

const SummaryCard = ({
  title,
  count,
  amount,
  highlight = false
}: {
  title: string;
  count?: number;
  amount?: number;
  highlight?: boolean;
}) => (
  <div
    className={`rounded-radius-m border p-16 ${highlight ? 'border-primary-300 bg-primary-50' : 'border-color-300 bg-color-50'}`}
  >
    <TextBase classNames="body3 !text-color-700" text={title} />
    <TextBase classNames="mt-8 title4" text={`${formatMoney(count)} khoản`} />
    <TextBase classNames="mt-4 body2 !text-color-700" text={`${formatMoney(amount)} VNĐ`} />
  </div>
);

const DebtAgingScreen = () => {
  const state = useDebtAging();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerListLoaded, setCustomerListLoaded] = useState(false);
  const isMounted = useRef(true);
  const customerRequestInFlight = useRef(false);

  const customerOptions = useMemo<AppSelectOption[]>(
    () =>
      customers
        .filter((customer) => Boolean(customer.customerCode))
        .map((customer) => ({
          value: customer.customerCode || '',
          label: [customer.customerCode, customer.fullName].filter(Boolean).join(' - ')
        })),
    [customers]
  );

  const loadCustomers = useCallback(async () => {
    if (customerRequestInFlight.current || customerListLoaded) return;

    customerRequestInFlight.current = true;
    try {
      const response = await customerServices.getCustomerList();
      if (!isMounted.current) return;
      if (hasApiError(response)) {
        showToast({
          type: TYPE_TOAST.ERROR,
          content: getErrorMessage(response, 'Không thể tải danh sách khách hàng')
        });
        return;
      }

      setCustomers(Array.isArray(response.data) ? response.data : []);
      setCustomerListLoaded(true);
    } finally {
      customerRequestInFlight.current = false;
    }
  }, [customerListLoaded]);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  const columns = useMemo<ColumnsType<DebtAgingRow>>(
    () => [
      { title: 'STT', width: 64, render: (_value, _row, index) => index + 1 },
      { title: 'Kỳ phát sinh', dataIndex: 'periodCode', width: 120 },
      { title: 'Mã hóa đơn', dataIndex: 'invoiceNo', width: 150, render: (value) => value || '-' },
      { title: 'Mã khách hàng', dataIndex: 'customerCode', width: 150 },
      { title: 'Tên khách hàng', dataIndex: 'customerName', width: 220 },
      { title: 'Ngày thông báo', dataIndex: 'noticeDate', width: 135, render: formatDate },
      { title: 'Hạn thanh toán', dataIndex: 'dueDate', width: 135, render: formatDate },
      { title: 'Ngày thanh toán', dataIndex: 'paymentDate', width: 145, render: formatDate },
      {
        title: 'Trạng thái',
        dataIndex: 'payStatus',
        width: 165,
        render: (value?: DebtPayStatus) => {
          const status = value ? statusConfig[value] : undefined;
          return status ? (
            <span className={`rounded-radius-s px-8 py-4 ${status.className}`}>{status.label}</span>
          ) : (
            '-'
          );
        }
      },
      { title: 'Ngày quá hạn', dataIndex: 'overdueDays', align: 'right', width: 130 },
      { title: 'Tuổi nợ', dataIndex: 'ageDays', align: 'right', width: 110 },
      {
        title: 'Tiền nợ (VNĐ)',
        dataIndex: 'debtAmount',
        align: 'right',
        width: 165,
        render: formatMoney
      },
      {
        title: 'Lãi phạt dự kiến (VNĐ)',
        dataIndex: 'expectedPenalty',
        align: 'right',
        width: 190,
        render: formatMoney
      }
    ],
    []
  );

  const summary = state.summary as DebtAgingSummary | undefined;
  const breadcrumbList = [{ title: 'Chỉ số - Hoá đơn' }, { title: 'Tính tuổi nợ' }];

  return (
    <PageWithBreadcrumb breadcrumbList={breadcrumbList}>
      <section>
        <div>
          <TextBase classNames="title4" text="Tính tuổi nợ" />
          <TextBase
            classNames="body3 !text-color-700"
            text="Theo dõi công nợ, ngày quá hạn và lãi phạt dự kiến"
          />
        </div>
        <Divider />
        <div className="rounded-radius-l border border-color-300 bg-color-50 p-16">
          <div className="grid grid-cols-3 gap-12 tablet:grid-cols-2 mobile:grid-cols-1">
            <AppDatePicker
              name="periodFrom"
              label="Kỳ phát sinh từ"
              labelSuffix={<span className="text-error-600">*</span>}
              wrapperClassName="w-full"
              datePickerClassName="w-full"
              picker="month"
              format="MM/YYYY"
              placeholder="mm/yyyy"
              value={state.filters.periodFrom ? dayjs(state.filters.periodFrom, 'MM/YYYY') : null}
              onChange={(value) =>
                state.setFilters({ ...state.filters, periodFrom: value?.format('MM/YYYY') || '' })
              }
            />
            <AppDatePicker
              name="periodTo"
              label="Kỳ phát sinh đến"
              labelSuffix={<span className="text-error-600">*</span>}
              wrapperClassName="w-full"
              datePickerClassName="w-full"
              picker="month"
              format="MM/YYYY"
              placeholder="mm/yyyy"
              value={state.filters.periodTo ? dayjs(state.filters.periodTo, 'MM/YYYY') : null}
              onChange={(value) =>
                state.setFilters({ ...state.filters, periodTo: value?.format('MM/YYYY') || '' })
              }
            />
            <AppSelect
              name="customerCode"
              label="Mã khách hàng"
              placeholder="Chọn khách hàng"
              options={[{ value: '', label: 'Tất cả' }, ...customerOptions]}
              value={state.filters.customerCode}
              onSelectOption={({ key }) =>
                state.setFilters({ ...state.filters, customerCode: String(key) })
              }
            />
          </div>
          {state.validationError && (
            <TextBase classNames="mt-8 body3 !text-error-600" text={state.validationError} />
          )}
          <Space className="mt-16" wrap>
            <ButtonBase
              type="primary"
              disabled={state.loading}
              onClick={state.calculate}
              customContent={
                <>
                  <SearchOutlined className="mr-8" />
                  {state.loading ? 'Đang tính...' : 'Tính tuổi nợ'}
                </>
              }
            />
            <ButtonBase
              type="ghost"
              disabled={state.loading}
              onClick={state.reset}
              customContent={
                <>
                  <ReloadOutlined className="mr-8" />
                  Làm mới
                </>
              }
            />
            <ButtonBase
              type="secondary"
              disabled={!state.hasCalculated || state.exporting}
              onClick={state.exportExcel}
              customContent={
                <>
                  <FileExcelOutlined className="mr-8" />
                  {state.exporting ? 'Đang xuất...' : 'Xuất Excel'}
                </>
              }
            />
          </Space>
        </div>

        {state.hasCalculated && (
          <>
            <div className="mt-16 grid grid-cols-5 gap-12 desktop:grid-cols-3 tablet:grid-cols-2 mobile:grid-cols-1">
              <SummaryCard
                title="Tổng số khoản nợ"
                count={summary?.totalCount}
                amount={summary?.totalDebt}
                highlight
              />
              <SummaryCard
                title="Chưa đến hạn"
                count={summary?.notYetDueCount}
                amount={summary?.notYetDueAmount}
              />
              <SummaryCard
                title="Quá hạn"
                count={summary?.overdueCount}
                amount={summary?.overdueAmount}
              />
              <SummaryCard
                title="Nợ quá hạn > 90 ngày"
                count={summary?.over90Count}
                amount={summary?.over90Amount}
              />
              <div className="rounded-radius-m border border-color-300 bg-color-50 p-16">
                <TextBase classNames="body3 !text-color-700" text="Tổng lãi phạt dự kiến" />
                <TextBase
                  classNames="mt-8 title4"
                  text={`${formatMoney(summary?.totalExpectedPenalty)} VNĐ`}
                />
              </div>
            </div>
            <div className="mt-16 overflow-hidden rounded-radius-l border border-color-300">
              <AppTable
                rowKey={(row) =>
                  `${row.invoiceNo || ''}-${row.customerCode || ''}-${row.periodCode || ''}`
                }
                loading={state.loading}
                columns={columns as any}
                dataSource={state.rows}
                scroll={{ x: 1900 }}
                pagination={false}
              />
            </div>
          </>
        )}
      </section>
    </PageWithBreadcrumb>
  );
};

export default DebtAgingScreen;
