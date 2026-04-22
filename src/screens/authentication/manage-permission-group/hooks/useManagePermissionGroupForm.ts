import { K_SIZE_1 } from '@constant';
import { zodResolver } from '@hookform/resolvers/zod';
import { ADD_ROLE, EDIT_ROLE, GET_ROLE_DETAIL } from '@redux-action-type/role';
import { dispatch } from '@redux-common';
import { selectRoleLoadingDetail } from '@redux-selector/role';
import { showToast } from 'components/toast';
import { TYPE_TOAST } from 'components/toast/type';
import { ROUTES } from 'config/routes';
import { AddRoleReq, EditRoleReq, GetRoleDetailReq, GetRoleDetailRes } from 'model/role';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { ROLE_STATUS } from 'screens/authentication/manage-permission-group/utils/constant';
import { DebugUtils } from 'utils/debug-utils';
import { useAppTranslation } from 'utils/i18n';
import { TypedT } from 'utils/i18n/useAppTranslation';
import { z } from 'zod';

export interface ManagePermissionGroupFormProps {
  isAddMode: boolean;
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
        title: z.string().trim().min(K_SIZE_1)
      })
      .array()
      .min(K_SIZE_1)
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

  const action = useMemo(
    () => (isAddMode ? t('common:add_new') : isView ? t('common:view_detail') : t('common:edit')),
    [t, isAddMode, isView]
  );

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
    (res: any) => {
      DebugUtils.logS(res);
      router.push(ROUTES.MANAGE_PERMISSION_GROUP);
      showToast({
        type: TYPE_TOAST.SUCCESS,
        content: t('manage_role:action_success', { action })
      });
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
        description: data.note,
        permissionIds: data.permissions.map((p) => p.permissionId)
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
          onSuccess: onSubmitSuccess,
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
            permissionId: p.permissionId,
            title: p.action
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
    onEdit
  };
}
