'use client';

import { Badge } from 'antd';
import { AppSwitch } from 'components/switch';
import { TextBase } from 'components/text';
import { useCallback, useMemo } from 'react';
import { UseFormReturn, useWatch } from 'react-hook-form';
import { PermissionGroupForm } from 'screens/authentication/manage-permission-group/hooks/useManagePermissionGroupForm';
import { PermissionGroup } from 'screens/authentication/manage-permission-group/utils/type';

interface PermissionGroupHeaderProps {
  data: PermissionGroup;
  form: UseFormReturn<PermissionGroupForm>;
}

const PermissionGroupHeader = ({ data, form }: PermissionGroupHeaderProps) => {
  const { control, setValue } = form;
  const { title, functions } = data;

  const watchPermission = useWatch({ control, name: 'permissions' });

  const permissions = useMemo(() => functions.flatMap((fn) => fn.permissions), [functions]);

  const checked: boolean = useMemo(() => {
    const watchIds = new Set(watchPermission.map((p) => p.permissionId));
    return permissions.every((permission) => watchIds.has(permission.permissionId.toString()));
  }, [permissions, watchPermission]);

  const onToggle = useCallback(
    (value: boolean) => {
      if (value) {
        const existingIds = new Set(watchPermission.map((p) => p.permissionId));
        const newPermissions = permissions
          .filter((p) => !existingIds.has(p.permissionId.toString()))
          .map((p) => ({
            permissionId: p.permissionId.toString(),
            title: p.title
          }));
        return setValue('permissions', [...watchPermission, ...newPermissions]);
      } else {
        const groupIds = new Set(permissions.map((p) => p.permissionId.toString()));
        const filteredPermissions = watchPermission.filter((p) => !groupIds.has(p.permissionId));
        return setValue('permissions', filteredPermissions);
      }
    },
    [permissions, watchPermission, setValue]
  );

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-8">
        <Badge count={permissions.length} classNames={{ indicator: '!bg-primary-500' }} />
        <TextBase text={title} classNames="font-semibold" />
      </div>
      <AppSwitch checked={checked} onChange={onToggle} />
    </div>
  );
};

export default PermissionGroupHeader;
