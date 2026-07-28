'use client';

import {
  DEFAULT_PAGE_SIZE,
  K_SIZE_0,
  K_SIZE_1,
  K_SIZE_100,
  K_SIZE_130,
  K_SIZE_150,
  K_SIZE_16,
  K_SIZE_18,
  K_SIZE_180,
  K_SIZE_200,
  K_SIZE_220,
  K_SIZE_8,
  REQUIRED_MARK
} from '@constant';
import { Divider, Drawer, Dropdown, Flex, Spin } from 'antd';
import type { AnyObject } from 'antd/es/_util/type';
import ButtonBase from 'components/button';
import { AppDatePicker, AppDatePickerControl } from 'components/date-picker';
import { IconSvgLocal } from 'components/icon-vec-local';
import IconHover from 'components/icon-vec-local/icon-hover';
import { AppSelect, AppSelectControl, AppSelectOption } from 'components/select';
import Status, { KIND_STATUS } from 'components/status';
import AppTable from 'components/table';
import AppPagination from 'components/table/pagination';
import TagFilter from 'components/tag-filter';
import { TextBase } from 'components/text';
import { AppTextField, AppTextFieldControl } from 'components/text-field';
import { ROUTES } from 'config/routes';
import PageWithBreadcrumb from 'layout/AppLayout/PageWithBreadcumb';
import { Contract } from 'model/contract';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { useCallback, useMemo } from 'react';
import { displayDateTimeFromServer } from 'utils/date';
import { useResponsive } from 'utils/responsive';
import useManageContract from './useManageContract';
import {
  CONTRACT_STATUS_OPTIONS,
  ContractFilter,
  displayText,
  getContractId,
  getContractStatusMeta,
  renderContractDate
} from './utils';

dayjs.extend(customParseFormat);

const ALL_OPTION: AppSelectOption = { value: '', label: 'Tất cả' };
type ContractDateFilterKey = 'signedDate' | 'effectiveDate' | 'expiryDate';

const FILTER_LABEL_MAP: Record<keyof ContractFilter, string> = {
  contractNumber: 'Số hợp đồng',
  customerId: 'Khách hàng',
  meterId: 'Công tơ',
  status: 'Trạng thái',
  signedDate: 'Thời gian ký',
  effectiveDate: 'Ngày hiệu lực',
  expiryDate: 'Ngày hết hiệu lực',
  createdBy: 'Người tạo'
};

const renderTruncatedText = (text?: string | null, className = 'max-w-[220px]') => (
  <div title={text || ''} className={`${className} truncate`}>
    {displayText(text)}
  </div>
);

const isFilterValueActive = (value: ContractFilter[keyof ContractFilter]) => Boolean(value);

