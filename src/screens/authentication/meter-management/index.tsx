'use client';

import {
  DEFAULT_PAGE_SIZE,
  K_SIZE_1,
  K_SIZE_100,
  K_SIZE_120,
  K_SIZE_130,
  K_SIZE_150,
  K_SIZE_16,
  K_SIZE_18,
  K_SIZE_70,
  K_SIZE_8,
  NULL_VALUE
} from '@constant';
import { Divider, Flex } from 'antd';
import ButtonBase from 'components/button';
import { AppDatePicker } from 'components/date-picker';
import { IconSvgLocal } from 'components/icon-vec-local';
import IconHover from 'components/icon-vec-local/icon-hover';
import { AppSelect, AppSelectOption } from 'components/select';
import Status, { KIND_STATUS } from 'components/status';
import AppTable from 'components/table';
import AppPagination from 'components/table/pagination';
import TagFilter from 'components/tag-filter';
import { TextBase } from 'components/text';
import { AppTextField } from 'components/text-field';
import { ROUTES } from 'config/routes';
import PageWithBreadcrumb from 'layout/AppLayout/PageWithBreadcumb';
import { Meter } from 'model/meter';
import dayjs from 'dayjs';
import { useCallback, useMemo } from 'react';
import { FORMAT_DATE_API, displayDateFromServer } from 'utils/date';
import { formatNumberValueWithCommas, parseFormattedNumber } from 'utils/number-input';
import useManageMeter, { MeterFilterForm } from './hooks/useManageMeter';
import {
  METER_TYPE_OPTIONS,
  getMeterRecordId,
  getMeterStatusLabel,
  getMeterStatusType,
  getMeterTypeLabel,
  getVoltageLevelLabel,
  METER_STATUS_OPTIONS,
  METER_STATUS_LABEL_MAP,
  VOLTAGE_LEVEL_OPTIONS,
  VOLTAGE_LEVEL_LABEL_MAP
} from './utils/constant';

const ALL_OPTION: AppSelectOption = { value: '', label: 'Tất cả' };

const renderDate = (date?: string) => (date ? displayDateFromServer(date) : NULL_VALUE);

const renderNumber = (value?: string | number) => {
  if (value === undefined || value === null || value === '') return NULL_VALUE;
  const numericValue = parseFormattedNumber(value);
  if (numericValue === undefined) return String(value);
  return formatNumberValueWithCommas(numericValue, { maximumFractionDigits: 2 });
};

// const formatCompactNumber = (value: number) => new Intl.NumberFormat('en-US').format(value);
//
// const formatPercent = (value: number) =>
//   new Intl.NumberFormat('en-US', {
//     maximumFractionDigits: 2,
//     minimumFractionDigits: 0
//   }).format(value);
//
// interface StatCardProps {
//   label: string;
//   value: string;
//   suffix?: string;
//   icon: React.ReactNode;
//   colorClassName: string;
//   extra?: string;
// }

// const StatCard = ({
//   label,
//   value,
//   suffix = 'công tơ',
//   icon,
//   colorClassName,
//   extra
// }: StatCardProps) => (
//   <div className="flex min-h-[76px] items-center gap-16 rounded-radius-l border border-color-300 bg-color-50 px-16 py-12">
//     <div
//       className={`flex size-44 shrink-0 items-center justify-center rounded-radius-m ${colorClassName}`}
//     >
//       {icon}
//     </div>
//     <div className="min-w-0">
//       <div className="mb-4 text-12 font-semibold leading-16 text-color-700">{label}</div>
//       <div className="flex flex-wrap items-baseline gap-8">
//         <span className="text-24 font-bold leading-28 text-color-900">{value}</span>
//         <span className="text-12 font-semibold text-color-700">{suffix}</span>
//         {extra && <span className="text-12 font-semibold text-color-700">{extra}</span>}
//       </div>
//     </div>
//   </div>
// );

