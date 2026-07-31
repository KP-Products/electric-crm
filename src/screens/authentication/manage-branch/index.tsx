'use client';

import {
  K_SIZE_108,
  K_SIZE_130,
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
import { AppSelectControl, AppSelectOption } from 'components/select';
import Status, { KIND_STATUS, TYPE_STATUS } from 'components/status';
import AppTable from 'components/table';
import AppPagination from 'components/table/pagination';
import { TextBase } from 'components/text';
import { AppTextFieldControl } from 'components/text-field';
import { ROUTES } from 'config/routes';
import PageWithBreadcrumb from 'layout/AppLayout/PageWithBreadcumb';
import { BRANCH_STATUS, Branch } from 'model/branch';
import { useMemo } from 'react';
import { useResponsive } from 'utils/responsive';
import useManageBranch from './useManageBranch';

const BRANCH_STATUS_OPTIONS: AppSelectOption[] = [
  { value: BRANCH_STATUS.ACTIVE, label: 'Hoạt động' },
  { value: BRANCH_STATUS.TRIAL, label: 'Thử nghiệm' },
  { value: BRANCH_STATUS.STOPPED, label: 'Ngừng' }
];

const BRANCH_STATUS_LABEL_MAP: Record<string, string> = {
  [BRANCH_STATUS.ACTIVE]: 'Hoạt động',
  [BRANCH_STATUS.TRIAL]: 'Thử nghiệm',
  [BRANCH_STATUS.STOPPED]: 'Ngừng'
};

const BRANCH_STATUS_TYPE_MAP: Record<string, TYPE_STATUS> = {
  [BRANCH_STATUS.ACTIVE]: TYPE_STATUS.SUCCESS,
  [BRANCH_STATUS.TRIAL]: TYPE_STATUS.PENDING,
  [BRANCH_STATUS.STOPPED]: TYPE_STATUS.ERROR
};

const renderText = (text?: string | number | null) =>
  text === undefined || text === null || text === '' ? NULL_VALUE : text;

const renderTruncatedText = (text?: string | null, className = 'max-w-[220px]') => (
  <div title={text || ''} className={`${className} truncate`}>
    {renderText(text)}
  </div>
);

const ManageBranchScreen = () => {
  const { isMobile, isTablet } = useResponsive();
  const {
    t,
    branchList,
    listLoading,
    detailLoading,
    usersLoading,
    pagination,
    selectedBranch,
    isDrawerOpen,
    form,
    managerOptions,
    onOpenCreate,
    onOpenUpdate,
    onCancel,
    handleSubmit
  } = useManageBranch();

  const {
    control,
    handleSubmit: handleFormSubmit,
    formState: { isValid, isDirty }
  } = form;

  const columns = useMemo<any[]>(
    () => [
      {
        title: 'Mã',
        dataIndex: 'code',
        key: 'code',
        width: K_SIZE_130,
        render: (text: string) => (
          <TextBase classNames="sub-title4" text={String(renderText(text))} />
        )
      },
      {
        title: 'Tên chi nhánh',
        dataIndex: 'name',
        key: 'name',
        width: K_SIZE_220,
        render: (text: string) => renderTruncatedText(text, 'max-w-[240px]')
      },
      {
        title: 'Địa chỉ',
        dataIndex: 'address',
        key: 'address',
        width: K_SIZE_220,
        render: (text: string) => renderTruncatedText(text, 'max-w-[260px]')
      },
      {
        title: 'Trưởng chi nhánh',
        dataIndex: 'managerName',
        key: 'managerName',
        width: K_SIZE_200,
        render: (text: string) => renderTruncatedText(text)
      },
      {
        title: 'Nhân sự',
        dataIndex: 'employeeCount',
        key: 'employeeCount',
        width: K_SIZE_130,
        align: 'right',
        render: (value: number) => renderText(value)
      },
      {
        title: 'TT',
        dataIndex: 'status',
        key: 'status',
        width: K_SIZE_130,
        render: (status: string) => (
          <Status
            type={BRANCH_STATUS_TYPE_MAP[status] || TYPE_STATUS.DEFAULT}
            kind={KIND_STATUS.SECONDARY}
            content={BRANCH_STATUS_LABEL_MAP[status] || status || NULL_VALUE}
          />
        )
      },
      {
        title: t('common:action'),
        fixed: 'right',
        align: 'center',
        width: K_SIZE_108,
        render: (_: unknown, record: Branch) => (
          <div className="flex justify-center gap-8">
            <IconHover
              rootClassName="text-color-800"
              title={t('common:edit')}
              icon="ICON_EDIT"
              iconHeight={K_SIZE_18}
              onClick={() => onOpenUpdate(record)}
            />
          </div>
        )
      }
    ],
    [onOpenUpdate, t]
  );

  const breadcrumbList = [
    {
      title: t('menu:system_administration')
    },
    {
      title: 'Quản lý chi nhánh',
      key: ROUTES.MANAGE_BRANCH
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
            <TextBase classNames="title4" text="Quản lý chi nhánh" />
            <TextBase classNames="body3 mt-4 text-color-700" text="Cấu hình đơn vị trực thuộc" />
          </div>
          <ButtonBase
            type="primary"
            leftIcon="IC_ADD_OUTLINE2"
            customContent="Thêm chi nhánh"
            onClick={onOpenCreate}
            classNames="mobile:w-full mobile:justify-center"
          />
        </Flex>
        <Divider className="my-16" />

        <div className="overflow-hidden rounded-radius-l border border-color-400 pb-4 duration-500">
          <AppTable
            loading={listLoading}
            rootClassName="w-full"
            className="[&_.ant-pagination]:hidden"
            scroll={{ x: 'max-content', y: '70vh' }}
            dataSource={branchList}
            columns={columns}
            rowKey={(record: any, index?: number) => record.id || record.code || String(index)}
            pagination={pagination}
          />
        </div>
        <AppPagination
          currentPage={pagination.current}
          total={pagination.total}
          pagination={pagination}
        />

        <Drawer
          open={isDrawerOpen}
          title={
            <Flex justify="space-between" align="center">
              <div>{selectedBranch ? 'Sửa thông tin chi nhánh' : 'Thêm chi nhánh'}</div>
              <IconHover
                title={t('common:close')}
                icon="IC_CLOSE_OUTLINE"
                onClick={onCancel}
                rootClassName="text-color-700"
              />
            </Flex>
          }
          destroyOnClose
          placement="right"
          closable={false}
          maskClosable={!detailLoading}
          onClose={onCancel}
          width={isTablet || isMobile ? '90vw' : 480}
          footer={
            <Flex justify="end" gap={K_SIZE_8}>
              <ButtonBase
                classNames="app-common-btn"
                type="ghost"
                customContent={t('common:cancel')}
                onClick={onCancel}
                disabled={detailLoading}
              />
              <ButtonBase
                classNames="app-common-btn"
                type="primary"
                form="branch-form"
                htmlType="submit"
                disabled={
                  !isValid || Boolean(selectedBranch && !isDirty) || detailLoading || usersLoading
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
          <form id="branch-form" onSubmit={handleFormSubmit(handleSubmit)}>
            <div className="grid gap-12">
              {selectedBranch && (
                <AppTextFieldControl
                  name="code"
                  label="Mã chi nhánh"
                  placeholder="Mã chi nhánh"
                  control={control}
                  disabled
                />
              )}
              <AppTextFieldControl
                name="name"
                label="Tên chi nhánh"
                labelSuffix={REQUIRED_MARK}
                labelSuffixClassName="text-error-600"
                placeholder="Nhập tên chi nhánh"
                control={control}
              />
              <AppTextFieldControl
                name="address"
                label="Địa chỉ"
                labelSuffix={REQUIRED_MARK}
                labelSuffixClassName="text-error-600"
                placeholder="Nhập địa chỉ đầy đủ"
                control={control}
              />
              <AppSelectControl
                name="managerId"
                label="Trưởng chi nhánh"
                placeholder="Chọn người dùng"
                options={managerOptions}
                control={control}
                isLoading={usersLoading}
              />
              <AppSelectControl
                name="status"
                label="Trạng thái"
                labelSuffix={<span className="text-error-600">{REQUIRED_MARK}</span>}
                placeholder="Chọn trạng thái"
                options={BRANCH_STATUS_OPTIONS}
                control={control}
              />
            </div>
          </form>
        </Drawer>
      </section>
    </PageWithBreadcrumb>
  );
};

export default ManageBranchScreen;
