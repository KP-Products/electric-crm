'use client';

import {
  DeleteOutlined,
  DownloadOutlined,
  EditOutlined,
  ExportOutlined,
  FileExcelOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  UploadOutlined
} from '@ant-design/icons';
import { Button, DatePicker, Divider, Form, Input, Modal, Space, Table, Upload } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs, { Dayjs } from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import PageWithBreadcrumb from 'layout/AppLayout/PageWithBreadcumb';
import {
  CreatePaymentStatementReq,
  PaymentStatementRow,
  PaymentUploadPreviewRow
} from 'model/payment-statement';
import { useCallback, useMemo, useState } from 'react';
import paymentStatementServices from 'services/payment-statement-services';
import { parseFormattedNumber } from 'utils/number-input';
import { formatUploadFileSize, getUploadFileSizeError, isValidUploadFileSize } from 'utils/upload';
import { TextBase } from 'components/text';
import { parseRemoteMeterReadingWorkbook } from '../remote-meter-reading/xlsxPreview';
import usePaymentStatement from './usePaymentStatement';

dayjs.extend(customParseFormat);

type PaymentFormValues = Omit<
  CreatePaymentStatementReq,
  'paymentAmount' | 'transactionDate' | 'accountingDate'
> & {
  paymentAmount: string | number;
  transactionDate: Dayjs;
  accountingDate?: Dayjs;
};

