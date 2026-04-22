'use client';

import { useResponsive } from 'utils/responsive';
import { Divider, Drawer, Flex, Spin } from 'antd';
import {
  K_SIZE_0,
  K_SIZE_1,
  K_SIZE_108,
  K_SIZE_16,
  K_SIZE_160,
  K_SIZE_18,
  K_SIZE_20,
  K_SIZE_200,
  K_SIZE_8,
  NULL_VALUE
} from '@constant';
import { TextBase } from 'components/text';
import ButtonBase from 'components/button';
import AppTable from 'components/table';
import { STATUS_FEE_COND } from 'model/fee-condition';
import Status, { KIND_STATUS, TYPE_STATUS } from 'components/status';
import { IconSvgLocal } from 'components/icon-vec-local';
import AppPagination from 'components/table/pagination';
import IconHover from 'components/icon-vec-local/icon-hover';
import { AppTextField, AppTextFieldControl } from 'components/text-field';
import { AppSelectControl } from 'components/select';
import useManageCustomerGroup from 'screens/authentication/manage-customer-group/useManageCustomerGroup';
import React, { useEffect } from 'react';

const ManageCustomerGroupScreen = () => {
  const { isMobile, isTablet } = useResponsive();
  const {
    t,
    fecthList,
    setMoreAction,
    selectedItem,
    setSelectedItem,
    openCreate,
    setOpenCreate,
    currentPage,
    pagination,
    optionStatus,
    onCloseCreate,
    listLoading,
    handleUpdateSubmit,
    updateForm,
    loadingEdit,
    debounceSearch,
    total,
    search,
    setSearch,
    custList,
    customerTypes,
    fetchCustomeType,
    loadingDP,
    onDownload
  } = useManageCustomerGroup();

  const {
    control,
    handleSubmit,
    formState: { isValid, isDirty }
  } = updateForm;

  const isView = !!selectedItem?.id && !openCreate;

  useEffect(() => {
    fecthList();
  }, []);

  useEffect(() => {
    if (!customerTypes) {
      fetchCustomeType();
    }
  }, [customerTypes]);
  return (
    <section>
      <Flex
        justify={'space-between'}
        align={'center'}
        gap={K_SIZE_8}
        className={'mobile:flex-col mobile:items-start'}
      >
        <TextBase classNames="title4" t18n={'manage_customer_group:title_page'} />
        <Flex
          flex={K_SIZE_1}
          justify={'end'}
          gap={K_SIZE_16}
          className={'mobile:mt-8 mobile:w-full mobile:flex-col'}
        >
          <div className={'w-[250px] mobile:w-full'}>
            <AppTextField
              allowClear
              placeholder={t('common:search_placeholder')}
              rootClassName={'h-44'}
              prefix={
                <IconSvgLocal
                  name={'IC_SEARCH_OUTLINE2'}
                  width={K_SIZE_20}
                  height={K_SIZE_20}
                  classNames={'text-color-500'}
                />
              }
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                debounceSearch(e.target.value);
              }}
            />
          </div>
          <div className={'flex justify-between gap-8 mobile:w-full'}>
            <ButtonBase
              type={'ghost'}
              leftIcon={'IC_ADD_OUTLINE2'}
              t18n={'common:add_new'}
              onClick={() => {
                setOpenCreate(true);
              }}
              classNames={'mobile:flex-1 mobile:justify-center'}
            />
            <ButtonBase
              type={'primary'}
              leftIcon={'IC_DOWNLOAD_OUTLINE'}
              t18n={'common:download'}
              onClick={onDownload}
              disabled={loadingDP}
              classNames={'mobile:flex-1 mobile:justify-center'}
            />
          </div>
        </Flex>
      </Flex>
      <Divider className={'my-16'} />
      <Spin spinning={listLoading && custList?.length > K_SIZE_0}>
        <div className={'overflow-hidden rounded-radius-l border border-color-400 duration-500'}>
          <AppTable
            loading={listLoading}
            rootClassName={'w-full'}
            className={'[&_.ant-pagination]:hidden'}
            scroll={{ x: 'max-content', y: '75vh' }}
            dataSource={custList}
            columns={[
              {
                title: t('manage_customer_group:name_group'),
                dataIndex: 'name',
                key: 'name',
                width: K_SIZE_200,
                render: (text, record) => (
                  <TextBase
                    text={text}
                    classNames={
                      'sub-title4 !text-secondary-500 cursor-pointer hover:!text-secondary-700'
                    }
                    onClick={() => {
                      setSelectedItem(record as any);
                    }}
                  />
                )
              },
              {
                title: t('common:value'),
                key: 'value',
                dataIndex: 'value',
                render: (text) => <>{text || NULL_VALUE}</>,
                width: K_SIZE_200
              },
              {
                title: t('manage_customer_group:cust_type'),
                dataIndex: 'customerType',
                key: 'customerType',
                render: (text) => <>{text || NULL_VALUE}</>,
                width: K_SIZE_160
              },
              {
                title: t('common:status'),
                dataIndex: 'status',
                key: 'status',
                width: K_SIZE_108,
                render: (_, record) => {
                  const active = record?.status?.toUpperCase() === STATUS_FEE_COND.ACTIVE;
                  return (
                    <Status
                      type={active ? TYPE_STATUS.SUCCESS : TYPE_STATUS.ERROR}
                      kind={KIND_STATUS.SECONDARY}
                      content={t(active ? 'common:status_active' : 'common:status_inactive')}
                    />
                  );
                }
              },
              // {
              //   title: t('common:created_at'),
              //   dataIndex: 'createdAt',
              //   key: 'createdAt',
              //   width: K_SIZE_160,
              //   render: (text) => <span>{displayDateTimeFromServer(text)}</span>
              // },
              // {
              //   title: t('common:created_by'),
              //   dataIndex: 'createdBy',
              //   key: 'createdBy',
              //   width: K_SIZE_160
              // },
              // {
              //   title: t('common:updated_at'),
              //   dataIndex: 'updateAt',
              //   key: 'updateAt',
              //   width: K_SIZE_160,
              //   render: (text) => <span>{displayDateTimeFromServer(text)}</span>
              // },
              // {
              //   title: t('common:updated_by'),
              //   dataIndex: 'updateBy',
              //   key: 'updateBy',
              //   width: K_SIZE_160
              // },
              {
                title: t('common:action'),
                fixed: 'right',
                align: 'center',
                width: K_SIZE_108,
                render: (_, record: any) =>
                  record?.status?.toUpperCase() === STATUS_FEE_COND.ACTIVE ? (
                    NULL_VALUE
                  ) : (
                    <Flex justify={'center'}>
                      <IconHover
                        rootClassName={'text-color-800'}
                        title={t('common:edit')}
                        icon={'ICON_EDIT'}
                        iconHeight={K_SIZE_18}
                        onClick={() => {
                          setSelectedItem(record);
                          setOpenCreate(true);
                        }}
                      />
                    </Flex>
                  )
              }
            ]}
            onScroll={() => {
              setMoreAction(undefined);
            }}
            rowKey={'id'}
            pagination={pagination}
          />
        </div>
        <AppPagination currentPage={currentPage} total={total} pagination={pagination} />
      </Spin>

      <form id={'update-form'} onSubmit={handleSubmit(handleUpdateSubmit)}>
        <Drawer
          open={openCreate || !!selectedItem?.id}
          title={
            <Flex justify={'space-between'}>
              <div className={''}>
                {`${t(
                  !!selectedItem?.id
                    ? openCreate
                      ? 'common:edit'
                      : 'common:view_detail'
                    : 'common:add_new'
                )} ${t('fee:cust_group').toLowerCase()}`}
              </div>
              {selectedItem?.status?.toUpperCase() === STATUS_FEE_COND.ACTIVE ? null : (
                <IconHover
                  title={isView ? t('common:edit') : ''}
                  icon={isView ? 'ICON_EDIT' : 'IC_CLOSE_OUTLINE'}
                  onClick={() => {
                    if (isView) {
                      setOpenCreate(true);
                      return;
                    }
                    onCloseCreate();
                  }}
                />
              )}
            </Flex>
          }
          destroyOnClose
          placement={'right'}
          closable={false}
          maskClosable={isView}
          onClose={onCloseCreate}
          width={isTablet || isMobile ? '80vw' : '40vw'}
          footer={
            <Flex justify={'end'}>
              <ButtonBase
                classNames={'app-common-btn'}
                type={isView ? 'ghost' : 'primary'}
                customContent={t(isView ? 'common:close' : 'common:confirm')}
                form={'update-form'}
                htmlType={isView ? 'button' : 'submit'}
                onClick={() => {
                  if (isView) onCloseCreate();
                }}
                disabled={isView ? false : !isValid || !isDirty || loadingEdit}
              />
            </Flex>
          }
        >
          <div>
            <div
              className={`grid gap-8 ${!!selectedItem && !openCreate ? 'grid-cols-2 gap-y-12' : ''}`}
            >
              {isView && (
                <AppTextField
                  label={'ID'}
                  wrapperClassName={'flex-1'}
                  isView={true}
                  value={selectedItem?.id}
                />
              )}
              <AppTextFieldControl
                name={'name'}
                control={control}
                label={t('manage_customer_group:name_group') + ' *'}
                placeholder={t('common:input_pla', {
                  label: t('manage_customer_group:name_group').toLowerCase()
                })}
                wrapperClassName={'flex-1'}
                isView={!openCreate}
              />
              <AppTextFieldControl
                name={'valueData'}
                label={t('common:value') + ' *'}
                placeholder={t('common:input_pla', {
                  label: t('common:value').toLowerCase()
                })}
                isView={!openCreate}
                control={control}
              />
              <AppSelectControl
                name={'customerType'}
                label={t('manage_customer_group:cust_type') + ' *'}
                placeholder={t('common:select_pla', {
                  label: t('manage_customer_group:cust_type').toLowerCase()
                })}
                wrapperClassName={'flex-1'}
                options={
                  customerTypes?.map((cus) => ({
                    value: cus.code || '',
                    label: `${cus.name} - ${cus.description}`
                  })) || []
                }
                isView={!openCreate}
                control={control}
              />
              {isView && (
                <>
                  <AppSelectControl
                    name={'status'}
                    label={t('common:status')}
                    placeholder={t('common:select_pla', {
                      label: t('common:status').toLowerCase()
                    })}
                    options={optionStatus}
                    isView={true}
                    control={control}
                  />
                </>
              )}
              <AppTextFieldControl
                label={t('common:note')}
                placeholder={t('common:input_pla', { label: t('common:note').toLowerCase() })}
                wrapperClassName={'flex-1'}
                isView={!openCreate}
                control={control}
                name={'note'}
              />
            </div>
          </div>
        </Drawer>
      </form>
    </section>
  );
};

export default ManageCustomerGroupScreen;
