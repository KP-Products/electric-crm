'use client';

import {
  CURRENCY_VND,
  DEFAULT_PAGE_SIZE,
  K_SIZE_0,
  K_SIZE_1,
  K_SIZE_100,
  K_SIZE_120,
  K_SIZE_130,
  K_SIZE_150,
  K_SIZE_160,
  K_SIZE_18,
  K_SIZE_200,
  K_SIZE_220,
  K_SIZE_8,
  NULL_VALUE,
  REQUIRED_MARK
} from '@constant';
import { Divider, Drawer, Flex, Spin } from 'antd';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import type { ReactNode } from 'react';
import { useMemo } from 'react';

import ButtonBase from 'components/button';
import { AppDatePicker, AppDatePickerControl } from 'components/date-picker';
import IconHover from 'components/icon-vec-local/icon-hover';
import { AppSelect, AppSelectControl, AppSelectOption } from 'components/select';
import Status, { KIND_STATUS, TYPE_STATUS } from 'components/status';
import AppTable from 'components/table';
import AppPagination from 'components/table/pagination';
import { AppTakeNoteControl } from 'components/take-note';
import TagFilter from 'components/tag-filter';
import { TextBase } from 'components/text';
import { AppTextField, AppTextFieldControl } from 'components/text-field';
import { ROUTES } from 'config/routes';
import PageWithBreadcrumb from 'layout/AppLayout/PageWithBreadcumb';
import { OperationPrice } from 'model/operation-price';
import moment from 'moment';
import { API_DATE_INPUT_FORMATS, displayDateTimeFromServer } from 'utils/date';
import { formatCurrency as formatCurrencyBase } from 'utils/math';
import { useResponsive } from 'utils/responsive';
import useOperationPrice, {
  DATE_API_FORMAT,
  OPERATION_PRICE_STATUS,
  OperationPriceFilter
} from './useOperationPrice';

const STATUS_OPTIONS: AppSelectOption[] = [
  { value: OPERATION_PRICE_STATUS.ACTIVE, label: 'Hiệu lực' },
  { value: OPERATION_PRICE_STATUS.INACTIVE, label: 'Hết hiệu lực' }
];

const DISCOUNT_TYPE_OPTIONS: AppSelectOption[] = [
  { value: 'PERCENT', label: 'Phần trăm' },
  { value: 'AMOUNT', label: 'Số tiền' }
];

const DATE_DISPLAY_FORMAT = 'DD/MM/YYYY';

const FILTER_LABEL_MAP: Record<keyof OperationPriceFilter, string> = {
  priceCode: 'Mã đơn giá',
  priceName: 'Tên đơn giá',
  status: 'Trạng thái',
  effectiveFrom: 'Hiệu lực từ',
  effectiveTo: 'Hiệu lực đến'
};

const displayText = (value?: string | number | null) => {
  if (value === undefined || value === null || value === '') return NULL_VALUE;
  return String(value);
};

const renderTruncatedText = (text?: string | null, className = 'max-w-[220px]') => (
  <div title={text || ''} className={`${className} truncate`}>
    {displayText(text)}
  </div>
);

const formatCurrency = (value?: number | null) => {
  if (value === undefined || value === null || !Number.isFinite(value)) return NULL_VALUE;
  return formatCurrencyBase(Math.round(value), ',', CURRENCY_VND) || NULL_VALUE;
};

const getStatusMeta = (status?: number | string) => {
  if (
    status === OPERATION_PRICE_STATUS.ACTIVE ||
    status === '1' ||
    status === 'ACTIVE' ||
    status === 'HIEU_LUC'
  ) {
    return { label: 'Hiệu lực', type: TYPE_STATUS.SUCCESS };
  }

  if (
    status === OPERATION_PRICE_STATUS.INACTIVE ||
    status === '0' ||
    status === 'INACTIVE' ||
    status === 'HET_HIEU_LUC'
  ) {
    return { label: 'Hết hiệu lực', type: TYPE_STATUS.ERROR };
  }

  return { label: displayText(status), type: TYPE_STATUS.PENDING };
};

const getDiscountTypeLabel = (discountType?: string) =>
  DISCOUNT_TYPE_OPTIONS.find((option) => option.value === discountType)?.label || discountType;

