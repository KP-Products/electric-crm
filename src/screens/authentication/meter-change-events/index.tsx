'use client';

import {
  AuditOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  FileTextOutlined,
  HourglassOutlined
} from '@ant-design/icons';
import {
  K_SIZE_0,
  K_SIZE_1,
  K_SIZE_100,
  K_SIZE_120,
  K_SIZE_140,
  K_SIZE_150,
  K_SIZE_160,
  K_SIZE_180,
  K_SIZE_18,
  K_SIZE_200,
  K_SIZE_8,
  NULL_VALUE,
  REQUIRED_MARK
} from '@constant';
import { Divider, Drawer, Flex, Spin } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { ReactNode } from 'react';
import { useMemo } from 'react';

import ButtonBase from 'components/button';
import { AppDatePickerControl } from 'components/date-picker';
import IconHover from 'components/icon-vec-local/icon-hover';
import { AppSelect, AppSelectControl } from 'components/select';
import Status, { KIND_STATUS } from 'components/status';
import AppTable from 'components/table';
import AppPagination from 'components/table/pagination';
import { AppTakeNoteControl } from 'components/take-note';
import TagFilter from 'components/tag-filter';
import { TextBase } from 'components/text';
import { AppTextField, AppTextFieldControl } from 'components/text-field';
import { ROUTES } from 'config/routes';
import PageWithBreadcrumb from 'layout/AppLayout/PageWithBreadcumb';
import { MeterChangeEventWithDetails } from 'model/meter-change-event';
import { formatNumberValueWithCommas } from 'utils/number-input';
import { useResponsive } from 'utils/responsive';
import useMeterChangeEvents, { MeterChangeEventFilter } from './useMeterChangeEvents';
import {
  DATE_API_FORMAT,
  displayEventDate,
  displayEventDateTime,
  displayText,
  EVENT_STATUS_OPTIONS,
  EVENT_TYPE_OPTIONS,
  getEventStatusLabel,
  getEventStatusType,
  getEventTypeLabel
} from './utils';

const requiredMark = <span className="text-error-600">{REQUIRED_MARK}</span>;

const FILTER_LABEL_MAP: Record<keyof MeterChangeEventFilter, string> = {
  eventNo: 'Mã sự kiện',
  eventType: 'Loại sự kiện',
  customerId: 'Khách hàng',
  status: 'Trạng thái'
};

const formatNumber = (value?: number) => {
  if (value === undefined || value === null || !Number.isFinite(value)) return NULL_VALUE;
  return formatNumberValueWithCommas(value);
};

const renderTruncatedText = (text?: string | null, className = 'max-w-[220px]') => (
  <div title={text || ''} className={`${className} truncate`}>
    {displayText(text)}
  </div>
);

const getFilterDisplayValue = (
  key: keyof MeterChangeEventFilter,
  value: MeterChangeEventFilter[keyof MeterChangeEventFilter]
) => {
  if (key === 'eventType') return getEventTypeLabel(value);
  if (key === 'status') return getEventStatusLabel(value);
  return String(value);
};

const MetricCard = ({
  icon,
  label,
  value,
  accentClassName
}: {
  icon: ReactNode;
  label: string;
  value: number;
  accentClassName: string;
}) => (
  <div className="rounded-radius-l border border-color-300 bg-color-50 p-16">
    <Flex align="center" gap={K_SIZE_8}>
      <div
        className={`flex size-40 items-center justify-center rounded-radius-m text-20 ${accentClassName}`}
      >
        {icon}
      </div>
      <div>
        <TextBase classNames="caption !text-color-700" text={label} />
        <TextBase
          classNames="title5 !text-color-900"
          text={formatNumberValueWithCommas(value, { maximumFractionDigits: 0 })}
        />
      </div>
    </Flex>
  </div>
);

const DetailItem = ({ label, value }: { label: string; value: ReactNode }) => (
  <div className="min-w-0">
    <div className="mb-4 text-12 font-semibold text-color-700">{label}</div>
    <div className="break-words text-14 font-medium text-color-900">{value || NULL_VALUE}</div>
  </div>
);

