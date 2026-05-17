'use client';

import { K_SIZE_1, K_SIZE_16, K_SIZE_8 } from '@constant';
import { Empty, Flex, Tabs } from 'antd';
import ButtonBase from 'components/button';
import { TextBase } from 'components/text';
import { ROUTES } from 'config/routes';
import { useEffect, useMemo, useState } from 'react';
import useManagePermissionGroup from 'screens/authentication/manage-permission-group/hooks/useManagePermissionGroup';

import PageWithBreadcrumb from '../../../layout/AppLayout/PageWithBreadcumb';
import PermissionTableView from './form/components/PermissionTableView';
import useManagePermissionGroupForm from './hooks/useManagePermissionGroupForm';
import { Role } from '../../../model/role';

const ManagePermissionGroup = () => {
  const { t, roleList, loadingRoleList, onAdd, onEdit, onDelete } = useManagePermissionGroup();
  const { permissionGroupForm } = useManagePermissionGroupForm({ isView: true });
  const roles = useMemo(() => {
    if (!roleList) return [];

    return Array.isArray(roleList) ? roleList : [roleList];
  }, [roleList]);

  const [activeRoleId, setActiveRoleId] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<Role>();

  useEffect(() => {
    if (!activeRoleId && roles.length > 0) {
      setActiveRoleId(roles[0].id);
    }
  }, [roles, activeRoleId]);

  useEffect(() => {
    const selectedRole = roles.find((item) => item.id === activeRoleId);
    if (!selectedRole) return;
    setSelectedRole(selectedRole);
    permissionGroupForm.setValue(
      'permissions',
      selectedRole.permissions.map((permission: string) => ({
        permissionId: permission,
        title: permission,
        permissionCode: permission
      })),
      {
        shouldDirty: false,
        shouldTouch: false,
        shouldValidate: false
      }
    );
  }, [activeRoleId, roles, permissionGroupForm]);

  const breadcrumbList = [
    {
      title: t('menu:system_administration'),
      key: ROUTES.MANAGE_USER
    },
    {
      title: t('menu:permission_group_management'),
      key: ROUTES.MANAGE_PERMISSION_GROUP
    }
  ];

  const tabItems = roles.map((role) => ({
    key: role.id,
    label: (
      <div className="flex flex-col items-start">
        <span className="font-semibold">{role.name}</span>
        <span className="text-12 text-color-600">{role.code}</span>
      </div>
    ),
    children: (
      <div className="mt-4">
        <PermissionTableView key={role.id} form={permissionGroupForm} isView={true} />
      </div>
    )
  }));

  return (
    <PageWithBreadcrumb breadcrumbList={breadcrumbList}>
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
            <Flex gap={K_SIZE_16}>
              <ButtonBase
                type={'primary'}
                leftIcon={'IC_ADD_OUTLINE2'}
                customContent={t('common:add_new')}
                onClick={onAdd}
                classNames={'mobile:flex-1 mobile:justify-center'}
              />
              <ButtonBase
                type={'ghost'}
                leftIcon={'ICON_EDIT'}
                customContent={t('common:edit')}
                onClick={() => onEdit(activeRoleId)}
                classNames={'mobile:flex-1 mobile:justify-center'}
              />
              <ButtonBase
                type={'secondary'}
                leftIcon={'IC_TRASH_OUTLINE'}
                customContent={t('common:delete')}
                onClick={() => onDelete(selectedRole)}
                classNames={'mobile:flex-1 mobile:justify-center'}
              />
            </Flex>
          </Flex>
        </Flex>

        <div className="mt-16">
          {loadingRoleList ? null : roles.length > 0 ? (
            <Tabs
              type="card"
              activeKey={activeRoleId}
              onChange={setActiveRoleId}
              items={tabItems}
              destroyInactiveTabPane
              className="
                [&_.ant-tabs-nav]:mb-4
                [&_.ant-tabs-tab-active]:bg-color-50
                [&_.ant-tabs-tab-active_.ant-tabs-tab-btn]:!text-secondary-600
                [&_.ant-tabs-tab:hover_.ant-tabs-tab-btn]:!text-secondary-600
                [&_.ant-tabs-tab]:rounded-t-radius-l
              "
            />
          ) : (
            <Empty description="Không có nhóm quyền" />
          )}
        </div>
      </div>
    </PageWithBreadcrumb>
  );
};

export default ManagePermissionGroup;
