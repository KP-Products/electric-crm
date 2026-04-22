'use client';

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
  K_SIZE_2,
  K_SIZE_200,
  K_SIZE_220,
  K_SIZE_8,
  NULL_VALUE
} from '@constant';
import { Divider, Dropdown, Flex } from 'antd';
import clsx from 'clsx';
import ButtonBase from 'components/button';
import IconHover from 'components/icon-vec-local/icon-hover';
import Status, { KIND_STATUS } from 'components/status';
import AppTable from 'components/table';
import AppPagination from 'components/table/pagination';
import TagFilter from 'components/tag-filter';
import { TextBase } from 'components/text';
import { ROUTES } from 'config/routes';
import { User } from 'model/user';
import { useCallback, useMemo } from 'react';
import UserFilterDrawer, {
  UserFilterForm
} from 'screens/authentication/manage-user/components/UserFilterDrawer';
import useManageUser from 'screens/authentication/manage-user/hooks/useManageUser';
import useManageUserPermission from 'screens/authentication/manage-user/hooks/useManageUserPermission';
import {
  USER_FILTER_LABEL_MAP,
  USER_STATUS_LABEL_MAP,
  USER_STATUS_TYPE_MAP
} from 'screens/authentication/manage-user/utils/constant';
import { displayDateTimeFromServer } from 'utils/date';

const ManageUser = () => {
  const {
    t,
    router,
    onApplyFilter,
    defaultFilter,
    filterApplied,
    userPaginated,
    loadingUserList,
    pagination,
    onDownload,
    onResetFilter,
    filterDrawerRef,
    roleOptions,
    unitList,
    departmentList
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
        title: t('manage_user:unit'),
        dataIndex: 'unit',
        align: 'left',
        width: K_SIZE_220,
        render: (unit: User['unit']) => renderColumn(unit?.name)
      },
      {
        title: t('manage_user:department'),
        dataIndex: 'department',
        align: 'left',
        width: K_SIZE_220,
        render: (department: User['department']) => renderColumn(department?.name)
      },
      {
        title: t('manage_user:role'),
        dataIndex: 'roleGroup',
        align: 'left',
        width: K_SIZE_200,
        render: (roleGroup: User['roleGroup']) => renderColumn(roleGroup?.name)
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
              content={t(USER_STATUS_LABEL_MAP[status])}
            />
          );
        }
      },
      {
        title: t('manage_user:phone'),
        dataIndex: 'phone',
        align: 'left',
        width: K_SIZE_160,
        render: (text: string) => renderColumn(text)
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
          return t(USER_STATUS_LABEL_MAP[value]);
        case 'roleId':
          const role = roleOptions.find((r) => r.value === value);
          return role?.label;
        case 'unitId':
          const unit = unitList.find((u) => u.id === value);
          return unit?.name;
        case 'departmentId':
          const department = departmentList.find((d) => d.id === value);
          return department?.name;
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
  }, [t, filterApplied, onResetFilter, roleOptions, unitList, departmentList]);

  return (
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
          <Flex gap={K_SIZE_16}>
            <ButtonBase
              type={'ghost'}
              customContent={t('common:advanced_filter')}
              leftIcon={'IC_FILTER_OUTLINE'}
              onClick={() => filterDrawerRef.current?.open(filterApplied)}
              classNames={'mobile:flex-1 mobile:justify-center'}
            />
          </Flex>
          <Flex gap={K_SIZE_16}>
            {permission.canAdd && (
              <Dropdown
                trigger={['click']}
                menu={{
                  items: [
                    { key: K_SIZE_1.toString(), label: t('manage_user:add_user') },
                    { key: K_SIZE_2.toString(), label: t('manage_user:upload_user') }
                  ],
                  onClick: (item) => {
                    switch (item.key) {
                      case K_SIZE_1.toString(): {
                        return router.push(ROUTES.MANAGE_USER_ADD);
                      }
                      case K_SIZE_2.toString(): {
                        return router.push(ROUTES.MANAGE_USER_UPLOAD);
                      }
                    }
                  }
                }}
                placement={'bottomLeft'}
              >
                <ButtonBase
                  type={'ghost'}
                  leftIcon={'IC_ADD_OUTLINE2'}
                  customContent={t('common:add_new')}
                  classNames={'mobile:flex-1 mobile:justify-center'}
                />
              </Dropdown>
            )}
            {permission.canDownload && (
              <ButtonBase
                type={'primary'}
                customContent={t('common:download')}
                leftIcon={'IC_DOWNLOAD_OUTLINE'}
                onClick={onDownload}
                classNames={'mobile:flex-1 mobile:justify-center'}
              />
            )}
          </Flex>
        </Flex>
      </Flex>
      <Divider className={'my-16 '} />
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
      <UserFilterDrawer
        ref={filterDrawerRef}
        defaultValues={defaultFilter}
        onApplyFilter={onApplyFilter}
        onResetFilter={onResetFilter}
        roleOptions={roleOptions}
      />
    </div>
  );
};

export default ManageUser;
