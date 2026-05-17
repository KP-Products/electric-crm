'use client';

import { useResponsive } from 'utils/responsive';
import { Divider, Drawer, Flex, Spin } from 'antd';
import {
  K_SIZE_0,
  K_SIZE_1,
  K_SIZE_100,
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
import { IconSvgLocal } from 'components/icon-vec-local';
import AppPagination from 'components/table/pagination';
import IconHover from 'components/icon-vec-local/icon-hover';
import { AppTextField, AppTextFieldControl } from 'components/text-field';
import { AppSelectControl } from 'components/select';
import useManageCustomer from './useManageCustomer';
import React, { useEffect } from 'react';
import PageWithBreadcrumb from '../../../layout/AppLayout/PageWithBreadcumb';
import { ROUTES } from '../../../config/routes';
import { STATUS } from '../../../model/user';

const ManageCustomerScreen = () => {
  const { isMobile, isTablet } = useResponsive();
  const {
    t,
    fetchList,
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
    // fetchCustomeType,
    loadingDP,
    onDownload
  } = useManageCustomer();

  const {
    control,
    handleSubmit,
    formState: { isValid, isDirty }
  } = updateForm;

  const isView = !!selectedItem?.id && !openCreate;

  useEffect(() => {
    fetchList();
  }, []);

  // useEffect(() => {
  //   if (!customerTypes) {
  //     fetchCustomeType();
  //   }
  // }, [customerTypes]);
  const breadcrumbList = [
    {
      title: t('menu:system_administration'),
      key: ROUTES.MANAGE_USER
    },
    {
      title: 'Quản lý khách hàng',
      key: ROUTES.MANAGE_CUSTOMER
    }
  ];
  return (
    <PageWithBreadcrumb breadcrumbList={breadcrumbList}>
      <section>
        <Flex
          justify={'space-between'}
          align={'center'}
          gap={K_SIZE_8}
          className={'mobile:flex-col mobile:items-start'}
        >
          <TextBase classNames="title4" text={'Quản lý khách hàng'} />
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
                  title: 'Mã KH',
                  dataIndex: 'customerCode',
                  key: 'customerCode',
                  width: K_SIZE_100,
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
                  title: 'Tên khách hàng',
                  key: 'fullName',
                  dataIndex: 'fullName',
                  render: (text) => <>{text || NULL_VALUE}</>,
                  width: K_SIZE_200
                },
                {
                  title: 'Hợp đồng',
                  dataIndex: 'contactName',
                  key: 'contactName',
                  render: (text) => <>{text || NULL_VALUE}</>,
                  width: K_SIZE_160
                },
                {
                  title: 'Mã số thuế',
                  dataIndex: 'taxNo',
                  key: 'taxNo',
                  render: (text) => <>{text || NULL_VALUE}</>,
                  width: K_SIZE_160
                },
                {
                  title: 'Địa chỉ',
                  dataIndex: 'address',
                  key: 'address',
                  render: (text) => <>{text || NULL_VALUE}</>,
                  width: K_SIZE_160
                },
                {
                  title: 'Số điện thoại',
                  dataIndex: 'phone',
                  key: 'phone',
                  render: (text) => <>{text || NULL_VALUE}</>,
                  width: K_SIZE_160
                },
                {
                  title: 'Email',
                  dataIndex: 'email',
                  key: 'email',
                  render: (text) => <>{text || NULL_VALUE}</>,
                  width: K_SIZE_160
                },

                // {
                //   title: t('common:status'),
                //   dataIndex: 'status',
                //   key: 'status',
                //   width: K_SIZE_108,
                //   render: (_, record) => {
                //     const active = record?.status?.toUpperCase() === STATUS_FEE_COND.ACTIVE;
                //     return (
                //       <Status
                //         type={active ? TYPE_STATUS.SUCCESS : TYPE_STATUS.ERROR}
                //         kind={KIND_STATUS.SECONDARY}
                //         content={t(active ? 'common:status_active' : 'common:status_inactive')}
                //       />
                //     );
                //   }
                // },
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
                    record?.status?.toUpperCase() === STATUS.ACTIVE ? (
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
                  )} khách hàng`}
                </div>
                {selectedItem?.status?.toUpperCase() === STATUS.ACTIVE ? null : (
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
                  name={'customerCode'}
                  control={control}
                  label={'Mã khách hàng *'}
                  placeholder={'Nhập mã khách hàng'}
                  wrapperClassName={'flex-1'}
                  isView={!openCreate}
                />
                <AppTextFieldControl
                  name={'name'}
                  control={control}
                  label={'Tên khách hàng *'}
                  placeholder={'Nhập tên khách hàng'}
                  wrapperClassName={'flex-1'}
                  isView={!openCreate}
                />
                <AppTextFieldControl
                  name={'taxNo'}
                  label={'Mã số thuế *'}
                  placeholder={'Nhập mã số thuế'}
                  isView={!openCreate}
                  control={control}
                />
                <AppTextFieldControl
                  name={'phone'}
                  label={'Số điện thoại *'}
                  placeholder={'Nhập số điện thoại'}
                  isView={!openCreate}
                  control={control}
                />
                <AppTextFieldControl
                  name={'email'}
                  label={'Email *'}
                  placeholder={'Nhập email'}
                  isView={!openCreate}
                  control={control}
                />
                <AppTextFieldControl
                  name={'address'}
                  label={'Địa chỉ *'}
                  placeholder={'Nhập địa chỉ'}
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
    </PageWithBreadcrumb>
  );
};

export default ManageCustomerScreen;
