'use client';

import { K_SIZE_1, K_SIZE_108, K_SIZE_16, K_SIZE_20, K_SIZE_24, K_SIZE_8 } from '@constant';
import { Divider, Drawer, Dropdown, Flex, Spin } from 'antd';
import ButtonBase from 'components/button';
import { TextBase } from 'components/text';
import React, { useState } from 'react';
import { useResponsive } from 'utils/responsive';
import AppTable from 'components/table';
import { FORMAT_DATE_PARAMS } from 'utils/date';
import useMyPendingHook from 'screens/authentication/my-pending/useMyPendingHook';
import AppPagination from 'components/table/pagination';
import { IconSvgLocal } from 'components/icon-vec-local';
import { AppSelect } from 'components/select';
import { AppTextField } from 'components/text-field';
import dayjs from 'dayjs';
import { AppDatePicker } from 'components/date-picker';
import { FEE_CODE_STATUS } from 'model/fee-code';
import { DebugUtils } from 'utils/debug-utils';
import { AppSelectWithMulti } from 'components/select/AppSelectWithMulti';
import { ItemType } from 'antd/es/menu/interface';

const MyPending = () => {
  const { isMobile, isTablet } = useResponsive();
  const {
    t,
    filter,
    setFilter,
    setFieldFilter,
    filterApplied,
    setFilterApplied,
    total,
    dataFilter,
    openFilter,
    setOpenFilter,
    pagination,
    defaultFilterCode,
    optionFeature,
    optionAction,
    renderInfoTask,
    getDetailTask,
    ACTION_KEYS,
    columns,
    statusOptions,
    renderFilterTags,
    checkActionEdit,
    showDialogConfirm
  } = useMyPendingHook();
  const [moreAction, setMoreAction] = useState<string>();

  return (
    <section>
      <Flex
        justify={'space-between'}
        align={'center'}
        gap={K_SIZE_8}
        className={'mobile:flex-col mobile:items-start'}
      >
        <TextBase classNames="title4" t18n={'approve:my_pending_tasks'} />
        <Flex flex={1} justify={'end'} gap={K_SIZE_16} className={'mobile:w-full mobile:flex-col'}>
          <ButtonBase
            type={'ghost'}
            t18n={'common:advanced_filter'}
            leftIcon={'IC_FILTER_OUTLINE'}
            onClick={() => {
              setOpenFilter(true);
            }}
          />
        </Flex>
      </Flex>
      <Divider className={'my-16'} />

      {renderFilterTags()}
      <Spin spinning={false}>
        <div className={'overflow-hidden rounded-radius-l border border-color-400'}>
          <AppTable
            rootClassName={'w-full'}
            className={'[&_.ant-pagination]:hidden'}
            scroll={{ x: 'max-content', y: '75vh' }}
            dataSource={dataFilter}
            columns={[
              ...columns,
              {
                title: t('common:action'),
                fixed: 'right',
                align: 'center',
                width: K_SIZE_108,
                render: (_, record) =>
                  [FEE_CODE_STATUS.REJECTED, FEE_CODE_STATUS.AWAIT_APPROVE].includes(
                    record.status || ''
                  ) ? (
                    <Dropdown
                      trigger={['click']}
                      open={moreAction === record.requestId}
                      onOpenChange={(visible) => {
                        setMoreAction(visible ? record.requestId : null);
                      }}
                      menu={{
                        items: [
                          ...([
                            record.status === FEE_CODE_STATUS.REJECTED &&
                              checkActionEdit(record.operationType) && {
                                key: ACTION_KEYS.EDIT,
                                label: t('common:edit')
                              },
                            { key: ACTION_KEYS.DELETE, label: t('common:delete'), danger: true }
                          ].filter(Boolean) as ItemType[])
                        ],
                        onClick: (item) => {
                          DebugUtils.logS(['selected', record]);
                          if (item.key === ACTION_KEYS.EDIT) {
                            getDetailTask(record, true);
                          }
                          if (item.key === ACTION_KEYS.DELETE) {
                            showDialogConfirm(ACTION_KEYS.DELETE, record);
                          }
                        }
                      }}
                      placement={'bottomRight'}
                      arrow={{ pointAtCenter: true }}
                    >
                      <div className={'flex justify-center'}>
                        <IconSvgLocal
                          height={K_SIZE_20}
                          name={'ICON_MORE'}
                          classNames={'cursor-pointer'}
                          onClick={() => {
                            setMoreAction(record.code);
                          }}
                        />
                      </div>
                    </Dropdown>
                  ) : null
              }
            ]}
            onScroll={() => {
              setMoreAction(undefined);
            }}
            rowKey={'requestId'}
          />
        </div>
        <AppPagination
          currentPage={filterApplied.page || K_SIZE_1}
          total={total}
          pagination={pagination}
        />
      </Spin>

      <Drawer
        open={openFilter}
        title={
          <Flex justify={'space-between'}>
            <div>
              {t('common:advanced_filter') + ' ' + t('approve:my_pending_tasks').toLowerCase()}
            </div>
            <IconSvgLocal
              name={'IC_CLOSE_OUTLINE'}
              classNames={'text-color-700 cursor-pointer hover:text-color-800'}
              height={K_SIZE_24}
              onClick={() => {
                setOpenFilter(false);
              }}
            />
          </Flex>
        }
        destroyOnClose
        placement={'right'}
        closable={false}
        onClose={() => {
          setOpenFilter(false);
        }}
        width={isTablet ? '80vw' : isMobile ? '100vw' : '40vw'}
        footer={
          <Flex justify={'end'}>
            <Flex justify={'end'} gap={K_SIZE_8}>
              <ButtonBase
                type={'secondary'}
                classNames={'app-common-btn'}
                t18n={'common:clear_filter'}
                onClick={() => {
                  setFilter(defaultFilterCode);
                  setFilterApplied(defaultFilterCode);
                  setOpenFilter(false);
                }}
              />
              <ButtonBase
                type={'primary'}
                t18n={'common:apply'}
                classNames={'app-common-btn'}
                onClick={() => {
                  setFilterApplied({
                    ...filter,
                    page: K_SIZE_1
                  });
                  setOpenFilter(false);
                }}
              />
            </Flex>
          </Flex>
        }
      >
        <Flex vertical gap={K_SIZE_8}>
          <AppSelect
            name={'actionId'}
            label={t('approve:feature')}
            options={optionFeature || []}
            placeholder={t('common:select_pla', { label: t('approve:feature').toLowerCase() })}
            value={filter.actionId}
            onSelectOption={(e) => {
              setFieldFilter('actionId', e.key);
            }}
          />
          <AppSelect
            name={'operationType'}
            label={t('common:status_active')}
            options={optionAction}
            placeholder={t('common:select_pla', { label: t('common:status_active').toLowerCase() })}
            value={filter.operationType}
            onSelectOption={(e) => {
              setFieldFilter('operationType', e.key);
            }}
          />
          <AppTextField
            label={t('approve:feature_id')}
            placeholder={t('common:input_pla', { label: t('approve:feature_id').toLowerCase() })}
            wrapperClassName={'flex-1'}
            value={filter.requestId}
            defaultValue={filter.requestId}
            onChange={(e) => {
              setFieldFilter('requestId', e.target.value);
            }}
          />
          <AppTextField
            label={t('common:created_by')}
            placeholder={t('common:input_pla', { label: t('common:created_by').toLowerCase() })}
            wrapperClassName={'flex-1'}
            value={filter.createdBy}
            defaultValue={filter.createdBy}
            onChange={(e) => {
              setFieldFilter('createdBy', e.target.value);
            }}
          />
          <AppDatePicker
            label={t('common:created_at')}
            wrapperClassName={'w-full'}
            onChange={(date) => {
              setFieldFilter('createAt', date.toISOString());
            }}
            value={filter.createAt ? dayjs(filter.createAt) : undefined}
            format={FORMAT_DATE_PARAMS}
          />
          <AppSelectWithMulti
            name={'status'}
            mode={'multiple'}
            label={t('approve:status_approve')}
            options={statusOptions}
            isTranslationLabel
            placeholder={t('common:select_status')}
            value={filter.status}
            onChange={(value) => {
              setFieldFilter('status', value);
            }}
          />
        </Flex>
      </Drawer>

      {renderInfoTask()}
    </section>
  );
};

export default MyPending;
