'use client';

import {
  K_SIZE_0,
  K_SIZE_1,
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
import { AppDatePickerControl } from 'components/date-picker';
import { Divider, Drawer, Flex, Spin } from 'antd';
import ButtonBase from 'components/button';
import IconHover from 'components/icon-vec-local/icon-hover';
import { AppSelectControl } from 'components/select';
import Status, { KIND_STATUS, TYPE_STATUS } from 'components/status';
import AppTable from 'components/table';
import AppPagination from 'components/table/pagination';
import TagFilter from 'components/tag-filter';
import { TextBase } from 'components/text';
import { AppTextFieldControl } from 'components/text-field';
import { ROUTES } from 'config/routes';
import PageWithBreadcrumb from 'layout/AppLayout/PageWithBreadcumb';
import { Contract } from 'model/contract';
import { useCallback, useMemo } from 'react';
import { displayDateFromServer, displayDateTimeFromServer } from 'utils/date';
import { useResponsive } from 'utils/responsive';
import ContractFilterDrawer, { type ContractFilterForm } from './components/ContractFilterDrawer';
import useManageContract from './useManageContract';

const CUSTOMER_TYPE_OPTIONS = [
  { value: 'SINH_HOAT', label: 'Sinh hoạt' },
  { value: 'SAN_XUAT', label: 'Sản xuất' },
  { value: 'KINH_DOANH', label: 'Kinh doanh' },
  { value: 'HC', label: 'HC' }
];

const VOLTAGE_LEVEL_OPTIONS = [
  { value: 'V_0_4_KV', label: '0.4kV' },
  { value: 'V_6_KV', label: '6kV' },
  { value: 'V_22_KV', label: '22kV' },
  { value: 'V_110_KV', label: '110kV' }
];

const CONTRACT_STATUS_OPTIONS = [
  { value: 'HIEU_LUC', label: 'Hiệu lực' },
  { value: 'SAP_HET_HAN', label: 'Sắp hết hạn' },
  { value: 'HET_HAN', label: 'Hết hạn' },
  { value: 'TAM_NGUNG', label: 'Tạm ngưng' }
];

const CUSTOMER_TYPE_LABEL_MAP: Record<string, string> = {
  SINH_HOAT: 'Sinh hoạt',
  SAN_XUAT: 'Sản xuất',
  KINH_DOANH: 'Kinh doanh',
  HC: 'HC',
  'Sinh hoạt': 'Sinh hoạt',
  'Sản xuất': 'Sản xuất',
  'Kinh doanh': 'Kinh doanh'
};

const VOLTAGE_LEVEL_LABEL_MAP: Record<string, string> = {
  V_0_4_KV: '0.4kV',
  V_6_KV: '6kV',
  V_22_KV: '22kV',
  V_110_KV: '110kV',
  '0.4kV': '0.4kV',
  '6kV': '6kV',
  '22kV': '22kV',
  '110kV': '110kV'
};

const CONTRACT_STATUS_LABEL_MAP: Record<string, string> = {
  HIEU_LUC: 'Hiệu lực',
  SAP_HET_HAN: 'Sắp hết hạn',
  HET_HAN: 'Hết hạn',
  TAM_NGUNG: 'Tạm ngưng',
  ACTIVE: 'Hiệu lực',
  EXPIRING_SOON: 'Sắp hết hạn',
  EXPIRED: 'Hết hạn',
  SUSPENDED: 'Tạm ngưng',
  'Hiệu lực': 'Hiệu lực',
  'Sắp hết hạn': 'Sắp hết hạn',
  'Hết hạn': 'Hết hạn',
  'Tạm ngưng': 'Tạm ngưng'
};

const CONTRACT_STATUS_TYPE_MAP: Record<string, TYPE_STATUS> = {
  HIEU_LUC: TYPE_STATUS.SUCCESS,
  SAP_HET_HAN: TYPE_STATUS.PENDING,
  HET_HAN: TYPE_STATUS.ERROR,
  TAM_NGUNG: TYPE_STATUS.DISABLED,
  ACTIVE: TYPE_STATUS.SUCCESS,
  EXPIRING_SOON: TYPE_STATUS.PENDING,
  EXPIRED: TYPE_STATUS.ERROR,
  SUSPENDED: TYPE_STATUS.DISABLED
};

const FILTER_LABEL_MAP: Record<keyof ContractFilterForm, string> = {
  contractNumber: 'Số hợp đồng',
  customerId: 'Mã khách hàng',
  customerType: 'Loại khách hàng',
  status: 'Trạng thái'
};

const renderText = (text?: string | number) => text || NULL_VALUE;

const renderTruncatedText = (text?: string, className = 'max-w-[220px]') => (
  <div title={text} className={`${className} truncate`}>
    {text || NULL_VALUE}
  </div>
);

const getStatusLabel = (status?: string) => {
  if (!status) return NULL_VALUE;
  return (
    CONTRACT_STATUS_LABEL_MAP[status] || CONTRACT_STATUS_LABEL_MAP[status.toUpperCase()] || status
  );
};

const getStatusType = (status?: string) => {
  if (!status) return TYPE_STATUS.DEFAULT;
  return (
    CONTRACT_STATUS_TYPE_MAP[status] ||
    CONTRACT_STATUS_TYPE_MAP[status.toUpperCase()] ||
    TYPE_STATUS.DEFAULT
  );
};

const ManageContractScreen = () => {
  const { isMobile, isTablet } = useResponsive();
  const {
    t,
    contractList,
    total,
    listLoading,
    detailLoading,
    exportLoading,
    currentPage,
    pagination,
    defaultFilter,
    filterApplied,
    filterDrawerRef,
    customerOptions,
    customerLabelMap,
    onApplyFilter,
    onResetFilter,
    openForm,
    selectedContract,
    form,
    handleSubmit,
    onOpenCreate,
    onOpenUpdate,
    onCloseForm,
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
    onExport,
    isoDateFormat
  } = useManageContract();

  const {
    control,
    handleSubmit: handleFormSubmit,
    formState: { isValid, isDirty }
  } = form;
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
      (Object.entries(filterApplied) as [keyof ContractFilterForm, string][]).filter(([, value]) =>
        Boolean(value)
      ),
    [filterApplied]
  );

  const formatFilterValue = useCallback((key: keyof ContractFilterForm, value: string) => {
    if (key === 'customerType') return CUSTOMER_TYPE_LABEL_MAP[value] || value;
    if (key === 'status') return getStatusLabel(value);
    return value;
  }, []);

  const getCustomerLabel = useCallback(
    (customerId?: string) => (customerId ? customerLabelMap[customerId] || customerId : NULL_VALUE),
    [customerLabelMap]
  );

  const getExportDisplayValue = useCallback(
    (contract: Contract, key: string) => {
      switch (key) {
        case 'customerId':
          return getCustomerLabel(contract.customerId);
        case 'customerType':
          return (
            CUSTOMER_TYPE_LABEL_MAP[contract.customerType || ''] || contract.customerType || ''
          );
        case 'voltageLevelId':
          return (
            VOLTAGE_LEVEL_LABEL_MAP[contract.voltageLevelId || ''] || contract.voltageLevelId || ''
          );
        case 'signedDate':
        case 'effectiveDate':
        case 'expiryDate':
          return displayDateFromServer(contract[key as keyof Contract] as string);
        case 'status':
          return getStatusLabel(contract.status);
        default:
          return String(contract[key as keyof Contract] || '');
      }
    },
    [getCustomerLabel]
  );

  const columns = useMemo<any[]>(
    () => [
      {
        title: 'Số hợp đồng',
        dataIndex: 'contractNumber',
        key: 'contractNumber',
        width: K_SIZE_160,
        render: (text: string) => renderTruncatedText(text, 'max-w-[180px]')
      },
      {
        title: 'Khách hàng',
        dataIndex: 'customerId',
        key: 'customerId',
        width: K_SIZE_220,
        render: (customerId: string) =>
          renderTruncatedText(getCustomerLabel(customerId), 'max-w-[260px]')
      },
      {
        title: 'Loại khách hàng',
        dataIndex: 'customerType',
        key: 'customerType',
        width: K_SIZE_160,
        render: (text: string) => CUSTOMER_TYPE_LABEL_MAP[text] || text || NULL_VALUE
      },
      {
        title: 'Cấp điện áp',
        dataIndex: 'voltageLevelId',
        key: 'voltageLevelId',
        width: K_SIZE_130,
        render: (text: string) => VOLTAGE_LEVEL_LABEL_MAP[text] || text || NULL_VALUE
      },
      {
        title: 'Công suất (kVA)',
        dataIndex: 'capacityKva',
        key: 'capacityKva',
        width: K_SIZE_130,
        render: renderText
      },
      {
        title: 'Ngày ký',
        dataIndex: 'signedDate',
        key: 'signedDate',
        width: K_SIZE_130,
        render: (date: string) => displayDateFromServer(date)
      },
      {
        title: 'Ngày hiệu lực',
        dataIndex: 'effectiveDate',
        key: 'effectiveDate',
        width: K_SIZE_130,
        render: (date: string) => displayDateFromServer(date)
      },
      {
        title: 'Ngày hết hạn',
        dataIndex: 'expiryDate',
        key: 'expiryDate',
        width: K_SIZE_130,
        render: (date: string) => displayDateFromServer(date)
      },
      {
        title: 'Trạng thái',
        dataIndex: 'status',
        key: 'status',
        width: K_SIZE_130,
        render: (status: string) => (
          <Status
            type={getStatusType(status)}
            kind={KIND_STATUS.PRIMARY}
            content={getStatusLabel(status)}
          />
        )
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
        width: K_SIZE_160,
        render: (_: unknown, record: Contract) => (
          <div className="flex justify-center gap-8">
            <IconHover
              rootClassName="text-color-800"
              title={t('common:edit')}
              icon="ICON_EDIT"
              iconHeight={K_SIZE_18}
              onClick={() => onOpenUpdate(record)}
            />
            <IconHover
              rootClassName="text-color-800"
              title="Gia hạn"
              icon="IC_HISTORY_OUTLINE"
              iconHeight={K_SIZE_18}
              onClick={() => onOpenExtend(record)}
            />
            <IconHover
              rootClassName="text-color-800"
              title="Tạm ngưng / Chấm dứt"
              icon="ICON_WARNING"
              iconHeight={K_SIZE_18}
              onClick={() => onOpenStatus(record)}
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
    [getCustomerLabel, onDelete, onOpenExtend, onOpenStatus, onOpenUpdate, t]
  );

  const breadcrumbList = [
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
              leftIcon="IC_FILTER_OUTLINE"
              customContent={t('common:advanced_filter')}
              onClick={() => filterDrawerRef.current?.open(filterApplied)}
              classNames="mobile:flex-1 mobile:justify-center"
            />
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
              type="ghost"
              leftIcon="IC_ADD_OUTLINE2"
              customContent="Tạo hợp đồng"
              onClick={onOpenCreate}
              classNames="mobile:flex-1 mobile:justify-center"
            />
          </Flex>
        </Flex>
        <Divider className="my-16" />

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
          <div className="overflow-hidden rounded-radius-l border border-color-400 duration-500">
            <AppTable
              loading={listLoading}
              rootClassName="w-full"
              className="[&_.ant-pagination]:hidden"
              scroll={{ x: 'max-content', y: '75vh' }}
              dataSource={contractList}
              columns={columns}
              rowKey="id"
              pagination={pagination}
            />
          </div>
          <AppPagination currentPage={currentPage} total={total} pagination={pagination} />
        </Spin>

        <form id="contract-form" onSubmit={handleFormSubmit(handleSubmit)}>
          <Drawer
            open={openForm}
            title={
              <Flex justify="space-between" align="center">
                <div>{selectedContract ? 'Cập nhật hợp đồng' : 'Tạo hợp đồng'}</div>
                <IconHover title="" icon="IC_CLOSE_OUTLINE" onClick={onCloseForm} />
              </Flex>
            }
            destroyOnClose
            placement="right"
            closable={false}
            onClose={onCloseForm}
            width={isTablet || isMobile ? '80vw' : '44vw'}
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
                  form="contract-form"
                  htmlType="submit"
                  disabled={!isValid || Boolean(selectedContract && !isDirty) || detailLoading}
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
                name="contractNumber"
                label="Số hợp đồng"
                labelSuffix={REQUIRED_MARK}
                labelSuffixClassName="text-error-600"
                placeholder="HD-YYYY-NNN"
                control={control}
                disabled={Boolean(selectedContract)}
              />
              <AppSelectControl
                name="customerId"
                label="Khách hàng"
                labelSuffix={<span className="text-error-600">{REQUIRED_MARK}</span>}
                placeholder="Chọn khách hàng"
                options={customerOptions}
                control={control}
              />
              <AppSelectControl
                name="customerType"
                label="Loại khách hàng"
                labelSuffix={<span className="text-error-600">{REQUIRED_MARK}</span>}
                placeholder="Chọn loại khách hàng"
                options={CUSTOMER_TYPE_OPTIONS}
                control={control}
              />
              <AppSelectControl
                name="voltageLevelId"
                label="Cấp điện áp"
                labelSuffix={<span className="text-error-600">{REQUIRED_MARK}</span>}
                placeholder="Chọn cấp điện áp"
                options={VOLTAGE_LEVEL_OPTIONS}
                control={control}
              />
              <AppTextFieldControl
                name="capacityKva"
                label="Công suất (kVA)"
                labelSuffix={REQUIRED_MARK}
                labelSuffixClassName="text-error-600"
                placeholder="Nhập công suất hợp đồng tối đa"
                control={control}
              />
              <AppDatePickerControl
                name="signedDate"
                label="Ngày ký"
                labelSuffix={REQUIRED_MARK}
                labelSuffixClassName="text-error-600"
                placeholder="Chọn ngày ký"
                backendFormat={isoDateFormat}
                wrapperClassName="w-full"
                datePickerClassName="w-full"
                control={control}
              />
              <AppDatePickerControl
                name="effectiveDate"
                label="Ngày hiệu lực"
                labelSuffix={REQUIRED_MARK}
                labelSuffixClassName="text-error-600"
                placeholder="Chọn ngày hiệu lực"
                backendFormat={isoDateFormat}
                wrapperClassName="w-full"
                datePickerClassName="w-full"
                control={control}
              />
              <AppDatePickerControl
                name="expiryDate"
                label="Ngày hết hạn"
                placeholder="Chọn ngày hết hạn"
                backendFormat={isoDateFormat}
                allowClear
                wrapperClassName="w-full"
                datePickerClassName="w-full"
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

        <ContractFilterDrawer
          ref={filterDrawerRef}
          defaultValues={defaultFilter}
          customerTypeOptions={CUSTOMER_TYPE_OPTIONS}
          statusOptions={CONTRACT_STATUS_OPTIONS}
          onApplyFilter={onApplyFilter}
          onResetFilter={onResetFilter}
        />
      </section>
    </PageWithBreadcrumb>
  );
};

export default ManageContractScreen;
