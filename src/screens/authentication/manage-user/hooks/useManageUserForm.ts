import { K_SIZE_1, MAX_PAGE_SIZE } from '@constant';
import { zodResolver } from '@hookform/resolvers/zod';
import { SEARCH_BRANCH } from '@redux-action-type/branch';
import { ADD_USER, EDIT_USER } from '@redux-action-type/user';
import { dispatch } from '@redux-common';
import { selectBranchList } from '@redux-selector/branch';
import { selectRoleList } from '@redux-selector/role';
import { selectUserList, selectUserLoadingDetail } from '@redux-selector/user';
import { showToast } from 'components/toast';
import { TYPE_TOAST } from 'components/toast/type';
import { ROUTES } from 'config/routes';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { DebugUtils } from 'utils/debug-utils';
import { TypedT, useAppTranslation } from 'utils/i18n/useAppTranslation';
import { z } from 'zod';
import { GET_LIST_ROLE } from '@redux-action-type/role';
import {
  buildBranchOptions,
  buildCreateUserBody,
  buildEditUserBody
} from 'screens/authentication/manage-user/utils/method';

const userSchema = (t: TypedT, isAddMode: boolean) => {
  return z.object({
    username: z
      .string()
      .trim()
      .min(K_SIZE_1, { message: t('validate:required', { name: t('login_screen:username') }) }),

    password: isAddMode
      ? z
          .string()
          .trim()
          .min(K_SIZE_1, { message: t('validate:required', { name: t('login_screen:password') }) })
      : z.string().trim().optional(),

    email: z.string().trim(),
    status: z.string().trim(),
    roleId: z.string().trim().optional(),
    branchId: z.string().trim(),

    permissions: z
      .object({
        permissionId: z.string().trim().min(K_SIZE_1),
        title: z.string().trim().min(K_SIZE_1),
        permissionCode: z.string().trim().min(K_SIZE_1)
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
  const branchList = useSelector(selectBranchList);
  const loading = useSelector(selectUserLoadingDetail);
  const submittingRef = useRef<boolean>(false);

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
    () => roleList.map((role) => ({ value: role.id, label: role.name })),
    [roleList]
  );
  const branchOptions = useMemo(
    () => buildBranchOptions(branchList, userDetail),
    [branchList, userDetail]
  );
  const getUserPermission = useCallback(
    (roleId?: string) => {
      return (roleList.find((role) => role.id === roleId)?.permissions || []).map(
        (p) => ({ permissionId: p, title: p, permissionCode: p }) as UserForm['permissions'][number]
      );
    },
    [roleList]
  );

  const userForm = useForm<UserForm>({
    mode: 'onTouched',
    defaultValues: {
      username: '',
      password: '',
      email: '',
      roleId: '',
      branchId: '',
      status: '',
      permissions: []
    },
    resolver: zodResolver(userSchema(t, isAddMode))
  });

  useEffect(() => {
    if (!isAddMode) {
      if (!userDetail) {
        return router.replace(ROUTES.MANAGE_USER);
      } else {
        userForm.reset({
          ...userDetail,
          roleId: userDetail?.roles?.map((r) => r).join(',') || ''
        });
      }
    }
  }, [router, userDetail, isAddMode, userForm]);

  useEffect(() => {
    dispatch({ type: GET_LIST_ROLE, payload: {} });
    dispatch({
      type: SEARCH_BRANCH,
      payload: {
        body: {
          page: 0,
          size: MAX_PAGE_SIZE
        }
      }
    });
  }, []);

  const onSubmitSuccess = useCallback(
    (res: any) => {
      submittingRef.current = false;
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
    submittingRef.current = false;
    showToast({
      type: TYPE_TOAST.ERROR,
      content: t('manage_user:action_failed', { action })
    });
  }, [t, action]);

  const onSubmit = useCallback(
    (data: UserForm) => {
      if (submittingRef.current) return;

      DebugUtils.logS(data);
      if (isAddMode) {
        submittingRef.current = true;
        dispatch({
          type: ADD_USER,
          payload: {
            body: buildCreateUserBody(data),
            onSuccess: onSubmitSuccess,
            onFailed: onSubmitFailed
          }
        });
      } else if (id) {
        submittingRef.current = true;
        dispatch({
          type: EDIT_USER,
          payload: {
            body: buildEditUserBody(id, data),
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
    branchOptions,
    getUserPermission
  };
}
