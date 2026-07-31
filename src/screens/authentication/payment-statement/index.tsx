'use client';

import {
  DeleteOutlined,
  CloudUploadOutlined,
  EditOutlined,
  FileSearchOutlined,
  FileExcelOutlined,
  PlusOutlined,
  SearchOutlined,
  UploadOutlined
} from '@ant-design/icons';
import { Divider, Drawer, Form, Modal, Space, Upload } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs, { Dayjs } from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import PageWithBreadcrumb from 'layout/AppLayout/PageWithBreadcumb';
import {
  CreatePaymentStatementReq,
  PaymentStatementRow,
  PaymentUploadPreviewRow
} from 'model/payment-statement';
import { Bill } from 'model/bill';
import { Customer } from 'model/customer';
import { useCallback, useEffect, useMemo, useState } from 'react';
import billServices from 'services/bill-services';
import customerServices from 'services/customer-services';
import paymentStatementServices from 'services/payment-statement-services';
import { parseFormattedNumber } from 'utils/number-input';
import { formatUploadFileSize, getUploadFileSizeError, isValidUploadFileSize } from 'utils/upload';
import { TextBase } from 'components/text';
import ButtonBase from 'components/button';
import { AppDatePicker } from 'components/date-picker';
import { AppDateRangePicker } from 'components/date-picker/range-picker';
import AppTable from 'components/table';
import AppPagination from 'components/table/pagination';
import { AppSelect, AppSelectOption } from 'components/select';
import { AppTextField } from 'components/text-field';
import { parseRemoteMeterReadingWorkbook } from '../remote-meter-reading/xlsxPreview';
import usePaymentStatement from './usePaymentStatement';

dayjs.extend(customParseFormat);

type PaymentFormValues = Omit<
  CreatePaymentStatementReq,
  'paymentAmount' | 'periodCode' | 'transactionDate' | 'accountingDate'
> & {
  paymentAmount: string | number;
  periodCode?: Dayjs;
  transactionDate: Dayjs;
  accountingDate?: Dayjs;
};

interface LocalUploadRow extends PaymentUploadPreviewRow {
  id: string;
  errors: string[];
}

interface ImportHistoryRow {
  id: string;
  importedAt: string;
  fileName: string;
  total: number;
  success: number;
  failed: number;
  result: string;
}

const ImportStepCard = ({
  children,
  step,
  title
}: {
  children: React.ReactNode;
  step: number;
  title: string;
}) => (
  <div className="min-h-[250px] rounded-radius-m border border-color-300 bg-color-50 p-16">
    <TextBase classNames="sub-title3 !text-primary-700" text={`${step}. ${title}`} />
    <div className="mt-16">{children}</div>
  </div>
);

const DATE_FORMAT = 'DD/MM/YYYY';
const API_DATE_FORMAT = 'DD-MM-YYYY';
const REQUIRED_HEADERS = [
  'periodCode',
  'invoiceNo',
  'customerCode',
  'paymentAmount',
  'accountingDate',
  'transactionDate',
  'sourceAccount',
  'destinationAccount',
  'transactionNo',
  'description'
];
const HEADER_MAP: Record<string, string> = {
  ky_thanh_toan: 'periodCode',
  period_code: 'periodCode',
  ma_hoa_don: 'invoiceNo',
  invoice_no: 'invoiceNo',
  ma_khach_hang: 'customerCode',
  customer_code: 'customerCode',
  customer_id: 'customerCode',
  so_tien_thanh_toan: 'paymentAmount',
  payment_amount: 'paymentAmount',
  ngay_hach_toan: 'accountingDate',
  accounting_date: 'accountingDate',
  ngay_giao_dich: 'transactionDate',
  transaction_date: 'transactionDate',
  tai_khoan_chuyen: 'sourceAccount',
  source_account: 'sourceAccount',
  tai_khoan_nhan: 'destinationAccount',
  destination_account: 'destinationAccount',
  so_giao_dich: 'transactionNo',
  transaction_no: 'transactionNo',
  noi_dung: 'description'
};

