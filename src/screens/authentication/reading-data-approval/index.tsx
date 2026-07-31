'use client';

import {
  CheckCircleOutlined,
  CloseOutlined,
  EyeOutlined,
  FileExcelOutlined,
  SearchOutlined,
  StopOutlined
} from '@ant-design/icons';
import { DEFAULT_PAGE_SIZE, K_SIZE_1, NULL_VALUE } from '@constant';
import { Flex, Input, Modal, Spin, Tooltip } from 'antd';
import ButtonBase from 'components/button';
import { AppSelect } from 'components/select';
import Status, { KIND_STATUS } from 'components/status';
import AppTable from 'components/table';
import AppPagination from 'components/table/pagination';
import { TextBase } from 'components/text';
import { AppTextField } from 'components/text-field';
import { showToast } from 'components/toast';
import { TYPE_TOAST } from 'components/toast/type';
import { ROUTES } from 'config/routes';
import PageWithBreadcrumb from 'layout/AppLayout/PageWithBreadcumb';
import { MeterReading, ReadingReviewRow } from 'model/manual-meter-reading';
import { useCallback, useMemo, useState } from 'react';
import { displayDateFromServer } from 'utils/date';
import { formatNumberValueWithCommas } from 'utils/number-input';
import { getAbnormalMeta, getReadingStatusMeta, READING_APPROVAL_STATUS_OPTIONS } from './utils';
import useReadingDataApproval from './useReadingDataApproval';

const formatNumber = (value?: number) => {
  if (value === undefined || value === null || !Number.isFinite(value)) return NULL_VALUE;
  return formatNumberValueWithCommas(value);
};

const ApiUnavailableField = ({ label }: { label: string }) => (
  <Tooltip title="API xác nhận số liệu hiện chưa hỗ trợ điều kiện này.">
    <div>
      <AppTextField
        name={`unavailable-${label}`}
        label={label}
        placeholder="Chưa được API hỗ trợ"
        disabled
        caption="Chưa được API hỗ trợ"
      />
    </div>
  </Tooltip>
);

const StatCard = ({ label, value }: { label: string; value: number }) => (
  <Tooltip title="Số liệu tính trên các bản ghi của trang hiện tại; API chưa có endpoint thống kê toàn bộ.">
    <div className="rounded-radius-m border border-color-300 bg-color-50 p-12">
      <TextBase classNames="caption1 !text-color-700" text={label} />
      <TextBase classNames="sub-title3 !text-primary-700" text={formatNumber(value)} />
      <TextBase classNames="caption1 !text-color-600" text="Trang hiện tại" />
    </div>
  </Tooltip>
);