interface LocalUploadRow extends PaymentUploadPreviewRow {
  id: string;
  errors: string[];
}

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

  const invalidCount = previewRows.filter((row) => row.errors.length).length;
  const openCreate = useCallback(() => {
    setEditing(undefined);
    form.resetFields();
    setFormOpen(true);
  }, [form]);
  const openEdit = useCallback(
    (row: PaymentStatementRow) => {
      setEditing(row);
      form.setFieldsValue({
        ...row,
        paymentAmount: row.paymentAmount || '',
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
    if (!response?.data?.success) {
      const errors =
        response?.data?.errors?.join('; ') || getErrorMessage(response, 'Upload dữ liệu thất bại');
      setUploadError(errors);
      return;
    }
    setUploadOpen(false);
    setSelectedFile(undefined);
    setPreviewRows([]);
    state.refresh();
  }, [invalidCount, selectedFile, state, uploadError]);

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
      { title: 'Người tạo', dataIndex: 'createdBy', width: 140, render: (value) => value || '-' },
      { title: 'Ngày tạo', dataIndex: 'createdAt', width: 140, render: displayDate },
      {
        title: 'Thao tác',
        fixed: 'right',
        width: 105,
        render: (_v, row) => (
          <Space>
            <Button
              type="text"
              aria-label="Sửa"
              icon={<EditOutlined />}
              onClick={() => openEdit(row)}
            />
            <Button
              type="text"
              danger
              aria-label="Xóa"
              icon={<DeleteOutlined />}
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
          <Space wrap>
            <Button icon={<ExportOutlined />} loading={state.exporting} onClick={state.exportExcel}>
              Xuất Excel
            </Button>
            <Button icon={<UploadOutlined />} onClick={() => setUploadOpen(true)}>
              Upload lô
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              Thêm mới
            </Button>
          </Space>
        </div>
        <Divider />
        <div className="rounded-radius-l border border-color-300 bg-color-50 p-16">
          <div className="grid grid-cols-4 gap-12 tablet:grid-cols-2 mobile:grid-cols-1">
            <div>
              <label className="text-14 font-semibold">
                Kỳ thanh toán <span className="text-error-600">*</span>
              </label>
              <DatePicker
                picker="month"
                className="mt-4 w-full"
                format="MM/YYYY"
                value={dayjs(state.filters.periodCode, 'MM/YYYY')}
                onChange={(value) =>
                  state.setFilters({ ...state.filters, periodCode: value?.format('MM/YYYY') || '' })
                }
              />
            </div>
            <div>
              <label className="text-14 font-semibold">Mã khách hàng</label>
              <Input
                className="mt-4"
                value={state.filters.customerCode}
                onChange={(e) =>
                  state.setFilters({ ...state.filters, customerCode: e.target.value })
                }
              />
            </div>
            <div>
              <label className="text-14 font-semibold">Mã hóa đơn</label>
              <Input
                className="mt-4"
                value={state.filters.invoiceNo}
                onChange={(e) => state.setFilters({ ...state.filters, invoiceNo: e.target.value })}
              />
            </div>
            <div>
              <label className="text-14 font-semibold">Ngày thanh toán từ - đến</label>
              <DatePicker.RangePicker
                className="mt-4 w-full"
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
          </div>
          <Space className="mt-16">
            <Button
              type="primary"
              icon={<SearchOutlined />}
              loading={state.loading}
              onClick={state.onSearch}
            >
              Tìm kiếm
            </Button>
            <Button icon={<ReloadOutlined />} onClick={state.reset}>
              Làm mới
            </Button>
          </Space>
        </div>
        <div className="mt-16 overflow-hidden rounded-radius-l border border-color-300">
          <Table
            rowKey="payId"
            loading={state.loading}
            columns={columns}
            dataSource={state.rows}
            scroll={{ x: 1900 }}
            pagination={{
              current: state.page,
              pageSize: state.size,
              total: state.total,
              showSizeChanger: true,
              onChange: state.onPageChange
            }}
          />
        </div>
      </section>
      <Modal
        title={editing ? 'Sửa thông tin thanh toán' : 'Thêm mới giao dịch thanh toán'}
        open={formOpen}
        onCancel={() => setFormOpen(false)}
        onOk={saveForm}
        confirmLoading={saving}
        okText="Lưu"
        cancelText="Hủy"
        width={720}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <div className="grid grid-cols-2 gap-x-12">
            <Form.Item
              name="customerCode"
              label="Mã khách hàng"
              rules={[{ required: !editing, message: 'Vui lòng nhập mã khách hàng' }]}
            >
              <Input disabled={Boolean(editing)} />
            </Form.Item>
            <Form.Item name="invoiceNo" label="Mã hóa đơn">
              <Input />
            </Form.Item>
            <Form.Item name="periodCode" label="Kỳ thanh toán">
              <Input placeholder="MM/YYYY" />
            </Form.Item>
            <Form.Item
              name="paymentAmount"
              label="Số tiền thanh toán"
              rules={[{ required: true, message: 'Vui lòng nhập số tiền' }]}
            >
              <Input inputMode="numeric" />
            </Form.Item>
            <Form.Item
              name="transactionDate"
              label="Ngày thanh toán"
              rules={[{ required: true, message: 'Vui lòng chọn ngày thanh toán' }]}
            >
              <DatePicker className="w-full" format={DATE_FORMAT} />
            </Form.Item>
            <Form.Item name="accountingDate" label="Ngày hạch toán">
              <DatePicker className="w-full" format={DATE_FORMAT} />
            </Form.Item>
            <Form.Item
              name="sourceAccount"
              label="Tài khoản chuyển"
              rules={[{ max: 50, message: 'Tối đa 50 ký tự' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="destinationAccount"
              label="Tài khoản nhận"
              rules={[{ max: 50, message: 'Tối đa 50 ký tự' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="transactionNo"
              label="Số giao dịch"
              rules={[
                { required: !editing, message: 'Vui lòng nhập số giao dịch' },
                { max: 100, message: 'Tối đa 100 ký tự' }
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="description"
              label="Nội dung"
              rules={[{ max: 250, message: 'Tối đa 250 ký tự' }]}
            >
              <Input.TextArea rows={3} />
            </Form.Item>
          </div>
        </Form>
      </Modal>
      <Modal
        title="Upload lô sao kê thanh toán"
        open={uploadOpen}
        onCancel={() => {
          setUploadOpen(false);
          setSelectedFile(undefined);
          setPreviewRows([]);
          setUploadError('');
        }}
        onOk={confirmUpload}
        okText="Xác nhận"
        cancelText="Thoát"
        confirmLoading={uploading}
        okButtonProps={{ disabled: !selectedFile || invalidCount > 0 || Boolean(uploadError) }}
        width={1280}
      >
        <p className="mb-12 text-color-700">
          Chọn file Excel mẫu, tối đa 10MB. Hệ thống hiện chỉ nhận .xlsx theo API.
        </p>
        <Space>
          <Button
            icon={<DownloadOutlined />}
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
          >
            Tải file mẫu
          </Button>
          <Upload accept=".xlsx" showUploadList={false} beforeUpload={selectUploadFile}>
            <Button icon={<FileExcelOutlined />}>
              {selectedFile ? selectedFile.name : 'Chọn file dữ liệu'}
            </Button>
          </Upload>
          {selectedFile && (
            <span className="text-color-700">{formatUploadFileSize(selectedFile.size)}</span>
          )}
        </Space>
        {uploadError && <p className="mt-12 text-error-600">{uploadError}</p>}
        <div className="mt-16 grid grid-cols-3 gap-12">
          <div className="rounded-radius-m bg-color-100 p-12">
            Tổng số lượng: <b>{previewRows.length}</b>
          </div>
          <div className="rounded-radius-m bg-success-50 p-12">
            Hợp lệ: <b>{previewRows.length - invalidCount}</b>
          </div>
          <div className="rounded-radius-m bg-error-50 p-12">
            Không hợp lệ: <b>{invalidCount}</b>
          </div>
        </div>
        <div className="mt-16 overflow-hidden rounded-radius-m border border-color-300">
          <Table
            rowKey="id"
            columns={previewColumns}
            dataSource={previewRows}
            scroll={{ x: 1900, y: 360 }}
            pagination={{ pageSize: 10 }}
          />
        </div>
      </Modal>
    </PageWithBreadcrumb>
  );
};

export default PaymentStatementScreen;