const HEADER_LABELS: Record<string, string> = {
  periodCode: 'Kỳ thanh toán',
  invoiceNo: 'Mã hóa đơn',
  customerCode: 'Mã khách hàng',
  paymentAmount: 'Số tiền thanh toán',
  accountingDate: 'Ngày hạch toán',
  transactionDate: 'Ngày phát sinh giao dịch',
  sourceAccount: 'Tài khoản chuyển',
  destinationAccount: 'Tài khoản nhận',
  transactionNo: 'Số giao dịch',
  description: 'Nội dung'
};

const getErrorMessage = (error: any, fallback: string) =>
  error?.businessErrorMessage ||
  error?.systemErrorMessage ||
  error?.detailMessage ||
  error?.message ||
  fallback;
const displayDate = (value?: string) =>
  value
    ? dayjs(value, [API_DATE_FORMAT, 'DD-MM-YYYY HH:mm:ss', 'YYYY-MM-DD']).format(DATE_FORMAT)
    : '-';
const displayMoney = (value?: number) =>
  value === undefined || value === null ? '-' : new Intl.NumberFormat('vi-VN').format(value);
const toApiPeriodCode = (periodCode?: string) => {
  const match = /^(\d{2})\/(\d{4})$/.exec(periodCode?.trim() || '');
  return match ? `${match[2]}${match[1]}` : undefined;
};

const normalizeHeader = (value: string) => HEADER_MAP[value] || value;
const excelDate = (value: unknown) =>
  typeof value === 'number' && value > 20000
    ? dayjs('1899-12-30').add(value, 'day').format('DD-MM-YYYY HH:mm:ss')
    : String(value ?? '').trim();

const buildLocalPreview = async (file: File): Promise<LocalUploadRow[]> => {
  const workbook = await parseRemoteMeterReadingWorkbook(file);
  const sheet = Object.values(workbook.sheets)[0];
  if (!sheet) throw new Error('File Excel không có dữ liệu');
  const headers = sheet.headers.map(normalizeHeader);
  const missing = REQUIRED_HEADERS.filter((header) => !headers.includes(header));
  if (missing.length) throw new Error('File không đúng template');
  return sheet.rows.map((source) => {
    const values: Record<string, string> = {};
    Object.entries(source.values).forEach(([key, value]) => {
      values[normalizeHeader(key)] = excelDate(value);
    });
    const errors: string[] = [];
    REQUIRED_HEADERS.forEach((field) => {
      if (!values[field]) errors.push(`${HEADER_LABELS[field]} không được trống`);
    });
    const amount = parseFormattedNumber(values.paymentAmount);
    if (values.paymentAmount && (amount === undefined || amount <= 0))
      errors.push('Số tiền thanh toán không hợp lệ');
    ['accountingDate', 'transactionDate'].forEach((field) => {
      if (!values[field]) return;
      const date = dayjs(values[field], ['DD-MM-YYYY HH:mm:ss', 'DD-MM-YYYY'], true);
      if (!date.isValid())
        errors.push(
          `${field === 'accountingDate' ? 'Ngày hạch toán' : 'Ngày phát sinh giao dịch'} sai định dạng`
        );
      else if (date.isAfter(dayjs(), 'day'))
        errors.push(
          `${field === 'accountingDate' ? 'Ngày hạch toán' : 'Ngày phát sinh giao dịch'} không được lớn hơn ngày hiện tại`
        );
    });
    if ((values.description || '').length > 250) errors.push('Nội dung không được quá 250 ký tự');
    return {
      id: String(source.rowNumber),
      rowNumber: source.rowNumber,
      ...values,
      paymentAmount: amount,
      errors
    };
  });
};

