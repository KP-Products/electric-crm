'use client';
import useManageUserPermission from '../manage-user/hooks/useManageUserPermission';
import { useCallback, useMemo } from 'react';
import {
  K_SIZE_0,
  K_SIZE_1,
  K_SIZE_100,
  K_SIZE_108,
  K_SIZE_130,
  K_SIZE_16,
  K_SIZE_160,
  K_SIZE_18,
  K_SIZE_180,
  K_SIZE_8,
  NULL_VALUE
} from '@constant';
import { User } from '../../../model/user';
import { TextBase } from '../../../components/text';
import { ROUTES } from '../../../config/routes';
import Status, { KIND_STATUS } from '../../../components/status';
import {
  USER_FILTER_LABEL_MAP,
  USER_STATUS_LABEL_MAP,
  USER_STATUS_TYPE_MAP
} from '../manage-user/utils/constant';
import { displayDateTimeFromServer } from '../../../utils/date';
import IconHover from '../../../components/icon-vec-local/icon-hover';
import { UserFilterForm } from '../manage-user/components/UserFilterDrawer';
import clsx from 'clsx';
import TagFilter from '../../../components/tag-filter';
import PageWithBreadcrumb from '../../../layout/AppLayout/PageWithBreadcumb';
import { Divider, Flex } from 'antd';
import ButtonBase from '../../../components/button';
import AppTable from '../../../components/table';
import AppPagination from '../../../components/table/pagination';
import useManageMeter from './hooks/useManageMeter';

const MeterManagementScreen = () => {
  const {
    t,
    router,
    filterApplied,
    loadingMeterList,
    pagination,
    onResetFilter,
    filterDrawerRef,
    meterList
  } = useManageMeter();

  const { permission } = useManageUserPermission();

  const renderColumn = useCallback((text: string, display?: (text: string) => any) => {
    return display?.(text) || text || NULL_VALUE;
  }, []);

  const columns = useMemo(() => {
    const cols: any = [
      {
        title: 'Mã công tơ',
        dataIndex: 'meterCode',
        key: 'meterCode',
        align: 'left',
        width: K_SIZE_160,
        render: (text: string, record: User) => {
          return (
            <TextBase
              text={text}
              classNames={'sub-title4 !text-secondary-500 cursor-pointer hover:!text-secondary-700'}
              onClick={() => router.push(`${ROUTES.MANAGE_METER_DETAIL}?id=${record.id}`)}
            />
          );
        }
      },
      {
        title: t('common:status'),
        dataIndex: 'status',
        align: 'left',
        width: K_SIZE_130,
        render: (status: string) => {
          return (
            <Status
              type={USER_STATUS_TYPE_MAP[status]}
              kind={KIND_STATUS.SECONDARY}
              content={USER_STATUS_LABEL_MAP[status]}
            />
          );
        }
      },
      {
        title: t('common:created_at'),
        dataIndex: 'createdAt',
        align: 'left',
        width: K_SIZE_180,
        render: (text: string) => renderColumn(text, displayDateTimeFromServer)
      },
      {
        title: t('common:created_by'),
        dataIndex: 'createdBy',
        align: 'left',
        width: K_SIZE_100,
        render: (text: string) => renderColumn(text)
      },
      {
        title: t('common:updated_at'),
        dataIndex: 'updatedAt',
        align: 'left',
        width: K_SIZE_180,
        render: (text: string) => renderColumn(text, displayDateTimeFromServer)
      },
      {
        title: t('common:updated_by'),
        dataIndex: 'updatedBy',
        align: 'left',
        width: K_SIZE_100,
        render: (text: string) => renderColumn(text)
      }
    ];
    if (permission.canEdit) {
      cols.push({
        title: t('common:action'),
        fixed: 'right',
        width: K_SIZE_108,
        align: 'center',
        render: (_: any, record: User) => (
          <div className="flex justify-center">
            <IconHover
              rootClassName={'text-color-800'}
              title={t('common:edit')}
              icon={'ICON_EDIT'}
              iconHeight={K_SIZE_18}
              onClick={() => router.push(`${ROUTES.MANAGE_USER_EDIT}?id=${record.id}`)}
            />
          </div>
        )
      });
    }
    return cols;
  }, [t, router, renderColumn, permission]);

  const TagFilterGroup = useCallback(() => {
    const entries = Object.entries(filterApplied) as [keyof UserFilterForm, any][];
    const activeFilters = entries.filter(([, value]) => Boolean(value));
    const formatValue = (key: keyof UserFilterForm, value: any) => {
      switch (key) {
        case 'status':
          return USER_STATUS_LABEL_MAP[value];
        default:
          return value;
      }
    };
    return (
      <div
        className={clsx('flex w-full items-center gap-8', {
          'mb-8': activeFilters.length > K_SIZE_0
        })}
      >
        {activeFilters.map(([key, value]) => {
          const valueFilter = formatValue(key, value);
          if (!valueFilter) return null;
          return (
            <TagFilter
              key={key}
              content={`${t(USER_FILTER_LABEL_MAP[key])}: ${valueFilter}`}
              onClose={() => onResetFilter(key)}
            />
          );
        })}
      </div>
    );
  }, [t, filterApplied, onResetFilter]);
  const breadcrumbList = [
    {
      title: t('menu:system_administration')
    },
    {
      title: 'Quản lý công tơ',
      key: ROUTES.METER_MANAGEMENT
    }
  ];
  return (
    <PageWithBreadcrumb breadcrumbList={breadcrumbList}>
      <div>
        <Flex
          justify={'space-between'}
          align={'center'}
          gap={K_SIZE_8}
          className={'tablet:flex-col tablet:items-start'}
        >
          <TextBase classNames="title4" text={'Quản lý công tơ'} />
          <Flex
            flex={K_SIZE_1}
            justify={'end'}
            gap={K_SIZE_16}
            className={'mobile:w-full mobile:flex-col'}
          >
            <Flex gap={K_SIZE_16}>
              <ButtonBase
                type={'ghost'}
                customContent={t('common:advanced_filter')}
                leftIcon={'IC_FILTER_OUTLINE'}
                onClick={() => filterDrawerRef.current?.open(filterApplied)}
                classNames={'mobile:flex-1 mobile:justify-center'}
              />
            </Flex>

            <ButtonBase
              type={'ghost'}
              leftIcon={'IC_ADD_OUTLINE2'}
              customContent={t('common:add_new')}
              classNames={'mobile:flex-1 mobile:justify-center'}
              onClick={() => router.push(ROUTES.MANAGE_METER_ADD)}
            />
          </Flex>
        </Flex>
        <Divider className={'my-16 '} />
        <TagFilterGroup />
        <div className={'overflow-hidden rounded-radius-l border border-color-400 pb-4'}>
          <AppTable
            rootClassName={'w-full'}
            className={'[&_.ant-pagination]:hidden'}
            scroll={{ x: 'max-content', y: '75vh' }}
            dataSource={meterList}
            loading={loadingMeterList}
            columns={[...columns]}
            rowKey={'id'}
            pagination={pagination}
          />
        </div>
        <AppPagination
          currentPage={pagination.current}
          total={pagination.total}
          pagination={pagination}
        />
        {/*<UserFilterDrawer*/}
        {/*  ref={filterDrawerRef}*/}
        {/*  defaultValues={defaultFilter}*/}
        {/*  onApplyFilter={onApplyFilter}*/}
        {/*  onResetFilter={onResetFilter}*/}
        {/*/>*/}
      </div>
    </PageWithBreadcrumb>
  );
};
export default MeterManagementScreen;
