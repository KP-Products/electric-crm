'use client';

import {
  CheckCircleOutlined,
  DownloadOutlined,
  EyeOutlined,
  FilePdfOutlined,
  PlusOutlined,
  SearchOutlined
} from '@ant-design/icons';
import { DEFAULT_PAGE_SIZE, K_SIZE_0, K_SIZE_1, NULL_VALUE } from '@constant';
import { Flex, Modal, Spin, Tooltip } from 'antd';
import ButtonBase from 'components/button';
import { AppDatePicker } from 'components/date-picker';
import { AppSelect } from 'components/select';
import Status, { KIND_STATUS, TYPE_STATUS } from 'components/status';
import AppTable from 'components/table';
import AppPagination from 'components/table/pagination';
import { TextBase } from 'components/text';
import { AppTextField } from 'components/text-field';
import { showToast } from 'components/toast';
import { TYPE_TOAST } from 'components/toast/type';
import { ROUTES } from 'config/routes';
import dayjs from 'dayjs';
import PageWithBreadcrumb from 'layout/AppLayout/PageWithBreadcumb';
import { Bill, BillDetailItem, BillPayStatus, BillStatus } from 'model/bill';
import { useCallback, useMemo, useState } from 'react';
import { displayDateFromServer } from 'utils/date';
import { formatNumberValueWithCommas } from 'utils/number-input';
import useElectricityNoticeCspk from './useElectricityNoticeCspk';

const STATUS_OPTIONS = [
  { value: '', label: 'Tất cả' },
  { value: 'CHO_DUYET', label: 'Đã tính, chờ duyệt' },
  { value: 'CONFIRMED', label: 'Đã chốt/duyệt' }
];

const PAY_STATUS_OPTIONS = [
  { value: '', label: 'Tất cả' },
  { value: 'UNPAID', label: 'Chưa thanh toán' },
  { value: 'PAID', label: 'Đã thanh toán' }
];

const VOLTAGE_LEVEL_OPTIONS = [
  { value: 'HA_AP', label: 'Hạ áp' },
  { value: 'TRUNG_AP', label: 'Trung áp' },
  { value: 'CAO_AP', label: 'Cao áp' }
];

const getBillStatusMeta = (status?: string) => {
  if (status === 'CONFIRMED') return { label: 'Đã chốt/duyệt', type: TYPE_STATUS.SUCCESS };
  if (status === 'CHO_DUYET') return { label: 'Đã tính, chờ duyệt', type: TYPE_STATUS.PENDING };
  return { label: status || NULL_VALUE, type: TYPE_STATUS.DEFAULT };
};

const getPayStatusMeta = (status?: string) => {
  if (status === 'PAID') return { label: 'Đã thanh toán', type: TYPE_STATUS.SUCCESS };
  if (status === 'UNPAID') return { label: 'Chưa thanh toán', type: TYPE_STATUS.PENDING };
  return { label: status || NULL_VALUE, type: TYPE_STATUS.DEFAULT };
};

const formatNumber = (value?: number | string) => {
  if (value === undefined || value === null || value === '') return NULL_VALUE;
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? formatNumberValueWithCommas(numberValue) : String(value);
};

const formatMoney = (value?: number) =>
  value === undefined ? NULL_VALUE : `${formatNumber(value)} đ`;

