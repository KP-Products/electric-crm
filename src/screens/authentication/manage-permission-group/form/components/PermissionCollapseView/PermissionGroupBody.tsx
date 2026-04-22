'use client';

import AppCheckbox from 'components/checkbox';
import { useCallback, useMemo } from 'react';
import { useController, UseFormReturn } from 'react-hook-form';
import { PermissionGroupForm } from 'screens/authentication/manage-permission-group/hooks/useManagePermissionGroupForm';
import { PermissionGroup } from 'screens/authentication/manage-permission-group/utils/type';

interface PermissionGroupBodyProps {
  data: PermissionGroup;
  form: UseFormReturn<PermissionGroupForm>;
}

const PermissionGroupBody = ({ data, form }: PermissionGroupBodyProps) => {
  const { control } = form;
  const { functions } = data;

  const permissions = useMemo(() => functions.flatMap((fn) => fn.permissions), [functions]);

  const {
    field: { value, onChange, name }
  } = useController({ control, name: 'permissions' });

  const handleChange = useCallback(
    (checkedValue: any[]) => {
      const groupIds = new Set(permissions.map((p) => p.permissionId.toString()));
      const filteredPermissions = value.filter((p) => !groupIds.has(p.permissionId));
      const newPermissions = permissions
        .filter((p) => checkedValue.includes(p.permissionId.toString()))
        .map((p) => ({
          permissionId: p.permissionId.toString(),
          title: p.title
        }));
      return onChange([...filteredPermissions, ...newPermissions]);
    },
    [permissions, value, onChange]
  );

  return (
    <AppCheckbox
      direction="column"
      name={name}
      value={value.map((p) => p.permissionId.toString())}
      onChange={handleChange}
      options={permissions.map((item) => ({
        label: item.title,
        value: item.permissionId.toString()
      }))}
    />
  );
};

export default PermissionGroupBody;