const formatDiscount = (discountType?: string, discountValue?: number) => {
  if (!discountType || discountValue === undefined || discountValue === null) return NULL_VALUE;
  if (discountType === 'PERCENT') return `${discountValue}%`;
  if (discountType === 'AMOUNT') return formatCurrency(discountValue);
  return `${getDiscountTypeLabel(discountType)} - ${discountValue}`;
};

const getDatePickerValue = (date?: string) =>
  date ? dayjs(date, [DATE_API_FORMAT, ...API_DATE_INPUT_FORMATS]) : null;

const displayOperationPriceDate = (date?: string) => {
  if (!date) return NULL_VALUE;
  const parsedDate = moment(date, [...API_DATE_INPUT_FORMATS, moment.ISO_8601], true);
  return parsedDate.isValid() ? parsedDate.format(DATE_DISPLAY_FORMAT) : NULL_VALUE;
};

const isActiveFilter = (value: OperationPriceFilter[keyof OperationPriceFilter]) => value !== '';

const getFilterDisplayValue = (
  key: keyof OperationPriceFilter,
  value: OperationPriceFilter[keyof OperationPriceFilter]
) => {
  if (key === 'status') return getStatusMeta(value).label;
  if (key === 'effectiveFrom' || key === 'effectiveTo') {
    return displayOperationPriceDate(String(value));
  }
  return String(value);
};

const DetailItem = ({ label, value }: { label: string; value: ReactNode }) => (
  <div className="min-w-0">
    <div className="mb-4 text-12 font-semibold text-color-700">{label}</div>
    <div className="break-words text-14 font-medium text-color-900">{value || NULL_VALUE}</div>
  </div>
);

