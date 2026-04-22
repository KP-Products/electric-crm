import { K_SIZE_0, K_SIZE_1, MAX_PAGE_SIZE } from '@constant';
import { zodResolver } from '@hookform/resolvers/zod';
import { GET_LIST_ROLE } from '@redux-action-type/role';
import { ADD_USER, EDIT_USER } from '@redux-action-type/user';
import { dispatch } from '@redux-common';
import { selectRoleList } from '@redux-selector/role';
import { selectUserList, selectUserLoadingDetail } from '@redux-selector/user';
import { showToast } from 'components/toast';
import { TYPE_TOAST } from 'components/toast/type';
import { ROUTES } from 'config/routes';
import { GetListRoleReq } from 'model/role';
import { AddUserReq, EditUserReq } from 'model/user';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { DebugUtils } from 'utils/debug-utils';
import { TypedT, useAppTranslation } from 'utils/i18n/useAppTranslation';
import { z } from 'zod';

const userSchema = (t: TypedT) => {
  return z.object({
    username: z
      .string()
      .trim()
      .min(K_SIZE_1, { message: t('validate:required', { name: t('login_screen:username') }) }),
    fullName: z.string().trim(),
    email: z.string().trim(),
    phone: z.string().trim(),
    status: z
      .string()
      .trim()
      .min(K_SIZE_1, { message: t('validate:required', { name: t('common:status') }) }),
    roleId: z
      .string()
      .trim()
      .min(K_SIZE_1, { message: t('validate:required', { name: t('manage_user:role') }) }),
    unitId: z.string().trim(),
    departmentId: z.string().trim(),
    permissions: z
      .object({
        permissionId: z.string().trim().min(K_SIZE_1),
        title: z.string().trim().min(K_SIZE_1)
      })
      .array()
  });
};

export type UserForm = z.infer<ReturnType<typeof userSchema>>;

export interface ManageUserFormProps {
  isAddMode: boolean;
  isView: boolean;
}
export default function useManageUserForm({ isAddMode, isView }: ManageUserFormProps) {
  const { t } = useAppTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const userList = useSelector(selectUserList);
  const roleList = useSelector(selectRoleList);
  const loading = useSelector(selectUserLoadingDetail);

  const id = searchParams.get('id');

  const userDetail = useMemo(() => {
    if (!id) return;
    return userList.find((user) => user?.id === id);
  }, [id, userList]);

  const action = useMemo(
    () => (isAddMode ? t('common:add_new') : isView ? t('common:view_detail') : t('common:edit')),
    [t, isAddMode, isView]
  );

  const roleOptions = useMemo(
    () => roleList.map((role) => ({ value: role.roleId, label: role.name })),
    [roleList]
  );

  const getUserPermission = useCallback(
    (roleId?: string) => {
      return (roleList.find((role) => role.roleId === roleId)?.permissions || []).map(
        (p) =>
          ({ permissionId: p.permissionId, title: p.action }) as UserForm['permissions'][number]
      );
    },
    [roleList]
  );

  const userForm = useForm<UserForm>({
    mode: 'onTouched',
    defaultValues: {
      username: '',
      fullName: '',
      email: '',
      phone: '',
      status: '',
      roleId: '',
      unitId: '',
      departmentId: '',
      permissions: []
    },
    resolver: zodResolver(userSchema(t))
  });

  useEffect(() => {
    if (!isAddMode) {
      if (!userDetail) {
        return router.replace(ROUTES.MANAGE_USER);
      } else {
        userForm.reset({
          ...userDetail,
          roleId: userDetail?.roleGroup?.roleId || '',
          unitId: userDetail?.unit?.id || '',
          departmentId: userDetail?.department?.id || '',
          permissions: getUserPermission(userDetail?.roleGroup?.roleId)
        });
      }
    }
  }, [router, userDetail, isAddMode, userForm, getUserPermission]);

  useEffect(() => {
    const body: GetListRoleReq = {
      page: K_SIZE_0,
      size: MAX_PAGE_SIZE
    };
    dispatch({ type: GET_LIST_ROLE, payload: { body } });
  }, []);

  const onSubmitSuccess = useCallback(
    (res: any) => {
      DebugUtils.logS(res);
      router.push(ROUTES.MANAGE_USER);
      showToast({
        type: TYPE_TOAST.SUCCESS,
        content: t('manage_user:action_success', { action })
      });
    },
    [t, router, action]
  );

  const onSubmitFailed = useCallback(() => {
    showToast({
      type: TYPE_TOAST.ERROR,
      content: t('manage_user:action_failed', { action })
    });
  }, [t, action]);

  const onSubmit = useCallback(
    (data: UserForm) => {
      DebugUtils.logS(data);
      if (isAddMode) {
        const body: AddUserReq = {
          username: data.username,
          email: data.email,
          fullName: data.fullName,
          phone: data.phone,
          unitId: data.unitId,
          departmentId: data.departmentId,
          status: data.status,
          roleId: data.roleId
        };
        dispatch({
          type: ADD_USER,
          payload: {
            body,
            onSuccess: onSubmitSuccess,
            onFailed: onSubmitFailed
          }
        });
      } else if (id) {
        const body: EditUserReq = {
          userId: id,
          status: data.status,
          roleId: data.roleId
        };
        dispatch({
          type: EDIT_USER,
          payload: {
            body,
            onSuccess: onSubmitSuccess,
            onFailed: onSubmitFailed
          }
        });
      }
    },
    [onSubmitSuccess, onSubmitFailed, isAddMode, id]
  );

  const onBack = useCallback(() => router.back(), [router]);

  const onEdit = useCallback(
    () => router.push(`${ROUTES.MANAGE_USER_EDIT}?id=${id}`),
    [router, id]
  );

  return {
    t,
    action,
    onSubmit,
    userForm,
    loading,
    onBack,
    onEdit,
    roleOptions,
    getUserPermission
  };
}
