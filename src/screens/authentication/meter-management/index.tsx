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
  K_SIZE_8,
  NULL_VALUE
} from '@constant';
import { Divider, Flex } from 'antd';
import ButtonBase from 'components/button';
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
import { useCallback, useMemo } from 'react';
import { displayDateFromServer } from 'utils/date';
import useManageMeter, { MeterFilterForm } from './hooks/useManageMeter';
import {
  getMeterRecordId,
  getMeterStatusLabel,
  getMeterStatusType,
  getVoltageLevelLabel,
  METER_STATUS_OPTIONS,
  METER_STATUS_LABEL_MAP,
  VOLTAGE_TYPE_OPTIONS,
  VOLTAGE_TYPE_LABEL_MAP
} from './utils/constant';

const ALL_OPTION: AppSelectOption = { value: '', label: 'Tất cả' };

const renderDate = (date?: string) => (date ? displayDateFromServer(date) : NULL_VALUE);

const renderNumber = (value?: string | number) => {
  if (value === undefined || value === null || value === '') return NULL_VALUE;
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return String(value);
  return new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 2 }).format(numericValue);
};

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
    exportLoading,
    currentPage,
    pagination,
    onChangeFilter,
    onApplyFilter,
    onResetFilter,
    meterList,
    total,
    onExport,
    onImport
  } = useManageMeter();

  const columns = useMemo<any[]>(
    () => [
      {
        title: 'STT',
        key: 'index',
        align: 'center',
        width: K_SIZE_100,
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
        title: 'Ngày lắp đặt',
        dataIndex: 'installationDate',
        key: 'installationDate',
        align: 'left',
        width: K_SIZE_130,
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
            content={getMeterStatusLabel(status)}
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
            </div>
          );
        }
      }
    ],
    [currentPage, router, t]
  );

  const TagFilterGroup = useCallback(() => {
    const entries = Object.entries(filterApplied) as [keyof MeterFilterForm, string][];
    const activeFilters = entries.filter(([, value]) => Boolean(value));
    const formatValue = (key: keyof MeterFilterForm, value: string) => {
      switch (key) {
        case 'status':
          return METER_STATUS_LABEL_MAP[value] || value;
        case 'voltageType':
          return VOLTAGE_TYPE_LABEL_MAP[value] || value;
        case 'customerId':
          return getCustomerDisplay(value);
        default:
          return value;
      }
    };
    const labelMap: Record<keyof MeterFilterForm, string> = {
      meterCodeContains: 'Mã công tơ',
      customerId: 'Mã khách hàng',
      status: 'Trạng thái',
      voltageType: 'Kiểu điện áp'
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
              type={'ghost'}
              leftIcon={'IC_DOWNLOAD_OUTLINE'}
              customContent={exportLoading ? 'Đang xuất...' : 'Xuất Excel'}
              disabled={exportLoading}
              classNames={'mobile:flex-1 mobile:justify-center'}
              onClick={onExport}
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
              name="status"
              label="Trạng thái"
              placeholder="Chọn trạng thái"
              value={filterDraft.status}
              options={[ALL_OPTION, ...METER_STATUS_OPTIONS]}
              onSelectOption={({ key }) => onChangeFilter('status', String(key))}
            />
            <AppSelect
              name="voltageType"
              label="Kiểu điện áp"
              placeholder="Chọn kiểu điện áp"
              value={filterDraft.voltageType}
              options={[ALL_OPTION, ...VOLTAGE_TYPE_OPTIONS]}
              onSelectOption={({ key }) => onChangeFilter('voltageType', String(key))}
            />
            <div className="flex items-end justify-end gap-8 tablet:col-span-2 mobile:col-span-1 mobile:flex-col">
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

        <TagFilterGroup />

        <div
          className={'overflow-hidden rounded-radius-l border border-color-400 bg-color-50 pb-4'}
        >
          <Flex justify="space-between" align="center" className="px-16 py-12">
            <TextBase classNames="sub-title3 !text-primary-700" text="Danh sách công tơ" />
            <div className="text-14 font-medium text-color-700">
              Hiển thị {meterList.length} bản ghi
            </div>
          </Flex>
          <AppTable
            rootClassName={'w-full'}
            className={'[&_.ant-pagination]:hidden'}
            scroll={{ x: 'max-content', y: '68vh' }}
            dataSource={meterList}
            loading={loadingMeterList}
            columns={columns}
            rowKey={(record: any) => getMeterRecordId(record) || record.meterCode}
            pagination={pagination}
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
