'use client';

import {
  K_SIZE_0,
  K_SIZE_1,
  K_SIZE_100,
  K_SIZE_120,
  K_SIZE_140,
  K_SIZE_150,
  K_SIZE_18,
  K_SIZE_200,
  K_SIZE_220,
  K_SIZE_240,
  K_SIZE_8,
  NULL_VALUE,
  REQUIRED_MARK
} from '@constant';
import { Divider, Drawer, Flex, Spin } from 'antd';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import ButtonBase from 'components/button';
import { AppDatePicker, AppDatePickerControl } from 'components/date-picker';
import IconHover from 'components/icon-vec-local/icon-hover';
import { AppSelect, AppSelectControl } from 'components/select';
import CustomDropSearchMore from 'components/select/CustomDropSearchMore';
import Status, { KIND_STATUS } from 'components/status';
import AppTable from 'components/table';
import AppPagination from 'components/table/pagination';
import TagFilter from 'components/tag-filter';
import { TextBase } from 'components/text';
import { AppTextFieldControl } from 'components/text-field';
import { ROUTES } from 'config/routes';
import PageWithBreadcrumb from 'layout/AppLayout/PageWithBreadcumb';
import { PpeItemHistory } from 'model/ppe-item-history';
import type { ChangeEvent, ReactNode } from 'react';
import { useMemo } from 'react';
import { FORMAT_DATE_PARAMS } from 'utils/date';
import { useResponsive } from 'utils/responsive';
import usePpeItemHistory, { PpeItemHistoryFilterForm } from './usePpeItemHistory';
import {
  displayText,
  getHistoryTypeLabel,
  getHistoryTypeStatus,
  PPE_ITEM_HISTORY_DATE_FORMAT,
  PPE_ITEM_HISTORY_TYPE_OPTIONS,
  renderPpeItemHistoryDate,
  renderPpeItemHistoryNumber
} from './utils';

dayjs.extend(customParseFormat);

const requiredMark = <span className="text-error-600">{REQUIRED_MARK}</span>;

const FILTER_LABEL_MAP: Record<keyof PpeItemHistoryFilterForm, string> = {
  ppeItemId: 'Thiết bị',
  employeeId: 'Nhân viên nhận',
  exportDate: 'Ngày bàn giao',
  type: 'Loại bàn giao',
  exportEmployeeId: 'Nhân viên bàn giao'
};

const parseFilterDate = (value?: string): Dayjs | null => {
  if (!value) return null;
  const parsedDate = dayjs(value, PPE_ITEM_HISTORY_DATE_FORMAT, true);
  return parsedDate.isValid() ? parsedDate : null;
};

const renderTruncatedText = (text?: string | number | null, className = 'max-w-[220px]') => (
  <div title={text ? String(text) : ''} className={`${className} truncate`}>
    {displayText(text)}
  </div>
);

const sanitizeInteger = (value: string) => value.replace(/\D/g, '');

