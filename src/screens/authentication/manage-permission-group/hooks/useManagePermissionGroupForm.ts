import { K_SIZE_1 } from '@constant';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ADD_ROLE,
  ASSIGN_PERMISSION,
  EDIT_ROLE,
  GET_ROLE_DETAIL,
  REMOVE_PERMISSION
} from '@redux-action-type/role';
import { dispatch } from '@redux-common';
import { selectRoleLoadingDetail } from '@redux-selector/role';
import { showToast } from 'components/toast';
import { TYPE_TOAST } from 'components/toast/type';
import { ROUTES } from 'config/routes';
import { AddRoleReq, EditRoleReq, GetRoleDetailReq, GetRoleDetailRes } from 'model/role';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { ROLE_STATUS } from 'screens/authentication/manage-permission-group/utils/constant';
import { DebugUtils } from 'utils/debug-utils';
import { useAppTranslation } from 'utils/i18n';
import { TypedT } from 'utils/i18n/useAppTranslation';
import { z } from 'zod';
import { STATUS } from '../../../../model/user';

export interface ManagePermissionGroupFormProps {
  isAddMode?: boolean;
  isView?: boolean;
}

const permissionGroupSchema = (t: TypedT) => {
  return z.object({
    groupCode: z
      .string()
      .trim()
      .min(K_SIZE_1, { message: t('validate:required', { name: t('manage_role:role_code') }) }),
    groupName: z
      .string()
      .trim()
      .min(K_SIZE_1, { message: t('validate:required', { name: t('manage_role:role_name') }) }),
    note: z.string().trim(),
    status: z.string().trim().min(K_SIZE_1),
    permissions: z
      .object({
        permissionId: z.string().trim().min(K_SIZE_1),
        title: z.string().trim().min(K_SIZE_1),
        permissionCode: z.string().trim().min(K_SIZE_1)
      })
      .array()
  });
};

export type PermissionGroupForm = z.infer<ReturnType<typeof permissionGroupSchema>>;

