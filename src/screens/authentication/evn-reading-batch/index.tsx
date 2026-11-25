'use client';

import {
  CheckCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  FileExcelOutlined,
  MoreOutlined,
  SearchOutlined
} from '@ant-design/icons';
import { DEFAULT_PAGE_SIZE, K_SIZE_1, NULL_VALUE } from '@constant';
import { Drawer, Dropdown, Flex, Input, Modal, Spin } from 'antd';
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
import PageWithBreadcrumb from 'layout/AppLayout/PageWithBreadcumb';
import { EvnReadingBatch } from 'model/evn-reading-batch';
import dayjs from 'dayjs';
import { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { displayDateFromServer, displayDateTimeFromServer } from 'utils/date';
import { formatNumberValueWithCommas } from 'utils/number-input';
import useEvnReadingBatch, { DEFAULT_EVN_BATCH_FORM, EvnBatchForm } from './useEvnReadingBatch';

// Trạng thái lô theo BE (BatchStatus) — trạng thái do BE tự tính khi lưu chỉ số qua save-readings.
const STATUS_OPTIONS = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: 'CHUA_NHAP', label: 'Chưa nhập' },
  { value: 'DA_NHAP', label: 'Đã nhập' },
  { value: 'NHAP_LOI', label: 'Nhập lỗi' },
  { value: 'CHO_CHOT', label: 'Chờ chốt' },
  { value: 'DA_CHOT', label: 'Đã chốt' }
];

const STATUS_TYPES: Record<string, TYPE_STATUS> = {
  CHUA_NHAP: TYPE_STATUS.DISABLED,
  DA_NHAP: TYPE_STATUS.PENDING,
  NHAP_LOI: TYPE_STATUS.ERROR,
  CHO_CHOT: TYPE_STATUS.CONFIRM,
  DA_CHOT: TYPE_STATUS.SUCCESS
};

const getStatusMeta = (status?: string, statusLabel?: string) => {
  const code = status?.toUpperCase() || '';
  return {
    label:
      statusLabel ||
      STATUS_OPTIONS.find((option) => option.value && option.value === code)?.label ||
      status ||
      NULL_VALUE,
    type: STATUS_TYPES[code] || TYPE_STATUS.DEFAULT
  };
};

const formatDate = (value?: string) => (value ? displayDateFromServer(value) : NULL_VALUE);
const formatDateTime = (value?: string) => (value ? displayDateTimeFromServer(value) : NULL_VALUE);
const formatNumber = (value?: number) =>
  value === undefined || value === null ? NULL_VALUE : formatNumberValueWithCommas(value);

const isConfirmed = (batch: EvnReadingBatch) => batch.status?.toUpperCase() === 'DA_CHOT';

const toDatePickerValue = (value?: string) => {
  if (!value) return null;
  const parsed = dayjs(value, ['YYYY-MM-DD', 'DD-MM-YYYY'], true);
  return parsed.isValid() ? parsed : null;
};

