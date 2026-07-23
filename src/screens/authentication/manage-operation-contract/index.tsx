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
  K_SIZE_8
} from '@constant';
import { Divider, Flex, Spin } from 'antd';
import ButtonBase from 'components/button';
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
import { OperationContract } from 'model/operation-contract';
import { useCallback, useMemo } from 'react';
import { displayDateTimeFromServer } from 'utils/date';
import {
  displayText,
  getOperationContractId,
  getOperationContractStatusMeta,
  OperationContractFilter,
  OPERATION_CONTRACT_STATUS_OPTIONS,
  renderOperationContractDate
} from './utils';
import useManageOperationContracts from './useManageOperationContracts';

const FILTER_LABEL_MAP: Record<keyof OperationContractFilter, string> = {
  contractNumber: 'Số hợp đồng',
  contractName: 'Tên hợp đồng',
  operationUnitId: 'Đơn vị vận hành',
  contractType: 'Loại hợp đồng',
  status: 'Trạng thái'
};

const renderTruncatedText = (text?: string | null, className = 'max-w-[220px]') => (
  <div title={text || ''} className={`${className} truncate`}>
    {displayText(text)}
  </div>
);

const ManageOperationContractScreen = () => {
  const {
    t,
    operationContractList,
    total,
    listLoading,
    currentPage,
    pagination,
    filter,
    filterApplied,
    operationUnitOptions,
    getOperationUnitDisplay,
    onOpenOperationUnitDropdown,
    operationUnitDropdownRender,
    onChangeFilter,
    onApplyFilter,
    onResetFilter,
    onOpenCreate,
    onOpenUpdate,
    onOpenDetail,
    onDelete
  } = useManageOperationContracts();

  const activeFilters = useMemo(
    () =>
      (Object.entries(filterApplied) as [keyof OperationContractFilter, string][]).filter(
        ([, value]) => Boolean(value)
      ),
    [filterApplied]
  );

  const formatFilterValue = useCallback(
    (key: keyof OperationContractFilter, value: string) => {
      if (key === 'operationUnitId') return getOperationUnitDisplay(value);
      if (key === 'status') return getOperationContractStatusMeta(value).label;
      return value;
    },
    [getOperationUnitDisplay]
  );

  const columns = useMemo<any[]>(
    () => [
      {
        title: 'STT',
        key: 'index',
        width: K_SIZE_100,
        align: 'center',
        render: (_: unknown, __: OperationContract, index: number) =>
          (currentPage - K_SIZE_1) * DEFAULT_PAGE_SIZE + index + K_SIZE_1
      },
      {
        title: 'Số hợp đồng',
        dataIndex: 'contractNumber',
        key: 'contractNumber',
        width: K_SIZE_180,
        render: (text: string, record: OperationContract) => (
          <TextBase
            classNames="sub-title4 cursor-pointer !text-secondary-500 hover:!text-secondary-700"
            text={displayText(text)}
            onClick={() => onOpenDetail(record)}
          />
        )
      },
      {
        title: 'Tên hợp đồng',
        dataIndex: 'contractName',
        key: 'contractName',
        width: K_SIZE_240,
        render: (text: string) => renderTruncatedText(text, 'max-w-[280px]')
      },
      {
        title: 'Đơn vị vận hành',
        dataIndex: 'operationUnitId',
        key: 'operationUnitId',
        width: K_SIZE_240,
        render: (operationUnitId: string) =>
          renderTruncatedText(getOperationUnitDisplay(operationUnitId), 'max-w-[280px]')
      },
      {
        title: 'Loại hợp đồng',
        dataIndex: 'contractType',
        key: 'contractType',
        width: K_SIZE_150,
        render: (text: string) => renderTruncatedText(text, 'max-w-[180px]')
      },
      {
        title: 'Ngày ký',
        dataIndex: 'signedDate',
        key: 'signedDate',
        width: K_SIZE_130,
        render: (date: string) => renderOperationContractDate(date)
      },
      {
        title: 'Ngày hiệu lực',
        dataIndex: 'effectiveDate',
        key: 'effectiveDate',
        width: K_SIZE_130,
        render: (date: string) => renderOperationContractDate(date)
      },
      {
        title: 'Ngày hết hạn',
        dataIndex: 'expiryDate',
        key: 'expiryDate',
        width: K_SIZE_130,
        render: (date: string) => renderOperationContractDate(date)
      },
      {
        title: 'Trạng thái',
        dataIndex: 'status',
        key: 'status',
        width: K_SIZE_150,
        render: (status: string) => {
          const meta = getOperationContractStatusMeta(status);
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
        title: 'Ngày tạo',
        dataIndex: 'createdAt',
        key: 'createdAt',
        width: K_SIZE_200,
        render: (date: string) => displayDateTimeFromServer(date)
      },
      {
        title: t('common:action'),
        fixed: 'right',
        align: 'center',
        width: K_SIZE_120,
        render: (_: unknown, record: OperationContract) => (
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
    [currentPage, getOperationUnitDisplay, onDelete, onOpenDetail, onOpenUpdate, t]
  );

  const breadcrumbList = [
    {
      title: 'Hợp đồng'
    },
    {
      title: 'Quản lý hợp đồng vận hành',
      key: ROUTES.MANAGE_OPERATION_CONTRACT
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
          <TextBase classNames="title4" text="Quản lý hợp đồng vận hành" />
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

        <div className="mb-12 grid grid-cols-[minmax(150px,0.9fr)_minmax(180px,1fr)_minmax(220px,1.1fr)_minmax(150px,0.8fr)_minmax(150px,0.8fr)_auto] items-end gap-12 rounded-radius-l border border-color-300 bg-color-50 p-12 tablet:grid-cols-2 mobile:grid-cols-1">
          <AppTextField
            name="contractNumber"
            label="Số hợp đồng"
            placeholder="Nhập số hợp đồng"
            value={filter.contractNumber}
            onChange={(event) => onChangeFilter('contractNumber', event.target.value)}
            onPressEnter={onApplyFilter}
          />
          <AppTextField
            name="contractName"
            label="Tên hợp đồng"
            placeholder="Nhập tên hợp đồng"
            value={filter.contractName}
            onChange={(event) => onChangeFilter('contractName', event.target.value)}
            onPressEnter={onApplyFilter}
          />
          <AppSelect
            name="operationUnitId"
            label="Đơn vị vận hành"
            placeholder="Tất cả"
            value={filter.operationUnitId}
            options={operationUnitOptions}
            dropdownRender={operationUnitDropdownRender}
            onOpenChange={onOpenOperationUnitDropdown}
            onSelectOption={({ key }) => onChangeFilter('operationUnitId', String(key))}
          />
          <AppTextField
            name="contractType"
            label="Loại hợp đồng"
            placeholder="Nhập loại hợp đồng"
            value={filter.contractType}
            onChange={(event) => onChangeFilter('contractType', event.target.value)}
            onPressEnter={onApplyFilter}
          />
          <AppSelect
            name="status"
            label="Trạng thái"
            placeholder="Tất cả"
            value={filter.status}
            options={OPERATION_CONTRACT_STATUS_OPTIONS as AppSelectOption[]}
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
                content={`${FILTER_LABEL_MAP[key]}: ${formatFilterValue(key, value)}`}
                onClose={() => onResetFilter(key)}
              />
            ))}
          </div>
        )}

        <Spin spinning={listLoading && operationContractList.length > K_SIZE_0}>
          <div className="overflow-hidden rounded-radius-l border border-color-400 duration-500">
            <AppTable
              loading={listLoading}
              rootClassName="w-full"
              className="[&_.ant-pagination]:hidden"
              scroll={{ x: 'max-content', y: '75vh' }}
              dataSource={operationContractList}
              columns={columns}
              rowKey={(record: any, index?: number) =>
                String(getOperationContractId(record) || record.contractNumber || index)
              }
              pagination={pagination}
            />
          </div>
          <AppPagination currentPage={currentPage} total={total} pagination={pagination} />
        </Spin>
      </section>
    </PageWithBreadcrumb>
  );
};

export default ManageOperationContractScreen;
