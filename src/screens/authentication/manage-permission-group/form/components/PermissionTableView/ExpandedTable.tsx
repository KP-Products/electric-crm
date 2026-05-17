'use client';

import { K_SIZE_120, K_SIZE_302, K_SIZE_52, K_SIZE_60, NULL_VALUE } from '@constant';
import { Checkbox } from 'antd';
import clsx from 'clsx';
import AppTable from 'components/table';
import { useCallback, useMemo } from 'react';
import { useController, UseFormReturn } from 'react-hook-form';
import { PermissionGroupForm } from 'screens/authentication/manage-permission-group/hooks/useManagePermissionGroupForm';
import { USER_ACTION } from 'screens/authentication/manage-permission-group/utils/constant';
import { PermissionGroup } from 'screens/authentication/manage-permission-group/utils/type';
import { useAppTranslation } from 'utils/i18n';

interface ExpandedTableProps {
  data: PermissionGroup;
  form: UseFormReturn<PermissionGroupForm>;
  isView?: boolean;
}

const ExpandedTable = ({ data, form, isView }: ExpandedTableProps) => {
  const { t } = useAppTranslation();

  const { control } = form;
  const { functions } = data;

  const {
    field: { value: watchPermission, onChange }
  } = useController({ control, name: 'permissions' });

  const renderUserAction = useCallback(
    (action: string, permissions: PermissionGroupForm['permissions']) => {
      const permission = permissions?.find((per) => per.permissionCode.includes(action));
      if (!permission) return NULL_VALUE;
      const isChecked = watchPermission.some((p) => p.permissionCode === permission.permissionCode);
      const handleChange = (checked: boolean) => {
        if (checked) {
          onChange([...watchPermission, permission]);
        } else {
          onChange(watchPermission.filter((p) => p.permissionCode !== permission.permissionCode));
        }
      };
      return (
        <Checkbox
          checked={isChecked}
          onChange={(e) => !isView && handleChange(e.target.checked)}
          className={clsx({ 'pointer-events-none': isView })}
        />
      );
    },
    [watchPermission, onChange, isView]
  );

  const columns: any = useMemo(
    () => [
      {
        title: t('common:order'),
        dataIndex: 'order',
        align: 'center',
        width: K_SIZE_60
      },
      {
        title: t('manage_role:function'),
        dataIndex: 'title',
        align: 'left',
        width: K_SIZE_302,
        render: (text: string) => (
          <div title={text} className="max-w-[270px] truncate">
            {text}
          </div>
        )
      },
      {
        title: t('manage_role:view'),
        dataIndex: 'permissions',
        align: 'center',
        width: K_SIZE_120,
        render: (permissions: PermissionGroupForm['permissions']) =>
          renderUserAction(USER_ACTION.VIEW, permissions)
      },
      {
        title: t('manage_role:add'),
        dataIndex: 'permissions',
        align: 'center',
        width: K_SIZE_120,
        render: (permissions: PermissionGroupForm['permissions']) =>
          renderUserAction(USER_ACTION.ADD, permissions)
      },
      {
        title: t('manage_role:edit'),
        dataIndex: 'permissions',
        align: 'center',
        width: K_SIZE_120,
        render: (permissions: PermissionGroupForm['permissions']) =>
          renderUserAction(USER_ACTION.EDIT, permissions)
      },
      {
        title: t('manage_role:delete'),
        dataIndex: 'permissions',
        align: 'center',
        width: K_SIZE_120,
        render: (permissions: PermissionGroupForm['permissions']) =>
          renderUserAction(USER_ACTION.DELETE, permissions)
      },
      {
        title: 'Phê duyệt',
        dataIndex: 'permissions',
        align: 'center',
        width: K_SIZE_120,
        render: (permissions: PermissionGroupForm['permissions']) =>
          renderUserAction(USER_ACTION.APPROVE, permissions)
      },
      {
        title: 'In ấn',
        dataIndex: 'permissions',
        align: 'center',
        width: K_SIZE_120,
        render: (permissions: PermissionGroupForm['permissions']) =>
          renderUserAction(USER_ACTION.PRINT, permissions)
      },
      { width: K_SIZE_52 }
    ],
    [t, renderUserAction]
  );

  return (
    <AppTable
      rootClassName={'w-full'}
      className={'[&_.ant-pagination]:hidden'}
      scroll={{ x: 'max-content' }}
      dataSource={functions}
      columns={columns}
      rowKey={'functionId'}
      showHeader={false}
    />
  );
};

export default ExpandedTable;
