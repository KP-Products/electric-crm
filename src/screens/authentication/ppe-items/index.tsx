'use client';

import {
  K_SIZE_0,
  K_SIZE_1,
  K_SIZE_100,
  K_SIZE_120,
  K_SIZE_140,
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
import ButtonBase from 'components/button';
import { AppDatePickerControl } from 'components/date-picker';
import IconHover from 'components/icon-vec-local/icon-hover';
import { AppSelect, AppSelectControl } from 'components/select';
import CustomDropSearchMore from 'components/select/CustomDropSearchMore';
import Status, { KIND_STATUS } from 'components/status';
import AppTable from 'components/table';
import AppPagination from 'components/table/pagination';
import TagFilter from 'components/tag-filter';
import { TextBase } from 'components/text';
import { AppTextField, AppTextFieldControl } from 'components/text-field';
import { ROUTES } from 'config/routes';
import PageWithBreadcrumb from 'layout/AppLayout/PageWithBreadcumb';
import { PpeItem } from 'model/ppe-item';
import type { ReactNode } from 'react';
import { useMemo } from 'react';
import { useResponsive } from 'utils/responsive';
import usePpeItems, { PpeItemFilterForm } from './usePpeItems';
import {
  getPpeItemCreator,
  getPpeItemStatusLabel,
  getPpeItemStatusType,
  PPE_DATE_FORMAT,
  PPE_ITEM_STATUS_OPTIONS,
  renderPpeItemDate,
  renderPpeItemNumber
} from './utils';

const requiredMark = <span className="text-error-600">{REQUIRED_MARK}</span>;

const FILTER_LABEL_MAP: Record<keyof PpeItemFilterForm, string> = {
  itemCode: 'Mã thiết bị',
  itemName: 'Tên thiết bị',
  status: 'Trạng thái',
  employeeId: 'Nhân viên được cấp'
};

const renderText = (text?: string | number | null) =>
  text === undefined || text === null || text === '' ? NULL_VALUE : String(text);

const renderTruncatedText = (text?: string | null, className = 'max-w-[220px]') => (
  <div title={text || ''} className={`${className} truncate`}>
    {renderText(text)}
  </div>
);

const PpeItemsScreen = () => {
  const { isMobile, isTablet } = useResponsive();
  const {
    t,
    ppeItemList,
    total,
    listLoading,
    detailLoading,
    currentPage,
    pagination,
    filter,
    filterApplied,
    employeeOptions,
    employeeSearch,
    employeeOptionsLoading,
    openForm,
    selectedItem,
    permission,
    form,
    onSearchEmployees,
    onOpenEmployeeDropdown,
    updateFilter,
    onApplyFilter,
    onResetFilter,
    onOpenCreate,
    onOpenUpdate,
    onCloseForm,
    onSubmit,
    onDelete,
    getEmployeeName
  } = usePpeItems();

  const {
    control,
    handleSubmit,
    formState: { isDirty, isValid }
  } = form;

  const activeFilters = useMemo(
    () =>
      (Object.entries(filterApplied) as [keyof PpeItemFilterForm, string][]).filter(([, value]) =>
        Boolean(value)
      ),
    [filterApplied]
  );

  const getFilterDisplayValue = (key: keyof PpeItemFilterForm, value: string) => {
    if (key === 'status') return getPpeItemStatusLabel(value);
    if (key === 'employeeId') return getEmployeeName(Number(value));
    return value;
  };

  const renderEmployeeDropdown = (menuInstance: ReactNode) => (
    <CustomDropSearchMore
      menuInstance={menuInstance}
      searchValue={employeeSearch}
      onChangeSearch={onSearchEmployees}
      onMore={() => {}}
      totalList={employeeOptions.length}
      total={employeeOptions.length}
      loading={employeeOptionsLoading}
    />
  );

  const columns = useMemo<any[]>(() => {
    const cols: any[] = [
      {
        title: 'STT',
        key: 'index',
        width: K_SIZE_100,
        align: 'center',
        render: (_: unknown, __: PpeItem, index: number) =>
          (currentPage - K_SIZE_1) * Number(pagination.pageSize || K_SIZE_0) + index + K_SIZE_1
      },
      {
        title: 'Mã thiết bị',
        dataIndex: 'itemCode',
        key: 'itemCode',
        width: K_SIZE_150,
        render: (text: string, record: PpeItem) => (
          <TextBase
            classNames={
              permission.canEdit
                ? 'sub-title4 cursor-pointer !text-secondary-500 hover:!text-secondary-700'
                : 'sub-title4'
            }
            text={text || NULL_VALUE}
            onClick={permission.canEdit ? () => onOpenUpdate(record) : undefined}
          />
        )
      },
      {
        title: 'Tên thiết bị',
        dataIndex: 'itemName',
        key: 'itemName',
        width: K_SIZE_220,
        render: (text: string) => renderTruncatedText(text, 'max-w-[260px]')
      },
      {
        title: 'Đơn vị tính',
        dataIndex: 'unit',
        key: 'unit',
        width: K_SIZE_120,
        render: renderText
      },
      {
        title: 'Số lượng',
        dataIndex: 'quantity',
        key: 'quantity',
        align: 'right',
        width: K_SIZE_120,
        render: renderPpeItemNumber
      },
      {
        title: 'Ngày nhập kho',
        dataIndex: 'importDate',
        key: 'importDate',
        width: K_SIZE_140,
        render: renderPpeItemDate
      },
      {
        title: 'Tình trạng',
        dataIndex: 'status',
        key: 'status',
        width: K_SIZE_140,
        render: (status: string) => (
          <Status
            type={getPpeItemStatusType(status)}
            kind={KIND_STATUS.SECONDARY}
            content={getPpeItemStatusLabel(status)}
          />
        )
      },
      {
        title: 'Người nhập kho',
        key: 'createdBy',
        width: K_SIZE_160,
        render: (_: unknown, record: PpeItem) => renderTruncatedText(getPpeItemCreator(record))
      },
      {
        title: 'Nhân viên được cấp',
        dataIndex: 'employeeId',
        key: 'employeeId',
        width: K_SIZE_200,
        render: (employeeId?: number) => renderTruncatedText(getEmployeeName(employeeId))
      }
    ];

    if (permission.canEdit || permission.canDelete) {
      cols.push({
        title: t('common:action'),
        fixed: 'right',
        align: 'center',
        width: K_SIZE_100,
        render: (_: unknown, record: PpeItem) => (
          <div className="flex justify-center gap-8">
            {permission.canEdit && (
              <IconHover
                rootClassName="text-color-800"
                title={t('common:edit')}
                icon="ICON_EDIT"
                iconHeight={K_SIZE_18}
                onClick={() => onOpenUpdate(record)}
              />
            )}
            {permission.canDelete && (
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
      });
    }

    return cols;
  }, [
    currentPage,
    getEmployeeName,
    onDelete,
    onOpenUpdate,
    pagination.pageSize,
    permission.canDelete,
    permission.canEdit,
    t
  ]);

  const breadcrumbList = [
    {
      title: 'Thiết bị'
    },
    {
      title: 'Quản lý bảo hộ lao động',
      key: ROUTES.PPE_ITEMS
    }
  ];

  // if (!permission.canView) {
  //   return (
  //     <PageWithBreadcrumb breadcrumbList={breadcrumbList}>
  //       <section>
  //         <TextBase
  //           classNames="body2 !text-color-700"
  //           text="Bạn không có quyền truy cập tính năng này"
  //         />
  //       </section>
  //     </PageWithBreadcrumb>
  //   );
  // }

  return (
    <PageWithBreadcrumb breadcrumbList={breadcrumbList}>
      <section>
        <Flex
          justify="space-between"
          align="center"
          gap={K_SIZE_8}
          className="mobile:flex-col mobile:items-start"
        >
          <div>
            <TextBase classNames="title4" text="Quản lý bảo hộ lao động" />
            <TextBase
              classNames="body3 !text-color-700"
              text={`Theo dõi ${total} thiết bị bảo hộ lao động và trạng thái cấp phát`}
            />
          </div>
          {/*{permission.canAdd && (*/}
          <ButtonBase
            type="primary"
            leftIcon="IC_ADD_OUTLINE2"
            customContent="Thêm mới"
            classNames="mobile:w-full mobile:justify-center"
            onClick={onOpenCreate}
          />
          {/*)}*/}
        </Flex>
        <Divider className="my-16" />

        <div className="mb-12 grid grid-cols-[minmax(160px,1fr)_minmax(180px,1fr)_minmax(160px,1fr)_minmax(200px,1fr)_auto] items-end gap-12 rounded-radius-l border border-color-300 bg-color-50 p-12 tablet:grid-cols-2 mobile:grid-cols-1">
          <AppTextField
            name="itemCodeFilter"
            label="Mã thiết bị"
            placeholder="Nhập mã thiết bị"
            value={filter.itemCode}
            onChange={(event) => updateFilter('itemCode', event.target.value)}
            onPressEnter={onApplyFilter}
          />
          <AppTextField
            name="itemNameFilter"
            label="Tên thiết bị"
            placeholder="Nhập tên thiết bị"
            value={filter.itemName}
            onChange={(event) => updateFilter('itemName', event.target.value)}
            onPressEnter={onApplyFilter}
          />
          <AppSelect
            name="statusFilter"
            label="Trạng thái"
            placeholder="Chọn trạng thái"
            value={filter.status}
            options={PPE_ITEM_STATUS_OPTIONS}
            onSelectOption={({ key }) => updateFilter('status', String(key))}
          />
          <AppSelect
            name="employeeFilter"
            label="Nhân viên được cấp"
            placeholder="Chọn nhân viên"
            value={filter.employeeId}
            options={employeeOptions}
            dropdownRender={renderEmployeeDropdown}
            onOpenChange={(open) => {
              if (open) onOpenEmployeeDropdown();
            }}
            onSelectOption={({ key }) => updateFilter('employeeId', String(key))}
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

        <Spin spinning={listLoading && ppeItemList.length > K_SIZE_0}>
          <div className="overflow-hidden rounded-radius-l border border-color-400 duration-500">
            <AppTable
              loading={listLoading}
              rootClassName="w-full"
              className="[&_.ant-pagination]:hidden"
              scroll={{ x: 'max-content', y: '72vh' }}
              dataSource={ppeItemList}
              columns={columns}
              rowKey={(record: any) => String(record.id || record.itemCode)}
              pagination={pagination}
            />
          </div>
          <AppPagination currentPage={currentPage} total={total} pagination={pagination} />
        </Spin>

        <form id="ppe-item-form" onSubmit={handleSubmit(onSubmit)}>
          <Drawer
            open={openForm}
            title={
              <Flex justify="space-between" align="center">
                <div>{selectedItem ? 'Cập nhật bảo hộ lao động' : 'Thêm bảo hộ lao động'}</div>
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
            onClose={onCloseForm}
            width={isTablet || isMobile ? '94vw' : '50vw'}
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
                  form="ppe-item-form"
                  htmlType="submit"
                  disabled={!isValid || Boolean(selectedItem && !isDirty) || detailLoading}
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
              <div className="grid grid-cols-2 gap-12 mobile:grid-cols-1">
                <AppTextFieldControl
                  name="itemCode"
                  label="Mã thiết bị"
                  labelSuffix={requiredMark}
                  placeholder="Nhập mã thiết bị"
                  control={control}
                  disabled={Boolean(selectedItem)}
                />
                <AppTextFieldControl
                  name="itemName"
                  label="Tên thiết bị"
                  labelSuffix={requiredMark}
                  placeholder="Nhập tên thiết bị"
                  control={control}
                />
              </div>
              <div className="grid grid-cols-2 gap-12 mobile:grid-cols-1">
                <AppTextFieldControl
                  name="category"
                  label="Loại vật tư"
                  placeholder="Nhập loại vật tư"
                  control={control}
                />
                <AppTextFieldControl
                  name="unit"
                  label="Đơn vị tính"
                  placeholder="Nhập đơn vị tính"
                  control={control}
                />
              </div>
              <div className="grid grid-cols-2 gap-12 mobile:grid-cols-1">
                <AppTextFieldControl
                  name="quantity"
                  label="Số lượng"
                  placeholder="Nhập số lượng"
                  control={control}
                />
                <AppSelectControl
                  name="status"
                  label="Trạng thái"
                  placeholder="Chọn trạng thái"
                  options={PPE_ITEM_STATUS_OPTIONS}
                  control={control}
                />
              </div>
              <div className="grid grid-cols-2 gap-12 mobile:grid-cols-1">
                <AppDatePickerControl
                  control={control}
                  name="importDate"
                  label="Ngày nhập kho"
                  placeholder="Chọn ngày nhập kho"
                  backendFormat={PPE_DATE_FORMAT}
                  wrapperClassName="w-full"
                  datePickerClassName="w-full"
                />
                <AppDatePickerControl
                  control={control}
                  name="exportDate"
                  label="Ngày xuất kho"
                  placeholder="Chọn ngày xuất kho"
                  backendFormat={PPE_DATE_FORMAT}
                  wrapperClassName="w-full"
                  datePickerClassName="w-full"
                />
              </div>
              <AppSelectControl
                name="employeeId"
                label="Nhân viên được cấp"
                placeholder="Chọn nhân viên"
                options={employeeOptions}
                dropdownRender={renderEmployeeDropdown}
                onOpenChange={(open) => {
                  if (open) onOpenEmployeeDropdown();
                }}
                unSeleted
                control={control}
              />
              <AppTextFieldControl
                name="note"
                label="Ghi chú"
                placeholder="Nhập ghi chú"
                control={control}
              />
            </div>
          </Drawer>
        </form>
      </section>
    </PageWithBreadcrumb>
  );
};

export default PpeItemsScreen;
