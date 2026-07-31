'use client';

import {
  K_SIZE_0,
  K_SIZE_1,
  K_SIZE_108,
  K_SIZE_130,
  K_SIZE_16,
  K_SIZE_160,
  K_SIZE_18,
  K_SIZE_200,
  K_SIZE_220,
  K_SIZE_8,
  NULL_VALUE,
  REQUIRED_MARK
} from '@constant';
import { Divider, Drawer, Flex, Spin } from 'antd';
import ButtonBase from 'components/button';
import IconHover from 'components/icon-vec-local/icon-hover';
import { AppSelect, AppSelectControl } from 'components/select';
import { AppSwitchControl } from 'components/switch';
import AppTable from 'components/table';
import AppPagination from 'components/table/pagination';
import TagFilter from 'components/tag-filter';
import { TextBase } from 'components/text';
import { AppTextField, AppTextFieldControl } from 'components/text-field';
import { ROUTES } from 'config/routes';
import PageWithBreadcrumb from 'layout/AppLayout/PageWithBreadcumb';
import { ServiceLocation } from 'model/service-location';
import { useMemo } from 'react';
import { displayDateTimeFromServer } from 'utils/date';
import { useResponsive } from 'utils/responsive';
import useManageServiceLocation, {
  type ServiceLocationFilterForm
} from './useManageServiceLocation';

const VOLTAGE_LEVEL_OPTIONS = [
  { value: 'HA_AP', label: 'Hạ áp' },
  { value: 'TRUNG_AP', label: 'Trung áp' },
  { value: 'CAO_AP', label: 'Cao áp' }
];

const USAGE_PURPOSE_OPTIONS = [
  { value: 'SINH_HOAT', label: 'Sinh hoạt' },
  { value: 'SAN_XUAT', label: 'Sản xuất' },
  { value: 'KINH_DOANH', label: 'Kinh doanh' },
  { value: 'HC', label: 'HC' }
];

const ALL_OPTION = { value: '', label: 'Tất cả' };

const VOLTAGE_LEVEL_LABEL_MAP: Record<string, string> = {
  HA_AP: 'Hạ áp',
  TRUNG_AP: 'Trung áp',
  CAO_AP: 'Cao áp',
  V_0_4_KV: 'Hạ áp',
  V_6_KV: 'Trung áp',
  V_22_KV: 'Trung áp',
  V_35_KV: 'Trung áp',
  V_110_KV: 'Cao áp',
  '0.4kV': 'Hạ áp',
  '6kV': 'Trung áp',
  '22kV': 'Trung áp',
  '35kV': 'Trung áp',
  '110kV': 'Cao áp',
  'Hạ áp': 'Hạ áp',
  'Trung áp': 'Trung áp',
  'Cao áp': 'Cao áp'
};

const USAGE_PURPOSE_LABEL_MAP: Record<string, string> = {
  SINH_HOAT: 'Sinh hoạt',
  SAN_XUAT: 'Sản xuất',
  KINH_DOANH: 'Kinh doanh',
  HC: 'HC',
  'Sinh hoạt': 'Sinh hoạt',
  'Sản xuất': 'Sản xuất',
  'Kinh doanh': 'Kinh doanh'
};

const FILTER_LABEL_MAP: Record<keyof ServiceLocationFilterForm, string> = {
  keyword: 'Từ khóa',
  contractId: 'Mã hợp đồng',
  customerId: 'Mã khách hàng',
  voltageLevel: 'Cấp điện áp',
  usagePurpose: 'Mục đích sử dụng'
};

const renderText = (text?: string) => text || NULL_VALUE;

const renderTruncatedText = (text?: string, className = 'max-w-[220px]') => (
  <div title={text} className={`${className} truncate`}>
    {text || NULL_VALUE}
  </div>
);

