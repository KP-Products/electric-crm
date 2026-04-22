'use client';

import { K_SIZE_0, K_SIZE_120, K_SIZE_20, K_SIZE_302, K_SIZE_60, K_SIZE_7 } from '@constant';
import { GET_LIST_PERMISSION } from '@redux-action-type/role';
import { dispatch } from '@redux-common';
import { selectPermissionList, selectRoleLoadingList } from '@redux-selector/role';
import { Table } from 'antd';
import clsx from 'clsx';
import { IconSvgLocal } from 'components/icon-vec-local';
import { AppSwitch } from 'components/switch';
import AppTable from 'components/table';
import { TextBase } from 'components/text';
import { useCallback, useEffect, useMemo } from 'react';
import { useController, UseFormReturn } from 'react-hook-form';
import { useSelector } from 'react-redux';
import ExpandedTable from 'screens/authentication/manage-permission-group/form/components/PermissionTableView/ExpandedTable';
import { PermissionGroupForm } from 'screens/authentication/manage-permission-group/hooks/useManagePermissionGroupForm';
import { mapPermissionGroup } from 'screens/authentication/manage-permission-group/utils/method';
import { PermissionGroup } from 'screens/authentication/manage-permission-group/utils/type';
import { useAppTranslation } from 'utils/i18n';

interface PermissionTableViewProps {
  form: UseFormReturn<PermissionGroupForm>;
  isView?: boolean;
}

const PermissionTableView = ({ form, isView }: PermissionTableViewProps) => {
  const { t } = useAppTranslation();
  const permissionList = useSelector(selectPermissionList);
  const loadingPermissionGroup = useSelector(selectRoleLoadingList);

  const { control } = form;

  const permissionGroup = useMemo(() => mapPermissionGroup(permissionList), [permissionList]);

  useEffect(() => {
    if (permissionList.length === K_SIZE_0) {
      dispatch({ type: GET_LIST_PERMISSION, payload: {} });
    }
  }, [permissionList]);

  const {
    field: { value: watchPermission, onChange }
  } = useController({ control, name: 'permissions' });

  const isAllPermissionsChecked = useCallback(
    (permissions: PermissionGroup['functions'][number]['permissions']) => {
      const watchIds = new Set(watchPermission.map((p) => p.permissionId));
      return permissions.every((permission) => watchIds.has(permission.permissionId));
    },
    [watchPermission]
  );

  const onToggleAllPermission = useCallback(
    (checked: boolean, permissions: PermissionGroupForm['permissions']) => {
      if (checked) {
        const existingIds = new Set(watchPermission.map((p) => p.permissionId));
        const newPermissions = permissions
          .filter((p) => !existingIds.has(p.permissionId))
          .map((p) => ({
            permissionId: p.permissionId,
            title: p.title
          }));
        return onChange([...watchPermission, ...newPermissions]);
      } else {
        const groupIds = new Set(permissions.map((p) => p.permissionId));
        const filteredPermissions = watchPermission.filter((p) => !groupIds.has(p.permissionId));
        return onChange(filteredPermissions);
      }
    },
    [watchPermission, onChange]
  );

  const sharedOnCell = useCallback(() => ({ colSpan: K_SIZE_0 }), []);

  const columns: any = useMemo(
    () => [
      {
        title: t('common:order'),
        dataIndex: 'title',
        align: 'center',
        width: K_SIZE_60,
        onCell: () => ({
          colSpan: K_SIZE_7
        }),
        render: (text: string, record: PermissionGroup) => {
          const allPermissions = record.functions.flatMap((fn) => fn.permissions);
          return (
            <div className="flex items-center justify-between">
              <TextBase text={text} classNames="font-semibold" />
              <div className="flex items-center gap-8">
                <AppSwitch
                  checked={isAllPermissionsChecked(allPermissions)}
                  onChange={(checked) => !isView && onToggleAllPermission(checked, allPermissions)}
                  className={clsx({ 'pointer-events-none': isView })}
                />
                <TextBase t18n="manage_role:all_permission" />
              </div>
            </div>
          );
        }
      },
      {
        title: t('manage_role:function'),
        align: 'left',
        width: K_SIZE_302,
        onCell: sharedOnCell
      },
      {
        title: t('manage_role:view'),
        align: 'center',
        width: K_SIZE_120,
        onCell: sharedOnCell
      },
      {
        title: t('manage_role:add'),
        align: 'center',
        width: K_SIZE_120,
        onCell: sharedOnCell
      },
      {
        title: t('manage_role:edit'),
        align: 'center',
        width: K_SIZE_120,
        onCell: sharedOnCell
      },
      {
        title: t('manage_role:delete'),
        align: 'center',
        width: K_SIZE_120,
        onCell: sharedOnCell
      },
      {
        title: t('manage_role:download'),
        align: 'center',
        width: K_SIZE_120,
        onCell: sharedOnCell
      },
      Table.EXPAND_COLUMN
    ],
    [t, isAllPermissionsChecked, onToggleAllPermission, sharedOnCell, isView]
  );

  if (loadingPermissionGroup) return null;

  return (
    <div className={'overflow-hidden rounded-radius-l border border-color-400 pb-4'}>
      <AppTable
        rootClassName={'w-full'}
        className={'[&_.ant-pagination]:hidden'}
        scroll={{ x: 'max-content' }}
        dataSource={permissionGroup}
        columns={columns}
        rowKey={'moduleId'}
        expandable={{
          defaultExpandedRowKeys: permissionGroup.map((item) => item.moduleId),
          expandedRowRender: (record) => {
            return <ExpandedTable data={record as any} form={form} isView={isView} />;
          },
          expandedRowClassName: 'expanded-row',
          expandIcon: ({ expanded, onExpand, record }) => {
            if (!record?.functions) return null;
            return (
              <div
                className={'flex cursor-pointer'}
                onClick={(e) => {
                  e.stopPropagation();
                  onExpand(record, e);
                }}
                aria-hidden="true"
              >
                <IconSvgLocal
                  height={K_SIZE_20}
                  name={'ICON_ARROW_LEFT'}
                  classNames={expanded ? '-rotate-90' : 'rotate-180'}
                />
              </div>
            );
          }
        }}
      />
    </div>
  );
};

export default PermissionTableView;