const OperationPriceScreen = () => {
  const { isMobile, isTablet } = useResponsive();
  const {
    t,
    operationPriceList,
    total,
    listLoading,
    detailLoading,
    lookupLoading,
    currentPage,
    pagination,
    filter,
    filterApplied,
    openForm,
    openDetail,
    selectedOperationPrice,
    selectedDetail,
    form,
    onChangeFilter,
    onApplyFilter,
    onResetFilter,
    onOpenCreate,
    onOpenUpdate,
    onCloseForm,
    handleSubmit,
    onLookupContract,
    onChangeContractNumber,
    onOpenDetail,
    onCloseDetail,
    onDelete
  } = useOperationPrice();

  const {
    control,
    handleSubmit: handleFormSubmit,
    formState: { isValid, isDirty }
  } = form;

  const activeFilters = useMemo(
    () =>
      (
        Object.entries(filterApplied) as [
          keyof OperationPriceFilter,
          OperationPriceFilter[keyof OperationPriceFilter]
        ][]
      ).filter(([, value]) => isActiveFilter(value)),
    [filterApplied]
  );

  const columns = useMemo<any[]>(
    () => [
      {
        title: 'STT',
        key: 'index',
        width: K_SIZE_100,
        align: 'center',
        render: (_: unknown, __: OperationPrice, index: number) =>
          (currentPage - K_SIZE_1) * DEFAULT_PAGE_SIZE + index + K_SIZE_1
      },
      {
        title: 'Mã đơn giá',
        dataIndex: 'priceCode',
        key: 'priceCode',
        width: K_SIZE_150,
        render: (text: string, record: OperationPrice) => (
          <TextBase
            classNames="sub-title4 cursor-pointer !text-secondary-500 hover:!text-secondary-700"
            text={displayText(text)}
            onClick={() => onOpenDetail(record)}
          />
        )
      },
      {
        title: 'Tên đơn giá',
        dataIndex: 'priceName',
        key: 'priceName',
        width: K_SIZE_220,
        render: (text: string) => renderTruncatedText(text, 'max-w-[260px]')
      },
      {
        title: 'Số hợp đồng vận hành',
        dataIndex: 'contractNumber',
        key: 'contractNumber',
        width: K_SIZE_200,
        render: (text: string) => renderTruncatedText(text)
      },
      {
        title: 'Mã khách hàng',
        dataIndex: 'customerCode',
        key: 'customerCode',
        width: K_SIZE_160,
        render: (text: string) => renderTruncatedText(text)
      },
      {
        title: 'Tên khách hàng',
        dataIndex: 'customerName',
        key: 'customerName',
        width: K_SIZE_200,
        render: (text: string) => renderTruncatedText(text)
      },
      {
        title: 'Đơn giá',
        dataIndex: 'unitPrice',
        key: 'unitPrice',
        width: K_SIZE_130,
        align: 'right',
        render: (value: number) => formatCurrency(value)
      },
      {
        title: 'Trạng thái',
        dataIndex: 'status',
        key: 'status',
        width: K_SIZE_130,
        render: (status: number | string) => {
          const meta = getStatusMeta(status);
          return <Status type={meta.type} kind={KIND_STATUS.SECONDARY} content={meta.label} />;
        }
      },
      {
        title: 'Ngày hiệu lực từ',
        dataIndex: 'effectiveFrom',
        key: 'effectiveFrom',
        width: K_SIZE_150,
        render: (date: string) => displayOperationPriceDate(date)
      },
      {
        title: 'Ngày hiệu lực đến',
        dataIndex: 'effectiveTo',
        key: 'effectiveTo',
        width: K_SIZE_150,
        render: (date: string) => displayOperationPriceDate(date)
      },
      {
        title: 'Người tạo',
        dataIndex: 'createdByUsername',
        key: 'createdByUsername',
        width: K_SIZE_160,
        render: (text: string) => renderTruncatedText(text, 'max-w-[160px]')
      },
      {
        title: 'Người cập nhật',
        dataIndex: 'updatedByUsername',
        key: 'updatedByUsername',
        width: K_SIZE_160,
        render: (text: string) => renderTruncatedText(text, 'max-w-[160px]')
      },
      {
        title: t('common:action'),
        fixed: 'right',
        align: 'center',
        width: K_SIZE_120,
        render: (_: unknown, record: OperationPrice) => (
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
    [currentPage, onDelete, onOpenDetail, onOpenUpdate, t]
  );

  const breadcrumbList = [
    {
      title: 'Danh mục'
    },
    {
      title: 'Đơn giá vận hành',
      key: ROUTES.OPERATION_PRICE
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
          <TextBase classNames="title4" text="Danh mục đơn giá vận hành" />
          <ButtonBase
            type="primary"
            leftIcon="IC_ADD_OUTLINE2"
            customContent="Thêm mới"
            onClick={onOpenCreate}
            classNames="mobile:w-full mobile:justify-center"
          />
        </Flex>
        <Divider className="my-16" />

        <div className="mb-12 grid grid-cols-[minmax(150px,0.8fr)_minmax(190px,1fr)_minmax(140px,0.7fr)_minmax(150px,0.8fr)_minmax(150px,0.8fr)_auto] items-end gap-12 rounded-radius-l border border-color-300 bg-color-50 p-12 tablet:grid-cols-2 mobile:grid-cols-1">
          <AppTextField
            name="priceCode"
            label="Mã đơn giá"
            placeholder="Nhập mã đơn giá"
            value={filter.priceCode}
            onChange={(event) => onChangeFilter('priceCode', event.target.value)}
            onPressEnter={onApplyFilter}
          />
          <AppTextField
            name="priceName"
            label="Tên đơn giá"
            placeholder="Nhập tên đơn giá"
            value={filter.priceName}
            onChange={(event) => onChangeFilter('priceName', event.target.value)}
            onPressEnter={onApplyFilter}
          />
          <AppSelect
            name="status"
            label="Trạng thái"
            placeholder="Tất cả"
            value={filter.status}
            options={STATUS_OPTIONS}
            onSelectOption={({ key }) => onChangeFilter('status', Number(key))}
          />
          <AppDatePicker
            name="effectiveFrom"
            label="Hiệu lực từ"
            value={getDatePickerValue(filter.effectiveFrom)}
            allowClear
            wrapperClassName="w-full"
            datePickerClassName="w-full"
            onChange={(value: Dayjs | null) =>
              onChangeFilter('effectiveFrom', value ? value.format(DATE_API_FORMAT) : '')
            }
          />
          <AppDatePicker
            name="effectiveTo"
            label="Hiệu lực đến"
            value={getDatePickerValue(filter.effectiveTo)}
            allowClear
            wrapperClassName="w-full"
            datePickerClassName="w-full"
            onChange={(value: Dayjs | null) =>
              onChangeFilter('effectiveTo', value ? value.format(DATE_API_FORMAT) : '')
            }
          />
          <Flex gap={K_SIZE_8} className="tablet:col-span-2 mobile:col-span-1">
            <ButtonBase
              type="ghost"
              customContent="Xóa bộ lọc"
              onClick={() => onResetFilter()}
              classNames="min-w-[108px] mobile:flex-1 mobile:justify-center"
            />
            <ButtonBase
              type="primary"
              leftIcon="IC_SEARCH_OUTLINE2"
              customContent="Tra cứu"
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

        <Spin spinning={listLoading && operationPriceList.length > K_SIZE_0}>
          <div className="overflow-hidden rounded-radius-l border border-color-400 duration-500">
            <AppTable
              loading={listLoading}
              rootClassName="w-full"
              className="[&_.ant-pagination]:hidden"
              scroll={{ x: 'max-content', y: '75vh' }}
              dataSource={operationPriceList}
              columns={columns}
              rowKey={(record: any, index?: number) =>
                String(record.id ?? record.priceCode ?? index)
              }
              pagination={pagination}
            />
          </div>
          <AppPagination currentPage={currentPage} total={total} pagination={pagination} />
        </Spin>

        <form id="operation-price-form" onSubmit={handleFormSubmit(handleSubmit)}>
          <Drawer
            open={openForm}
            title={
              <Flex justify="space-between" align="center">
                <div>
                  {selectedOperationPrice
                    ? 'Cập nhật đơn giá vận hành'
                    : 'Thêm mới đơn giá vận hành'}
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
            maskClosable={!detailLoading && !lookupLoading}
            onClose={onCloseForm}
            width={isTablet || isMobile ? '92vw' : '58vw'}
            footer={
              <Flex justify="end" gap={K_SIZE_8}>
                <ButtonBase
                  classNames="app-common-btn"
                  type="ghost"
                  customContent="Hủy"
                  onClick={onCloseForm}
                  disabled={detailLoading || lookupLoading}
                />
                <ButtonBase
                  classNames="app-common-btn"
                  type="primary"
                  form="operation-price-form"
                  htmlType="submit"
                  disabled={
                    !isValid ||
                    Boolean(selectedOperationPrice && !isDirty) ||
                    detailLoading ||
                    lookupLoading
                  }
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
            <div className="grid gap-12">
              <div className="grid grid-cols-2 gap-12 mobile:grid-cols-1">
                {selectedOperationPrice && (
                  <AppTextField
                    name="priceCodeView"
                    label="Mã đơn giá"
                    value={selectedOperationPrice.priceCode || ''}
                    isView
                  />
                )}
                <AppTextFieldControl
                  name="priceName"
                  label="Tên đơn giá"
                  labelSuffix={REQUIRED_MARK}
                  labelSuffixClassName="text-error-600"
                  placeholder="Nhập tên đơn giá"
                  control={control}
                />
              </div>

              <div className="grid grid-cols-[1fr_auto] items-end gap-8 mobile:grid-cols-1">
                <AppTextFieldControl
                  name="contractNumber"
                  label="Số hợp đồng vận hành"
                  labelSuffix={REQUIRED_MARK}
                  labelSuffixClassName="text-error-600"
                  placeholder="Nhập số hợp đồng vận hành"
                  control={control}
                  disabled={Boolean(selectedOperationPrice) || lookupLoading}
                  onChange={onChangeContractNumber}
                />
                {!selectedOperationPrice && (
                  <ButtonBase
                    type="primary"
                    leftIcon="IC_SEARCH_OUTLINE2"
                    customContent={
                      <div className="flex flex-row items-center justify-center">
                        <div>Tìm kiếm</div>
                        {lookupLoading && (
                          <div className="ml-8">
                            <Spin size="small" />
                          </div>
                        )}
                      </div>
                    }
                    onClick={onLookupContract}
                    disabled={lookupLoading}
                    classNames="min-w-[112px] justify-center"
                  />
                )}
              </div>

              <div className="grid grid-cols-2 gap-12 mobile:grid-cols-1">
                <AppTextFieldControl
                  name="customerCode"
                  label="Mã khách hàng"
                  placeholder="Tự động sau khi tra cứu"
                  control={control}
                  disabled
                />
                <AppTextFieldControl
                  name="customerName"
                  label="Tên khách hàng"
                  placeholder="Tự động sau khi tra cứu"
                  control={control}
                  disabled
                />
              </div>

              <div className="grid grid-cols-3 gap-12 tablet:grid-cols-2 mobile:grid-cols-1">
                <AppTextFieldControl
                  name="unitPrice"
                  label="Đơn giá (VND)"
                  labelSuffix={REQUIRED_MARK}
                  labelSuffixClassName="text-error-600"
                  placeholder="Nhập đơn giá"
                  control={control}
                  formatNumberWithCommas
                />
                <AppSelectControl
                  name="discountType"
                  label="Chiết khấu"
                  placeholder="Chọn loại"
                  options={DISCOUNT_TYPE_OPTIONS}
                  control={control}
                />
                <AppTextFieldControl
                  name="discountValue"
                  label="Giá trị chiết khấu"
                  placeholder="Nhập giá trị"
                  control={control}
                  formatNumberWithCommas
                />
              </div>

              <div className="grid grid-cols-2 gap-12 mobile:grid-cols-1">
                <AppDatePickerControl
                  name="effectiveFrom"
                  control={control}
                  backendFormat={DATE_API_FORMAT}
                  label="Ngày hiệu lực từ"
                  labelSuffix={<span className="text-error-600">{REQUIRED_MARK}</span>}
                  wrapperClassName="w-full"
                  datePickerClassName="w-full"
                />
                <AppDatePickerControl
                  name="effectiveTo"
                  control={control}
                  backendFormat={DATE_API_FORMAT}
                  label="Ngày hiệu lực đến"
                  allowClear
                  wrapperClassName="w-full"
                  datePickerClassName="w-full"
                />
              </div>

              {selectedOperationPrice && (
                <AppSelectControl
                  name="status"
                  label="Trạng thái"
                  placeholder="Chọn trạng thái"
                  options={STATUS_OPTIONS}
                  control={control}
                />
              )}

              <AppTakeNoteControl
                name="description"
                label="Mô tả"
                placeholder="Nhập mô tả"
                control={control}
                autoSize={{ minRows: 4, maxRows: 6 }}
              />
            </div>
          </Drawer>
        </form>

        <Drawer
          open={openDetail}
          title={
            <Flex justify="space-between" align="center">
              <div>Chi tiết đơn giá vận hành</div>
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
          width={isTablet || isMobile ? '92vw' : '54vw'}
          extra={
            selectedDetail ? (
              <ButtonBase
                type="ghost"
                leftIcon="ICON_EDIT"
                customContent="Sửa"
                onClick={() => {
                  onCloseDetail();
                  onOpenUpdate(selectedDetail);
                }}
              />
            ) : undefined
          }
        >
          <Spin spinning={detailLoading}>
            <div className="grid grid-cols-2 gap-16 mobile:grid-cols-1">
              <DetailItem label="Mã đơn giá" value={displayText(selectedDetail?.priceCode)} />
              <DetailItem label="Tên đơn giá" value={displayText(selectedDetail?.priceName)} />
              <DetailItem
                label="Số hợp đồng vận hành"
                value={displayText(selectedDetail?.contractNumber)}
              />
              <DetailItem label="Mã khách hàng" value={displayText(selectedDetail?.customerCode)} />
              <DetailItem
                label="Tên khách hàng"
                value={displayText(selectedDetail?.customerName)}
              />
              <DetailItem label="Đơn giá" value={formatCurrency(selectedDetail?.unitPrice)} />
              <DetailItem
                label="Chiết khấu"
                value={formatDiscount(selectedDetail?.discountType, selectedDetail?.discountValue)}
              />
              <DetailItem
                label="Trạng thái"
                value={
                  <Status
                    type={getStatusMeta(selectedDetail?.status).type}
                    kind={KIND_STATUS.SECONDARY}
                    content={getStatusMeta(selectedDetail?.status).label}
                  />
                }
              />
              <DetailItem
                label="Ngày hiệu lực từ"
                value={displayOperationPriceDate(selectedDetail?.effectiveFrom)}
              />
              <DetailItem
                label="Ngày hiệu lực đến"
                value={displayOperationPriceDate(selectedDetail?.effectiveTo)}
              />
              <DetailItem label="Người tạo" value={displayText(selectedDetail?.createdBy)} />
              <DetailItem
                label="Ngày tạo"
                value={displayDateTimeFromServer(selectedDetail?.createdAt || '')}
              />
              <div className="col-span-2 mobile:col-span-1">
                <DetailItem label="Mô tả" value={displayText(selectedDetail?.description)} />
              </div>
            </div>
          </Spin>
        </Drawer>
      </section>
    </PageWithBreadcrumb>
  );
};

export default OperationPriceScreen;