const ManageServiceLocationScreen = () => {
  const { isMobile, isTablet } = useResponsive();
  const {
    t,
    serviceLocationList,
    total,
    listLoading,
    detailLoading,
    currentPage,
    pagination,
    filter,
    filterApplied,
    onChangeFilter,
    onApplyFilter,
    onResetFilter,
    openForm,
    selectedLocation,
    form,
    handleSubmit,
    onOpenCreate,
    onOpenUpdate,
    onCloseForm,
    onDelete
  } = useManageServiceLocation();

  const {
    control,
    handleSubmit: handleFormSubmit,
    watch,
    formState: { isValid, isDirty }
  } = form;
  const unassignMeter = watch('unassignMeter');

  const activeFilters = useMemo(
    () =>
      (Object.entries(filterApplied) as [keyof ServiceLocationFilterForm, string][]).filter(
        ([, value]) => Boolean(value)
      ),
    [filterApplied]
  );

  const formatFilterValue = (key: keyof ServiceLocationFilterForm, value: string) => {
    if (key === 'voltageLevel') return VOLTAGE_LEVEL_LABEL_MAP[value] || value;
    if (key === 'usagePurpose') return USAGE_PURPOSE_LABEL_MAP[value] || value;
    return value;
  };

  const columns = useMemo<any[]>(
    () => [
      {
        title: 'Địa chỉ sử dụng điện',
        dataIndex: 'address',
        key: 'address',
        width: K_SIZE_220,
        render: (text: string) => renderTruncatedText(text, 'max-w-[260px]')
      },
      {
        title: 'Phường/Xã',
        dataIndex: 'ward',
        key: 'ward',
        width: K_SIZE_160,
        render: renderText
      },
      {
        title: 'Mã hợp đồng',
        dataIndex: 'contractId',
        key: 'contractId',
        width: K_SIZE_200,
        render: (text: string) => renderTruncatedText(text)
      },
      {
        title: 'Mã khách hàng',
        dataIndex: 'customerId',
        key: 'customerId',
        width: K_SIZE_200,
        render: (text: string) => renderTruncatedText(text)
      },
      {
        title: 'Công tơ',
        dataIndex: 'meterId',
        key: 'meterId',
        width: K_SIZE_200,
        render: (text: string) => renderTruncatedText(text)
      },
      {
        title: 'Cấp điện áp',
        dataIndex: 'voltageLevel',
        key: 'voltageLevel',
        width: K_SIZE_130,
        render: (text: string) => VOLTAGE_LEVEL_LABEL_MAP[text] || text || NULL_VALUE
      },
      {
        title: 'Mục đích sử dụng',
        dataIndex: 'usagePurpose',
        key: 'usagePurpose',
        width: K_SIZE_160,
        render: (text: string) => USAGE_PURPOSE_LABEL_MAP[text] || text || NULL_VALUE
      },
      {
        title: t('common:created_at'),
        dataIndex: 'createdAt',
        key: 'createdAt',
        width: K_SIZE_200,
        render: (text: string) => displayDateTimeFromServer(text)
      },
      {
        title: t('common:action'),
        fixed: 'right',
        align: 'center',
        width: K_SIZE_108,
        render: (_: unknown, record: ServiceLocation) => (
          <div className="flex justify-center gap-8">
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
    [onDelete, onOpenUpdate, t]
  );

  const breadcrumbList = [
    {
      title: 'Hợp đồng'
    },
    {
      title: 'Quản lý địa điểm sử dụng điện',
      key: ROUTES.MANAGE_SERVICE_LOCATION
    }
  ];

  return (
    <PageWithBreadcrumb breadcrumbList={breadcrumbList}>
      <section>
        <Flex
          justify="space-between"
          align="center"
          gap={K_SIZE_8}
          className="mobile:flex-col mobile:items-start"
        >
          <TextBase classNames="title4" text="Quản lý địa điểm sử dụng điện" />
          <Flex
            flex={K_SIZE_1}
            justify="end"
            gap={K_SIZE_16}
            className="mobile:mt-8 mobile:w-full mobile:flex-col"
          >
            <ButtonBase
              type="ghost"
              leftIcon="IC_ADD_OUTLINE2"
              customContent="Thêm địa điểm"
              onClick={onOpenCreate}
              classNames="mobile:flex-1 mobile:justify-center"
            />
          </Flex>
        </Flex>
        <Divider className="my-16" />

        <div className="mb-12 grid grid-cols-[minmax(180px,1.2fr)_minmax(160px,1fr)_minmax(160px,1fr)_minmax(150px,1fr)_minmax(170px,1fr)_auto] items-end gap-12 rounded-radius-l border border-color-300 bg-color-50 p-12 desktop:grid-cols-3 tablet:grid-cols-2 mobile:grid-cols-1">
          <AppTextField
            name="keyword"
            label="Từ khóa"
            placeholder="Nhập địa chỉ, phường/xã"
            value={filter.keyword}
            onChange={(event) => onChangeFilter('keyword', event.target.value)}
            onPressEnter={onApplyFilter}
          />
          <AppTextField
            name="contractId"
            label="Mã hợp đồng"
            placeholder="Nhập mã hợp đồng"
            value={filter.contractId}
            onChange={(event) => onChangeFilter('contractId', event.target.value)}
            onPressEnter={onApplyFilter}
          />
          <AppTextField
            name="customerId"
            label="Mã khách hàng"
            placeholder="Nhập mã khách hàng"
            value={filter.customerId}
            onChange={(event) => onChangeFilter('customerId', event.target.value)}
            onPressEnter={onApplyFilter}
          />
          <AppSelect
            name="voltageLevel"
            label="Cấp điện áp"
            placeholder="Chọn cấp điện áp"
            value={filter.voltageLevel}
            options={[ALL_OPTION, ...VOLTAGE_LEVEL_OPTIONS]}
            onSelectOption={({ key }) => onChangeFilter('voltageLevel', String(key))}
          />
          <AppSelect
            name="usagePurpose"
            label="Mục đích sử dụng"
            placeholder="Chọn mục đích sử dụng"
            value={filter.usagePurpose}
            options={[ALL_OPTION, ...USAGE_PURPOSE_OPTIONS]}
            onSelectOption={({ key }) => onChangeFilter('usagePurpose', String(key))}
          />
          <Flex justify="end" gap={K_SIZE_8} className="col-span-full">
            <ButtonBase
              type="ghost"
              customContent="Xoá bộ lọc"
              onClick={() => onResetFilter()}
              classNames="min-w-[104px] mobile:flex-1 mobile:justify-center"
            />
            <ButtonBase
              type="primary"
              leftIcon="IC_SEARCH_OUTLINE2"
              customContent="Tìm kiếm"
              onClick={onApplyFilter}
              classNames="min-w-[112px] mobile:flex-1 mobile:justify-center"
            />
          </Flex>
        </div>

        {activeFilters.length > K_SIZE_0 && (
          <div className="mb-8 flex w-full flex-wrap items-center gap-8">
            {activeFilters.map(([key, value]) => (
              <TagFilter
                key={key}
                content={`${FILTER_LABEL_MAP[key]}: ${formatFilterValue(key, value)}`}
                onClose={() => onResetFilter(key)}
              />
            ))}
          </div>
        )}

        <Spin spinning={listLoading && serviceLocationList.length > K_SIZE_0}>
          <div className="overflow-hidden rounded-radius-l border border-color-400 duration-500">
            <AppTable
              loading={listLoading}
              rootClassName="w-full"
              className="[&_.ant-pagination]:hidden"
              scroll={{ x: 'max-content', y: '75vh' }}
              dataSource={serviceLocationList}
              columns={columns}
              rowKey="id"
              pagination={pagination}
            />
          </div>
          <AppPagination currentPage={currentPage} total={total} pagination={pagination} />
        </Spin>

        <form id="service-location-form" onSubmit={handleFormSubmit(handleSubmit)}>
          <Drawer
            open={openForm}
            title={
              <Flex justify="space-between" align="center">
                <div>{selectedLocation ? 'Cập nhật địa điểm' : 'Thêm địa điểm'}</div>
                <IconHover title="" icon="IC_CLOSE_OUTLINE" onClick={onCloseForm} />
              </Flex>
            }
            destroyOnClose
            placement="right"
            closable={false}
            onClose={onCloseForm}
            width={isTablet || isMobile ? '80vw' : '40vw'}
            footer={
              <Flex justify="end" gap={K_SIZE_8}>
                <ButtonBase
                  classNames="app-common-btn"
                  type="ghost"
                  customContent={t('common:close')}
                  onClick={onCloseForm}
                />
                <ButtonBase
                  classNames="app-common-btn"
                  type="primary"
                  form="service-location-form"
                  htmlType="submit"
                  disabled={!isValid || Boolean(selectedLocation && !isDirty) || detailLoading}
                  customContent={
                    <div className="flex flex-row items-center justify-center">
                      <div>{t('common:confirm')}</div>
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
            <div className="grid gap-12">
              <AppTextFieldControl
                name="contractId"
                label="Mã hợp đồng"
                labelSuffix={REQUIRED_MARK}
                labelSuffixClassName="text-error-600"
                placeholder="Nhập mã hợp đồng"
                control={control}
                disabled={Boolean(selectedLocation)}
              />
              <AppTextFieldControl
                name="address"
                label="Địa chỉ sử dụng điện"
                labelSuffix={REQUIRED_MARK}
                labelSuffixClassName="text-error-600"
                placeholder="Nhập số nhà, đường"
                control={control}
              />
              <AppTextFieldControl
                name="ward"
                label="Phường/Xã"
                labelSuffix={REQUIRED_MARK}
                labelSuffixClassName="text-error-600"
                placeholder="Nhập phường/xã"
                control={control}
              />
              <AppSelectControl
                name="voltageLevel"
                label="Cấp điện áp"
                labelSuffix={<span className="text-error-600">{REQUIRED_MARK}</span>}
                placeholder="Chọn cấp điện áp"
                options={VOLTAGE_LEVEL_OPTIONS}
                control={control}
              />
              <AppSelectControl
                name="usagePurpose"
                label="Mục đích sử dụng"
                labelSuffix={<span className="text-error-600">{REQUIRED_MARK}</span>}
                placeholder="Chọn mục đích sử dụng"
                options={USAGE_PURPOSE_OPTIONS}
                control={control}
              />
              <AppTextFieldControl
                name="meterId"
                label="Mã công tơ lắp đặt"
                placeholder="Nhập mã công tơ"
                control={control}
                disabled={Boolean(unassignMeter)}
              />
              {selectedLocation && (
                <AppSwitchControl
                  name="unassignMeter"
                  label="Gỡ liên kết công tơ"
                  labelChecked="Có"
                  labelUnchecked="Không"
                  control={control}
                />
              )}
            </div>
          </Drawer>
        </form>
      </section>
    </PageWithBreadcrumb>
  );
};

export default ManageServiceLocationScreen;