const ManageContractScreen = () => {
  const { isMobile, isTablet } = useResponsive();
  const {
    t,
    contractList,
    total,
    listLoading,
    detailLoading,
    currentPage,
    pagination,
    filter,
    filterApplied,
    selectedContractKeys,
    selectedContractCount,
    customerOptions,
    meterOptions,
    userOptions,
    getCustomerDisplay,
    getMeterDisplay,
    getUserDisplay,
    onOpenCustomerDropdown,
    customerDropdownRender,
    onOpenMeterDropdown,
    meterDropdownRender,
    onOpenUserDropdown,
    userDropdownRender,
    onChangeFilter,
    onApplyFilter,
    onResetFilter,
    onOpenCreate,
    onOpenUpdate,
    onCopyContract,
    onOpenDetail,
    openExtend,
    extendForm,
    handleExtendSubmit,
    onOpenExtend,
    onCloseExtend,
    openStatus,
    statusForm,
    handleStatusSubmit,
    onOpenStatus,
    onCloseStatus,
    onDelete,
    onSelectContracts,
    onPrintContracts,
    isoDateFormat
  } = useManageContract();

  const {
    control: extendControl,
    handleSubmit: handleExtendFormSubmit,
    formState: { isValid: isExtendValid }
  } = extendForm;
  const {
    control: statusControl,
    handleSubmit: handleStatusFormSubmit,
    formState: { isValid: isStatusValid }
  } = statusForm;

  const activeFilters = useMemo(
    () =>
      (
        Object.entries(filterApplied) as [
          keyof ContractFilter,
          ContractFilter[keyof ContractFilter]
        ][]
      ).filter(([, value]) => isFilterValueActive(value)),
    [filterApplied]
  );

  const formatFilterValue = useCallback(
    (key: keyof ContractFilter, value: ContractFilter[keyof ContractFilter]) => {
      if (key === 'customerId') return getCustomerDisplay(value);
      if (key === 'meterId') return getMeterDisplay(value);
      if (key === 'createdBy') return getUserDisplay(value);
      if (key === 'status') return getContractStatusMeta(value).label;
      if (key === 'signedDate' || key === 'effectiveDate' || key === 'expiryDate') {
        return renderContractDate(value);
      }
      return value;
    },
    [getCustomerDisplay, getMeterDisplay, getUserDisplay]
  );

  const getDatePickerValue = useCallback(
    (date?: string) => {
      if (!date) return null;
      const parsedDate = dayjs(date, isoDateFormat);
      return parsedDate.isValid() ? parsedDate : null;
    },
    [isoDateFormat]
  );

  const onChangeDateFilter = useCallback(
    (key: ContractDateFilterKey, date: Dayjs | null) => {
      onChangeFilter(key, date ? date.format(isoDateFormat) : '');
    },
    [onChangeFilter, isoDateFormat]
  );

  const getContractRowKey = useCallback((record: AnyObject, index?: number) => {
    const contract = record as Partial<Contract>;
    const key = getContractId(contract as Contract) || contract.contractNumber;
    if (key) return String(key);
    return index !== undefined ? String(index) : '';
  }, []);

  const rowSelection = useMemo(
    () => ({
      selectedRowKeys: selectedContractKeys,
      onChange: onSelectContracts,
      getCheckboxProps: (record: AnyObject) => {
        const contract = record as Partial<Contract>;
        return {
          disabled: !getContractId(contract as Contract) && !contract.contractNumber
        };
      }
    }),
    [onSelectContracts, selectedContractKeys]
  );

  const columns = useMemo<any[]>(
    () => [
      {
        title: 'STT',
        key: 'index',
        width: K_SIZE_100,
        align: 'center',
        render: (_: unknown, __: Contract, index: number) =>
          (currentPage - K_SIZE_1) * DEFAULT_PAGE_SIZE + index + K_SIZE_1
      },
      {
        title: 'Số hợp đồng',
        dataIndex: 'contractNumber',
        key: 'contractNumber',
        width: K_SIZE_180,
        render: (text: string, record: Contract) => (
          <TextBase
            classNames="sub-title4 cursor-pointer !text-secondary-500 hover:!text-secondary-700"
            text={displayText(text)}
            onClick={() => onOpenDetail(record)}
          />
        )
      },
      {
        title: 'Khách hàng',
        dataIndex: 'customerId',
        key: 'customerId',
        width: K_SIZE_220,
        render: (customerId: string) =>
          renderTruncatedText(getCustomerDisplay(customerId), 'max-w-[260px]')
      },
      {
        title: 'Công tơ',
        dataIndex: 'meterId',
        key: 'meterId',
        width: K_SIZE_150,
        render: (meterId: string) => renderTruncatedText(getMeterDisplay(meterId), 'max-w-[180px]')
      },
      {
        title: 'Ngày ký',
        dataIndex: 'signedDate',
        key: 'signedDate',
        width: K_SIZE_130,
        render: (date: string) => renderContractDate(date)
      },
      {
        title: 'Ngày hiệu lực',
        dataIndex: 'effectiveDate',
        key: 'effectiveDate',
        width: K_SIZE_130,
        render: (date: string) => renderContractDate(date)
      },
      {
        title: 'Ngày hết hiệu lực',
        dataIndex: 'expiryDate',
        key: 'expiryDate',
        width: K_SIZE_150,
        render: (date: string) => renderContractDate(date)
      },
      {
        title: 'Trạng thái',
        dataIndex: 'status',
        key: 'status',
        width: K_SIZE_150,
        render: (status: string) => {
          const meta = getContractStatusMeta(status);
          return <Status type={meta.type} kind={KIND_STATUS.PRIMARY} content={meta.label} />;
        }
      },
      {
        title: 'Người tạo',
        dataIndex: 'createdBy',
        key: 'createdBy',
        width: K_SIZE_150,
        render: (createdBy: string) =>
          renderTruncatedText(getUserDisplay(createdBy), 'max-w-[180px]')
      },
      {
        title: 'Ngày tạo',
        dataIndex: 'createdAt',
        key: 'createdAt',
        width: K_SIZE_200,
        render: (date: string) => displayDateTimeFromServer(date)
      },
      {
        title: 'Thao tác',
        fixed: 'right',
        align: 'center',
        width: K_SIZE_100,
        render: (_: unknown, record: Contract) => (
          <Dropdown
            trigger={['click']}
            placement="bottomRight"
            arrow={{ pointAtCenter: true }}
            menu={{
              items: [
                { key: 'detail', label: 'Xem chi tiết' },
                { key: 'edit', label: t('common:edit') },
                { key: 'copy', label: 'Sao chép' },
                { key: 'extend', label: 'Gia hạn' },
                { key: 'status', label: 'Tạm ngưng / Chấm dứt' },
                { key: 'delete', label: t('common:delete'), danger: true }
              ],
              onClick: ({ key, domEvent }) => {
                domEvent.stopPropagation();
                if (key === 'detail') onOpenDetail(record);
                if (key === 'edit') onOpenUpdate(record);
                if (key === 'copy') onCopyContract(record);
                if (key === 'extend') onOpenExtend(record);
                if (key === 'status') onOpenStatus(record);
                if (key === 'delete') onDelete(record);
              }
            }}
          >
            <button
              type="button"
              aria-label="Mở menu thao tác"
              className="inline-flex size-28 items-center justify-center rounded-radius-s text-color-800 hover:bg-color-100"
              onClick={(event) => event.stopPropagation()}
            >
              <IconSvgLocal name="ICON_MORE" height={K_SIZE_18} />
            </button>
          </Dropdown>
        )
      }
    ],
    [
      currentPage,
      getCustomerDisplay,
      getMeterDisplay,
      getUserDisplay,
      onDelete,
      onCopyContract,
      onOpenDetail,
      onOpenExtend,
      onOpenStatus,
      onOpenUpdate,
      t
    ]
  );

  const breadcrumbList = [
    {
      title: 'Trang chủ'
    },
    {
      title: 'Hợp đồng'
    },
    {
      title: 'Quản lý hợp đồng mua bán điện',
      key: ROUTES.MANAGE_CONTRACT
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
          <TextBase classNames="title4" text="Quản lý hợp đồng mua bán điện" />
          <Flex
            flex={K_SIZE_1}
            justify="end"
            gap={K_SIZE_16}
            className="mobile:mt-8 mobile:w-full mobile:flex-col"
          >
            <ButtonBase
              type="ghost"
              leftIcon="ICON_BILL"
              customContent={`In hợp đồng${selectedContractCount ? ` (${selectedContractCount})` : ''}`}
              onClick={onPrintContracts}
              disabled={selectedContractCount === K_SIZE_0}
              classNames="mobile:flex-1 mobile:justify-center"
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

        <div className="mb-12 rounded-radius-l border border-color-300 bg-color-50 p-16">
          <div className="grid grid-cols-5 gap-16 tablet:grid-cols-2 mobile:grid-cols-1">
            <AppTextField
              name="contractNumber"
              label="Số hợp đồng"
              placeholder="Nhập số hợp đồng"
              value={filter.contractNumber}
              onChange={(event) => onChangeFilter('contractNumber', event.target.value)}
              onPressEnter={onApplyFilter}
            />
            <AppSelect
              name="customerId"
              label="Khách hàng"
              placeholder="Nhập mã hoặc tên khách hàng"
              value={filter.customerId}
              options={[ALL_OPTION, ...customerOptions]}
              dropdownRender={customerDropdownRender}
              onOpenChange={onOpenCustomerDropdown}
              onSelectOption={({ key }) => onChangeFilter('customerId', String(key))}
              suffix={<IconSvgLocal name="ICON_SEARCH" height={20} width={20} />}
            />
            <AppSelect
              name="meterId"
              label="Công tơ"
              placeholder="Nhập mã công tơ"
              value={filter.meterId}
              options={[ALL_OPTION, ...meterOptions]}
              dropdownRender={meterDropdownRender}
              onOpenChange={onOpenMeterDropdown}
              onSelectOption={({ key }) => onChangeFilter('meterId', String(key))}
              suffix={<IconSvgLocal name="ICON_SEARCH" height={20} width={20} />}
            />
            <AppSelect
              name="status"
              label="Trạng thái"
              placeholder="Chọn trạng thái"
              value={filter.status}
              options={[ALL_OPTION, ...CONTRACT_STATUS_OPTIONS]}
              onSelectOption={({ key }) => onChangeFilter('status', String(key))}
            />
            <AppDatePicker
              name="signedDate"
              label="Thời gian ký"
              placeholder="Chọn thời gian ký"
              value={getDatePickerValue(filter.signedDate)}
              onChange={(date) => onChangeDateFilter('signedDate', date as Dayjs | null)}
              allowClear
              wrapperClassName="w-full"
              datePickerClassName="w-full"
            />
            <AppDatePicker
              name="effectiveDate"
              label="Ngày hiệu lực"
              placeholder="Chọn ngày hiệu lực"
              value={getDatePickerValue(filter.effectiveDate)}
              onChange={(date) => onChangeDateFilter('effectiveDate', date as Dayjs | null)}
              allowClear
              wrapperClassName="w-full"
              datePickerClassName="w-full"
            />
            <AppDatePicker
              name="expiryDate"
              label="Ngày hết hiệu lực"
              placeholder="Chọn ngày hết hiệu lực"
              value={getDatePickerValue(filter.expiryDate)}
              onChange={(date) => onChangeDateFilter('expiryDate', date as Dayjs | null)}
              allowClear
              wrapperClassName="w-full"
              datePickerClassName="w-full"
            />
            <AppSelect
              name="createdBy"
              label="Người tạo"
              placeholder="Chọn người tạo"
              value={filter.createdBy}
              options={[ALL_OPTION, ...userOptions]}
              dropdownRender={userDropdownRender}
              onOpenChange={onOpenUserDropdown}
              onSelectOption={({ key }) => onChangeFilter('createdBy', String(key))}
              suffix={<IconSvgLocal name="ICON_SEARCH" height={20} width={20} />}
            />
            <div className="col-start-5 flex items-end justify-end gap-8 tablet:col-span-2 tablet:col-start-auto mobile:col-span-1 mobile:flex-col">
              <ButtonBase
                type="ghost"
                customContent="Làm mới"
                onClick={() => onResetFilter()}
                classNames="min-w-[104px] mobile:w-full mobile:justify-center"
              />
              <ButtonBase
                type="primary"
                leftIcon="IC_SEARCH_OUTLINE2"
                customContent="Tìm kiếm"
                onClick={onApplyFilter}
                classNames="min-w-[140px] mobile:w-full mobile:justify-center"
              />
            </div>
          </div>
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

        <Spin spinning={listLoading && contractList.length > K_SIZE_0}>
          <div className="overflow-hidden rounded-radius-l border border-color-400 bg-color-50 duration-500">
            <Flex justify="space-between" align="center" className="px-16 py-12">
              <TextBase classNames="sub-title3 !text-primary-700" text="Danh sách hợp đồng" />
              <div className="text-14 font-medium text-color-700">
                Hiển thị {Math.min(DEFAULT_PAGE_SIZE, total)} bản ghi
              </div>
            </Flex>
            <AppTable
              loading={listLoading}
              rootClassName="w-full"
              className="[&_.ant-pagination]:hidden"
              scroll={{ x: 'max-content', y: '68vh' }}
              dataSource={contractList}
              columns={columns}
              rowKey={getContractRowKey}
              rowSelection={rowSelection}
              pagination={pagination}
            />
            <div className="px-16 pb-12">
              <AppPagination currentPage={currentPage} total={total} pagination={pagination} />
            </div>
          </div>
        </Spin>

        <form id="contract-extend-form" onSubmit={handleExtendFormSubmit(handleExtendSubmit)}>
          <Drawer
            open={openExtend}
            title={
              <Flex justify="space-between" align="center">
                <div>Gia hạn hợp đồng</div>
                <IconHover title="" icon="IC_CLOSE_OUTLINE" onClick={onCloseExtend} />
              </Flex>
            }
            destroyOnClose
            placement="right"
            closable={false}
            onClose={onCloseExtend}
            width={isTablet || isMobile ? '80vw' : '36vw'}
            footer={
              <Flex justify="end" gap={K_SIZE_8}>
                <ButtonBase
                  classNames="app-common-btn"
                  type="ghost"
                  customContent={t('common:close')}
                  onClick={onCloseExtend}
                />
                <ButtonBase
                  classNames="app-common-btn"
                  type="primary"
                  form="contract-extend-form"
                  htmlType="submit"
                  disabled={!isExtendValid || detailLoading}
                  customContent={t('common:confirm')}
                />
              </Flex>
            }
          >
            <div className="grid gap-12">
              <AppDatePickerControl
                name="expiryDate"
                label="Ngày hết hạn mới"
                labelSuffix={REQUIRED_MARK}
                labelSuffixClassName="text-error-600"
                placeholder="Chọn ngày hết hạn mới"
                backendFormat={isoDateFormat}
                wrapperClassName="w-full"
                datePickerClassName="w-full"
                control={extendControl}
              />
              <AppTextFieldControl
                name="note"
                label="Ghi chú gia hạn"
                placeholder="Nhập ghi chú"
                control={extendControl}
              />
            </div>
          </Drawer>
        </form>

        <form id="contract-status-form" onSubmit={handleStatusFormSubmit(handleStatusSubmit)}>
          <Drawer
            open={openStatus}
            title={
              <Flex justify="space-between" align="center">
                <div>Tạm ngưng / Chấm dứt hợp đồng</div>
                <IconHover title="" icon="IC_CLOSE_OUTLINE" onClick={onCloseStatus} />
              </Flex>
            }
            destroyOnClose
            placement="right"
            closable={false}
            onClose={onCloseStatus}
            width={isTablet || isMobile ? '80vw' : '36vw'}
            footer={
              <Flex justify="end" gap={K_SIZE_8}>
                <ButtonBase
                  classNames="app-common-btn"
                  type="ghost"
                  customContent={t('common:close')}
                  onClick={onCloseStatus}
                />
                <ButtonBase
                  classNames="app-common-btn"
                  type="primary"
                  form="contract-status-form"
                  htmlType="submit"
                  disabled={!isStatusValid || detailLoading}
                  customContent={t('common:confirm')}
                />
              </Flex>
            }
          >
            <div className="grid gap-12">
              <AppSelectControl
                name="status"
                label="Trạng thái"
                labelSuffix={<span className="text-error-600">{REQUIRED_MARK}</span>}
                placeholder="Chọn trạng thái"
                options={CONTRACT_STATUS_OPTIONS}
                control={statusControl}
              />
              <AppTextFieldControl
                name="note"
                label="Lý do"
                labelSuffix={REQUIRED_MARK}
                labelSuffixClassName="text-error-600"
                placeholder="Nhập lý do cập nhật trạng thái"
                control={statusControl}
              />
            </div>
          </Drawer>
        </form>
      </section>
    </PageWithBreadcrumb>
  );
};

export default ManageContractScreen;
