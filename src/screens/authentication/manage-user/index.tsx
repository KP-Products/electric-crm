'use client';

import {
  K_SIZE_0,
  K_SIZE_1,
  K_SIZE_108,
  K_SIZE_130,
  K_SIZE_16,
  K_SIZE_160,
  K_SIZE_18,
  K_SIZE_180,
  K_SIZE_200,
  K_SIZE_220,
  K_SIZE_8,
  NULL_VALUE
} from '@constant';
import { Divider, Flex } from 'antd';
import clsx from 'clsx';
import ButtonBase from 'components/button';
import IconHover from 'components/icon-vec-local/icon-hover';
import { AppSelect } from 'components/select';
import Status, { KIND_STATUS } from 'components/status';
import AppTable from 'components/table';
import AppPagination from 'components/table/pagination';
import TagFilter from 'components/tag-filter';
import { TextBase } from 'components/text';
import { AppTextField } from 'components/text-field';
import { ROUTES } from 'config/routes';
import { User } from 'model/user';
import { useCallback, useMemo } from 'react';
import type { UserFilterForm } from 'screens/authentication/manage-user/hooks/useManageUser';
import useManageUser from './hooks/useManageUser';
import useManageUserPermission from 'screens/authentication/manage-user/hooks/useManageUserPermission';
import {
  USER_FILTER_LABEL_MAP,
  USER_STATUS_OPTIONS,
  USER_STATUS_LABEL_MAP,
  USER_STATUS_TYPE_MAP
} from 'screens/authentication/manage-user/utils/constant';
import { displayDateTimeFromServer } from 'utils/date';
import PageWithBreadcrumb from '../../../layout/AppLayout/PageWithBreadcumb';

const ALL_OPTION = { value: '', label: 'Tất cả' };

