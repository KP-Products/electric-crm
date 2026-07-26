'use client';

import {
  DEFAULT_PAGE_SIZE,
  K_SIZE_0,
  K_SIZE_1,
  K_SIZE_100,
  K_SIZE_120,
  K_SIZE_130,
  K_SIZE_150,
  K_SIZE_160,
  K_SIZE_16,
  K_SIZE_18,
  K_SIZE_180,
  K_SIZE_200,
  K_SIZE_220,
  K_SIZE_240,
  K_SIZE_8,
  NULL_VALUE,
  REQUIRED_MARK
} from '@constant';
import { Divider, Drawer, Flex, Spin } from 'antd';
import ButtonBase from 'components/button';
import IconHover from 'components/icon-vec-local/icon-hover';
import { AppSelectControl } from 'components/select';
import AppTable from 'components/table';
import AppPagination from 'components/table/pagination';
import TagFilter from 'components/tag-filter';
import { TextBase } from 'components/text';
import { AppTextField, AppTextFieldControl } from 'components/text-field';
import { ROUTES } from 'config/routes';
import PageWithBreadcrumb from 'layout/AppLayout/PageWithBreadcumb';
import { Customer } from 'model/customer';
import type { ReactNode } from 'react';
import { useCallback, useMemo } from 'react';
import { displayDateFromServer, displayDateTimeFromServer } from 'utils/date';
import { useResponsive } from 'utils/responsive';
import useManageCustomer, { CustomerFilter } from './useManageCustomer';