const PaymentStatementScreen = () => {
  const state = usePaymentStatement();
  const [form] = Form.useForm<PaymentFormValues>();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<PaymentStatementRow>();
  const [saving, setSaving] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File>();
  const [previewRows, setPreviewRows] = useState<LocalUploadRow[]>([]);
  const [uploadError, setUploadError] = useState('');
  const [importHistory, setImportHistory] = useState<ImportHistoryRow[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerLoading, setCustomerLoading] = useState(false);
  const [filterBillOptions, setFilterBillOptions] = useState<AppSelectOption[]>([]);
  const [formBillOptions, setFormBillOptions] = useState<AppSelectOption[]>([]);
  const [formCustomerCode, setFormCustomerCode] = useState('');
  const [formInvoiceNo, setFormInvoiceNo] = useState('');

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

  const loadBillOptions = useCallback(
    async (customerCode: string, periodCode?: string) => {
      const customer = customers.find((item) => item.customerCode === customerCode);
      if (!customerCode) return [];
      const response = await billServices.searchBills({
        customerId: customer?.id,
        periodCode: toApiPeriodCode(periodCode),
        page: 0,
        size: 100
      });
      return (response.data?.items || []).filter((bill) => Boolean(bill.invoiceNo));
    },
    [customers]
  );

  const toBillOptions = useCallback(
    (bills: Bill[]): AppSelectOption[] =>
      bills.map((bill) => ({
        value: bill.invoiceNo || String(bill.id),
        label: [bill.invoiceNo, bill.periodCode, displayMoney(bill.totalAmount)]
          .filter(Boolean)
          .join(' - ')
      })),
    []
  );

  useEffect(() => {
    let active = true;
    const loadCustomers = async () => {
      setCustomerLoading(true);
      const response = await customerServices.getCustomerList();
      if (!active) return;
      setCustomerLoading(false);
      setCustomers(Array.isArray(response.data) ? response.data : []);
    };
    loadCustomers();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    loadBillOptions(state.filters.customerCode, state.filters.periodCode).then((bills) => {
      if (active) setFilterBillOptions(toBillOptions(bills));
    });
    return () => {
      active = false;
    };
  }, [loadBillOptions, state.filters.customerCode, state.filters.periodCode, toBillOptions]);

  useEffect(() => {
    let active = true;
    loadBillOptions(formCustomerCode).then((bills) => {
      if (active) setFormBillOptions(toBillOptions(bills));
    });
    return () => {
      active = false;
    };
  }, [formCustomerCode, loadBillOptions, toBillOptions]);

  const onSelectFilterCustomer = useCallback(
    async (customerCode: string) => {
      state.setFilters({ ...state.filters, customerCode, invoiceNo: '' });
      setFilterBillOptions([]);
      const bills = await loadBillOptions(customerCode, state.filters.periodCode);
      setFilterBillOptions(toBillOptions(bills));
    },
    [loadBillOptions, state, toBillOptions]
  );

  const onSelectFormCustomer = useCallback(
    async (customerCode: string) => {
      setFormCustomerCode(customerCode);
      setFormInvoiceNo('');
      form.setFieldsValue({ customerCode, invoiceNo: undefined });
      setFormBillOptions([]);
      const bills = await loadBillOptions(customerCode);
      setFormBillOptions(toBillOptions(bills));
    },
    [form, loadBillOptions, toBillOptions]
  );

  const invalidCount = previewRows.filter((row) => row.errors.length).length;
  const openCreate = useCallback(() => {
    setEditing(undefined);
    setFormCustomerCode('');
    setFormInvoiceNo('');
    form.resetFields();
    setFormOpen(true);
  }, [form]);
  const openEdit = useCallback(
    (row: PaymentStatementRow) => {
      setEditing(row);
      setFormCustomerCode(row.customerCode || '');
      setFormInvoiceNo(row.invoiceNo || '');
      form.setFieldsValue({
        ...row,
        paymentAmount: row.paymentAmount || '',
        periodCode: row.periodCode ? dayjs(row.periodCode, ['MM/YYYY', 'YYYYMM']) : undefined,
        transactionDate: row.transactionDate
          ? dayjs(row.transactionDate, [API_DATE_FORMAT, 'DD-MM-YYYY HH:mm:ss'])
          : undefined,
        accountingDate: row.accountingDate
          ? dayjs(row.accountingDate, [API_DATE_FORMAT, 'DD-MM-YYYY HH:mm:ss'])
          : undefined
      });
      setFormOpen(true);
    },
    [form]
  );
  const saveForm = useCallback(async () => {
    const values = await form.validateFields();
    const paymentAmount = parseFormattedNumber(values.paymentAmount);
    if (paymentAmount === undefined || paymentAmount <= 0) return;
    setSaving(true);
    const request = {
      ...values,
      paymentAmount,
      periodCode: values.periodCode?.format('YYYYMM'),
      transactionDate: values.transactionDate.format(API_DATE_FORMAT),
      accountingDate: values.accountingDate?.format(API_DATE_FORMAT)
    };
    const response = editing
      ? await paymentStatementServices.update({ ...request, payId: editing.payId })
      : await paymentStatementServices.create(request);
    setSaving(false);
    if (!response?.data) {
      Modal.error({
        title: 'Không thể lưu',
        content: getErrorMessage(response, 'Lưu giao dịch thất bại')
      });
      return;
    }
    setFormOpen(false);
    state.refresh();
  }, [editing, form, state]);

  const selectUploadFile = useCallback(async (file: File) => {
    if (!isValidUploadFileSize(file)) {
      setUploadError(getUploadFileSizeError('file'));
      return false;
    }
    if (!file.name.toLowerCase().endsWith('.xlsx')) {
      setUploadError('File không đúng định dạng. Hiện API chỉ hỗ trợ .xlsx');
      return false;
    }
    setSelectedFile(file);
    setUploadError('');
    setPreviewRows([]);
    try {
      setPreviewRows(await buildLocalPreview(file));
    } catch (error: any) {
      setUploadError(getErrorMessage(error, 'Không đọc được file Excel'));
    }
    return false;
  }, []);
  const confirmUpload = useCallback(async () => {
    if (!selectedFile || invalidCount || uploadError) return;
    setUploading(true);
    const response = await paymentStatementServices.upload({ file: selectedFile });
    setUploading(false);
    const uploadResult = response?.data;
    if (!uploadResult?.success) {
      const errors =
        response?.data?.errors?.join('; ') || getErrorMessage(response, 'Upload dữ liệu thất bại');
      setUploadError(errors);
      return;
    }
    setImportHistory((previous) => [
      {
        id: String(Date.now()),
        importedAt: dayjs().format('DD/MM/YYYY HH:mm'),
        fileName: selectedFile.name,
        total: previewRows.length,
        success: uploadResult.rowCount || previewRows.length,
        failed: 0,
        result: 'Hoàn thành'
      },
      ...previous
    ]);
    setUploadOpen(false);
    setSelectedFile(undefined);
    setPreviewRows([]);
    state.refresh();
  }, [invalidCount, previewRows.length, selectedFile, state, uploadError]);

  const columns = useMemo<ColumnsType<PaymentStatementRow>>(
    () => [
      {
        title: 'STT',
        width: 64,
        render: (_v, _r, index) => (state.page - 1) * state.size + index + 1
      },
      { title: 'Kỳ thanh toán', dataIndex: 'periodCode', width: 120 },
      { title: 'Mã hóa đơn', dataIndex: 'invoiceNo', width: 150 },
      { title: 'Mã khách hàng', dataIndex: 'customerCode', width: 150 },
      { title: 'Tên khách hàng', dataIndex: 'customerName', width: 200 },
      {
        title: 'Số tiền thanh toán',
        dataIndex: 'paymentAmount',
        align: 'right',
        width: 170,
        render: displayMoney
      },
      { title: 'Ngày thanh toán', dataIndex: 'transactionDate', width: 140, render: displayDate },
      { title: 'Tài khoản chuyển', dataIndex: 'sourceAccount', width: 160 },
      { title: 'Tài khoản nhận', dataIndex: 'destinationAccount', width: 160 },
      { title: 'Số giao dịch', dataIndex: 'transactionNo', width: 160 },
      {
        title: 'Người tạo',
        dataIndex: 'createdByName',
        width: 140,
        render: (value) => value || '-'
      },
      { title: 'Ngày tạo', dataIndex: 'createdAt', width: 140, render: displayDate },
      {
        title: 'Thao tác',
        fixed: 'right',
        width: 105,
        render: (_v, row) => (
          <Space>
            <ButtonBase
              type="ghost"
              size={32}
              customContent={<EditOutlined />}
              onClick={() => openEdit(row)}
            />
            <ButtonBase
              type="ghost"
              size={32}
              classNames="!text-error-600"
              customContent={<DeleteOutlined />}
              onClick={() => state.remove(row)}
            />
          </Space>
        )
      }
    ],
    [openEdit, state]
  );

  const previewColumns = useMemo<ColumnsType<LocalUploadRow>>(
    () => [
      { title: 'STT', dataIndex: 'rowNumber', width: 70 },
      { title: 'Kỳ thanh toán', dataIndex: 'periodCode', width: 120 },
      { title: 'Mã hóa đơn', dataIndex: 'invoiceNo', width: 140 },
      { title: 'Mã khách hàng', dataIndex: 'customerCode', width: 140 },
      {
        title: 'Tên khách hàng',
        dataIndex: 'customerName',
        width: 160,
        render: (value) => value || '-'
      },
      {
        title: 'Số tiền',
        dataIndex: 'paymentAmount',
        align: 'right',
        width: 130,
        render: displayMoney
      },
      { title: 'Ngày thanh toán', dataIndex: 'transactionDate', width: 150 },
      { title: 'TK chuyển', dataIndex: 'sourceAccount', width: 140 },
      { title: 'TK nhận', dataIndex: 'destinationAccount', width: 140 },
      { title: 'Số giao dịch', dataIndex: 'transactionNo', width: 150 },
      { title: 'Nội dung', dataIndex: 'description', width: 180 },
      {
        title: 'Lỗi',
        dataIndex: 'errors',
        width: 260,
        render: (errors: string[]) => <span className="text-error-600">{errors.join('; ')}</span>
      }
    ],
    []
  );

  const importHistoryColumns = useMemo<ColumnsType<ImportHistoryRow>>(
    () => [
      { title: 'STT', width: 64, render: (_value, _row, index) => index + 1 },
      { title: 'Thời gian import', dataIndex: 'importedAt', width: 150 },
      { title: 'Tên file import', dataIndex: 'fileName', width: 260 },
      { title: 'Số dòng', dataIndex: 'total', align: 'right', width: 100 },
      { title: 'Thành công', dataIndex: 'success', align: 'right', width: 100 },
      { title: 'Thất bại', dataIndex: 'failed', align: 'right', width: 100 },
      {
        title: 'Kết quả',
        dataIndex: 'result',
        width: 130,
        render: () => (
          <span className="rounded-radius-s bg-success-50 px-8 py-4 text-success-700">
            Hoàn thành
          </span>
        )
      }
    ],
    []
  );

  const breadcrumbList = [{ title: 'Chỉ số - Hoá đơn' }, { title: 'Nhập dữ liệu sao kê' }];
  return (
    <PageWithBreadcrumb breadcrumbList={breadcrumbList}>
      <section>
        <div className="flex items-center justify-between gap-12 mobile:flex-col mobile:items-start">
          <div>
            <TextBase classNames="title4" text="Nhập dữ liệu sao kê" />
            <TextBase
              classNames="body3 !text-color-700"
              text="Quản lý giao dịch thanh toán hóa đơn điện"
            />
          </div>
          <Space wrap className="mobile:w-full mobile:flex-col">
            <ButtonBase
              type="secondary"
              onClick={() => setUploadOpen(true)}
              classNames="mobile:w-full mobile:justify-center"
              customContent={
                <>
                  <UploadOutlined className="mr-8" />
                  Upload lô
                </>
              }
            />
            <ButtonBase
              type="primary"
              onClick={openCreate}
              classNames="mobile:w-full mobile:justify-center"
              customContent={
                <>
                  <PlusOutlined className="mr-8" />
                  Thêm mới
                </>
              }
            />
          </Space>
        </div>
        <Divider />
        <div className="rounded-radius-l border border-color-300 bg-color-50 p-16">
          <div className="grid grid-cols-4 gap-12 desktop:grid-cols-2 tablet:grid-cols-2 mobile:grid-cols-1">
            <AppDatePicker
              name="periodCode"
              label="Kỳ thanh toán"
              labelSuffix={<span className="text-error-600">*</span>}
              wrapperClassName="w-full"
              datePickerClassName="w-full"
              picker="month"
              format="MM/YYYY"
              placeholder="mm/yyyy"
              value={dayjs(state.filters.periodCode, 'MM/YYYY')}
              onChange={(value) =>
                state.setFilters({ ...state.filters, periodCode: value?.format('MM/YYYY') || '' })
              }
            />
            <AppSelect
              name="customerCode"
              label="Mã khách hàng"
              placeholder="Chọn mã khách hàng"
              options={customerOptions}
              isLoading={customerLoading}
              value={state.filters.customerCode}
              onSelectOption={({ key }) => onSelectFilterCustomer(String(key))}
            />
            <AppSelect
              name="invoiceNo"
              label="Mã hóa đơn"
              placeholder={
                state.filters.customerCode ? 'Chọn mã hóa đơn' : 'Chọn mã khách hàng trước'
              }
              options={filterBillOptions}
              disabled={!state.filters.customerCode}
              value={state.filters.invoiceNo}
              onSelectOption={({ key }) =>
                state.setFilters({ ...state.filters, invoiceNo: String(key) })
              }
            />
            <AppDateRangePicker
              name="paymentDateRange"
              label="Ngày thanh toán từ - đến"
              wrapperClassName="w-full"
              datePickerClassName="w-full"
              format={DATE_FORMAT}
              value={[
                state.filters.paymentDateFrom
                  ? dayjs(state.filters.paymentDateFrom, API_DATE_FORMAT)
                  : null,
                state.filters.paymentDateTo
                  ? dayjs(state.filters.paymentDateTo, API_DATE_FORMAT)
                  : null
              ]}
              onChange={(dates) =>
                state.setFilters({
                  ...state.filters,
                  paymentDateFrom: dates?.[0]?.format(API_DATE_FORMAT),
                  paymentDateTo: dates?.[1]?.format(API_DATE_FORMAT)
                })
              }
            />
          </div>
          <Space className="mt-16 flex w-full justify-end">
            <ButtonBase
              type="primary"
              disabled={state.loading}
              onClick={state.onSearch}
              customContent={
                <>
                  <SearchOutlined className="mr-8" />
                  {state.loading ? 'Đang tìm...' : 'Tìm kiếm'}
                </>
              }
            />
            <ButtonBase type="ghost" onClick={state.reset} customContent="Xoá bộ lọc" />
          </Space>
        </div>
        <div className="mt-16 overflow-hidden rounded-radius-l border border-color-300">
          <AppTable
            rowKey="payId"
            loading={state.loading}
            columns={columns as any}
            dataSource={state.rows}
            scroll={{ x: 1900 }}
            pagination={false}
          />
        </div>
        <AppPagination
          currentPage={state.page}
          total={state.total}
          pagination={{
            current: state.page,
            pageSize: state.size,
            total: state.total,
            onChange: state.onPageChange
          }}
        />
      </section>
      <Drawer
        title={editing ? 'Sửa thông tin thanh toán' : 'Thêm mới giao dịch thanh toán'}
        open={formOpen}
        onClose={() => setFormOpen(false)}
        placement="right"
        width={720}
        destroyOnClose
        footer={
          <div className="flex justify-end gap-8">
            <ButtonBase
              type="ghost"
              customContent="Hủy"
              onClick={() => setFormOpen(false)}
              disabled={saving}
            />
            <ButtonBase
              type="primary"
              form="payment-statement-form"
              htmlType="submit"
              disabled={saving}
              customContent={saving ? 'Đang lưu...' : 'Lưu'}
            />
          </div>
        }
      >
        <Form id="payment-statement-form" form={form} layout="vertical" onFinish={saveForm}>
          <div className="grid grid-cols-2 gap-x-12">
            <Form.Item
              name="customerCode"
              rules={[{ required: !editing, message: 'Vui lòng nhập mã khách hàng' }]}
            >
              <AppSelect
                name="formCustomerCode"
                label="Mã khách hàng"
                labelSuffix={<span className="text-error-600">*</span>}
                placeholder="Chọn mã khách hàng"
                options={customerOptions}
                value={formCustomerCode}
                disabled={Boolean(editing)}
                isLoading={customerLoading}
                onSelectOption={({ key }) => onSelectFormCustomer(String(key))}
              />
            </Form.Item>
            <Form.Item name="invoiceNo">
              <AppSelect
                name="formInvoiceNo"
                label="Mã hóa đơn"
                placeholder={formCustomerCode ? 'Chọn mã hóa đơn' : 'Chọn mã khách hàng trước'}
                options={formBillOptions}
                value={formInvoiceNo}
                disabled={!formCustomerCode}
                onSelectOption={({ key }) => {
                  const invoiceNo = String(key);
                  setFormInvoiceNo(invoiceNo);
                  form.setFieldValue('invoiceNo', invoiceNo);
                }}
              />
            </Form.Item>
            <Form.Item name="periodCode">
              <AppDatePicker
                name="periodCode"
                label="Kỳ thanh toán"
                wrapperClassName="w-full"
                datePickerClassName="w-full"
                picker="month"
                format="MM/YYYY"
                placeholder="mm/yyyy"
              />
            </Form.Item>
            <Form.Item
              name="paymentAmount"
              rules={[{ required: true, message: 'Vui lòng nhập số tiền' }]}
            >
              <AppTextField
                name="paymentAmount"
                label="Số tiền thanh toán"
                placeholder={'Nhập số tiền thanh toán'}
                labelSuffix={<span className="text-error-600">*</span>}
                wrapperClassName="w-full"
                formatNumberWithCommas
              />
            </Form.Item>
            <Form.Item
              name="transactionDate"
              rules={[{ required: true, message: 'Vui lòng chọn ngày thanh toán' }]}
            >
              <AppDatePicker
                name="transactionDate"
                label="Ngày thanh toán"
                labelSuffix={<span className="text-error-600">*</span>}
                wrapperClassName="w-full"
                datePickerClassName="w-full"
                format={DATE_FORMAT}
              />
            </Form.Item>
            <Form.Item name="accountingDate">
              <AppDatePicker
                name="accountingDate"
                label="Ngày hạch toán"
                wrapperClassName="w-full"
                datePickerClassName="w-full"
                format={DATE_FORMAT}
              />
            </Form.Item>
            <Form.Item name="sourceAccount" rules={[{ max: 50, message: 'Tối đa 50 ký tự' }]}>
              <AppTextField
                name="sourceAccount"
                label="Tài khoản chuyển"
                placeholder={'Nhập tài khoản chuyển'}
                wrapperClassName="w-full"
              />
            </Form.Item>
            <Form.Item name="destinationAccount" rules={[{ max: 50, message: 'Tối đa 50 ký tự' }]}>
              <AppTextField
                name="destinationAccount"
                label="Tài khoản nhận"
                placeholder={'Nhập tài khoản nhận'}
                wrapperClassName="w-full"
              />
            </Form.Item>
            <Form.Item
              name="transactionNo"
              rules={[
                { required: !editing, message: 'Vui lòng nhập số giao dịch' },
                { max: 100, message: 'Tối đa 100 ký tự' }
              ]}
            >
              <AppTextField
                name="transactionNo"
                label="Số giao dịch"
                placeholder={'Nhập số giao dịch'}
                labelSuffix={!editing ? <span className="text-error-600">*</span> : undefined}
                wrapperClassName="w-full"
              />
            </Form.Item>
            <Form.Item name="description" rules={[{ max: 250, message: 'Tối đa 250 ký tự' }]}>
              <AppTextField
                name="description"
                label="Nội dung"
                wrapperClassName="w-full"
                placeholder={'Nhập nội dung'}
              />
            </Form.Item>
          </div>
        </Form>
      </Drawer>
      <Modal
        title="Upload lô sao kê thanh toán"
        open={uploadOpen}
        onCancel={() => {
          setUploadOpen(false);
          setSelectedFile(undefined);
          setPreviewRows([]);
          setUploadError('');
        }}
        width={1280}
        footer={
          <div className="flex justify-end gap-8">
            <ButtonBase
              type="ghost"
              disabled={uploading}
              onClick={() => {
                setUploadOpen(false);
                setSelectedFile(undefined);
                setPreviewRows([]);
                setUploadError('');
              }}
              customContent="Thoát"
            />
            <ButtonBase
              type="primary"
              disabled={!selectedFile || invalidCount > 0 || Boolean(uploadError) || uploading}
              onClick={confirmUpload}
              customContent={uploading ? 'Đang xác nhận...' : 'Xác nhận'}
            />
          </div>
        }
      >
        <TextBase
          classNames="sub-title2 !text-primary-700"
          text="Import danh sách khách hàng đã thanh toán"
        />
        <div className="mt-16 grid grid-cols-4 gap-12 tablet:grid-cols-2 mobile:grid-cols-1">
          <ImportStepCard step={1} title="Tải file mẫu">
            <TextBase
              classNames="body3 !text-color-700"
              text="Tải file mẫu Excel để nhập dữ liệu đúng định dạng"
            />
            <ButtonBase
              type="ghost"
              classNames="mt-20"
              onClick={async () => {
                const r = await paymentStatementServices.downloadTemplate();
                if (r.data) {
                  const a = document.createElement('a');
                  a.href = URL.createObjectURL(r.data);
                  a.download = r.fileName || 'mau-upload-sao-ke.xlsx';
                  a.click();
                  URL.revokeObjectURL(a.href);
                } else setUploadError(getErrorMessage(r, 'Không tải được file mẫu'));
              }}
              customContent={
                <>
                  <FileExcelOutlined className="mr-8 text-success-700" />
                  Tải file mẫu Excel
                </>
              }
            />
          </ImportStepCard>
          <ImportStepCard step={2} title="Chọn file import">
            <Upload.Dragger
              accept=".xlsx"
              showUploadList={false}
              beforeUpload={selectUploadFile}
              className="!border-primary-200 !bg-primary-50"
            >
              <CloudUploadOutlined className="text-40 text-primary-600" />
              <TextBase classNames="sub-title4 mt-8" text="Kéo thả file Excel vào đây" />
              <TextBase classNames="caption1 mt-4 !text-color-700" text="hoặc" />
              <ButtonBase type="primary" classNames="mt-12" customContent="Chọn file Excel" />
              <TextBase
                classNames="caption1 mt-16 !text-color-700"
                text="Định dạng file: .xlsx | Dung lượng tối đa: 10MB"
              />
            </Upload.Dragger>
            {selectedFile && (
              <TextBase
                classNames="caption1 mt-8 !text-success-700"
                text={`${selectedFile.name} (${formatUploadFileSize(selectedFile.size)})`}
              />
            )}
          </ImportStepCard>
          <ImportStepCard step={3} title="Hướng dẫn import">
            <ul className="list-disc space-y-12 pl-20 text-13 leading-20 text-color-700">
              <li>Các cột có dấu (*) là bắt buộc.</li>
              <li>Ngày thanh toán đúng định dạng dd/MM/yyyy HH:mm:ss.</li>
              <li>Số tiền chỉ nhập số, không có ký tự đặc biệt.</li>
              <li>Mỗi dòng tương ứng một giao dịch thanh toán.</li>
              <li>Không được để trống các cột bắt buộc.</li>
            </ul>
          </ImportStepCard>
          <ImportStepCard step={4} title="Xem trước dữ liệu">
            {selectedFile ? (
              <div className="grid grid-cols-3 gap-8">
                <div className="rounded-radius-m bg-color-100 p-8 text-center text-13">
                  Tổng
                  <br />
                  <b>{previewRows.length}</b>
                </div>
                <div className="rounded-radius-m bg-success-50 p-8 text-center text-13">
                  Hợp lệ
                  <br />
                  <b>{previewRows.length - invalidCount}</b>
                </div>
                <div className="rounded-radius-m bg-error-50 p-8 text-center text-13">
                  Lỗi
                  <br />
                  <b>{invalidCount}</b>
                </div>
              </div>
            ) : (
              <div className="flex h-[160px] flex-col items-center justify-center rounded-radius-m border border-color-300 bg-color-100">
                <FileSearchOutlined className="text-48 text-primary-500" />
                <TextBase
                  classNames="caption1 mt-12 !text-color-700"
                  text="Chưa có file được chọn"
                />
              </div>
            )}
          </ImportStepCard>
        </div>
        {uploadError && <TextBase classNames="mt-12 !text-error-600" text={uploadError} />}
        {selectedFile && (
          <div className="mt-16 overflow-hidden rounded-radius-m border border-color-300">
            <AppTable
              rowKey="id"
              columns={previewColumns as any}
              dataSource={previewRows}
              scroll={{ x: 1900, y: 300 }}
              pagination={{ pageSize: 10 }}
            />
          </div>
        )}
        <div className="mt-24 border-t border-color-300 pt-16">
          <TextBase classNames="sub-title3 !text-primary-700" text="Lịch sử import" />
          <TextBase
            classNames="caption1 mt-4 !text-color-700"
            text="Hiển thị các lần import trong phiên làm việc hiện tại"
          />
          <div className="mt-12 overflow-hidden rounded-radius-m border border-color-300">
            <AppTable
              rowKey="id"
              columns={importHistoryColumns as any}
              dataSource={importHistory}
              pagination={false}
            />
          </div>
        </div>
      </Modal>
    </PageWithBreadcrumb>
  );
};

export default PaymentStatementScreen;