const PpeItemHistoryScreen = () => {
  const { isMobile, isTablet } = useResponsive();
  const {
    t,
    historyList,
    total,
    listLoading,
    detailLoading,
    currentPage,
    pagination,
    filter,
    filterApplied,
    ppeItemOptions,
    employeeOptions,
    ppeItemSearch,
    employeeSearch,
    ppeItemOptionsLoading,
    employeeOptionsLoading,
    openForm,
    selectedHistory,
    form,
    onSearchPpeItems,
    onSearchEmployees,
    onOpenPpeItemDropdown,
    onOpenEmployeeDropdown,
    updateFilter,
    onApplyFilter,
    onResetFilter,
    onOpenCreate,
    onOpenUpdate,
    onCloseForm,
    onSubmit,
    onDelete,
    getPpeItemName,
    getEmployeeName
  } = usePpeItemHistory();

  const {
    control,
    handleSubmit,
    setValue,
    formState: { isDirty, isValid }
  } = form;

  const activeFilters = useMemo(
    () =>
      (Object.entries(filterApplied) as [keyof PpeItemHistoryFilterForm, string][]).filter(
        ([, value]) => Boolean(value)
      ),
    [filterApplied]
  );

  const getFilterDisplayValue = (key: keyof PpeItemHistoryFilterForm, value: string) => {
    if (key === 'ppeItemId') return getPpeItemName(Number(value));
    if (key === 'employeeId' || key === 'exportEmployeeId') return getEmployeeName(Number(value));
    if (key === 'type') return getHistoryTypeLabel(value);
    if (key === 'exportDate') return renderPpeItemHistoryDate(value);
    return value;
  };

  const renderPpeItemDropdown = (menuInstance: ReactNode) => (
    <CustomDropSearchMore
      menuInstance={menuInstance}
      searchValue={ppeItemSearch}
      onChangeSearch={onSearchPpeItems}
      onMore={() => {}}
      totalList={ppeItemOptions.length}
      total={ppeItemOptions.length}
      loading={ppeItemOptionsLoading}
    />
  );

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

  const onQuantityChange = (event: ChangeEvent<HTMLInputElement>) => {
    setValue('quantity', sanitizeInteger(event.target.value), {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true
    });
  };

  const columns = useMemo<any[]>(() => {
    const cols: any[] = [
      {
        title: 'STT',
        key: 'index',
        width: K_SIZE_100,
        align: 'center',
        render: (_: unknown, __: PpeItemHistory, index: number) =>
          (currentPage - K_SIZE_1) * Number(pagination.pageSize || K_SIZE_0) + index + K_SIZE_1
      },
      {
        title: 'Thiết bị',
        key: 'ppeItemId',
        width: K_SIZE_240,
        render: (_: unknown, record: PpeItemHistory) => (
          <TextBase
            classNames="sub-title4 cursor-pointer !text-secondary-500 hover:!text-secondary-700"
            text={getPpeItemName(record.ppeItemId) || NULL_VALUE}
            onClick={() => onOpenUpdate(record)}
          />
        )
      },
      {
        title: 'Nhân viên nhận',
        dataIndex: 'employeeId',
        key: 'employeeId',
        width: K_SIZE_200,
        render: (employeeId?: number) =>
          renderTruncatedText(getEmployeeName(employeeId), 'max-w-[220px]')
      },
      {
        title: 'Ngày bàn giao',
        dataIndex: 'exportDate',
        key: 'exportDate',
        width: K_SIZE_140,
        render: renderPpeItemHistoryDate
      },
      {
        title: 'Số lượng',
        dataIndex: 'quantity',
        key: 'quantity',
        align: 'right',
        width: K_SIZE_120,
        render: renderPpeItemHistoryNumber
      },
      {
        title: 'Loại bàn giao',
        dataIndex: 'type',
        key: 'type',
        width: K_SIZE_150,
        render: (type: string) => (
          <Status
            type={getHistoryTypeStatus(type)}
            kind={KIND_STATUS.SECONDARY}
            content={getHistoryTypeLabel(type)}
          />
        )
      },
      {
        title: 'Nhân viên bàn giao',
        dataIndex: 'exportEmployeeId',
        key: 'exportEmployeeId',
        width: K_SIZE_200,
        render: (employeeId?: number) =>
          renderTruncatedText(getEmployeeName(employeeId), 'max-w-[220px]')
      },
      {
        title: 'Ghi chú',
        dataIndex: 'note',
        key: 'note',
        width: K_SIZE_220,
        render: (note?: string) => renderTruncatedText(note, 'max-w-[260px]')
      },
      {
        title: t('common:action'),
        fixed: 'right',
        align: 'center',
        width: K_SIZE_100,
        render: (_: unknown, record: PpeItemHistory) => (
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
    ];

    return cols;
  }, [
    currentPage,
    getEmployeeName,
    getPpeItemName,
    onDelete,
    onOpenUpdate,
    pagination.pageSize,
    t
  ]);

  const breadcrumbList = [
    {
      title: 'Thiết bị'
    },
    {
      title: 'Lịch sử bàn giao thiết bị',
      key: ROUTES.PPE_ITEM_HISTORY
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
          <div>
            <TextBase classNames="title4" text="Lịch sử bàn giao thiết bị" />
            <TextBase
              classNames="body3 !text-color-700"
              text={`Theo dõi ${total} lượt bàn giao, thu hồi và đổi mới thiết bị`}
            />
          </div>
          <ButtonBase
            type="primary"
            leftIcon="IC_ADD_OUTLINE2"
            customContent="Thêm mới"
            classNames="mobile:w-full mobile:justify-center"
            onClick={onOpenCreate}
          />
        </Flex>
        <Divider className="my-16" />

        <div className="mb-12 grid grid-cols-[minmax(200px,1fr)_minmax(180px,1fr)_minmax(160px,1fr)_minmax(160px,1fr)_minmax(180px,1fr)_auto] items-end gap-12 rounded-radius-l border border-color-300 bg-color-50 p-12 tablet:grid-cols-2 mobile:grid-cols-1">
          <AppSelect
            name="ppeItemFilter"
            label="Thiết bị"
            placeholder="Chọn thiết bị"
            value={filter.ppeItemId}
            options={ppeItemOptions}
            dropdownRender={renderPpeItemDropdown}
            onOpenChange={(open) => {
              if (open) onOpenPpeItemDropdown();
            }}
            onSelectOption={({ key }) => updateFilter('ppeItemId', String(key))}
          />
          <AppSelect
            name="employeeFilter"
            label="Nhân viên nhận"
            placeholder="Chọn nhân viên"
            value={filter.employeeId}
            options={employeeOptions}
            dropdownRender={renderEmployeeDropdown}
            onOpenChange={(open) => {
              if (open) onOpenEmployeeDropdown();
            }}
            onSelectOption={({ key }) => updateFilter('employeeId', String(key))}
          />
          <AppDatePicker
            name="exportDateFilter"
            label="Ngày bàn giao"
            placeholder="Chọn ngày"
            value={parseFilterDate(filter.exportDate)}
            format={FORMAT_DATE_PARAMS}
            allowClear
            wrapperClassName="w-full"
            datePickerClassName="w-full"
            onChange={(value) =>
              updateFilter('exportDate', value ? value.format(PPE_ITEM_HISTORY_DATE_FORMAT) : '')
            }
          />
          <AppSelect
            name="typeFilter"
            label="Loại bàn giao"
            placeholder="Chọn loại"
            value={filter.type}
            options={PPE_ITEM_HISTORY_TYPE_OPTIONS}
            onSelectOption={({ key }) => updateFilter('type', String(key))}
          />
          <AppSelect
            name="exportEmployeeFilter"
            label="Nhân viên bàn giao"
            placeholder="Chọn nhân viên"
            value={filter.exportEmployeeId}
            options={employeeOptions}
            dropdownRender={renderEmployeeDropdown}
            onOpenChange={(open) => {
              if (open) onOpenEmployeeDropdown();
            }}
            onSelectOption={({ key }) => updateFilter('exportEmployeeId', String(key))}
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

        <Spin spinning={listLoading && historyList.length > K_SIZE_0}>
          <div className="overflow-hidden rounded-radius-l border border-color-400 duration-500">
            <AppTable
              loading={listLoading}
              rootClassName="w-full"
              className="[&_.ant-pagination]:hidden"
              scroll={{ x: 'max-content', y: '72vh' }}
              dataSource={historyList}
              columns={columns}
              rowKey={(record: any) => String(record.id)}
              pagination={pagination}
            />
          </div>
          <AppPagination currentPage={currentPage} total={total} pagination={pagination} />
        </Spin>

        <form id="ppe-item-history-form" onSubmit={handleSubmit(onSubmit)}>
          <Drawer
            open={openForm}
            title={
              <Flex justify="space-between" align="center">
                <div>
                  {selectedHistory
                    ? 'Cập nhật lịch sử bàn giao thiết bị'
                    : 'Thêm lịch sử bàn giao thiết bị'}
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
                  form="ppe-item-history-form"
                  htmlType="submit"
                  disabled={!isValid || Boolean(selectedHistory && !isDirty) || detailLoading}
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
                <AppSelectControl
                  name="ppeItemId"
                  label="Thiết bị"
                  labelSuffix={requiredMark}
                  placeholder="Chọn thiết bị"
                  options={ppeItemOptions}
                  dropdownRender={renderPpeItemDropdown}
                  onOpenChange={(open) => {
                    if (open) onOpenPpeItemDropdown();
                  }}
                  control={control}
                />
                <AppSelectControl
                  name="type"
                  label="Loại bàn giao"
                  placeholder="Chọn loại"
                  options={PPE_ITEM_HISTORY_TYPE_OPTIONS}
                  control={control}
                />
              </div>
              <div className="grid grid-cols-2 gap-12 mobile:grid-cols-1">
                <AppSelectControl
                  name="employeeId"
                  label="Nhân viên nhận"
                  labelSuffix={requiredMark}
                  placeholder="Chọn nhân viên"
                  options={employeeOptions}
                  dropdownRender={renderEmployeeDropdown}
                  onOpenChange={(open) => {
                    if (open) onOpenEmployeeDropdown();
                  }}
                  control={control}
                />
                <AppSelectControl
                  name="exportEmployeeId"
                  label="Nhân viên bàn giao"
                  labelSuffix={requiredMark}
                  placeholder="Chọn nhân viên"
                  options={employeeOptions}
                  dropdownRender={renderEmployeeDropdown}
                  onOpenChange={(open) => {
                    if (open) onOpenEmployeeDropdown();
                  }}
                  control={control}
                />
              </div>
              <div className="grid grid-cols-2 gap-12 mobile:grid-cols-1">
                <AppDatePickerControl
                  control={control}
                  name="exportDate"
                  label="Ngày bàn giao"
                  placeholder="Chọn ngày bàn giao"
                  backendFormat={PPE_ITEM_HISTORY_DATE_FORMAT}
                  wrapperClassName="w-full"
                  datePickerClassName="w-full"
                />
                <AppTextFieldControl
                  name="quantity"
                  label="Số lượng"
                  placeholder="Nhập số lượng"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  onlyNumber
                  control={control}
                  onChange={onQuantityChange}
                />
              </div>
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

export default PpeItemHistoryScreen;