const MeterManagementScreen = () => {
  const {
    t,
    router,
    filterDraft,
    filterApplied,
    customerOptions,
    getCustomerDisplay,
    onOpenCustomerDropdown,
    customerDropdownRender,
    loadingMeterList,
    currentPage,
    pagination,
    expandedRowKeys,
    childMeterMap,
    onChangeFilter,
    onApplyFilter,
    onResetFilter,
    meterList,
    // meterStats,
    total,
    onExpandMeterRow,
    onDeleteMeter,
    fetchChildMeters,
    onImport
  } = useManageMeter();

  const meterCodeMap = useMemo(() => {
    const optionMap = new Map<string, string>();
    meterList.forEach((meter) => {
      const recordId = getMeterRecordId(meter);
      if (!recordId || !meter.meterCode) return;
      optionMap.set(recordId, meter.meterCode);
    });
    return optionMap;
  }, [meterList]);

  const columns = useMemo<any[]>(
    () => [
      {
        title: 'STT',
        key: 'index',
        align: 'center',
        width: K_SIZE_70,
        render: (_: unknown, __: Meter, index: number) =>
          (currentPage - K_SIZE_1) * DEFAULT_PAGE_SIZE + index + K_SIZE_1
      },
      {
        title: 'Mã công tơ',
        dataIndex: 'meterCode',
        key: 'meterCode',
        align: 'left',
        width: K_SIZE_150,
        render: (text: string, record: Meter) => {
          const recordId = getMeterRecordId(record);
          return (
            <TextBase
              text={text || NULL_VALUE}
              classNames={'sub-title4 !text-secondary-500 cursor-pointer hover:!text-secondary-700'}
              onClick={() =>
                recordId && router.push(`${ROUTES.MANAGE_METER_DETAIL}?id=${recordId}`)
              }
            />
          );
        }
      },
      {
        title: 'Mã khách hàng',
        dataIndex: 'customerId',
        key: 'customerId',
        align: 'left',
        width: K_SIZE_150,
        render: (customerId: string, record: Meter) => (
          <span title={customerId || record.customerName || ''}>
            {customerId || record.customerName || NULL_VALUE}
          </span>
        )
      },
      {
        title: 'Loại công tơ',
        dataIndex: 'meterType',
        key: 'meterType',
        align: 'left',
        width: K_SIZE_150,
        render: (meterType: string) => getMeterTypeLabel(meterType)
      },
      {
        title: 'Công tơ cha / Lộ tổng',
        dataIndex: 'parentId',
        key: 'parentId',
        align: 'left',
        width: K_SIZE_150,
        render: (parentId: string) =>
          parentId ? meterCodeMap.get(parentId) || parentId : NULL_VALUE
      },
      {
        title: 'Cấp điện áp',
        dataIndex: 'voltageLevel',
        key: 'voltageLevel',
        align: 'left',
        width: K_SIZE_130,
        render: (voltageLevel: string) => getVoltageLevelLabel(voltageLevel)
      },
      {
        title: 'Hệ số nhân',
        dataIndex: 'multiplier',
        key: 'multiplier',
        align: 'right',
        width: K_SIZE_100,
        render: renderNumber
      },
      {
        title: 'Chỉ số đầu',
        dataIndex: 'initialReading',
        key: 'initialReading',
        align: 'right',
        width: K_SIZE_120,
        render: renderNumber
      },
      {
        title: 'Ngày mua',
        dataIndex: 'purchaseDate',
        key: 'purchaseDate',
        align: 'left',
        width: K_SIZE_120,
        render: renderDate
      },
      {
        title: 'Ngày lắp đặt',
        dataIndex: 'installationDate',
        key: 'installationDate',
        align: 'left',
        width: K_SIZE_120,
        render: renderDate
      },
      {
        title: 'Trạng thái',
        dataIndex: 'status',
        key: 'status',
        align: 'left',
        width: K_SIZE_130,
        render: (status: string) => (
          <Status
            type={getMeterStatusType(status)}
            kind={KIND_STATUS.SECONDARY}
            content={status || getMeterStatusLabel(status)}
          />
        )
      },
      {
        title: t('common:action'),
        fixed: 'right',
        width: K_SIZE_120,
        align: 'center',
        render: (_: unknown, record: Meter) => {
          const recordId = getMeterRecordId(record);
          return (
            <div className="flex justify-center gap-8">
              <IconHover
                rootClassName={'text-color-800'}
                title="Xem chi tiết"
                icon={'ICON_EYE_OPEN'}
                iconHeight={K_SIZE_18}
                onClick={() =>
                  recordId && router.push(`${ROUTES.MANAGE_METER_DETAIL}?id=${recordId}`)
                }
              />
              <IconHover
                rootClassName={'text-color-800'}
                title={t('common:edit')}
                icon={'ICON_EDIT'}
                iconHeight={K_SIZE_18}
                onClick={() =>
                  recordId && router.push(`${ROUTES.MANAGE_METER_EDIT}?id=${recordId}`)
                }
              />
              <IconHover
                rootClassName="text-error-500 hover:text-error-500"
                title={t('common:delete')}
                icon="IC_TRASH_OUTLINE"
                iconHeight={K_SIZE_18}
                onClick={() => onDeleteMeter(record)}
              />
            </div>
          );
        }
      }
    ],
    [currentPage, meterCodeMap, onDeleteMeter, router, t]
  );

  const getChildColumns = useCallback(
    (childPage: number): any[] => [
      {
        title: 'STT',
        key: 'index',
        align: 'center',
        width: K_SIZE_70,
        render: (_: unknown, __: Meter, index: number) =>
          (childPage - K_SIZE_1) * DEFAULT_PAGE_SIZE + index + K_SIZE_1
      },
      {
        title: 'Mã công tơ',
        dataIndex: 'meterCode',
        key: 'meterCode',
        align: 'left',
        width: K_SIZE_150,
        render: (text: string, record: Meter) => {
          const recordId = getMeterRecordId(record);
          return (
            <TextBase
              text={text || NULL_VALUE}
              classNames={'sub-title4 !text-secondary-500 cursor-pointer hover:!text-secondary-700'}
              onClick={() =>
                recordId && router.push(`${ROUTES.MANAGE_METER_DETAIL}?id=${recordId}`)
              }
            />
          );
        }
      },
      {
        title: 'Mã khách hàng',
        dataIndex: 'customerId',
        key: 'customerId',
        align: 'left',
        width: K_SIZE_150,
        render: (customerId: string, record: Meter) => (
          <span title={customerId || record.customerName || ''}>
            {customerId || record.customerName || NULL_VALUE}
          </span>
        )
      },
      {
        title: 'Loại công tơ',
        dataIndex: 'meterType',
        key: 'meterType',
        align: 'left',
        width: K_SIZE_150,
        render: (meterType: string) => getMeterTypeLabel(meterType)
      },
      {
        title: 'Công tơ cha / Lộ tổng',
        dataIndex: 'parentId',
        key: 'parentId',
        align: 'left',
        width: K_SIZE_150,
        render: (parentId: string) =>
          parentId ? meterCodeMap.get(parentId) || parentId : NULL_VALUE
      },
      {
        title: 'Cấp điện áp',
        dataIndex: 'voltageLevel',
        key: 'voltageLevel',
        align: 'left',
        width: K_SIZE_130,
        render: (voltageLevel: string) => getVoltageLevelLabel(voltageLevel)
      },
      {
        title: 'Hệ số nhân',
        dataIndex: 'multiplier',
        key: 'multiplier',
        align: 'right',
        width: K_SIZE_100,
        render: renderNumber
      },
      {
        title: 'Chỉ số đầu',
        dataIndex: 'initialReading',
        key: 'initialReading',
        align: 'right',
        width: K_SIZE_120,
        render: renderNumber
      },
      {
        title: 'Ngày mua',
        dataIndex: 'purchaseDate',
        key: 'purchaseDate',
        align: 'left',
        width: K_SIZE_120,
        render: renderDate
      },
      {
        title: 'Ngày lắp đặt',
        dataIndex: 'installationDate',
        key: 'installationDate',
        align: 'left',
        width: K_SIZE_120,
        render: renderDate
      },
      {
        title: 'Trạng thái',
        dataIndex: 'status',
        key: 'status',
        align: 'left',
        width: K_SIZE_130,
        render: (status: string) => (
          <Status
            type={getMeterStatusType(status)}
            kind={KIND_STATUS.SECONDARY}
            content={status || getMeterStatusLabel(status)}
          />
        )
      },
      {
        title: t('common:action'),
        width: K_SIZE_120,
        align: 'center',
        render: (_: unknown, record: Meter) => {
          const recordId = getMeterRecordId(record);
          return (
            <div className="flex justify-center gap-8">
              <IconHover
                rootClassName={'text-color-800'}
                title="Xem chi tiết"
                icon={'ICON_EYE_OPEN'}
                iconHeight={K_SIZE_18}
                onClick={() =>
                  recordId && router.push(`${ROUTES.MANAGE_METER_DETAIL}?id=${recordId}`)
                }
              />
              <IconHover
                rootClassName={'text-color-800'}
                title={t('common:edit')}
                icon={'ICON_EDIT'}
                iconHeight={K_SIZE_18}
                onClick={() =>
                  recordId && router.push(`${ROUTES.MANAGE_METER_EDIT}?id=${recordId}`)
                }
              />
              <IconHover
                rootClassName="text-error-500 hover:text-error-500"
                title={t('common:delete')}
                icon="IC_TRASH_OUTLINE"
                iconHeight={K_SIZE_18}
                onClick={() => onDeleteMeter(record)}
              />
            </div>
          );
        }
      }
    ],
    [meterCodeMap, onDeleteMeter, router, t]
  );

  const renderChildTable = useCallback(
    (record: Meter) => {
      const parentId = getMeterRecordId(record);
      const childState = childMeterMap[parentId] || {
        items: [],
        total: 0,
        currentPage: K_SIZE_1,
        loading: false,
        loaded: false
      };
      const childPagination = {
        current: childState.currentPage,
        total: childState.total,
        pageSize: DEFAULT_PAGE_SIZE,
        onChange: (page: number) => fetchChildMeters(parentId, page),
        showSizeChanger: false
      };

      return (
        <div className="rounded-radius-l border border-color-300 bg-color-50 p-12">
          <Flex justify="space-between" align="center" className="mb-8">
            <TextBase classNames="sub-title4 !text-color-900" text="Danh sách công tơ thuộc lộ" />
            <div className="text-13 font-medium text-color-700">
              Hiển thị {childState.items.length} / {childState.total} bản ghi
            </div>
          </Flex>
          <AppTable
            rootClassName="w-full"
            className="[&_.ant-table-pagination]:hidden"
            scroll={{ x: 'max-content' }}
            dataSource={childState.items}
            loading={childState.loading}
            columns={getChildColumns(childState.currentPage)}
            rowKey={(childRecord: any) => getMeterRecordId(childRecord) || childRecord.meterCode}
            pagination={false}
          />
          <AppPagination
            currentPage={childState.currentPage}
            total={childState.total}
            pagination={childPagination}
            className="px-4 pb-4"
          />
        </div>
      );
    },
    [childMeterMap, fetchChildMeters, getChildColumns]
  );

  const TagFilterGroup = useCallback(() => {
    const entries = Object.entries(filterApplied) as [keyof MeterFilterForm, string][];
    const activeFilters = entries.filter(([, value]) => Boolean(value));
    const formatValue = (key: keyof MeterFilterForm, value: string) => {
      switch (key) {
        case 'status':
          return METER_STATUS_LABEL_MAP[value] || value;
        case 'meterType':
          return getMeterTypeLabel(value);
        case 'voltageLevel':
          return VOLTAGE_LEVEL_LABEL_MAP[value] || value;
        case 'customerId':
          return getCustomerDisplay(value);
        default:
          return value;
      }
    };
    const labelMap: Record<keyof MeterFilterForm, string> = {
      meterCodeContains: 'Mã công tơ',
      customerId: 'Mã khách hàng',
      meterType: 'Loại công tơ',
      status: 'Trạng thái',
      voltageLevel: 'Cấp điện áp',
      installationDateFrom: 'Ngày lắp đặt từ',
      installationDateTo: 'Ngày lắp đặt đến',
      purchaseDateFrom: 'Ngày mua từ',
      purchaseDateTo: 'Ngày mua đến'
    };
    return (
      <div
        className={`flex w-full flex-wrap items-center gap-8 ${activeFilters.length ? 'mb-8' : ''}`}
      >
        {activeFilters.map(([key, value]) => {
          const valueFilter = formatValue(key, value);
          if (!valueFilter) return null;
          return (
            <TagFilter
              key={key}
              content={`${labelMap[key]}: ${valueFilter}`}
              onClose={() => onResetFilter(key)}
            />
          );
        })}
      </div>
    );
  }, [filterApplied, getCustomerDisplay, onResetFilter]);

  const breadcrumbList = [
    {
      title: 'Trang chủ'
    },
    {
      title: 'Công tơ & lộ'
    },
    {
      title: 'Quản lý công tơ & lộ',
      key: ROUTES.METER_MANAGEMENT
    }
  ];

  return (
    <PageWithBreadcrumb breadcrumbList={breadcrumbList}>
      <div>
        <Flex
          justify={'space-between'}
          align={'center'}
          gap={K_SIZE_8}
          className={'tablet:flex-col tablet:items-start'}
        >
          <TextBase classNames="title4" text={'Quản lý công tơ & lộ (công tơ tổng)'} />
          <Flex
            flex={K_SIZE_1}
            justify={'end'}
            gap={K_SIZE_16}
            className={'mobile:w-full mobile:flex-col'}
          >
            <ButtonBase
              type={'ghost'}
              leftIcon={'IC_UPLOAD_OUTLINE'}
              customContent="Import Excel"
              classNames={'mobile:flex-1 mobile:justify-center'}
              onClick={onImport}
            />
            <ButtonBase
              type={'primary'}
              leftIcon={'IC_ADD_OUTLINE2'}
              customContent="Thêm công tơ"
              classNames={'mobile:flex-1 mobile:justify-center'}
              onClick={() => router.push(ROUTES.MANAGE_METER_ADD)}
            />
          </Flex>
        </Flex>
        <Divider className={'my-16'} />

        <div className="mb-12 rounded-radius-l border border-color-300 bg-color-50 p-16">
          <div className="grid grid-cols-5 gap-16 tablet:grid-cols-2 mobile:grid-cols-1">
            <AppTextField
              name="meterCodeContains"
              label="Mã công tơ"
              placeholder="Nhập mã công tơ"
              value={filterDraft.meterCodeContains}
              onChange={(event) => onChangeFilter('meterCodeContains', event.target.value)}
              onPressEnter={onApplyFilter}
              suffix={<IconSvgLocal name="ICON_SEARCH" height={20} width={20} />}
            />
            <AppSelect
              name="customerId"
              label="Mã khách hàng"
              placeholder="Nhập mã khách hàng"
              value={filterDraft.customerId}
              options={[ALL_OPTION, ...customerOptions]}
              dropdownRender={customerDropdownRender}
              onOpenChange={onOpenCustomerDropdown}
              onSelectOption={({ key }) => onChangeFilter('customerId', String(key))}
              suffix={<IconSvgLocal name="ICON_SEARCH" height={20} width={20} />}
            />
            <AppSelect
              name="meterType"
              label="Loại công tơ"
              placeholder="Chọn loại công tơ"
              value={filterDraft.meterType}
              options={[ALL_OPTION, ...METER_TYPE_OPTIONS]}
              onSelectOption={({ key }) => onChangeFilter('meterType', String(key))}
            />
            <AppSelect
              name="status"
              label="Trạng thái"
              placeholder="Chọn trạng thái"
              value={filterDraft.status}
              options={[ALL_OPTION, ...METER_STATUS_OPTIONS]}
              onSelectOption={({ key }) => onChangeFilter('status', String(key))}
            />
            <AppSelect
              name="voltageLevel"
              label="Cấp điện áp"
              placeholder="Chọn cấp điện áp"
              value={filterDraft.voltageLevel}
              options={[ALL_OPTION, ...VOLTAGE_LEVEL_OPTIONS]}
              onSelectOption={({ key }) => onChangeFilter('voltageLevel', String(key))}
            />
            <AppDatePicker
              name="installationDateFrom"
              label="Ngày lắp đặt từ"
              placeholder="dd/mm/yyyy"
              wrapperClassName="w-full"
              datePickerClassName="w-full"
              allowClear
              value={
                filterDraft.installationDateFrom
                  ? dayjs(filterDraft.installationDateFrom, FORMAT_DATE_API)
                  : null
              }
              onChange={(date) =>
                onChangeFilter('installationDateFrom', date ? date.format(FORMAT_DATE_API) : '')
              }
            />
            <div className="grid grid-cols-[24px_minmax(0,1fr)] items-end gap-8 tablet:grid-cols-1">
              <div className="pb-12 text-center text-13 font-semibold text-color-800 tablet:hidden">
                đến
              </div>
              <AppDatePicker
                name="installationDateTo"
                label=" "
                placeholder="dd/mm/yyyy"
                wrapperClassName="w-full"
                datePickerClassName="w-full"
                allowClear
                value={
                  filterDraft.installationDateTo
                    ? dayjs(filterDraft.installationDateTo, FORMAT_DATE_API)
                    : null
                }
                onChange={(date) =>
                  onChangeFilter('installationDateTo', date ? date.format(FORMAT_DATE_API) : '')
                }
              />
            </div>
            <AppDatePicker
              name="purchaseDateFrom"
              label="Ngày mua từ"
              placeholder="dd/mm/yyyy"
              wrapperClassName="w-full"
              datePickerClassName="w-full"
              allowClear
              value={
                filterDraft.purchaseDateFrom
                  ? dayjs(filterDraft.purchaseDateFrom, FORMAT_DATE_API)
                  : null
              }
              onChange={(date) =>
                onChangeFilter('purchaseDateFrom', date ? date.format(FORMAT_DATE_API) : '')
              }
            />
            <div className="grid grid-cols-[24px_minmax(0,1fr)] items-end gap-8 tablet:grid-cols-1">
              <div className="pb-12 text-center text-13 font-semibold text-color-800 tablet:hidden">
                đến
              </div>
              <AppDatePicker
                name="purchaseDateTo"
                label=" "
                placeholder="dd/mm/yyyy"
                wrapperClassName="w-full"
                datePickerClassName="w-full"
                allowClear
                value={
                  filterDraft.purchaseDateTo
                    ? dayjs(filterDraft.purchaseDateTo, FORMAT_DATE_API)
                    : null
                }
                onChange={(date) =>
                  onChangeFilter('purchaseDateTo', date ? date.format(FORMAT_DATE_API) : '')
                }
              />
            </div>
            <div className="flex items-end justify-end gap-16 tablet:col-span-2 mobile:col-span-1 mobile:flex-col">
              <ButtonBase
                type="ghost"
                leftIcon="IC_HISTORY_OUTLINE"
                customContent="Làm mới"
                onClick={() => onResetFilter()}
                classNames="min-w-[112px] mobile:w-full mobile:justify-center"
              />
              <ButtonBase
                type="primary"
                leftIcon="IC_SEARCH_OUTLINE2"
                customContent="Tìm kiếm"
                onClick={onApplyFilter}
                classNames="min-w-[112px] mobile:w-full mobile:justify-center"
              />
            </div>
          </div>
        </div>

        {/*<div className="mb-12 grid grid-cols-5 gap-12 tablet:grid-cols-2 mobile:grid-cols-1">*/}
        {/*  <StatCard*/}
        {/*    label="Tổng công tơ"*/}
        {/*    value={formatCompactNumber(meterStats.total)}*/}
        {/*    colorClassName="bg-[#0B63F6]"*/}
        {/*    icon={<IconSvgLocal name="IC_DOWNLOAD_OUTLINE" height={22} width={22} fill="#fff" />}*/}
        {/*  />*/}
        {/*  <StatCard*/}
        {/*    label="Công tơ tổng (lộ)"*/}
        {/*    value={formatCompactNumber(meterStats.feeder)}*/}
        {/*    colorClassName="bg-[#F97316]"*/}
        {/*    icon={<IconSvgLocal name="ICON_MORE" height={22} width={22} fill="#fff" />}*/}
        {/*  />*/}
        {/*  <StatCard*/}
        {/*    label="Công tơ đã lắp"*/}
        {/*    value={formatCompactNumber(meterStats.installed)}*/}
        {/*    colorClassName="bg-[#4F46E5]"*/}
        {/*    icon={<IconSvgLocal name="ICON_EYE_OPEN" height={22} width={22} fill="#fff" />}*/}
        {/*  />*/}
        {/*  <StatCard*/}
        {/*    label="Công tơ chưa lắp"*/}
        {/*    value={formatCompactNumber(meterStats.notInstalled)}*/}
        {/*    colorClassName="bg-[#22C55E]"*/}
        {/*    icon={<IconSvgLocal name="IC_UPLOAD_OUTLINE" height={22} width={22} fill="#fff" />}*/}
        {/*  />*/}
        {/*  <StatCard*/}
        {/*    label="Đang hoạt động"*/}
        {/*    value={formatCompactNumber(meterStats.active)}*/}
        {/*    extra={`(${formatPercent(meterStats.activeRate)}%)`}*/}
        {/*    colorClassName="bg-[#06B6D4]"*/}
        {/*    icon={<IconSvgLocal name="ICON_SEARCH" height={22} width={22} fill="#fff" />}*/}
        {/*  />*/}
        {/*</div>*/}

        <TagFilterGroup />

        <div
          className={'overflow-hidden rounded-radius-l border border-color-400 bg-color-50 pb-4'}
        >
          <Flex
            justify="space-between"
            align="center"
            className="border-b border-color-300 px-16 py-12"
          >
            <TextBase classNames="sub-title3 !text-color-900" text="Danh sách công tơ" />
            <div className="text-14 font-medium text-color-700">
              Hiển thị {meterList.length} bản ghi
            </div>
          </Flex>
          <AppTable
            rootClassName={'w-full'}
            className={'[&_.ant-table-pagination]:hidden'}
            scroll={{ x: 'max-content', y: '68vh' }}
            dataSource={meterList}
            loading={loadingMeterList}
            columns={columns}
            rowKey={(record: any) => getMeterRecordId(record) || record.meterCode}
            pagination={pagination}
            expandable={{
              expandedRowKeys,
              expandedRowRender: (record) => renderChildTable(record as Meter),
              onExpand: (expanded, record) => onExpandMeterRow(expanded, record as Meter),
              expandIcon: ({ expanded, onExpand, record }) => (
                <div
                  className="flex cursor-pointer"
                  onClick={(event) => {
                    event.stopPropagation();
                    onExpand(record, event);
                  }}
                  aria-hidden="true"
                >
                  <IconSvgLocal
                    height={20}
                    width={20}
                    name="ICON_ARROW_LEFT"
                    classNames={expanded ? '-rotate-90' : 'rotate-180'}
                  />
                </div>
              )
            }}
          />
          <div className="px-16 pb-12">
            <AppPagination currentPage={currentPage} total={total} pagination={pagination} />
          </div>
        </div>
      </div>
    </PageWithBreadcrumb>
  );
};

export default MeterManagementScreen;
