'use client';

import {
  K_SIZE_1,
  K_SIZE_100,
  K_SIZE_108,
  K_SIZE_120,
  K_SIZE_16,
  K_SIZE_180,
  K_SIZE_2,
  K_SIZE_20,
  K_SIZE_200,
  K_SIZE_220,
  K_SIZE_8,
  NULL_VALUE
} from '@constant';
import { Divider, Dropdown, Flex } from 'antd';
import { ItemType } from 'antd/es/menu/interface';
import ButtonBase from 'components/button';
import { IconSvgLocal } from 'components/icon-vec-local';
import Status, { KIND_STATUS } from 'components/status';
import AppTable from 'components/table';
import AppPagination from 'components/table/pagination';
import { TextBase } from 'components/text';
import { AppTextField } from 'components/text-field';
import { ROUTES } from 'config/routes';
import { Role } from 'model/role';
import { useCallback, useMemo } from 'react';
import useManagePermissionGroup from 'screens/authentication/manage-permission-group/hooks/useManagePermissionGroup';
import useManagePermissionGroupPermission from 'screens/authentication/manage-permission-group/hooks/useManagePermissionGroupPermission';
import {
  ROLE_STATUS_LABEL_MAP,
  ROLE_STATUS_TYPE_MAP
} from 'screens/authentication/manage-permission-group/utils/constant';
import { displayDateTimeFromServer } from 'utils/date';

const ManagePermissionGroup = () => {
  const {
    t,
    router,
    filter,
    setFilter,
    debouncedApplySearch,
    roleList,
    loadingRoleList,
    pagination,
    onAdd,
    onDownload,
    onEdit,
    onDelete
  } = useManagePermissionGroup();

  const { permission } = useManagePermissionGroupPermission();

  const renderColumn = useCallback((text: string, display?: (text: string) => any) => {
    return display?.(text) || text || NULL_VALUE;
  }, []);

  const columns = useMemo(() => {
    const cols: any[] = [
      {
        title: t('manage_role:role_code'),
        dataIndex: 'code',
        key: 'code',
        align: 'left',
        width: K_SIZE_200,
        render: (text: string, record: Role) => {
          return (
            <TextBase
              text={text}
              classNames={
                'sub-title4 !text-secondary-500 cursor-pointer hover:!text-secondary-700 truncate max-w-[168px]'
              }
              onClick={() =>
                router.push(`${ROUTES.MANAGE_PERMISSION_GROUP_DETAIL}?id=${record.roleId}`)
              }
            />
          );
        }
      },
      {
        title: t('manage_role:role_name'),
        dataIndex: 'name',
        align: 'left',
        width: K_SIZE_200,
        render: (text: string) => renderColumn(text)
      },
      {
        title: t('common:status'),
        dataIndex: 'status',
        align: 'left',
        width: K_SIZE_120,
        render: (status: string) => {
          return (
            <Status
              type={ROLE_STATUS_TYPE_MAP[status]}
              kind={KIND_STATUS.SECONDARY}
              content={t(ROLE_STATUS_LABEL_MAP[status])}
            />
          );
        }
      },
      {
        title: t('common:description'),
        dataIndex: 'description',
        align: 'left',
        width: K_SIZE_220,
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
    const actions = [
      permission.canEdit && { key: K_SIZE_1.toString(), label: t('common:edit') },
      permission.canDelete && { key: K_SIZE_2.toString(), label: t('common:delete'), danger: true }
    ].filter(Boolean) as ItemType[];
    if (actions.length) {
      cols.push({
        title: t('common:action'),
        fixed: 'right',
        width: K_SIZE_108,
        align: 'center',
        render: (_: any, record: Role) => (
          <Dropdown
            trigger={['click']}
            menu={{
              items: actions,
              onClick: (item) => {
                switch (item.key) {
                  case K_SIZE_1.toString(): {
                    return onEdit(record.roleId);
                  }
                  case K_SIZE_2.toString(): {
                    return onDelete(record.roleId);
                  }
                }
              }
            }}
            placement={'bottomRight'}
            arrow={{ pointAtCenter: true }}
          >
            <div className={'flex justify-center'}>
              <IconSvgLocal height={K_SIZE_20} name={'ICON_MORE'} classNames={'cursor-pointer'} />
            </div>
          </Dropdown>
        )
      });
    }
    return cols;
  }, [t, router, renderColumn, onEdit, onDelete, permission]);

  return (
    <div>
      <Flex
        justify={'space-between'}
        align={'center'}
        gap={K_SIZE_8}
        className={'tablet:flex-col tablet:items-start'}
      >
        <TextBase classNames="title4" t18n="menu:permission_group_management" />
        <Flex
          flex={K_SIZE_1}
          justify={'end'}
          gap={K_SIZE_16}
          className={'mobile:w-full mobile:flex-col'}
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
              value={filter.search}
              onChange={(e) => {
                setFilter((prev) => ({ ...prev, search: e.target.value }));
                debouncedApplySearch(e.target.value);
              }}
              onPressEnter={(e) => e.currentTarget.blur()}
            />
          </div>
          <Flex gap={K_SIZE_16}>
            {permission.canAdd && (
              <ButtonBase
                type={'ghost'}
                leftIcon={'IC_ADD_OUTLINE2'}
                customContent={t('common:add_new')}
                onClick={onAdd}
                classNames={'mobile:flex-1 mobile:justify-center'}
              />
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
      <div className={'overflow-hidden rounded-radius-l border border-color-400 pb-4'}>
        <AppTable
          rootClassName={'w-full'}
          className={'[&_.ant-pagination]:hidden'}
          scroll={{ x: 'max-content', y: '75vh' }}
          dataSource={roleList}
          loading={loadingRoleList}
          columns={[...columns]}
          rowKey={'roleId'}
          pagination={pagination}
        />
      </div>
      <AppPagination
        currentPage={pagination.current}
        total={pagination.total}
        pagination={pagination}
      />
    </div>
  );
};

export default ManagePermissionGroup;
