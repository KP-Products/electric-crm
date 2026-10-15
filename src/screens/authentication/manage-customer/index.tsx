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
  K_SIZE_240,
  K_SIZE_8,
  NULL_VALUE,
  REQUIRED_MARK
} from '@constant';
import { Divider, Drawer, Flex, Spin } from 'antd';
import ButtonBase from 'components/button';
import DocumentDropzone from 'components/document-dropzone';
import IconHover from 'components/icon-vec-local/icon-hover';
import Status, { KIND_STATUS, TYPE_STATUS } from 'components/status';
import AppTable from 'components/table';
import AppPagination from 'components/table/pagination';
import TagFilter from 'components/tag-filter';
import { TextBase } from 'components/text';
import { AppTextField, AppTextFieldControl } from 'components/text-field';
import { ROUTES } from 'config/routes';
import PageWithBreadcrumb from 'layout/AppLayout/PageWithBreadcumb';
import { CUSTOMER_STATUS, Customer } from 'model/customer';
import { useMemo } from 'react';
import { displayDateTimeFromServer } from 'utils/date';
import CustomerPersonFields from './components/CustomerPersonFields';
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

const renderDateTime = (date?: string | null) =>
  date ? displayDateTimeFromServer(date) : NULL_VALUE;

const getCustomerStatusMeta = (status?: string) => {
  if (status === CUSTOMER_STATUS.ACTIVE) {
    return { label: 'Đang hoạt động', type: TYPE_STATUS.SUCCESS };
  }

  if (status === CUSTOMER_STATUS.DELETED) {
    return { label: 'Đã xoá', type: TYPE_STATUS.ERROR };
  }

  return { label: displayText(status), type: TYPE_STATUS.DEFAULT };
};

const ManageCustomerScreen = () => {
  const { isMobile, isTablet } = useResponsive();
  const {
    t,
    customerList,
    total,
    listLoading,
    detailLoading,
    currentPage,
    pagination,
    filter,
    filterApplied,
    openForm,
    attachments,
    setAttachments,
    form,
    onChangeFilter,
    onApplyFilter,
    onResetFilter,
    onOpenCreate,
    onOpenUpdate,
    onCloseForm,
    handleSubmit,
    onOpenDetail,
    onDelete
  } = useManageCustomer();

  const {
    control,
    handleSubmit: handleFormSubmit,
    formState: { isValid }
  } = form;

  const activeFilters = useMemo(
    () =>
      (Object.entries(filterApplied) as [keyof CustomerFilter, string][]).filter(([, value]) =>
        Boolean(value)
      ),
    [filterApplied]
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
        key: 'contactPerson',
        render: (_: unknown, record: Customer) =>
          renderTruncatedText(
            record.contactPerson?.fullName || record.contactName,
            'max-w-[180px]'
          ),
        width: K_SIZE_180
      },
      {
        title: 'Người đại diện',
        key: 'representative',
        render: (_: unknown, record: Customer) =>
          renderTruncatedText(record.representative?.fullName, 'max-w-[180px]'),
        width: K_SIZE_180
      },
      {
        title: 'Địa chỉ',
        dataIndex: 'address',
        key: 'address',
        render: (text: string) => renderTruncatedText(text, 'max-w-[260px]'),
        width: K_SIZE_240
      },
      {
        title: 'Trạng thái',
        dataIndex: 'status',
        key: 'status',
        width: K_SIZE_130,
        render: (status: string) => {
          const meta = getCustomerStatusMeta(status);
          return <Status type={meta.type} kind={KIND_STATUS.SECONDARY} content={meta.label} />;
        }
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
            {record.status !== CUSTOMER_STATUS.DELETED && (
              <IconHover
                rootClassName="text-color-800"
                title={t('common:edit')}
                icon="ICON_EDIT"
                iconHeight={K_SIZE_18}
                onClick={() => onOpenUpdate(record)}
              />
            )}
            {record.status !== CUSTOMER_STATUS.DELETED && (
              <IconHover
                rootClassName="text-error-500 hover:text-error-500"
                title={t('common:delete')}
                icon="IC_TRASH_OUTLINE"
                iconHeight={K_SIZE_18}
                onClick={() => onDelete(record)}
              />
            )}
          </div>
        )
      }
    ],
    [currentPage, onDelete, onOpenDetail, onOpenUpdate, t]
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
          className="w-full mobile:flex-col mobile:items-start"
        >
          <TextBase classNames="title4" text="Quản lý khách hàng" />
          <Flex
            justify="start"
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

        <div className="mb-12 grid grid-cols-6 items-end gap-12 rounded-radius-l border border-color-300 bg-color-50 p-12 desktop:grid-cols-3 tablet:grid-cols-2 mobile:grid-cols-1">
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
          <Flex justify="end" gap={K_SIZE_8} className="col-span-full mobile:w-full">
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
                <div>Thêm mới khách hàng</div>
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
            width={isTablet || isMobile ? '92vw' : '56vw'}
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
                  disabled={!isValid || detailLoading}
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
              </div>

              <AppTextFieldControl
                name="address"
                label="Địa chỉ"
                placeholder="Nhập địa chỉ"
                control={control}
              />

              <CustomerPersonFields control={control} />

              <div className="border-t border-color-200 pt-12">
                <TextBase classNames="sub-title4 mb-8" text="Tài liệu đính kèm" />
                <DocumentDropzone value={attachments} onChange={setAttachments} />
              </div>
            </div>
          </Drawer>
        </form>
      </section>
    </PageWithBreadcrumb>
  );
};

export default ManageCustomerScreen;