const MeterChangeEventsScreen = () => {
  const { isMobile, isTablet } = useResponsive();
  const {
    t,
    meterChangeEventList,
    total,
    summary,
    listLoading,
    detailLoading,
    currentPage,
    pagination,
    filter,
    filterApplied,
    openForm,
    openDetail,
    selectedEvent,
    selectedDetail,
    customerOptions,
    oldDeviceOptions,
    newDeviceOptionsByRow,
    form,
    detailFieldArray,
    onOpenCustomerDropdown,
    onOpenOldDeviceDropdown,
    onChangeOldDevice,
    customerDropdownRender,
    onChangeFilter,
    onApplyFilter,
    onResetFilter,
    onOpenCreate,
    onOpenUpdate,
    onCloseForm,
    onOpenDetail,
    onCloseDetail,
    onSubmit,
    onDelete,
    createDefaultDetailForm
  } = useMeterChangeEvents();

  const {
    control,
    handleSubmit,
    formState: { isDirty, isValid }
  } = form;

  const activeFilters = useMemo(
    () =>
      (Object.entries(filterApplied) as [keyof MeterChangeEventFilter, string][]).filter(
        ([, value]) => Boolean(value)
      ),
    [filterApplied]
  );

  const columns = useMemo<ColumnsType<MeterChangeEventWithDetails>>(
    () => [
      {
        title: 'STT',
        key: 'index',
        width: K_SIZE_100,
        align: 'center',
        render: (_: unknown, __: MeterChangeEventWithDetails, index: number) =>
          (currentPage - K_SIZE_1) * Number(pagination.pageSize || K_SIZE_0) + index + K_SIZE_1
      },
      {
        title: 'Mã sự kiện',
        key: 'eventNo',
        width: K_SIZE_160,
        render: (_: unknown, record: MeterChangeEventWithDetails) => (
          <TextBase
            classNames="sub-title4 cursor-pointer !text-secondary-500 hover:!text-secondary-700"
            text={displayText(record.event?.eventNo)}
            onClick={() => onOpenDetail(record)}
          />
        )
      },
      {
        title: 'Loại sự kiện',
        key: 'eventType',
        width: K_SIZE_180,
        render: (_: unknown, record: MeterChangeEventWithDetails) =>
          getEventTypeLabel(record.event?.eventType)
      },
      {
        title: 'Khách hàng',
        key: 'customerId',
        width: K_SIZE_200,
        render: (_: unknown, record: MeterChangeEventWithDetails) =>
          renderTruncatedText(String(record.event?.customerId || ''), 'max-w-[240px]')
      },
      {
        title: 'Thời gian sự kiện',
        key: 'eventDate',
        width: K_SIZE_150,
        render: (_: unknown, record: MeterChangeEventWithDetails) =>
          displayEventDate(record.event?.eventDate)
      },
      {
        title: 'Trạng thái',
        key: 'status',
        width: K_SIZE_140,
        render: (_: unknown, record: MeterChangeEventWithDetails) => (
          <Status
            type={getEventStatusType(record.event?.status)}
            kind={KIND_STATUS.SECONDARY}
            content={getEventStatusLabel(record.event?.status)}
          />
        )
      },
      {
        title: 'Người thực hiện',
        key: 'performedBy',
        width: K_SIZE_160,
        render: (_: unknown, record: MeterChangeEventWithDetails) =>
          displayText(record.event?.performedBy)
      },
      {
        title: 'Phê duyệt bởi',
        key: 'approvedBy',
        width: K_SIZE_160,
        render: (_: unknown, record: MeterChangeEventWithDetails) =>
          displayText(record.event?.approvedBy)
      },
      {
        title: 'Ngày phê duyệt',
        key: 'approvedAt',
        width: K_SIZE_160,
        render: (_: unknown, record: MeterChangeEventWithDetails) =>
          displayEventDateTime(record.event?.approvedAt)
      },
      {
        title: t('common:action'),
        fixed: 'right',
        align: 'center',
        width: K_SIZE_120,
        render: (_: unknown, record: MeterChangeEventWithDetails) => (
          <div className="flex justify-center gap-8">
            <IconHover
              rootClassName="text-color-800"
              title="Xem chi tiết"
              icon="ICON_EYE_OPEN"
              iconHeight={K_SIZE_18}
              onClick={() => onOpenDetail(record)}
            />
            <IconHover
              rootClassName="text-color-800"
              title={t('common:edit')}
              icon="ICON_EDIT"
              iconHeight={K_SIZE_18}
              onClick={() => onOpenUpdate(record)}
            />
            <IconHover
              rootClassName="text-error-500 hover:text-error-500"
              title={t('common:delete')}
              icon="IC_TRASH_OUTLINE"
              iconHeight={K_SIZE_18}
              onClick={() => onDelete(record)}
            />
          </div>
        )
      }
    ],
    [currentPage, onDelete, onOpenDetail, onOpenUpdate, pagination.pageSize, t]
  );

  const breadcrumbList = [
    {
      title: 'Thiết bị'
    },
    {
      title: 'Biến động công tơ/TU/TI',
      key: ROUTES.METER_CHANGE_EVENTS
    }
  ];

  const selectedFormEventId = selectedEvent?.event?.id;
  const selectedDetailEvent = selectedDetail?.event;
  const selectedDetailRows = selectedDetail?.details || [];

  return (
    <PageWithBreadcrumb breadcrumbList={breadcrumbList}>
      <section>
        <Flex
          justify="space-between"
          align="center"
          gap={K_SIZE_8}
          className="mobile:flex-col mobile:items-start"
        >
          <TextBase classNames="title4" text="Biến động công tơ/TU/TI" />
          <Flex
            flex={K_SIZE_1}
            justify="end"
            gap={K_SIZE_8}
            className="mobile:w-full mobile:flex-col"
          >
            <ButtonBase
              type="primary"
              leftIcon="IC_ADD_OUTLINE2"
              customContent="Thêm mới"
              classNames="mobile:flex-1 mobile:justify-center"
              onClick={onOpenCreate}
            />
          </Flex>
        </Flex>
        <Divider className="my-16" />

        <div className="mb-12 grid grid-cols-[minmax(160px,1fr)_minmax(180px,1fr)_minmax(180px,1fr)_minmax(160px,1fr)_auto] items-end gap-12 rounded-radius-l border border-color-300 bg-color-50 p-12 tablet:grid-cols-2 mobile:grid-cols-1">
          <AppTextField
            name="eventNo"
            label="Mã sự kiện"
            placeholder="Nhập mã sự kiện"
            value={filter.eventNo}
            onChange={(event) => onChangeFilter('eventNo', event.target.value)}
            onPressEnter={onApplyFilter}
          />
          <AppSelect
            name="eventType"
            label="Loại sự kiện"
            placeholder="Chọn loại sự kiện"
            value={filter.eventType}
            options={EVENT_TYPE_OPTIONS}
            onSelectOption={({ key }) => onChangeFilter('eventType', String(key))}
          />
          <AppTextField
            name="customerId"
            label="Khách hàng"
            placeholder="Nhập mã khách hàng"
            value={filter.customerId}
            onChange={(event) => onChangeFilter('customerId', event.target.value)}
            onPressEnter={onApplyFilter}
          />
          <AppSelect
            name="status"
            label="Trạng thái"
            placeholder="Chọn trạng thái"
            value={filter.status}
            options={EVENT_STATUS_OPTIONS}
            onSelectOption={({ key }) => onChangeFilter('status', String(key))}
          />
          <Flex gap={K_SIZE_8} className="tablet:col-span-2 mobile:col-span-1">
            <ButtonBase
              type="ghost"
              customContent="Làm mới"
              onClick={() => onResetFilter()}
              classNames="min-w-[104px] mobile:flex-1 mobile:justify-center"
            />
            <ButtonBase
              type="primary"
              leftIcon="IC_SEARCH_OUTLINE2"
              customContent="Tìm kiếm"
              onClick={onApplyFilter}
              classNames="min-w-[104px] mobile:flex-1 mobile:justify-center"
            />
          </Flex>
        </div>

        {activeFilters.length > K_SIZE_0 && (
          <div className="mb-8 flex w-full flex-wrap items-center gap-8">
            {activeFilters.map(([key, value]) => (
              <TagFilter
                key={key}
                content={`${FILTER_LABEL_MAP[key]}: ${getFilterDisplayValue(key, value)}`}
                onClose={() => onResetFilter(key)}
              />
            ))}
          </div>
        )}

        <div className="mb-12 grid grid-cols-4 gap-12 tablet:grid-cols-2 mobile:grid-cols-1">
          <MetricCard
            icon={<FileTextOutlined />}
            label="Đang hiển thị"
            value={summary.totalInPage}
            accentClassName="bg-primary-100 text-primary-700"
          />
          <MetricCard
            icon={<CheckCircleOutlined />}
            label="Đã phê duyệt"
            value={summary.approved}
            accentClassName="bg-success-100 text-success-700"
          />
          <MetricCard
            icon={<HourglassOutlined />}
            label="Chờ phê duyệt"
            value={summary.pending}
            accentClassName="bg-warning-100 text-warning-700"
          />
          <MetricCard
            icon={<CloseCircleOutlined />}
            label="Từ chối"
            value={summary.rejected}
            accentClassName="bg-error-100 text-error-700"
          />
        </div>

        <Spin spinning={listLoading && meterChangeEventList.length > K_SIZE_0}>
          <div className="overflow-hidden rounded-radius-l border border-color-400 duration-500">
            <AppTable
              loading={listLoading}
              rootClassName="w-full"
              className="[&_.ant-pagination]:hidden"
              scroll={{ x: 'max-content', y: '72vh' }}
              dataSource={meterChangeEventList}
              columns={columns}
              rowKey={(record: MeterChangeEventWithDetails, index?: number) =>
                String(record.event?.id ?? record.event?.eventNo ?? index)
              }
              pagination={pagination}
            />
          </div>
          <AppPagination currentPage={currentPage} total={total} pagination={pagination} />
        </Spin>

        <form id="meter-change-event-form" onSubmit={handleSubmit(onSubmit)}>
          <Drawer
            open={openForm}
            title={
              <Flex justify="space-between" align="center">
                <div>
                  {selectedFormEventId
                    ? 'Cập nhật biến động thiết bị'
                    : 'Thêm mới biến động thiết bị'}
                </div>
                <IconHover
                  title={t('common:close')}
                  icon="IC_CLOSE_OUTLINE"
                  onClick={onCloseForm}
                />
              </Flex>
            }
            destroyOnClose
            placement="right"
            closable={false}
            maskClosable={!detailLoading}
            onClose={onCloseForm}
            width={isTablet || isMobile ? '94vw' : '76vw'}
            footer={
              <Flex justify="end" gap={K_SIZE_8}>
                <ButtonBase
                  classNames="app-common-btn"
                  type="ghost"
                  customContent="Hủy"
                  onClick={onCloseForm}
                  disabled={detailLoading}
                />
                <ButtonBase
                  classNames="app-common-btn"
                  type="primary"
                  form="meter-change-event-form"
                  htmlType="submit"
                  disabled={!isValid || Boolean(selectedFormEventId && !isDirty) || detailLoading}
                  customContent={
                    <div className="flex flex-row items-center justify-center">
                      <div>Lưu</div>
                      {detailLoading && (
                        <div className="ml-8">
                          <Spin size="small" />
                        </div>
                      )}
                    </div>
                  }
                />
              </Flex>
            }
          >
            <Spin spinning={detailLoading && Boolean(selectedFormEventId)}>
              <div className="grid gap-16">
                <div className="rounded-radius-l border border-color-300 bg-color-50 p-16">
                  <TextBase classNames="sub-title3 mb-12" text="Thông tin sự kiện" />
                  <div className="grid grid-cols-3 gap-12 tablet:grid-cols-2 mobile:grid-cols-1">
                    <AppSelectControl
                      name="eventType"
                      label="Loại sự kiện"
                      labelSuffix={requiredMark}
                      placeholder="Chọn loại sự kiện"
                      options={EVENT_TYPE_OPTIONS}
                      control={control}
                    />
                    <AppTextFieldControl
                      name="eventNo"
                      label="Mã sự kiện"
                      labelSuffix={requiredMark}
                      placeholder="Nhập mã sự kiện"
                      control={control}
                      disabled={Boolean(selectedFormEventId)}
                    />
                    <AppSelectControl
                      name="customerId"
                      label="Khách hàng"
                      placeholder="Chọn khách hàng"
                      options={customerOptions}
                      dropdownRender={customerDropdownRender}
                      onOpenChange={onOpenCustomerDropdown}
                      unSeleted
                      control={control}
                    />
                    <AppDatePickerControl
                      control={control}
                      name="eventDate"
                      label="Thời gian sự kiện"
                      labelSuffix={requiredMark}
                      backendFormat={DATE_API_FORMAT}
                      wrapperClassName="w-full"
                      datePickerClassName="w-full"
                    />
                    <AppSelectControl
                      name="status"
                      label="Trạng thái"
                      labelSuffix={requiredMark}
                      placeholder="Chọn trạng thái"
                      options={EVENT_STATUS_OPTIONS}
                      control={control}
                    />
                    <AppTextFieldControl
                      name="reason"
                      label="Lý do"
                      placeholder="Nhập lý do"
                      control={control}
                    />
                  </div>
                  <AppTakeNoteControl
                    name="note"
                    label="Ghi chú"
                    placeholder="Nhập ghi chú"
                    control={control}
                    wrapperClassName="mt-12"
                    autoSize={{ minRows: 3, maxRows: 4 }}
                    maxLength={500}
                    showCount
                  />
                </div>

                <div className="rounded-radius-l border border-color-300 bg-color-50 p-16">
                  <Flex justify="space-between" align="center" gap={K_SIZE_8} className="mb-12">
                    <TextBase classNames="sub-title3" text="Chi tiết thiết bị" />
                    <ButtonBase
                      type="ghost"
                      size={32}
                      leftIcon="IC_ADD_OUTLINE2"
                      customContent="Thêm dòng"
                      onClick={() => detailFieldArray.append(createDefaultDetailForm())}
                    />
                  </Flex>
                  <div className="overflow-x-auto">
                    <div className="min-w-[980px]">
                      <div className="grid grid-cols-[56px_1fr_1fr_140px_140px_120px_1fr_72px] gap-8 border-b border-color-300 bg-color-100 p-8 text-12 font-semibold text-color-700">
                        <div>STT</div>
                        <div>Thiết bị cũ</div>
                        <div>Thiết bị mới</div>
                        <div>Chỉ số tháo</div>
                        <div>Chỉ số lắp</div>
                        <div>Hệ số nhân</div>
                        <div>Ghi chú</div>
                        <div>Thao tác</div>
                      </div>
                      <div className="grid gap-8 py-8">
                        {detailFieldArray.fields.map((field, index) => (
                          <div
                            key={field.id}
                            className="grid grid-cols-[56px_1fr_1fr_140px_140px_120px_1fr_72px] items-start gap-8 px-8"
                          >
                            <div className="pt-12 text-14 font-medium text-color-900">
                              {index + K_SIZE_1}
                            </div>
                            <AppSelectControl
                              name={`details.${index}.oldDeviceId` as const}
                              placeholder="Chọn thiết bị cũ"
                              options={oldDeviceOptions}
                              onOpenChange={onOpenOldDeviceDropdown}
                              onChange={(value) => onChangeOldDevice(index, value)}
                              control={control}
                            />
                            <AppSelectControl
                              name={`details.${index}.newDeviceId` as const}
                              placeholder="Chọn thiết bị mới"
                              options={newDeviceOptionsByRow[index] || []}
                              onOpenChange={onOpenOldDeviceDropdown}
                              disabled={!form.watch(`details.${index}.oldDeviceId` as const)}
                              control={control}
                            />
                            <AppTextFieldControl
                              name={`details.${index}.removeReading` as const}
                              placeholder="Nhập chỉ số"
                              inputMode="decimal"
                              formatNumberWithCommas
                              allowDecimal
                              control={control}
                            />
                            <AppTextFieldControl
                              name={`details.${index}.installReading` as const}
                              placeholder="Nhập chỉ số"
                              inputMode="decimal"
                              formatNumberWithCommas
                              allowDecimal
                              control={control}
                            />
                            <AppTextFieldControl
                              name={`details.${index}.multiplier` as const}
                              placeholder="1"
                              inputMode="decimal"
                              formatNumberWithCommas
                              allowDecimal
                              control={control}
                            />
                            <AppTakeNoteControl
                              name={`details.${index}.note` as const}
                              placeholder="Nhập ghi chú"
                              control={control}
                              autoSize={{ minRows: 1, maxRows: 2 }}
                            />
                            <div className="flex justify-center pt-8">
                              <IconHover
                                rootClassName={
                                  detailFieldArray.fields.length <= K_SIZE_1
                                    ? 'pointer-events-none text-color-500'
                                    : 'text-error-500 hover:text-error-500'
                                }
                                title={t('common:delete')}
                                icon="IC_TRASH_OUTLINE"
                                iconHeight={K_SIZE_18}
                                onClick={() => detailFieldArray.remove(index)}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Spin>
          </Drawer>
        </form>

        <Drawer
          open={openDetail}
          title={
            <Flex justify="space-between" align="center">
              <div>Chi tiết biến động thiết bị</div>
              <IconHover
                title={t('common:close')}
                icon="IC_CLOSE_OUTLINE"
                onClick={onCloseDetail}
              />
            </Flex>
          }
          destroyOnClose
          placement="right"
          closable={false}
          onClose={onCloseDetail}
          width={isTablet || isMobile ? '94vw' : '70vw'}
        >
          <Spin spinning={detailLoading && Boolean(openDetail)}>
            <div className="grid gap-16">
              <div className="rounded-radius-l border border-color-300 bg-color-50 p-16">
                <Flex
                  justify="space-between"
                  align="center"
                  gap={K_SIZE_8}
                  className="mb-12 mobile:flex-col mobile:items-start"
                >
                  <Flex align="center" gap={K_SIZE_8}>
                    <AuditOutlined className="text-20 text-primary-700" />
                    <TextBase classNames="sub-title3" text="Thông tin sự kiện" />
                  </Flex>
                  {selectedDetail && (
                    <IconHover
                      rootClassName="text-color-800"
                      title={t('common:edit')}
                      icon="ICON_EDIT"
                      iconHeight={K_SIZE_18}
                      onClick={() => {
                        onCloseDetail();
                        onOpenUpdate(selectedDetail);
                      }}
                    />
                  )}
                </Flex>
                <div className="grid grid-cols-3 gap-12 tablet:grid-cols-2 mobile:grid-cols-1">
                  <DetailItem
                    label="Mã sự kiện"
                    value={displayText(selectedDetailEvent?.eventNo)}
                  />
                  <DetailItem
                    label="Loại sự kiện"
                    value={getEventTypeLabel(selectedDetailEvent?.eventType)}
                  />
                  <DetailItem
                    label="Khách hàng"
                    value={displayText(selectedDetailEvent?.customerId)}
                  />
                  <DetailItem
                    label="Thời gian sự kiện"
                    value={displayEventDate(selectedDetailEvent?.eventDate)}
                  />
                  <DetailItem
                    label="Trạng thái"
                    value={
                      <Status
                        type={getEventStatusType(selectedDetailEvent?.status)}
                        kind={KIND_STATUS.SECONDARY}
                        content={getEventStatusLabel(selectedDetailEvent?.status)}
                      />
                    }
                  />
                  <DetailItem label="Lý do" value={displayText(selectedDetailEvent?.reason)} />
                  <DetailItem
                    label="Người thực hiện"
                    value={displayText(selectedDetailEvent?.performedBy)}
                  />
                  <DetailItem
                    label="Phê duyệt bởi"
                    value={displayText(selectedDetailEvent?.approvedBy)}
                  />
                  <DetailItem
                    label="Ngày phê duyệt"
                    value={displayEventDateTime(selectedDetailEvent?.approvedAt)}
                  />
                  <DetailItem label="Ghi chú" value={displayText(selectedDetailEvent?.note)} />
                </div>
              </div>

              <div className="rounded-radius-l border border-color-300 bg-color-50 p-16">
                <TextBase classNames="sub-title3 mb-12" text="Chi tiết thiết bị" />
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[900px] border-collapse text-14">
                    <thead>
                      <tr className="border-b border-color-300 bg-color-100 text-left text-12 font-semibold text-color-700">
                        <th className="w-[56px] p-8">STT</th>
                        <th className="p-8">Thiết bị cũ</th>
                        <th className="p-8">Thiết bị mới</th>
                        <th className="p-8">Chỉ số tháo</th>
                        <th className="p-8">Chỉ số lắp</th>
                        <th className="p-8">Hệ số nhân</th>
                        <th className="p-8">Ghi chú</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedDetailRows.length === K_SIZE_0 && (
                        <tr>
                          <td className="px-8 py-12 text-center text-color-700" colSpan={7}>
                            {NULL_VALUE}
                          </td>
                        </tr>
                      )}
                      {selectedDetailRows.map((detail, index) => (
                        <tr key={detail.id || index} className="border-b border-color-300">
                          <td className="p-8">{index + K_SIZE_1}</td>
                          <td className="p-8">{displayText(detail.oldDeviceId)}</td>
                          <td className="p-8">{displayText(detail.newDeviceId)}</td>
                          <td className="p-8">{formatNumber(detail.removeReading)}</td>
                          <td className="p-8">{formatNumber(detail.installReading)}</td>
                          <td className="p-8">{formatNumber(detail.multiplier)}</td>
                          <td className="p-8">{displayText(detail.note)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </Spin>
        </Drawer>
      </section>
    </PageWithBreadcrumb>
  );
};

export default MeterChangeEventsScreen;