const ElectricityNoticeCspkScreen = () => {
  const {
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
    onCloseDetail,
    onConfirmBill,
    onExportNotice
  } = useElectricityNoticeCspk();
  const [createOpen, setCreateOpen] = useState(false);
  const [periodId, setPeriodId] = useState('');
  const [voltageLevel, setVoltageLevel] = useState('TRUNG_AP');
  const [vatRate, setVatRate] = useState('8');

  const onSubmitCreate = useCallback(async () => {
    const parsedPeriodId = Number(periodId);
    const parsedVatRate = Number(vatRate);
    if (!Number.isInteger(parsedPeriodId) || parsedPeriodId <= K_SIZE_0) {
      showToast({ type: TYPE_TOAST.ERROR, content: 'Vui lòng nhập ID kỳ ghi chỉ số hợp lệ' });
      return;
    }
    if (!voltageLevel) {
      showToast({ type: TYPE_TOAST.ERROR, content: 'Vui lòng chọn cấp điện áp' });
      return;
    }
    if (vatRate && (!Number.isFinite(parsedVatRate) || parsedVatRate < K_SIZE_0)) {
      showToast({ type: TYPE_TOAST.ERROR, content: 'Thuế suất VAT không hợp lệ' });
      return;
    }

    const created = await onCreateBill({
      periodId: parsedPeriodId,
      voltageLevel,
      vatRate: vatRate ? parsedVatRate : undefined
    });
    if (created) {
      setCreateOpen(false);
      setPeriodId('');
    }
  }, [onCreateBill, periodId, vatRate, voltageLevel]);

  const columns = useMemo<any[]>(
    () => [
      {
        title: 'STT',
        key: 'index',
        align: 'center',
        width: 72,
        render: (_: unknown, __: Bill, index: number) =>
          (currentPage - K_SIZE_1) * DEFAULT_PAGE_SIZE + index + K_SIZE_1
      },
      {
        title: 'Kỳ tính tiền',
        dataIndex: 'periodCode',
        key: 'periodCode',
        width: 130,
        render: (value: string) => value || NULL_VALUE
      },
      {
        title: 'Số công tơ',
        dataIndex: 'meterNumber',
        key: 'meterNumber',
        width: 155,
        render: (value: string) => value || NULL_VALUE
      },
      {
        title: 'Mã / Tên khách hàng',
        key: 'customer',
        width: 200,
        render: () => (
          <Tooltip title="API hóa đơn hiện chưa trả về mã hoặc tên khách hàng.">
            <span className="text-color-600">{NULL_VALUE}</span>
          </Tooltip>
        )
      },
      {
        title: 'Địa chỉ',
        key: 'address',
        width: 200,
        render: () => (
          <Tooltip title="API hóa đơn hiện chưa trả về địa chỉ khách hàng.">
            <span className="text-color-600">{NULL_VALUE}</span>
          </Tooltip>
        )
      },
      {
        title: 'Điện năng (kWh)',
        dataIndex: 'totalKwh',
        key: 'totalKwh',
        align: 'right',
        width: 155,
        render: (value: number) => formatNumber(value)
      },
      {
        title: 'Điện năng CSPK',
        dataIndex: 'totalKwhReactive',
        key: 'totalKwhReactive',
        align: 'right',
        width: 155,
        render: (value: string) => formatNumber(value)
      },
      {
        title: 'Tiền điện',
        dataIndex: 'totalAmount',
        key: 'totalAmount',
        align: 'right',
        width: 155,
        render: (value: number) => formatMoney(value)
      },
      {
        title: 'Tiền CSPK',
        dataIndex: 'totalAmountReactive',
        key: 'totalAmountReactive',
        align: 'right',
        width: 155,
        render: (value: number) => formatMoney(value)
      },
      {
        title: 'Trạng thái xác nhận',
        dataIndex: 'status',
        key: 'status',
        width: 165,
        render: (status: BillStatus) => {
          const meta = getBillStatusMeta(status);
          return <Status type={meta.type} kind={KIND_STATUS.SECONDARY} content={meta.label} />;
        }
      },
      {
        title: 'Thanh toán',
        dataIndex: 'payStatus',
        key: 'payStatus',
        width: 145,
        render: (status: BillPayStatus) => {
          const meta = getPayStatusMeta(status);
          return <Status type={meta.type} kind={KIND_STATUS.SECONDARY} content={meta.label} />;
        }
      },
      {
        title: 'Thao tác',
        key: 'action',
        fixed: 'right',
        align: 'center',
        render: (_: unknown, bill: Bill) => (
          <Flex justify="center" gap={8}>
            <Tooltip title="Xem chi tiết hóa đơn">
              <button
                className="text-color-700 hover:text-primary-600"
                onClick={() => onOpenDetail(bill)}
              >
                <EyeOutlined />
              </button>
            </Tooltip>
            {bill.status !== 'CONFIRMED' && (
              <Tooltip title="Xác nhận hóa đơn và gửi email">
                <button
                  className="text-success-600 hover:text-success-700"
                  onClick={() => onConfirmBill(bill)}
                >
                  <CheckCircleOutlined />
                </button>
              </Tooltip>
            )}
            <Tooltip title="Xuất thông báo tiền điện PDF">
              <button
                className="text-error-500 hover:text-error-600"
                onClick={() => onExportNotice(bill, 'DIEN')}
              >
                <FilePdfOutlined />
              </button>
            </Tooltip>
            <Tooltip title="Xuất thông báo tiền CSPK PDF">
              <button
                className="text-primary-600 hover:text-primary-700"
                onClick={() => onExportNotice(bill, 'CSPK')}
              >
                <DownloadOutlined />
              </button>
            </Tooltip>
          </Flex>
        )
      }
    ],
    [currentPage, onConfirmBill, onExportNotice, onOpenDetail]
  );

  const breadcrumbList = [
    { title: 'Chỉ số - Hoá đơn' },
    { title: 'Quản lý giấy báo tiền điện CSPK', key: ROUTES.ELECTRICITY_NOTICE_CSPK }
  ];

  return (
    <PageWithBreadcrumb breadcrumbList={breadcrumbList}>
      <section>
        <Flex
          justify="space-between"
          align="center"
          gap={8}
          className="mobile:flex-col mobile:items-start"
        >
          <TextBase classNames="title4" text="Quản lý Giấy báo tiền điện CSPK" />
          {/*<ButtonBase*/}
          {/*  type="primary"*/}
          {/*  customContent={*/}
          {/*    <span className="flex items-center gap-8">*/}
          {/*      <PlusOutlined />*/}
          {/*      Tạo kỳ tính tiền mới*/}
          {/*    </span>*/}
          {/*  }*/}
          {/*  onClick={() => setCreateOpen(true)}*/}
          {/*  classNames="mobile:w-full mobile:justify-center"*/}
          {/*/>*/}
        </Flex>

        <div className="mt-16 rounded-radius-l border border-color-300 bg-color-50 p-16">
          <div className="grid grid-cols-4 gap-12 desktop:grid-cols-2 tablet:grid-cols-2 mobile:grid-cols-1">
            <AppDatePicker
              name="periodCode"
              label="Kỳ tính toán"
              placeholder="MM/YYYY"
              wrapperClassName="w-full"
              datePickerClassName="w-full"
              picker="month"
              format="MM/YYYY"
              value={filter.periodCode ? dayjs(filter.periodCode, 'MM/YYYY') : null}
              onChange={(value) => onChangeFilter('periodCode', value?.format('MM/YYYY') || '')}
            />
            <AppSelect
              name="customerId"
              label="Mã khách hàng"
              placeholder="Chọn mã khách hàng"
              value={filter.customerId}
              options={[{ value: '', label: 'Tất cả' }, ...customerOptions]}
              isLoading={customerLoading}
              onSelectOption={({ key }) => onChangeFilter('customerId', String(key))}
            />
            <AppTextField
              name="meterNumber"
              label="Số công tơ"
              placeholder="Nhập số công tơ"
              value={filter.meterNumber}
              onChange={(event) => onChangeFilter('meterNumber', event.target.value)}
              onPressEnter={onApplyFilter}
            />
            <AppSelect
              name="payStatus"
              label="Trạng thái thanh toán"
              options={PAY_STATUS_OPTIONS}
              value={filter.payStatus}
              onSelectOption={({ key }) => onChangeFilter('payStatus', String(key))}
            />
            <AppSelect
              name="status"
              label="Trạng thái xác nhận"
              options={STATUS_OPTIONS}
              value={filter.status}
              onSelectOption={({ key }) => onChangeFilter('status', String(key))}
            />
          </div>
          <Flex justify="end" gap={8} className="mt-16 mobile:w-full">
            <ButtonBase
              type="ghost"
              customContent="Xoá bộ lọc"
              onClick={onResetFilter}
              classNames="mobile:flex-1 mobile:justify-center"
            />
            <ButtonBase
              type="primary"
              customContent={
                <span className="flex items-center gap-8">
                  <SearchOutlined />
                  Tìm kiếm
                </span>
              }
              onClick={onApplyFilter}
              classNames="mobile:flex-1 mobile:justify-center"
            />
          </Flex>
        </div>

        <div className="mt-16 rounded-radius-l border border-color-300 bg-color-50 p-16">
          <Spin spinning={loading || actionLoading}>
            <AppTable
              rootClassName="w-full"
              scroll={{ x: 'max-content' }}
              dataSource={bills}
              columns={columns}
              rowKey={(record: any) => String(record.id)}
              pagination={false}
            />
          </Spin>
          <AppPagination currentPage={currentPage} total={total} pagination={pagination} />
        </div>
      </section>

      <Modal
        title="Tạo kỳ tính tiền mới"
        open={createOpen}
        onCancel={() => setCreateOpen(false)}
        footer={
          <Flex justify="end" gap={8}>
            <ButtonBase
              type="ghost"
              customContent="Huỷ"
              disabled={actionLoading}
              onClick={() => setCreateOpen(false)}
            />
            <ButtonBase
              type="primary"
              customContent="Tính hóa đơn"
              disabled={actionLoading}
              onClick={onSubmitCreate}
            />
          </Flex>
        }
      >
        <div className="grid gap-16 pt-8">
          <Tooltip title="API chưa hỗ trợ tra cứu các kỳ ghi đủ điều kiện tính hóa đơn.">
            <div>
              <AppTextField
                name="periodId"
                label="ID kỳ ghi chỉ số"
                placeholder="Nhập ID kỳ ghi"
                value={periodId}
                onlyNumber
                caption="Nhập ID kỳ ghi do API chưa có chức năng tra cứu kỳ đủ điều kiện"
                onChange={(event) => setPeriodId(event.target.value)}
              />
            </div>
          </Tooltip>
          <AppSelect
            name="voltageLevel"
            label="Cấp điện áp"
            options={VOLTAGE_LEVEL_OPTIONS}
            value={voltageLevel}
            onSelectOption={({ key }) => setVoltageLevel(String(key))}
          />
          <AppTextField
            name="vatRate"
            label="Thuế suất VAT (%)"
            value={vatRate}
            allowDecimal
            onlyNumber
            onChange={(event) => setVatRate(event.target.value)}
          />
        </div>
      </Modal>

      <Modal
        title={`Chi tiết hóa đơn ${detail?.bill?.invoiceNo || detail?.bill?.meterNumber || ''}`}
        open={detailOpen}
        footer={null}
        onCancel={onCloseDetail}
        width={920}
      >
        <div className="mb-16 grid grid-cols-3 gap-12 mobile:grid-cols-1">
          <div>
            <TextBase classNames="caption1 !text-color-700" text="Kỳ tính tiền" />
            <b>{detail?.bill?.periodCode || NULL_VALUE}</b>
          </div>
          <div>
            <TextBase classNames="caption1 !text-color-700" text="Ngày thông báo" />
            <b>
              {detail?.bill?.noticeDate
                ? displayDateFromServer(detail.bill.noticeDate)
                : NULL_VALUE}
            </b>
          </div>
          <div>
            <TextBase classNames="caption1 !text-color-700" text="Hạn thanh toán" />
            <b>{detail?.bill?.dueDate ? displayDateFromServer(detail.bill.dueDate) : NULL_VALUE}</b>
          </div>
        </div>
        <div className="overflow-x-auto rounded-radius-m border border-color-300">
          <table className="w-full min-w-[760px] border-collapse text-14">
            <thead>
              <tr className="bg-color-100 text-left text-13 text-color-800">
                <th className="p-8">TOU</th>
                <th className="p-8 text-right">Chỉ số cũ</th>
                <th className="p-8 text-right">Chỉ số mới</th>
                <th className="p-8 text-right">Hệ số</th>
                <th className="p-8 text-right">kWh</th>
                <th className="p-8 text-right">Đơn giá</th>
                <th className="p-8 text-right">Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              {(detail?.details || []).map((item: BillDetailItem) => (
                <tr key={item.id || item.tou} className="border-t border-color-200">
                  <td className="p-8">{item.tou || NULL_VALUE}</td>
                  <td className="p-8 text-right">{formatNumber(item.oldIndex)}</td>
                  <td className="p-8 text-right">{formatNumber(item.newIndex)}</td>
                  <td className="p-8 text-right">{formatNumber(item.multiplier)}</td>
                  <td className="p-8 text-right">{formatNumber(item.kwh)}</td>
                  <td className="p-8 text-right">{formatMoney(item.unitPrice)}</td>
                  <td className="p-8 text-right">{formatMoney(item.amount)}</td>
                </tr>
              ))}
              {!detail?.details?.length && (
                <tr>
                  <td colSpan={7} className="p-16 text-center text-color-700">
                    Chưa có dòng chi tiết
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Modal>
    </PageWithBreadcrumb>
  );
};

export default ElectricityNoticeCspkScreen;