const EvnReadingBatchScreen = () => {
  const router = useRouter();
  const {
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
    onChangeFilter,
    onApplyFilter,
    onResetFilter,
    onOpenDetail,
    onCloseDetail,
    onCreate,
    onUpdate,
    onDelete,
    onConfirm,
    onExport
  } = useEvnReadingBatch();
  const [formOpen, setFormOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState<EvnReadingBatch>();
  const [form, setForm] = useState<EvnBatchForm>(DEFAULT_EVN_BATCH_FORM);
  const [confirmBatch, setConfirmBatch] = useState<EvnReadingBatch>();
  const [confirmationAction, setConfirmationAction] = useState<'delete' | 'confirm'>();

  const openReadingInput = useCallback(
    (batch?: EvnReadingBatch) => {
      const params = new URLSearchParams();
      if (batch?.masterMeterId) params.set('feederId', batch.masterMeterId);
      if (batch?.id) params.set('batchId', String(batch.id));
      if (batch?.periodCode) params.set('periodCode', batch.periodCode);
      if (batch?.periodNo) params.set('periodNo', String(batch.periodNo));
      if (batch?.periodFrom) params.set('periodFrom', batch.periodFrom);
      if (batch?.periodTo) params.set('periodTo', batch.periodTo);
      if (batch?.readingDate) params.set('readingDate', batch.readingDate);
      const query = params.toString();
      router.push(`${ROUTES.EVN_READING_BATCH_INPUT}${query ? `?${query}` : ''}`);
    },
    [router]
  );

  const openEdit = useCallback((batch: EvnReadingBatch) => {
    setEditingBatch(batch);
    setForm({
      masterMeterId: batch.masterMeterId || '',
      readingDate: batch.readingDate || '',
      note: batch.note || ''
    });
    setFormOpen(true);
  }, []);

  const submitForm = useCallback(async () => {
    if (form.note.length > 250) {
      showToast({ type: TYPE_TOAST.ERROR, content: 'Ghi chú không được vượt quá 250 ký tự' });
      return;
    }
    const success = editingBatch ? await onUpdate(editingBatch, form) : await onCreate(form);
    if (success) setFormOpen(false);
  }, [editingBatch, form, onCreate, onUpdate]);

  const columns = useMemo<any[]>(
    () => [
      {
        title: 'STT',
        key: 'index',
        width: 70,
        align: 'center',
        render: (_: unknown, __: EvnReadingBatch, index: number) =>
          (currentPage - K_SIZE_1) * DEFAULT_PAGE_SIZE + index + K_SIZE_1
      },
      {
        title: 'Mã lộ',
        key: 'feederCode',
        width: 110,
        render: (_: unknown, batch: EvnReadingBatch) =>
          batch.feederCode || batch.meterCode || NULL_VALUE
      },
      {
        title: 'Tên lộ',
        dataIndex: 'feederName',
        key: 'feederName',
        width: 165,
        render: (value: string) => value || NULL_VALUE
      },
      {
        title: 'Địa chỉ',
        dataIndex: 'address',
        key: 'address',
        width: 220,
        render: (value: string) => value || NULL_VALUE
      },
      {
        title: 'Tổng số công tơ',
        dataIndex: 'totalMeterCount',
        key: 'totalMeterCount',
        width: 105,
        align: 'center',
        render: formatNumber
      },
      {
        title: 'Kỳ ghi chỉ số',
        key: 'periodCode',
        width: 115,
        align: 'center',
        render: (_: unknown, batch: EvnReadingBatch) =>
          batch.periodCode
            ? `${batch.periodCode}${batch.periodNo ? ` - Kỳ ${batch.periodNo}` : ''}`
            : NULL_VALUE
      },
      {
        title: 'Từ ngày ghi chỉ số',
        key: 'periodFrom',
        width: 135,
        render: (_: unknown, batch: EvnReadingBatch) => formatDate(batch.periodFrom)
      },
      {
        title: 'Đến ngày ghi chỉ số',
        key: 'periodTo',
        width: 145,
        render: (_: unknown, batch: EvnReadingBatch) => formatDate(batch.periodTo)
      },
      {
        title: 'Trạng thái nhập',
        key: 'inputStatus',
        width: 125,
        render: (_: unknown, batch: EvnReadingBatch) => {
          const meta = getStatusMeta(batch.status, batch.statusLabel);
          return <Status type={meta.type} kind={KIND_STATUS.SECONDARY} content={meta.label} />;
        }
      },
      {
        title: 'Người nhập',
        key: 'enteredBy',
        width: 110,
        render: (_: unknown, batch: EvnReadingBatch) => batch.enteredBy || NULL_VALUE
      },
      {
        title: 'Cập nhật lúc',
        key: 'enteredAt',
        width: 145,
        render: (_: unknown, batch: EvnReadingBatch) => formatDateTime(batch.enteredAt)
      },
      {
        title: 'Thao tác',
        key: 'action',
        fixed: 'right',
        width: 105,
        align: 'center',
        render: (_: unknown, batch: EvnReadingBatch) => {
          const status = batch.status?.toUpperCase();
          const menuItems = [
            {
              key: 'input',
              icon: <EditOutlined />,
              label: 'Nhập chỉ số',
              disabled: isConfirmed(batch),
              onClick: () => openReadingInput(batch)
            },
            {
              key: 'detail',
              icon: <EyeOutlined />,
              label: 'Xem chi tiết',
              onClick: () => onOpenDetail(batch)
            },
            {
              key: 'export',
              icon: <FileExcelOutlined />,
              label: 'Xuất biên bản (Excel)',
              disabled: actionLoading,
              onClick: () => onExport(batch.id)
            },
            // Điều kiện theo BE: sửa khi chưa chốt, xóa khi Chưa nhập, chốt khi Đã nhập / Chờ chốt.
            ...(!isConfirmed(batch)
              ? [
                  {
                    key: 'edit',
                    icon: <EditOutlined />,
                    label: 'Sửa lô',
                    onClick: () => openEdit(batch)
                  }
                ]
              : []),
            ...(status === 'CHUA_NHAP'
              ? [
                  {
                    key: 'delete',
                    icon: <DeleteOutlined />,
                    label: 'Xóa lô',
                    danger: true,
                    onClick: () => {
                      setConfirmBatch(batch);
                      setConfirmationAction('delete');
                    }
                  }
                ]
              : []),
            ...(status === 'DA_NHAP' || status === 'CHO_CHOT'
              ? [
                  {
                    key: 'confirm',
                    icon: <CheckCircleOutlined />,
                    label: 'Chốt số điện',
                    onClick: () => {
                      setConfirmBatch(batch);
                      setConfirmationAction('confirm');
                    }
                  }
                ]
              : [])
          ];
          return (
            <Dropdown menu={{ items: menuItems }} trigger={['click']}>
              <span>
                <MoreOutlined className={'cursor-pointer'} />
              </span>
            </Dropdown>
          );
        }
      }
    ],
    [actionLoading, currentPage, onExport, onOpenDetail, openEdit, openReadingInput]
  );

  const detailColumns = useMemo<any[]>(
    () => [
      {
        title: 'Số công tơ',
        dataIndex: 'meterCode',
        key: 'meterCode',
        render: (value: string) => value || NULL_VALUE
      },
      {
        title: 'Mã KH',
        dataIndex: 'customerId',
        key: 'customerId',
        render: (value: string) => value || NULL_VALUE
      },
      {
        title: 'Tên khách hàng',
        dataIndex: 'customerName',
        key: 'customerName',
        render: (value: string) => value || NULL_VALUE
      },
      {
        title: 'Hệ số nhân',
        dataIndex: 'multiplier',
        key: 'multiplier',
        align: 'right',
        render: formatNumber
      }
    ],
    []
  );

  const confirmationCopy =
    confirmationAction === 'delete'
      ? 'Xóa lô chốt nháp này?'
      : 'Xác nhận chốt số điện với EVN? Sau khi chốt, lô không thể chỉnh sửa.';
  const runConfirmation = useCallback(async () => {
    if (!confirmBatch) return;
    const action = confirmationAction === 'delete' ? onDelete : onConfirm;
    if (await action(confirmBatch.id)) {
      setConfirmBatch(undefined);
      setConfirmationAction(undefined);
    }
  }, [confirmBatch, confirmationAction, onConfirm, onDelete]);

  return (
    <PageWithBreadcrumb
      breadcrumbList={[
        { title: 'Chỉ số - Hoá đơn' },
        { title: 'Quản lý chỉ số thủ công theo lộ', key: ROUTES.EVN_READING_BATCH }
      ]}
    >
      <section>
        <Flex justify="space-between" align="center" gap={12} wrap="wrap">
          <div>
            <TextBase
              classNames="sub-title2 !text-color-900"
              text="Quản lý chỉ số thủ công theo lộ"
            />
            <TextBase
              classNames="body2 !text-color-600"
              text="Theo dõi, nhập và chốt chỉ số điện theo từng lộ"
            />
          </div>
          <ButtonBase
            type="primary"
            customContent={
              <span className="flex items-center gap-8">
                <EditOutlined />
                Nhập chỉ số
              </span>
            }
            onClick={() => openReadingInput()}
          />
        </Flex>
        <div className="mt-16 rounded-radius-l border border-color-300 bg-color-50 p-16">
          <div className="grid grid-cols-4 gap-12 desktop:grid-cols-2 tablet:grid-cols-2 mobile:grid-cols-1">
            <AppTextField
              name="meterCode"
              label="Mã lộ"
              placeholder="Nhập mã lộ"
              value={filter.meterCode}
              onChange={(event) => onChangeFilter('meterCode', event.target.value)}
              onPressEnter={onApplyFilter}
            />
            <AppSelect
              name="status"
              label="Trạng thái"
              options={STATUS_OPTIONS}
              value={filter.status}
              onSelectOption={({ key }) => onChangeFilter('status', String(key))}
            />
            <AppDatePicker
              name="from"
              label="Từ ngày ghi chỉ số"
              wrapperClassName="w-full"
              format="DD-MM-YYYY"
              allowClear
              value={filter.from ? dayjs(filter.from, 'DD-MM-YYYY') : null}
              onChange={(_, dateString) => onChangeFilter('from', String(dateString || ''))}
            />
            <AppDatePicker
              name="to"
              label="Đến ngày ghi chỉ số"
              wrapperClassName="w-full"
              format="DD-MM-YYYY"
              allowClear
              value={filter.to ? dayjs(filter.to, 'DD-MM-YYYY') : null}
              onChange={(_, dateString) => onChangeFilter('to', String(dateString || ''))}
            />
          </div>
          <Flex justify="end" gap={8} className="mt-16">
            <ButtonBase type="ghost" customContent="Xoá bộ lọc" onClick={onResetFilter} />
            <ButtonBase
              type="primary"
              customContent={
                <span className="flex items-center gap-8">
                  <SearchOutlined />
                  Tìm kiếm
                </span>
              }
              onClick={onApplyFilter}
            />
          </Flex>
        </div>
        <div className="mt-16 overflow-hidden rounded-radius-l border border-color-300">
          <div className="border-b border-color-300 px-16 py-12">
            <TextBase classNames="sub-title4 !text-color-900" text="Danh sách lộ" />
          </div>
          <AppTable
            rootClassName="w-full"
            scroll={{ x: 'max-content' }}
            dataSource={batches}
            columns={columns}
            rowKey="id"
            loading={loading}
          />
        </div>
        <AppPagination currentPage={currentPage} total={total} pagination={pagination} />
      </section>

      <Drawer
        title={editingBatch ? 'Cập nhật lô chốt' : 'Tạo lô chốt EVN'}
        open={formOpen}
        onClose={() => setFormOpen(false)}
        placement="right"
        width={560}
        destroyOnClose
        footer={
          <Flex justify="end" gap={8}>
            <ButtonBase
              type="ghost"
              customContent="Hủy"
              onClick={() => setFormOpen(false)}
              disabled={actionLoading}
            />
            <ButtonBase
              type="primary"
              customContent={editingBatch ? 'Lưu' : 'Tạo lô'}
              onClick={() => void submitForm()}
              disabled={actionLoading}
            />
          </Flex>
        }
      >
        <div className="grid gap-16 pt-8">
          {!editingBatch && (
            <AppSelect
              name="masterMeterId"
              label="Lộ / công tơ đầu lộ"
              placeholder="Chọn lộ"
              options={feederOptions}
              value={form.masterMeterId}
              isLoading={feedersLoading}
              onSelectOption={({ key }) =>
                setForm((previous) => ({ ...previous, masterMeterId: String(key) }))
              }
            />
          )}
          {editingBatch && (
            <AppTextField
              name="meterCode"
              label="Công tơ đầu lộ"
              value={editingBatch.meterCode || ''}
              disabled
            />
          )}
          <AppDatePicker
            name="readingDate"
            label="Ngày chốt"
            wrapperClassName="w-full"
            format="DD-MM-YYYY"
            allowClear
            value={toDatePickerValue(form.readingDate)}
            onChange={(_, dateString) =>
              setForm((previous) => ({ ...previous, readingDate: String(dateString || '') }))
            }
          />
          <div>
            <TextBase classNames="body2 !text-color-800 mb-4" text="Ghi chú" />
            <Input.TextArea
              value={form.note}
              maxLength={250}
              rows={4}
              showCount
              onChange={(event) =>
                setForm((previous) => ({ ...previous, note: event.target.value }))
              }
            />
          </div>
        </div>
      </Drawer>

      <Modal
        title={`Chi tiết lô chốt ${detail?.feederCode || detail?.meterCode || ''}`}
        open={Boolean(detail)}
        footer={null}
        onCancel={onCloseDetail}
        width={1000}
      >
        {detailLoading ? (
          <div className="py-32 text-center">
            <Spin />
          </div>
        ) : (
          detail && (
            <div className="pt-8">
              <div className="grid grid-cols-3 gap-12 rounded-radius-m bg-color-50 p-12 mobile:grid-cols-1">
                <div>
                  <TextBase classNames="caption1 !text-color-700" text="Ngày chốt" />
                  <b>{formatDate(detail.readingDate)}</b>
                </div>
                <div>
                  <TextBase classNames="caption1 !text-color-700" text="Tiến độ nhập chỉ số" />
                  <b>
                    {formatNumber(detail.enteredMeterCount)} /{' '}
                    {formatNumber(detail.totalMeterCount)}
                  </b>
                </div>
                <div>
                  <TextBase classNames="caption1 !text-color-700" text="Trạng thái" />
                  <Status
                    type={getStatusMeta(detail.status, detail.statusLabel).type}
                    kind={KIND_STATUS.SECONDARY}
                    content={getStatusMeta(detail.status, detail.statusLabel).label}
                  />
                </div>
              </div>
              {detail.note && (
                <div className="mt-12">
                  <TextBase classNames="caption1 !text-color-700" text="Ghi chú" />
                  <p>{detail.note}</p>
                </div>
              )}
              {detail.rejectionReason && (
                <div className="mt-12 text-error-600">Lý do từ chối: {detail.rejectionReason}</div>
              )}
              <TextBase classNames="sub-title3 mt-16 !text-color-900" text="Công tơ con thuộc lộ" />
              <AppTable
                rootClassName="mt-8 w-full"
                scroll={{ x: 'max-content' }}
                dataSource={childMeters}
                columns={detailColumns}
                rowKey={(row: any) => String(row.meterId || row.id)}
                pagination={false}
              />
            </div>
          )
        )}
      </Modal>

      <Modal
        title="Xác nhận thao tác"
        open={Boolean(confirmBatch)}
        centered
        onCancel={() => {
          setConfirmBatch(undefined);
          setConfirmationAction(undefined);
        }}
        footer={
          <Flex justify="end" gap={8}>
            <ButtonBase
              type="ghost"
              customContent="Hủy"
              disabled={actionLoading}
              onClick={() => {
                setConfirmBatch(undefined);
                setConfirmationAction(undefined);
              }}
            />
            <ButtonBase
              type="primary"
              customContent="Xác nhận"
              disabled={actionLoading}
              onClick={() => void runConfirmation()}
            />
          </Flex>
        }
      >
        <p>{confirmationCopy}</p>
      </Modal>
    </PageWithBreadcrumb>
  );
};

export default EvnReadingBatchScreen;