const ManageUser = () => {
  const {
    t,
    router,
    filter,
    onChangeFilter,
    onApplyFilter,
    filterApplied,
    userPaginated,
    loadingUserList,
    pagination,
    onResetFilter,
    roleOptions,
    onDelete
  } = useManageUser();

  const { permission } = useManageUserPermission();

  const renderColumn = useCallback((text: string, display?: (text: string) => any) => {
    return display?.(text) || text || NULL_VALUE;
  }, []);

  const columns = useMemo(() => {
    const cols: any = [
      {
        title: t('login_screen:username'),
        dataIndex: 'username',
        key: 'username',
        align: 'left',
        width: K_SIZE_160,
        render: (text: string, record: User) => {
          return (
            <TextBase
              text={text}
              classNames={'sub-title4 !text-secondary-500 cursor-pointer hover:!text-secondary-700'}
              onClick={() => router.push(`${ROUTES.MANAGE_USER_DETAIL}?id=${record.id}`)}
            />
          );
        }
      },
      {
        title: t('manage_user:fullname'),
        dataIndex: 'fullName',
        align: 'left',
        width: K_SIZE_220,
        render: (text: string) => renderColumn(text)
      },
      {
        title: t('manage_user:role'),
        dataIndex: 'roles',
        align: 'left',
        width: K_SIZE_200,
        render: (roles: User['roles']) => renderColumn(Array.isArray(roles) ? roles.join(',') : '')
      },
      {
        title: 'Chi nhánh',
        dataIndex: 'branchName',
        align: 'left',
        width: K_SIZE_180,
        render: (text: string, record: User) =>
          renderColumn(text || record.branchCode || NULL_VALUE)
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
              content={USER_STATUS_LABEL_MAP[status] || status || NULL_VALUE}
            />
          );
        }
      },
      {
        title: t('manage_user:email'),
        dataIndex: 'email',
        align: 'left',
        width: K_SIZE_160,
        render: (text: string) => renderColumn(text)
      },
      {
        title: t('common:created_at'),
        dataIndex: 'createdAt',
        align: 'left',
        width: K_SIZE_180,
        render: (text: string) => renderColumn(text, displayDateTimeFromServer)
      }
    ];
    if (permission.canEdit || permission.canDelete) {
      cols.push({
        title: t('common:action'),
        fixed: 'right',
        width: K_SIZE_108,
        align: 'center',
        render: (_: any, record: User) => (
          <div className="flex justify-center gap-8">
            {permission.canEdit && (
              <IconHover
                rootClassName={'text-color-800'}
                title={t('common:edit')}
                icon={'ICON_EDIT'}
                iconHeight={K_SIZE_18}
                onClick={() => router.push(`${ROUTES.MANAGE_USER_EDIT}?id=${record.id}`)}
              />
            )}
            {permission.canDelete && (
              <IconHover
                rootClassName={'text-error-500 hover:text-error-500'}
                title={t('common:delete')}
                icon={'IC_TRASH_OUTLINE'}
                iconHeight={K_SIZE_18}
                onClick={() => onDelete(record)}
              />
            )}
          </div>
        )
      });
    }
    return cols;
  }, [t, router, renderColumn, permission, onDelete]);

  const TagFilterGroup = useCallback(() => {
    const entries = Object.entries(filterApplied) as [keyof UserFilterForm, any][];
    const activeFilters = entries.filter(([, value]) => Boolean(value));
    const formatValue = (key: keyof UserFilterForm, value: any) => {
      switch (key) {
        case 'status':
          return USER_STATUS_LABEL_MAP[value];
        case 'roleId':
          const role = roleOptions.find((r) => r.value === value);
          return role?.label;
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
  }, [t, filterApplied, onResetFilter, roleOptions]);
  const breadcrumbList = [
    {
      title: t('menu:system_administration')
    },
    {
      title: t('manage_user:manage_user'),
      key: ROUTES.MANAGE_USER
    }
  ];
  const userDashboardCards = useMemo(() => {
    const getStatus = (status?: string) => String(status || '').toUpperCase();

    const activeUsers = userPaginated.filter((user) => getStatus(user.status) === 'ACTIVE').length;
    const inactiveUsers = userPaginated.filter(
      (user) => getStatus(user.status) === 'INACTIVE'
    ).length;

    const lockedUsers = userPaginated.filter((user) => {
      const status = getStatus(user.status);
      return status === 'LOCKED';
    }).length;

    return [
      {
        title: 'Tổng người dùng',
        value: pagination.total,
        icon: '👥',
        className: 'from-blue-50 to-white text-blue-600'
      },
      {
        title: 'Đang hoạt động',
        value: activeUsers,
        icon: '●',
        className: 'from-green-50 to-white text-green-600'
      },
      {
        title: 'Không hoạt động',
        value: inactiveUsers,
        icon: '●',
        className: 'from-green-50 to-white text-green-600'
      },
      {
        title: 'Bị khóa',
        value: lockedUsers,
        icon: '🔒',
        className: 'from-red-50 to-white text-red-600'
      }
    ];
  }, [userPaginated, pagination.total]);

  const DashboardCard = useCallback(
    ({
      title,
      value,
      icon,
      className
    }: {
      title: string;
      value: number;
      icon: string;
      className: string;
    }) => {
      return (
        <div
          className={clsx(
            'rounded-radius-l border border-color-400 bg-gradient-to-br p-16 shadow-[0_8px_24px_rgba(16,36,62,0.05)]',
            className
          )}
        >
          <div className="flex items-center justify-between gap-12">
            <div>
              <TextBase text={title} classNames="sub-title4 !text-color-700" />
              <TextBase
                text={String(value)}
                classNames="mt-8 !text-[30px] !font-bold !leading-none !text-color-900"
              />
            </div>

            <div className="flex size-44 items-center justify-center rounded-full text-[22px]">
              {icon}
            </div>
          </div>
        </div>
      );
    },
    []
  );
  return (
    <PageWithBreadcrumb breadcrumbList={breadcrumbList}>
      <div>
        <Flex
          justify={'space-between'}
          align={'center'}
          gap={K_SIZE_8}
          className={'tablet:flex-col tablet:items-start'}
        >
          <TextBase classNames="title4" t18n={'menu:user_management'} />
          <Flex
            flex={K_SIZE_1}
            justify={'end'}
            gap={K_SIZE_16}
            className={'mobile:w-full mobile:flex-col'}
          >
            <ButtonBase
              type={'ghost'}
              leftIcon={'IC_ADD_OUTLINE2'}
              customContent={t('common:add_new')}
              classNames={'mobile:flex-1 mobile:justify-center'}
              onClick={() => router.push(ROUTES.MANAGE_USER_ADD)}
            />
          </Flex>
        </Flex>
        <Divider className={'my-16 '} />
        <div className="mb-16 grid grid-cols-4 gap-16 tablet:grid-cols-2 mobile:grid-cols-1">
          {userDashboardCards.map((item) => (
            <DashboardCard key={item.title} {...item} />
          ))}
        </div>
        <div className="mb-12 grid grid-cols-[minmax(160px,1fr)_minmax(160px,1fr)_minmax(180px,1fr)_minmax(150px,1fr)_minmax(160px,1fr)_auto] items-end gap-12 rounded-radius-l border border-color-300 bg-color-50 p-12 tablet:grid-cols-2 mobile:grid-cols-1">
          <AppTextField
            name="username"
            label={t('login_screen:username')}
            placeholder={t('login_screen:enter_username')}
            value={filter.username}
            onChange={(event) => onChangeFilter('username', event.target.value)}
            onPressEnter={onApplyFilter}
          />
          <AppTextField
            name="fullName"
            label={t('manage_user:fullname')}
            placeholder={t('manage_user:enter_fullname')}
            value={filter.fullName}
            onChange={(event) => onChangeFilter('fullName', event.target.value)}
            onPressEnter={onApplyFilter}
          />
          <AppTextField
            name="email"
            label={t('manage_user:email')}
            placeholder={t('manage_user:enter_email')}
            value={filter.email}
            onChange={(event) => onChangeFilter('email', event.target.value)}
            onPressEnter={onApplyFilter}
          />
          <AppSelect
            name="status"
            label={t('common:status')}
            placeholder={t('common:select_status')}
            value={filter.status}
            options={[ALL_OPTION, ...USER_STATUS_OPTIONS]}
            onSelectOption={({ key }) => onChangeFilter('status', String(key))}
          />
          <AppSelect
            name="roleId"
            label={t('manage_user:role')}
            placeholder={t('manage_user:select_role')}
            value={filter.roleId}
            options={[ALL_OPTION, ...roleOptions]}
            onSelectOption={({ key }) => onChangeFilter('roleId', String(key))}
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
              classNames="min-w-[112px] mobile:flex-1 mobile:justify-center"
            />
          </Flex>
        </div>
        <TagFilterGroup />
        <div className={'overflow-hidden rounded-radius-l border border-color-400 pb-4'}>
          <AppTable
            rootClassName={'w-full'}
            className={'[&_.ant-pagination]:hidden'}
            scroll={{ x: 'max-content', y: '75vh' }}
            dataSource={userPaginated}
            loading={loadingUserList}
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
      </div>
    </PageWithBreadcrumb>
  );
};

export default ManageUser;