const ReadingDataApprovalScreen = () => {
  const {
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
    onSetSelectedPeriodIds,
    onOpenDetail,
    onCloseDetail,
    onConfirmPeriods,
    onRejectPeriod
  } = useReadingDataApproval();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [rejectRow, setRejectRow] = useState<ReadingReviewRow>();
  const [rejectReason, setRejectReason] = useState('');

  const openRejectModal = useCallback((row: ReadingReviewRow) => {
    if (!row.periodId) return;
    setRejectRow(row);
    setRejectReason('');
  }, []);

  const onSubmitReject = useCallback(async () => {
    if (!rejectRow?.periodId) return;
    if (!rejectReason.trim()) {
      showToast({ type: TYPE_TOAST.ERROR, content: 'Vui lòng nhập lý do từ chối' });
      return;
    }

    const rejected = await onRejectPeriod(rejectRow.periodId, rejectReason.trim());
    if (rejected) setRejectRow(undefined);
  }, [onRejectPeriod, rejectReason, rejectRow]);

  const onConfirmSelected = useCallback(() => {
    if (!selectedPeriodIds.length) {
      showToast({
        type: TYPE_TOAST.ERROR,
        content: 'Vui lòng chọn ít nhất một kỳ ghi để phê duyệt'
      });
      return;
    }

    setConfirmOpen(true);
  }, [selectedPeriodIds]);

  const onSubmitConfirm = useCallback(async () => {
    const confirmed = await onConfirmPeriods(selectedPeriodIds);
    if (confirmed) setConfirmOpen(false);
  }, [onConfirmPeriods, selectedPeriodIds]);

  const columns = useMemo<any[]>(
    () => [
      {
        title: 'STT',
        key: 'index',
        align: 'center',
        width: 70,
        render: (_: unknown, __: ReadingReviewRow, index: number) =>
          (currentPage - K_SIZE_1) * DEFAULT_PAGE_SIZE + index + K_SIZE_1
      },
      {
        title: 'Số công tơ',
        dataIndex: 'meterNumber',
        key: 'meterNumber',
        width: 150,
        render: (value: string) => value || NULL_VALUE
      },
      {
        title: 'Mã KH',
        dataIndex: 'customerId',
        key: 'customerId',
        width: 140,
        render: (value: string) => value || NULL_VALUE
      },
      {
        title: 'Tên khách hàng',
        key: 'customerName',
        width: 190,
        render: () => (
          <Tooltip title="API review hiện chưa trả về tên khách hàng.">
            <span className="text-color-600">{NULL_VALUE}</span>
          </Tooltip>
        )
      },
      {
        title: 'Địa chỉ',
        key: 'address',
        width: 190,
        render: () => (
          <Tooltip title="API review hiện chưa trả về địa chỉ khách hàng.">
            <span className="text-color-600">{NULL_VALUE}</span>
          </Tooltip>
        )
      },
      {
        title: 'Kỳ tính toán',
        dataIndex: 'periodCode',
        key: 'periodCode',
        width: 130,
        render: (value: string) => value || NULL_VALUE
      },
      {
        title: 'Sản lượng kỳ này (kWh)',
        dataIndex: 'currentKwh',
        key: 'currentKwh',
        align: 'right',
        width: 175,
        render: (value: number) => formatNumber(value)
      },
      {
        title: 'Sản lượng kỳ trước (kWh)',
        dataIndex: 'previousKwh',
        key: 'previousKwh',
        align: 'right',
        width: 185,
        render: (value: number) => formatNumber(value)
      },
      {
        title: 'Chênh lệch',
        dataIndex: 'deltaPercent',
        key: 'deltaPercent',
        align: 'right',
        width: 120,
        render: (value: number) => (value === undefined ? NULL_VALUE : `${formatNumber(value)}%`)
      },
      {
        title: 'Đánh giá bất thường',
        key: 'abnormal',
        width: 160,
        render: (_: unknown, row: ReadingReviewRow) => {
          const meta = getAbnormalMeta(row.abnormal, row.deltaPercent);
          return <Status type={meta.type} kind={KIND_STATUS.SECONDARY} content={meta.label} />;
        }
      },
      {
        title: 'Trạng thái phê duyệt',
        dataIndex: 'status',
        key: 'status',
        width: 160,
        render: (status: string) => {
          const meta = getReadingStatusMeta(status);
          return <Status type={meta.type} kind={KIND_STATUS.SECONDARY} content={meta.label} />;
        }
      },
      {
        title: 'Thao tác',
        key: 'actions',
        fixed: 'right',
        align: 'center',
        width: 110,
        render: (_: unknown, row: ReadingReviewRow) => (
          <Flex justify="center" gap={8}>
            <Tooltip title="Xem chi tiết kỳ ghi">
              <button
                type="button"
                className="text-color-700 hover:text-primary-600"
                onClick={(event) => {
                  event.stopPropagation();
                  onOpenDetail(row);
                }}
              >
                <EyeOutlined />
              </button>
            </Tooltip>
            {row.status === 'SAVED' && (
              <Tooltip title="Từ chối kỳ ghi">
                <button
                  type="button"
                  className="text-error-500 hover:text-error-600"
                  onClick={(event) => {
                    event.stopPropagation();
                    openRejectModal(row);
                  }}
                >
                  <StopOutlined />
                </button>
              </Tooltip>
            )}
          </Flex>
        )
      },
      {
        title: 'Xuất Excel',
        key: 'excel',
        fixed: 'right',
        align: 'center',
        width: 110,
        render: () => (
          <Tooltip title="API 5.4 hiện chưa hỗ trợ xuất danh sách Excel.">
            <span className="cursor-not-allowed text-color-400">
              <FileExcelOutlined />
            </span>
          </Tooltip>
        )
      }
    ],
    [currentPage, onOpenDetail, openRejectModal]
  );

  const rowSelection = useMemo(
    () => ({
      selectedRowKeys: selectedPeriodIds,
      preserveSelectedRowKeys: true,
      onChange: (keys: React.Key[]) => onSetSelectedPeriodIds(keys.map(Number)),
      getCheckboxProps: (row: ReadingReviewRow) => ({
        disabled: row.status !== 'SAVED' || !row.periodId
      })
    }),
    [onSetSelectedPeriodIds, selectedPeriodIds]
  );

  const breadcrumbList = [
    { title: 'Chỉ số - Hoá đơn' },
    { title: 'Xác nhận số liệu', key: ROUTES.READING_DATA_APPROVAL }
  ];

  return (
    <PageWithBreadcrumb breadcrumbList={breadcrumbList}>
      <section>
        <TextBase classNames="title4" text="Phê duyệt số liệu chỉ số & hóa đơn" />

        <div className="mt-16 rounded-radius-l border border-color-300 bg-color-50 p-16">
          <div className="grid grid-cols-4 gap-12 desktop:grid-cols-2 tablet:grid-cols-2 mobile:grid-cols-1">
            <AppTextField
              name="periodCode"
              label="Kỳ tính toán"
              placeholder="VD: 07/2026"
              value={filter.periodCode}
              onChange={(event) => onChangeFilter('periodCode', event.target.value)}
              onPressEnter={onApplyFilter}
            />
            <AppSelect
              name="customerCode"
              label="Mã khách hàng / Tên khách hàng"
              placeholder="Chọn khách hàng"
              options={[{ value: '', label: 'Tất cả' }, ...customerOptions]}
              value={filter.customerCode}
              isLoading={customerLoading}
              onSelectOption={({ key }) => onChangeFilter('customerCode', String(key))}
            />
            <AppSelect
              name="status"
              label="Trạng thái phê duyệt"
              options={READING_APPROVAL_STATUS_OPTIONS}
              value={filter.status}
              onSelectOption={({ key }) => onChangeFilter('status', String(key))}
            />
            <ApiUnavailableField label="Nhóm khách hàng" />
            <ApiUnavailableField label="Số công tơ" />
            <ApiUnavailableField label="Địa chỉ" />
            <ApiUnavailableField label="Đánh giá bất thường" />
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

        <div className="mt-16 grid grid-cols-5 gap-12 tablet:grid-cols-3 mobile:grid-cols-1">
          <StatCard label="Tổng số công tơ" value={rows.length} />
          <StatCard label="Chờ phê duyệt" value={pageStats.saved} />
          <StatCard label="Đã phê duyệt" value={pageStats.confirmed} />
          <StatCard label="Từ chối" value={pageStats.rejected} />
          <StatCard label="Bất thường" value={pageStats.abnormal} />
        </div>

        <div className="mt-16 grid grid-cols-[minmax(0,1fr)_360px] gap-16 desktop:grid-cols-1">
          <div className="min-w-0 rounded-radius-l border border-color-300 bg-color-50 p-16">
            <Flex
              justify="space-between"
              align="center"
              gap={8}
              className="mb-16 mobile:flex-col mobile:items-start"
            >
              <TextBase classNames="sub-title3 !text-primary-700" text={`Tất cả (${total})`} />
              <Flex gap={8} className="mobile:w-full">
                <ButtonBase
                  type="primary"
                  size={32}
                  customContent={
                    <span className="flex items-center gap-8">
                      <CheckCircleOutlined />
                      Phê duyệt
                    </span>
                  }
                  disabled={!selectedPeriodIds.length || actionLoading}
                  onClick={onConfirmSelected}
                  classNames="mobile:flex-1 mobile:justify-center"
                />
              </Flex>
            </Flex>
            <Spin spinning={loading || actionLoading}>
              <AppTable
                rootClassName="w-full"
                scroll={{ x: 'max-content' }}
                dataSource={rows}
                columns={columns}
                rowSelection={rowSelection}
                rowKey={(record: any) => record.periodId}
                pagination={false}
                onRow={(record: any) => ({
                  onClick: () => onOpenDetail(record),
                  className: selectedRow?.periodId === record.periodId ? 'bg-primary-50' : ''
                })}
              />
            </Spin>
            <AppPagination currentPage={currentPage} total={total} pagination={pagination} />
          </div>

          <aside className="min-h-[480px] rounded-radius-l border border-color-300 bg-color-50 p-16">
            <Flex justify="space-between" align="center" gap={8}>
              <TextBase classNames="sub-title3 !text-primary-700" text="Chi tiết kỳ ghi" />
              {selectedRow && (
                <button
                  type="button"
                  className="text-color-600 hover:text-color-900"
                  onClick={onCloseDetail}
                >
                  <CloseOutlined />
                </button>
              )}
            </Flex>
            {!selectedRow ? (
              <div className="mt-48 text-center text-14 text-color-700">
                Chọn một kỳ ghi để xem chi tiết
              </div>
            ) : detailLoading ? (
              <div className="mt-48 text-center">
                <Spin size="small" />
              </div>
            ) : (
              <>
                <div className="mt-16 grid grid-cols-2 gap-12">
                  <div>
                    <TextBase classNames="caption1 !text-color-700" text="Khách hàng" />
                    <b>{detail?.period?.customerName || selectedRow.customerId || NULL_VALUE}</b>
                  </div>
                  <div>
                    <TextBase classNames="caption1 !text-color-700" text="Số công tơ" />
                    <b>{detail?.period?.meterNumber || selectedRow.meterNumber || NULL_VALUE}</b>
                  </div>
                  <div>
                    <TextBase classNames="caption1 !text-color-700" text="Kỳ tính toán" />
                    <b>{detail?.period?.periodCode || selectedRow.periodCode || NULL_VALUE}</b>
                  </div>
                  <div>
                    <TextBase classNames="caption1 !text-color-700" text="Ngày ghi" />
                    <b>
                      {detail?.period?.readingDate
                        ? displayDateFromServer(detail.period.readingDate)
                        : selectedRow.readingDate
                          ? displayDateFromServer(selectedRow.readingDate)
                          : NULL_VALUE}
                    </b>
                  </div>
                </div>
                <div className="mt-16 overflow-x-auto rounded-radius-m border border-color-300">
                  <table className="w-full min-w-[430px] border-collapse text-13">
                    <thead>
                      <tr className="bg-color-100 text-left text-color-800">
                        <th className="p-8">TOU</th>
                        <th className="p-8 text-right">Chỉ số cũ</th>
                        <th className="p-8 text-right">Chỉ số mới</th>
                        <th className="p-8 text-right">Sản lượng</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(detail?.readings || []).map((reading: MeterReading) => (
                        <tr key={reading.id || reading.tou} className="border-t border-color-200">
                          <td className="p-8">{reading.tou || NULL_VALUE}</td>
                          <td className="p-8 text-right">{formatNumber(reading.oldIndex)}</td>
                          <td className="p-8 text-right">{formatNumber(reading.newIndex)}</td>
                          <td className="p-8 text-right">
                            {formatNumber(reading.energyAdjusted ?? reading.energyRaw)}
                          </td>
                        </tr>
                      ))}
                      {!detail?.readings?.length && (
                        <tr>
                          <td colSpan={4} className="p-16 text-center text-color-700">
                            Chưa có dòng chỉ số
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                {selectedRow.abnormal && (
                  <div className="mt-16 rounded-radius-m border border-error-200 bg-error-50 p-12 text-13 text-error-700">
                    API đánh dấu kỳ ghi bất thường; chênh lệch{' '}
                    {formatNumber(selectedRow.deltaPercent)}%.
                  </div>
                )}
                {selectedRow.status === 'SAVED' && (
                  <Flex gap={8} className="mt-16">
                    <ButtonBase
                      type="primary"
                      size={32}
                      customContent="Phê duyệt"
                      disabled={actionLoading}
                      onClick={() =>
                        selectedRow.periodId && onConfirmPeriods([selectedRow.periodId])
                      }
                    />
                    <ButtonBase
                      type="ghost"
                      size={32}
                      customContent="Từ chối"
                      disabled={actionLoading}
                      onClick={() => openRejectModal(selectedRow)}
                    />
                  </Flex>
                )}
              </>
            )}
          </aside>
        </div>
      </section>

      <Modal
        title="Phê duyệt số liệu"
        open={confirmOpen}
        centered
        onCancel={() => setConfirmOpen(false)}
        footer={
          <Flex justify="end" gap={8}>
            <ButtonBase
              type="ghost"
              customContent="Huỷ"
              disabled={actionLoading}
              onClick={() => setConfirmOpen(false)}
            />
            <ButtonBase
              type="primary"
              customContent="Phê duyệt"
              disabled={actionLoading}
              onClick={onSubmitConfirm}
            />
          </Flex>
        }
      >
        <TextBase
          classNames="body3 !text-color-700"
          text={`Bạn có chắc chắn phê duyệt ${selectedPeriodIds.length} kỳ ghi đã chọn?`}
        />
      </Modal>

      <Modal
        title="Từ chối số liệu"
        open={Boolean(rejectRow)}
        onCancel={() => setRejectRow(undefined)}
        footer={
          <Flex justify="end" gap={8}>
            <ButtonBase
              type="ghost"
              customContent="Huỷ"
              disabled={actionLoading}
              onClick={() => setRejectRow(undefined)}
            />
            <ButtonBase
              type="primary"
              customContent="Từ chối"
              disabled={actionLoading}
              onClick={onSubmitReject}
            />
          </Flex>
        }
      >
        <TextBase
          classNames="body3 !text-color-700"
          text="Lý do từ chối chưa được API lưu vào lịch sử."
        />
        <Input.TextArea
          className="mt-12"
          rows={4}
          value={rejectReason}
          placeholder="Nhập lý do từ chối"
          onChange={(event) => setRejectReason(event.target.value)}
        />
      </Modal>
    </PageWithBreadcrumb>
  );
};

export default ReadingDataApprovalScreen;