const FILTER_LABEL_MAP: Record<keyof CustomerFilter, string> = {
  customerCodeContains: 'Mã khách hàng',
  fullNameContains: 'Tên khách hàng',
  taxNoContains: 'Mã số thuế',
  phoneContains: 'Số điện thoại',
  emailContains: 'Email',
  contactNameContains: 'Người liên hệ',
  addressContains: 'Địa chỉ'
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

const renderDate = (date?: string | null) => (date ? displayDateFromServer(date) : NULL_VALUE);

const renderDateTime = (date?: string | null) =>
  date ? displayDateTimeFromServer(date) : NULL_VALUE;

const DetailItem = ({ label, value }: { label: string; value: ReactNode }) => (
  <div className="min-w-0">
    <div className="mb-4 text-12 font-semibold text-color-700">{label}</div>
    <div className="break-words text-14 font-medium text-color-900">{value || NULL_VALUE}</div>
  </div>
);

const ManageCustomerScreen = () => {
  const { isMobile, isTablet } = useResponsive();
  const {
    t,
    customerList,
    total,
    listLoading,
    detailLoading,
    detailLoadFailed,
    detailContracts,
    detailContractsLoading,
    detailContractsLoadFailed,
    currentPage,
    pagination,
    filter,
    filterApplied,
    openForm,
    openDetail,
    selectedCustomer,
    selectedDetail,
    operationUnitLoading,
    operationUnitOptions,
    form,
    onChangeFilter,
    onApplyFilter,
    onResetFilter,
    onOpenCreate,
    onOpenUpdate,
    onCloseForm,
    handleSubmit,
    onOpenDetail,
    onCloseDetail,
    onDelete
  } = useManageCustomer();

  const {
    control,
    handleSubmit: handleFormSubmit,
    formState: { isValid, isDirty }
  } = form;

  const detailCustomer = selectedDetail?.customer;
  const detailOperationUnit = selectedDetail?.operationUnit;

  const activeFilters = useMemo(
    () =>
      (Object.entries(filterApplied) as [keyof CustomerFilter, string][]).filter(([, value]) =>
        Boolean(value)
      ),
    [filterApplied]
  );

  const operationUnitLabelMap = useMemo(
    () =>
      operationUnitOptions.reduce<Record<string, string>>((result, option) => {
        result[String(option.value)] = String(option.label);
        return result;
      }, {}),
    [operationUnitOptions]
  );

  const getOperationUnitLabel = useCallback(
    (operationUnitId?: string | null) =>
      operationUnitId ? operationUnitLabelMap[operationUnitId] || operationUnitId : NULL_VALUE,
    [operationUnitLabelMap]
  );

  const columns = useMemo<any[]>(
    () => [
      {
        title: 'STT',
        key: 'index',
        width: K_SIZE_100,
        align: 'center',
        render: (_: unknown, __: Customer, index: number) =>
          (currentPage - K_SIZE_1) * DEFAULT_PAGE_SIZE + index + K_SIZE_1
      },
      {
        title: 'Mã KH',
        dataIndex: 'customerCode',
        key: 'customerCode',
        width: K_SIZE_150,
        render: (text: string, record: Customer) => (
          <TextBase
            text={displayText(text)}
            classNames="sub-title4 cursor-pointer !text-secondary-500 hover:!text-secondary-700"
            onClick={() => onOpenDetail(record)}
          />
        )
      },
      {
        title: 'Tên khách hàng',
        key: 'fullName',
        dataIndex: 'fullName',
        render: (text: string) => renderTruncatedText(text, 'max-w-[260px]'),
        width: K_SIZE_240
      },
      {
        title: 'Mã số thuế',
        dataIndex: 'taxNo',
        key: 'taxNo',
        render: (text: string) => renderTruncatedText(text, 'max-w-[160px]'),
        width: K_SIZE_160
      },
      {
        title: 'Số điện thoại',
        dataIndex: 'phone',
        key: 'phone',
        render: (text: string) => displayText(text),
        width: K_SIZE_150
      },
      {
        title: 'Email',
        dataIndex: 'email',
        key: 'email',
        render: (text: string) => renderTruncatedText(text, 'max-w-[180px]'),
        width: K_SIZE_180
      },
      {
        title: 'Người liên hệ',
        dataIndex: 'contactName',
        key: 'contactName',
        render: (text: string) => renderTruncatedText(text, 'max-w-[180px]'),
        width: K_SIZE_180
      },
      {
        title: 'Đơn vị vận hành',
        dataIndex: 'operationUnitId',
        key: 'operationUnitId',
        render: (text: string) => renderTruncatedText(getOperationUnitLabel(text), 'max-w-[220px]'),
        width: K_SIZE_220
      },
      {
        title: 'Địa chỉ',
        dataIndex: 'address',
        key: 'address',
        render: (text: string) => renderTruncatedText(text, 'max-w-[260px]'),
        width: K_SIZE_240
      },
      {
        title: 'Ngày tạo',
        dataIndex: 'createdAt',
        key: 'createdAt',
        width: K_SIZE_200,
        render: (date: string) => renderDateTime(date)
      },
      {
        title: 'Ngày cập nhật',
        dataIndex: 'updatedAt',
        key: 'updatedAt',
        width: K_SIZE_200,
        render: (date: string) => renderDateTime(date)
      },
      {
        title: t('common:action'),
        fixed: 'right',
        align: 'center',
        width: K_SIZE_120,
        render: (_: unknown, record: Customer) => (
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
    [currentPage, getOperationUnitLabel, onDelete, onOpenDetail, onOpenUpdate, t]
  );

  const contractColumns = useMemo<any[]>(
    () => [
      {
        title: 'Số hợp đồng',
        dataIndex: 'contractNumber',
        key: 'contractNumber',
        width: K_SIZE_180,
        render: (text: string) => displayText(text)
      },
      {
        title: 'Ngày ký',
        dataIndex: 'signedDate',
        key: 'signedDate',
        width: K_SIZE_130,
        render: (date: string) => renderDate(date)
      },
      {
        title: 'Ngày hiệu lực',
        dataIndex: 'effectiveDate',
        key: 'effectiveDate',
        width: K_SIZE_130,
        render: (date: string) => renderDate(date)
      },
      {
        title: 'Ngày hết hạn',
        dataIndex: 'expiryDate',
        key: 'expiryDate',
        width: K_SIZE_130,
        render: (date: string) => renderDate(date)
      },
      {
        title: 'Trạng thái',
        dataIndex: 'status',
        key: 'status',
        width: K_SIZE_130,
        render: (text: string) => displayText(text)
      }
    ],
    []
  );

  const breadcrumbList = [
    {
      title: 'Hợp đồng'
    },
    {
      title: 'Khách hàng'
    },
    {
      title: 'Danh sách',
      key: ROUTES.MANAGE_CUSTOMER
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
          <TextBase classNames="title4" text="Quản lý khách hàng" />
          <Flex
            flex={K_SIZE_1}
            justify="end"
            gap={K_SIZE_16}
            className="mobile:mt-8 mobile:w-full mobile:flex-col"
          >
            <ButtonBase
              type="primary"
              leftIcon="IC_ADD_OUTLINE2"
              customContent="Thêm mới"
              onClick={onOpenCreate}
              classNames="mobile:flex-1 mobile:justify-center"
            />
          </Flex>
        </Flex>
        <Divider className="my-16" />

        <div className="mb-12 grid grid-cols-6 items-end gap-12 rounded-radius-l border border-color-300 bg-color-50 p-12 tablet:grid-cols-2 mobile:grid-cols-1">
          <AppTextField
            name="customerCodeContains"
            label="Mã khách hàng"
            placeholder="Nhập mã khách hàng"
            value={filter.customerCodeContains}
            onChange={(event) => onChangeFilter('customerCodeContains', event.target.value)}
            onPressEnter={onApplyFilter}
          />
          <AppTextField
            name="fullNameContains"
            label="Tên khách hàng"
            placeholder="Nhập tên khách hàng"
            value={filter.fullNameContains}
            onChange={(event) => onChangeFilter('fullNameContains', event.target.value)}
            onPressEnter={onApplyFilter}
          />
          <AppTextField
            name="taxNoContains"
            label="Mã số thuế"
            placeholder="Nhập mã số thuế"
            value={filter.taxNoContains}
            onChange={(event) => onChangeFilter('taxNoContains', event.target.value)}
            onPressEnter={onApplyFilter}
          />
          <AppTextField
            name="phoneContains"
            label="Số điện thoại"
            placeholder="Nhập số điện thoại"
            value={filter.phoneContains}
            onChange={(event) => onChangeFilter('phoneContains', event.target.value)}
            onPressEnter={onApplyFilter}
          />
          <AppTextField
            name="emailContains"
            label="Email"
            placeholder="Nhập email"
            value={filter.emailContains}
            onChange={(event) => onChangeFilter('emailContains', event.target.value)}
            onPressEnter={onApplyFilter}
          />
          <AppTextField
            name="contactNameContains"
            label="Người liên hệ"
            placeholder="Nhập người liên hệ"
            value={filter.contactNameContains}
            onChange={(event) => onChangeFilter('contactNameContains', event.target.value)}
            onPressEnter={onApplyFilter}
          />
          <Flex
            justify="end"
            gap={K_SIZE_8}
            className="col-start-6 tablet:col-start-2 mobile:col-start-auto mobile:w-full"
          >
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
              classNames="min-w-[130px] mobile:flex-1 mobile:justify-center"
            />
          </Flex>
        </div>

        {activeFilters.length > K_SIZE_0 && (
          <div className="mb-8 flex w-full flex-wrap items-center gap-8">
            {activeFilters.map(([key, value]) => (
              <TagFilter
                key={key}
                content={`${FILTER_LABEL_MAP[key]}: ${value}`}
                onClose={() => onResetFilter(key)}
              />
            ))}
          </div>
        )}

        <Spin spinning={listLoading && customerList.length > K_SIZE_0}>
          <div className="overflow-hidden rounded-radius-l border border-color-400 duration-500">
            <AppTable
              loading={listLoading}
              rootClassName="w-full"
              className="[&_.ant-pagination]:hidden"
              scroll={{ x: 'max-content', y: '75vh' }}
              dataSource={customerList}
              columns={columns}
              rowKey={(record: any, index?: number) =>
                String(record.id || record.customerCode || index)
              }
              pagination={pagination}
            />
          </div>
          <AppPagination currentPage={currentPage} total={total} pagination={pagination} />
        </Spin>

        <form id="customer-form" onSubmit={handleFormSubmit(handleSubmit)}>
          <Drawer
            open={openForm}
            title={
              <Flex justify="space-between" align="center">
                <div>{selectedCustomer ? 'Cập nhật khách hàng' : 'Thêm mới khách hàng'}</div>
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
            width={isTablet || isMobile ? '92vw' : '34vw'}
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
                  form="customer-form"
                  htmlType="submit"
                  disabled={!isValid || Boolean(selectedCustomer && !isDirty) || detailLoading}
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
              <div className="grid grid-cols-2 gap-12 tablet:grid-cols-2 mobile:grid-cols-1">
                <AppTextFieldControl
                  name="customerCode"
                  control={control}
                  label="Mã khách hàng"
                  labelSuffix={REQUIRED_MARK}
                  labelSuffixClassName="text-error-600"
                  placeholder="Nhập mã khách hàng"
                  disabled={Boolean(selectedCustomer)}
                />
                <AppTextFieldControl
                  name="fullName"
                  control={control}
                  label="Tên khách hàng"
                  placeholder="Nhập tên khách hàng"
                />
                <AppTextFieldControl
                  name="taxNo"
                  label="Mã số thuế"
                  placeholder="Nhập mã số thuế"
                  control={control}
                />
                <AppTextFieldControl
                  name="phone"
                  label="Số điện thoại"
                  placeholder="Nhập số điện thoại"
                  control={control}
                />
                <AppTextFieldControl
                  name="email"
                  label="Email"
                  placeholder="Nhập email"
                  control={control}
                />
                <AppTextFieldControl
                  name="contactName"
                  label="Người liên hệ"
                  placeholder="Nhập người liên hệ"
                  control={control}
                />
                <AppTextFieldControl
                  name="contactIdNo"
                  label="CMND/CCCD người liên hệ"
                  placeholder="Nhập CMND/CCCD"
                  control={control}
                />
                <AppTextFieldControl
                  name="contactIssueDate"
                  label="Ngày cấp CMND/CCCD"
                  placeholder="dd-mm-yyyy"
                  control={control}
                />
              </div>

              <AppSelectControl
                name="operationUnitId"
                label="Đơn vị vận hành"
                placeholder="Chọn đơn vị vận hành"
                isLoading={operationUnitLoading}
                options={operationUnitOptions}
                control={control}
              />

              <AppTextFieldControl
                name="address"
                label="Địa chỉ"
                placeholder="Nhập địa chỉ"
                control={control}
              />
            </div>
          </Drawer>
        </form>

        <Drawer
          open={openDetail}
          title={
            <Flex justify="space-between" align="center">
              <div className={'flex flex-1 items-center '}>
                <TextBase>Chi tiết khách hàng</TextBase>
                {detailCustomer ? (
                  <IconHover
                    rootClassName="text-color-800 ml-4"
                    title={t('common:edit')}
                    icon="ICON_EDIT"
                    iconHeight={K_SIZE_18}
                    onClick={() => {
                      onCloseDetail();
                      onOpenUpdate(detailCustomer);
                    }}
                  />
                ) : undefined}
              </div>
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
          width={isTablet || isMobile ? '92vw' : '34vw'}
        >
          <Spin spinning={detailLoading}>
            <div className="grid gap-20">
              {detailLoadFailed && (
                <div className="rounded-radius-m border border-error-200 bg-error-50 p-12 text-14 font-medium text-error-600">
                  Không tải được chi tiết khách hàng. Thông tin đang hiển thị chỉ lấy từ danh sách.
                </div>
              )}

              <div className="grid grid-cols-2 gap-16 mobile:grid-cols-1">
                <DetailItem
                  label="Mã khách hàng"
                  value={displayText(detailCustomer?.customerCode)}
                />
                <DetailItem label="Tên khách hàng" value={displayText(detailCustomer?.fullName)} />
                <DetailItem label="Mã số thuế" value={displayText(detailCustomer?.taxNo)} />
                <DetailItem label="Số điện thoại" value={displayText(detailCustomer?.phone)} />
                <DetailItem label="Email" value={displayText(detailCustomer?.email)} />
                <DetailItem
                  label="Người liên hệ"
                  value={displayText(detailCustomer?.contactName)}
                />
                <DetailItem
                  label="CMND/CCCD người liên hệ"
                  value={displayText(detailCustomer?.contactIdNo)}
                />
                <DetailItem
                  label="Ngày cấp CMND/CCCD"
                  value={renderDate(detailCustomer?.contactIssueDate)}
                />
                <DetailItem label="Địa chỉ" value={displayText(detailCustomer?.address)} />
                <DetailItem
                  label="Đơn vị vận hành"
                  value={
                    detailOperationUnit
                      ? [detailOperationUnit.unitCode, detailOperationUnit.unitName]
                          .filter(Boolean)
                          .join(' - ')
                      : getOperationUnitLabel(detailCustomer?.operationUnitId)
                  }
                />
                <DetailItem label="Ngày tạo" value={renderDateTime(detailCustomer?.createdAt)} />
                <DetailItem
                  label="Ngày cập nhật"
                  value={renderDateTime(detailCustomer?.updatedAt)}
                />
              </div>

              <div>
                <TextBase classNames="sub-title3 mb-8" text="Hợp đồng đã ký" />
                {detailContractsLoadFailed ? (
                  <div className="text-14 font-medium text-color-700">
                    Không tải được danh sách hợp đồng đã ký
                  </div>
                ) : detailContractsLoading ? (
                  <div className="rounded-radius-m border border-color-300 p-16 text-center">
                    <Spin size="small" />
                  </div>
                ) : detailContracts.length > K_SIZE_0 ? (
                  <Spin spinning={detailContractsLoading}>
                    <div className="overflow-hidden rounded-radius-l border border-color-300">
                      <AppTable
                        rootClassName="w-full"
                        className="[&_.ant-pagination]:hidden"
                        scroll={{ x: 'max-content' }}
                        dataSource={detailContracts}
                        columns={contractColumns}
                        rowKey={(record: any, index?: number) =>
                          String(record.id || record.contractNumber || index)
                        }
                        pagination={false}
                      />
                    </div>
                  </Spin>
                ) : (
                  <div className="text-14 font-medium text-color-700">Chưa có hợp đồng đã ký</div>
                )}
              </div>
            </div>
          </Spin>
        </Drawer>
      </section>
    </PageWithBreadcrumb>
  );
};

export default ManageCustomerScreen;