export default function useManagePermissionGroupForm({
  isAddMode,
  isView
}: ManagePermissionGroupFormProps) {
  const { t } = useAppTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const loading = useSelector(selectRoleLoadingDetail);

  const id = searchParams.get('id');
  const optionStatus = [
    { value: STATUS.ACTIVE, label: t('common:status_active') },
    { value: STATUS.INACTIVE, label: t('common:status_inactive') }
  ];
  const action = useMemo(
    () => (isAddMode ? t('common:add_new') : isView ? t('common:view_detail') : t('common:edit')),
    [t, isAddMode, isView]
  );
  const [originPermissionGroup, setOriginPermissionGroup] = useState<PermissionGroupForm>();

  const permissionGroupForm = useForm<PermissionGroupForm>({
    mode: 'onTouched',
    defaultValues: {
      groupCode: '',
      groupName: '',
      note: '',
      status: ROLE_STATUS.ACTIVE,
      permissions: []
    },
    resolver: zodResolver(permissionGroupSchema(t))
  });

  const onSubmitSuccess = useCallback(
    (res: any, permissions: any) => {
      DebugUtils.logS(res);
      const roleId = isAddMode ? res?.data?.id : id;
      const showSuccessAndBack = () => {
        router.push(ROUTES.MANAGE_PERMISSION_GROUP);
        showToast({
          type: TYPE_TOAST.SUCCESS,
          content: t('manage_role:action_success', { action })
        });
      };
      // ADD MODE
      if (isAddMode) {
        if (permissions && permissions.length > 0) {
          const body = {
            roleId,
            permissionIds: permissions.map((p: any) => p.permissionCode)
          };

          dispatch({
            type: ASSIGN_PERMISSION,
            payload: {
              body,
              onSuccess: showSuccessAndBack,
              onFailed: onSubmitFailed
            }
          });

          return;
        }

        showSuccessAndBack();
        return;
      }
      // EDIT MODE
      const oldPermissionIds = originPermissionGroup?.permissions.map((p) => p.permissionCode);
      const newPermissionIds = permissions.map((p: any) => p?.permissionCode);
      const oldPermissionSet = new Set(oldPermissionIds);
      const newPermissionSet = new Set(newPermissionIds);
      const assignPermissionIds = newPermissionIds.filter((permissionCode: string) => {
        return !oldPermissionSet.has(permissionCode);
      });

      const removePermissionIds = oldPermissionIds?.filter((permissionCode) => {
        return !newPermissionSet.has(permissionCode);
      });

      const samePermissionIds = newPermissionIds.filter((permissionCode: string) => {
        return oldPermissionSet.has(permissionCode);
      });
      if (samePermissionIds.length > 0) {
        DebugUtils.logS('+++++++++ SAME PERMISSION +++++++++');
        showSuccessAndBack();
        return;
      }
      const callRemovePermission = () => {
        if (removePermissionIds?.length === 0) {
          showSuccessAndBack();
          return;
        }

        dispatch({
          type: REMOVE_PERMISSION,
          payload: {
            body: {
              roleId,
              permissionIds: removePermissionIds
            },
            onSuccess: showSuccessAndBack,
            onFailed: onSubmitFailed
          }
        });
      };

      if (assignPermissionIds.length > 0) {
        dispatch({
          type: ASSIGN_PERMISSION,
          payload: {
            body: {
              roleId,
              permissionIds: assignPermissionIds
            },
            onSuccess: callRemovePermission,
            onFailed: onSubmitFailed
          }
        });

        return;
      }

      callRemovePermission();
    },
    [t, router, action]
  );

  const onSubmitFailed = useCallback(() => {
    showToast({
      type: TYPE_TOAST.ERROR,
      content: t('manage_role:action_failed', { action })
    });
  }, [t, action]);

  const onSubmit = useCallback(
    (data: PermissionGroupForm) => {
      DebugUtils.logS(data);
      const type = isAddMode ? ADD_ROLE : EDIT_ROLE;
      const baseBody: AddRoleReq = {
        code: data.groupCode,
        name: data.groupName,
        status: data.status,
        description: data.note
      };
      const body = isAddMode
        ? baseBody
        : ({
            ...baseBody,
            roleId: id
          } as EditRoleReq);
      dispatch({
        type,
        payload: {
          body,
          onSuccess: (res: any) => onSubmitSuccess(res, data.permissions),
          onFailed: onSubmitFailed
        }
      });
    },
    [onSubmitSuccess, onSubmitFailed, isAddMode, id]
  );

  const onBack = useCallback(() => router.back(), [router]);

  const onEdit = useCallback(
    () => router.push(`${ROUTES.MANAGE_PERMISSION_GROUP_EDIT}?id=${id}`),
    [router, id]
  );
  const getRoleDetailSuccess = useCallback(
    (response: GetRoleDetailRes) => {
      const role = response.data;
      if (role) {
        permissionGroupForm.reset({
          groupCode: role.code,
          groupName: role.name,
          note: role.description,
          status: role.status,
          permissions: role.permissions.map((p) => ({
            permissionId: p,
            title: p,
            permissionCode: p
          }))
        });
        setOriginPermissionGroup({
          groupCode: role.code,
          groupName: role.name,
          note: role.description,
          status: role.status,
          permissions: role.permissions.map((p) => ({
            permissionId: p,
            title: p,
            permissionCode: p
          }))
        });
      }
    },
    [permissionGroupForm]
  );

  useEffect(() => {
    if (!isAddMode && id) {
      const body: GetRoleDetailReq = {
        roleId: id
      };
      dispatch({
        type: GET_ROLE_DETAIL,
        payload: {
          body,
          onSuccess: getRoleDetailSuccess
        }
      });
    }
  }, [isAddMode, id, getRoleDetailSuccess]);
  return {
    t,
    action,
    onSubmit,
    permissionGroupForm,
    loading,
    onBack,
    onEdit,
    optionStatus
  };
}
