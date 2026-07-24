'use client';

import {
  DEFAULT_PAGE_SIZE,
  K_SIZE_0,
  K_SIZE_1,
  K_SIZE_100,
  K_SIZE_120,
  K_SIZE_130,
  K_SIZE_150,
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
import type { ReactNode } from 'react';
import { useCallback, useMemo } from 'react';

import ButtonBase from 'components/button';
import IconHover from 'components/icon-vec-local/icon-hover';
import { AppSelect, AppSelectControl, AppSelectOption } from 'components/select';
import Status, { KIND_STATUS, TYPE_STATUS } from 'components/status';
import { AppTakeNoteControl } from 'components/take-note';
import AppTable from 'components/table';
import AppPagination from 'components/table/pagination';
import TagFilter from 'components/tag-filter';
import { TextBase } from 'components/text';
import { AppTextField, AppTextFieldControl } from 'components/text-field';
import { ROUTES } from 'config/routes';
import PageWithBreadcrumb from 'layout/AppLayout/PageWithBreadcumb';
import { OperationUnit, OPERATION_UNIT_STATUS } from 'model/operation-unit';
import { displayDateFromServer, displayDateTimeFromServer } from 'utils/date';
import { useResponsive } from 'utils/responsive';
import useManageOperationUnit, { OperationUnitFilter } from './useManageOperationUnit';

const STATUS_OPTIONS: AppSelectOption[] = [
  { value: OPERATION_UNIT_STATUS.ACTIVE, label: 'Đang hiệu lực' },
  { value: OPERATION_UNIT_STATUS.INACTIVE, label: 'Hết hiệu lực' }
];

const STATUS_LABEL_MAP: Record<string, string> = {
  ACTIVE: 'Đang hiệu lực',
  HIEU_LUC: 'Đang hiệu lực',
  INACTIVE: 'Hết hiệu lực',
  HET_HIEU_LUC: 'Hết hiệu lực',
  EXPIRED: 'Hết hiệu lực',
  SAP_HET_HAN: 'Sắp hết hạn',
  EXPIRING_SOON: 'Sắp hết hạn',
  'Đang hiệu lực': 'Đang hiệu lực',
  'Hết hiệu lực': 'Hết hiệu lực',
  'Sắp hết hạn': 'Sắp hết hạn'
};

const STATUS_TYPE_MAP: Record<string, TYPE_STATUS> = {
  ACTIVE: TYPE_STATUS.SUCCESS,
  HIEU_LUC: TYPE_STATUS.SUCCESS,
  INACTIVE: TYPE_STATUS.ERROR,
  HET_HIEU_LUC: TYPE_STATUS.ERROR,
  EXPIRED: TYPE_STATUS.ERROR,
  SAP_HET_HAN: TYPE_STATUS.PENDING,
  EXPIRING_SOON: TYPE_STATUS.PENDING
};

const FILTER_LABEL_MAP: Record<keyof OperationUnitFilter, string> = {
  unitCode: 'Mã đơn vị',
  unitName: 'Tên đơn vị',
  status: 'Trạng thái'
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

const getStatusMeta = (status?: string | null) => {
  if (!status) return { label: NULL_VALUE, type: TYPE_STATUS.DEFAULT };

  const normalizedStatus = status.toUpperCase();
  return {
    label: STATUS_LABEL_MAP[status] || STATUS_LABEL_MAP[normalizedStatus] || status,
    type: STATUS_TYPE_MAP[status] || STATUS_TYPE_MAP[normalizedStatus] || TYPE_STATUS.DEFAULT
  };
};

const getFilterDisplayValue = (key: keyof OperationUnitFilter, value: string) => {
  if (key === 'status') return getStatusMeta(value).label;
  return value;
};

const getRecordValue = (operationUnit: OperationUnit, key: string) => {
  const value = operationUnit[key as keyof OperationUnit];
  return typeof value === 'string' || typeof value === 'number' ? value : undefined;
};

const DetailItem = ({ label, value }: { label: string; value: ReactNode }) => (
  <div className="min-w-0">
    <div className="mb-4 text-12 font-semibold text-color-700">{label}</div>
    <div className="break-words text-14 font-medium text-color-900">{value || NULL_VALUE}</div>
  </div>
);

const ManageOperationUnitScreen = () => {
  const { isMobile, isTablet } = useResponsive();
  const {
    t,
    operationUnitList,
    total,
    listLoading,
    detailLoading,
    exportLoading,
    currentPage,
    pagination,
    filter,
    filterApplied,
    openForm,
    openDetail,
    selectedOperationUnit,
    selectedDetail,
    form,
    onChangeFilter,
    onApplyFilter,
    onResetFilter,
    onOpenCreate,
    onOpenUpdate,
    onCloseForm,
    handleSubmit,
    onChangeUnitCode,
    onOpenDetail,
    onCloseDetail,
    onDelete,
    onExport
  } = useManageOperationUnit();

  const {
    control,
    handleSubmit: handleFormSubmit,
    formState: { isValid, isDirty }
  } = form;

  const activeFilters = useMemo(
    () =>
      (Object.entries(filterApplied) as [keyof OperationUnitFilter, string][]).filter(([, value]) =>
        Boolean(value)
      ),
    [filterApplied]
  );

  const getExportDisplayValue = useCallback((operationUnit: OperationUnit, key: string) => {
    switch (key) {
      case 'signedDate':
      case 'effectiveDate':
      case 'expiryDate':
        return renderDate(getRecordValue(operationUnit, key) as string);
      case 'createdAt':
      case 'updatedAt':
        return renderDateTime(getRecordValue(operationUnit, key) as string);
      case 'status':
        return getStatusMeta(operationUnit.status).label;
      default:
        return displayText(getRecordValue(operationUnit, key));
    }
  }, []);

  const columns = useMemo<any[]>(
    () => [
      {
        title: 'ID',
        key: 'index',
        width: K_SIZE_100,
        align: 'center',
        render: (_: unknown, __: OperationUnit, index: number) =>
          (currentPage - K_SIZE_1) * DEFAULT_PAGE_SIZE + index + K_SIZE_1
      },
      {
        title: 'Mã đơn vị',
        dataIndex: 'unitCode',
        key: 'unitCode',
        width: K_SIZE_150,
        render: (text: string, record: OperationUnit) => (
          <TextBase
            classNames="sub-title4 cursor-pointer !text-secondary-500 hover:!text-secondary-700"
            text={displayText(text)}
            onClick={() => onOpenDetail(record)}
          />
        )
      },
      {
        title: 'Tên đơn vị',
        dataIndex: 'unitName',
        key: 'unitName',
        width: K_SIZE_240,
        render: (text: string) => renderTruncatedText(text, 'max-w-[280px]')
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
        title: 'Ngày hết hiệu lực',
        dataIndex: 'expiryDate',
        key: 'expiryDate',
        width: K_SIZE_150,
        render: (date: string) => renderDate(date)
      },
      {
        title: 'Trạng thái',
        dataIndex: 'status',
        key: 'status',
        width: K_SIZE_130,
        render: (status: string) => {
          const meta = getStatusMeta(status);
          return <Status type={meta.type} kind={KIND_STATUS.PRIMARY} content={meta.label} />;
        }
      },
      {
        title: 'Người tạo',
        dataIndex: 'createdBy',
        key: 'createdBy',
        width: K_SIZE_180,
        render: (text: string) => renderTruncatedText(text, 'max-w-[180px]')
      },
      {
        title: 'Người cập nhật',
        dataIndex: 'updateBy',
        key: 'updateBy',
        width: K_SIZE_180,
        render: (text: string) => renderTruncatedText(text, 'max-w-[180px]')
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
        render: (_: unknown, record: OperationUnit) => (
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
      title: 'Hợp đồng'
    },
    {
      title: 'Đơn vị vận hành'
    },
    {
      title: 'Danh sách',
      key: ROUTES.MANAGE_OPERATION_UNIT
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
          <TextBase classNames="title4" text="Quản lý đơn vị vận hành" />
          <Flex
            flex={K_SIZE_1}
            justify="end"
            gap={K_SIZE_16}
            className="mobile:mt-8 mobile:w-full mobile:flex-col"
          >
            <ButtonBase
              type="ghost"
              leftIcon="IC_DOWNLOAD_OUTLINE"
              customContent={
                <div className="flex items-center justify-center">
                  <div>Xuất Excel</div>
                  {exportLoading && (
                    <div className="ml-8">
                      <Spin size="small" />
                    </div>
                  )}
                </div>
              }
              onClick={() => onExport(getExportDisplayValue)}
              classNames="mobile:flex-1 mobile:justify-center"
              disabled={exportLoading}
            />
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

        <div className="mb-12 grid grid-cols-[minmax(160px,0.8fr)_minmax(220px,1fr)_minmax(160px,0.7fr)_auto] items-end gap-12 rounded-radius-l border border-color-300 bg-color-50 p-12 tablet:grid-cols-2 mobile:grid-cols-1">
          <AppTextField
            name="unitCode"
            label="Mã đơn vị"
            placeholder="Nhập mã đơn vị"
            value={filter.unitCode}
            onChange={(event) => onChangeFilter('unitCode', event.target.value)}
            onPressEnter={onApplyFilter}
          />
          <AppTextField
            name="unitName"
            label="Tên đơn vị"
            placeholder="Nhập tên đơn vị"
            value={filter.unitName}
            onChange={(event) => onChangeFilter('unitName', event.target.value)}
            onPressEnter={onApplyFilter}
          />
          <AppSelect
            name="status"
            label="Trạng thái"
            placeholder="Tất cả"
            value={filter.status}
            options={STATUS_OPTIONS}
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

        <Spin spinning={listLoading && operationUnitList.length > K_SIZE_0}>
          <div className="overflow-hidden rounded-radius-l border border-color-400 duration-500">
            <AppTable
              loading={listLoading}
              rootClassName="w-full"
              className="[&_.ant-pagination]:hidden"
              scroll={{ x: 'max-content', y: '75vh' }}
              dataSource={operationUnitList}
              columns={columns}
              rowKey={(record: any, index?: number) =>
                String(record.operationUnitId ?? record.unitCode ?? index)
              }
              pagination={pagination}
            />
          </div>
          <AppPagination currentPage={currentPage} total={total} pagination={pagination} />
        </Spin>

        <form id="operation-unit-form" onSubmit={handleFormSubmit(handleSubmit)}>
          <Drawer
            open={openForm}
            title={
              <Flex justify="space-between" align="center">
                <div>
                  {selectedOperationUnit ? 'Cập nhật đơn vị vận hành' : 'Thêm mới đơn vị vận hành'}
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
            width={isTablet || isMobile ? '92vw' : '54vw'}
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
                  form="operation-unit-form"
                  htmlType="submit"
                  disabled={!isValid || Boolean(selectedOperationUnit && !isDirty) || detailLoading}
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
                <AppTextFieldControl
                  name="unitCode"
                  label="Mã đơn vị"
                  labelSuffix={REQUIRED_MARK}
                  labelSuffixClassName="text-error-600"
                  placeholder="Nhập mã đơn vị"
                  control={control}
                  disabled={Boolean(selectedOperationUnit)}
                  onChange={selectedOperationUnit ? undefined : onChangeUnitCode}
                />
                <AppTextFieldControl
                  name="unitName"
                  label="Tên đơn vị"
                  labelSuffix={REQUIRED_MARK}
                  labelSuffixClassName="text-error-600"
                  placeholder="Nhập tên đơn vị"
                  control={control}
                />
              </div>

              <div className="grid grid-cols-2 gap-12 mobile:grid-cols-1">
                <AppTextFieldControl
                  name="shortName"
                  label="Tên viết tắt"
                  placeholder="Nhập tên viết tắt"
                  control={control}
                />
                <AppSelectControl
                  name="status"
                  label="Trạng thái"
                  placeholder="Chọn trạng thái"
                  options={STATUS_OPTIONS}
                  control={control}
                />
              </div>

              <div className="grid grid-cols-3 gap-12 tablet:grid-cols-2 mobile:grid-cols-1">
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

              <div className="grid grid-cols-3 gap-12 tablet:grid-cols-2 mobile:grid-cols-1">
                <AppTextFieldControl
                  name="contactName"
                  label="Người liên hệ"
                  placeholder="Nhập người liên hệ"
                  control={control}
                />
                <AppTextFieldControl
                  name="contractIdNo"
                  label="CMND/CCCD người liên hệ"
                  placeholder="Nhập CMND/CCCD"
                  control={control}
                />
                <AppTextFieldControl
                  name="contactIsueDate"
                  label="Ngày cấp CMND/CCCD"
                  placeholder="dd-mm-yyyy"
                  control={control}
                />
              </div>

              <AppTakeNoteControl
                name="address"
                label="Địa chỉ"
                placeholder="Nhập địa chỉ"
                control={control}
                autoSize={{ minRows: 3, maxRows: 5 }}
              />
            </div>
          </Drawer>
        </form>

        <Drawer
          open={openDetail}
          title={
            <Flex justify="space-between" align="center">
              <div>Chi tiết đơn vị vận hành</div>
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
              <DetailItem label="Mã đơn vị" value={displayText(selectedDetail?.unitCode)} />
              <DetailItem label="Tên đơn vị" value={displayText(selectedDetail?.unitName)} />
              <DetailItem label="Tên viết tắt" value={displayText(selectedDetail?.shortName)} />
              <DetailItem label="Mã số thuế" value={displayText(selectedDetail?.taxNo)} />
              <DetailItem label="Số điện thoại" value={displayText(selectedDetail?.phone)} />
              <DetailItem label="Email" value={displayText(selectedDetail?.email)} />
              <DetailItem label="Người liên hệ" value={displayText(selectedDetail?.contactName)} />
              <DetailItem
                label="CMND/CCCD người liên hệ"
                value={displayText(selectedDetail?.contractIdNo)}
              />
              <DetailItem
                label="Ngày cấp CMND/CCCD"
                value={renderDate(selectedDetail?.contactIsueDate)}
              />
              <DetailItem
                label="Trạng thái"
                value={
                  <Status
                    type={getStatusMeta(selectedDetail?.status).type}
                    kind={KIND_STATUS.PRIMARY}
                    content={getStatusMeta(selectedDetail?.status).label}
                  />
                }
              />
              <DetailItem label="Người tạo" value={displayText(selectedDetail?.createdBy)} />
              <DetailItem label="Ngày tạo" value={renderDateTime(selectedDetail?.createdAt)} />
              <DetailItem label="Người cập nhật" value={displayText(selectedDetail?.updateBy)} />
              <DetailItem label="Ngày cập nhật" value={renderDateTime(selectedDetail?.updatedAt)} />
              <div className="col-span-2 mobile:col-span-1">
                <DetailItem label="Địa chỉ" value={displayText(selectedDetail?.address)} />
              </div>
            </div>
          </Spin>
        </Drawer>
      </section>
    </PageWithBreadcrumb>
  );
};

export default ManageOperationUnitScreen;
