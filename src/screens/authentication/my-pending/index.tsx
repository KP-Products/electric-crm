'use client';

import { K_SIZE_1, K_SIZE_108, K_SIZE_20, K_SIZE_8 } from '@constant';
import { Divider, Dropdown, Flex, Spin } from 'antd';
import ButtonBase from 'components/button';
import { TextBase } from 'components/text';
import React, { useState } from 'react';
import AppTable from 'components/table';
import { API_DATE_INPUT_FORMATS, FORMAT_DATE_API, FORMAT_DATE_PARAMS } from 'utils/date';
import useMyPendingHook from 'screens/authentication/my-pending/useMyPendingHook';
import AppPagination from 'components/table/pagination';
import { IconSvgLocal } from 'components/icon-vec-local';
import { AppSelect } from 'components/select';
import { AppTextField } from 'components/text-field';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { AppDatePicker } from 'components/date-picker';
import { FEE_CODE_STATUS } from 'model/fee-code';
import { DebugUtils } from 'utils/debug-utils';
import { AppSelectWithMulti } from 'components/select/AppSelectWithMulti';
import { ROUTES } from '../../../config/routes';
import PageWithBreadcrumb from '../../../layout/AppLayout/PageWithBreadcumb';

dayjs.extend(customParseFormat);

const ALL_OPTION = { value: '', label: 'Tất cả' };

const MyPending = () => {
  const {
    t,
    filter,
    setFieldFilter,
    filterApplied,
    total,
    dataFilter,
    pagination,
    optionFeature,
    optionAction,
    ACTION_KEYS,
    columns,
    statusOptions,
    onApplyFilter,
    onResetFilter,
    renderFilterTags,
    showDialogConfirm
  } = useMyPendingHook();
  const [moreAction, setMoreAction] = useState<string>();
  const breadcrumbList = [
    {
      title: t('menu:system_administration')
    },
    {
      title: 'Tác vụ chờ duyệt của tôi',
      key: ROUTES.MY_PENDING
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
          <TextBase classNames="title4" t18n={'approve:my_pending_tasks'} />
        </Flex>
        <Divider className={'my-16'} />

        <div className="mb-12 grid grid-cols-6 items-end gap-12 rounded-radius-l border border-color-300 bg-color-50 p-12 tablet:grid-cols-2 mobile:grid-cols-1">
          <AppSelect
            name={'actionId'}
            label={t('approve:feature')}
            options={[ALL_OPTION, ...(optionFeature || [])]}
            placeholder={t('common:select_pla', { label: t('approve:feature').toLowerCase() })}
            value={filter.actionId}
            onSelectOption={(e) => {
              setFieldFilter('actionId', e.key);
            }}
          />
          <AppSelect
            name={'operationType'}
            label={t('common:status_active')}
            options={[ALL_OPTION, ...optionAction]}
            placeholder={t('common:select_pla', {
              label: t('common:status_active').toLowerCase()
            })}
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
            onChange={(e) => {
              setFieldFilter('requestId', e.target.value);
            }}
            onPressEnter={onApplyFilter}
          />
          <AppTextField
            label={t('common:created_by')}
            placeholder={t('common:input_pla', { label: t('common:created_by').toLowerCase() })}
            wrapperClassName={'flex-1'}
            value={filter.createdBy}
            onChange={(e) => {
              setFieldFilter('createdBy', e.target.value);
            }}
            onPressEnter={onApplyFilter}
          />
          <AppDatePicker
            label={t('common:created_at')}
            wrapperClassName={'w-full'}
            onChange={(date) => {
              setFieldFilter('createAt', date ? date.format(FORMAT_DATE_API) : '');
            }}
            value={filter.createAt ? dayjs(filter.createAt, API_DATE_INPUT_FORMATS) : undefined}
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
          <Flex
            justify="end"
            gap={K_SIZE_8}
            className="col-start-6 tablet:col-start-2 mobile:col-start-auto mobile:w-full"
          >
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
              classNames="min-w-[130px] mobile:flex-1 mobile:justify-center"
            />
          </Flex>
        </div>

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
                            { key: ACTION_KEYS.DELETE, label: t('common:delete'), danger: true }
                          ],
                          onClick: (item) => {
                            DebugUtils.logS(['selected', record]);
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
      </section>
    </PageWithBreadcrumb>
  );
};

export default MyPending;
