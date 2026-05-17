import { K_SIZE_1 } from '@constant';
import { zodResolver } from '@hookform/resolvers/zod';
import { dispatch } from '@redux-common';
import { selectRoleList } from '@redux-selector/role';
import { selectUserList, selectUserLoadingDetail } from '@redux-selector/user';
import { showToast } from 'components/toast';
import { TYPE_TOAST } from 'components/toast/type';
import { ROUTES } from 'config/routes';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { DebugUtils } from 'utils/debug-utils';
import { TypedT, useAppTranslation } from 'utils/i18n/useAppTranslation';
import { z } from 'zod';
import { AddMeterReq } from '../../../../model/meter';
import { ADD_METER, EDIT_METER } from '@redux-action-type/meter';

const userSchema = (t: TypedT) => {
  return z.object({
    meterCode: z
      .string()
      .trim()
      .min(K_SIZE_1, { message: t('validate:required', { name: 'Mã công tơ' }) }),
    customerId: z
      .string()
      .trim()
      .min(K_SIZE_1, { message: t('validate:required', { name: 'Mã khách hàng' }) }),
    installDate: z.string().trim(),
    voltageLevel: z.string().trim(),
    voltageType: z.string().trim(),
    roleId: z.string().trim().optional()
  });
};

export type UserForm = z.infer<ReturnType<typeof userSchema>>;

export interface ManageUserFormProps {
  isAddMode: boolean;
  isView: boolean;
}
export default function useManageMeterForm({ isAddMode, isView }: ManageUserFormProps) {
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
    () => roleList.map((role) => ({ value: role.id, label: role.name })),
    [roleList]
  );

  const userForm = useForm<UserForm>({
    mode: 'onTouched',
    defaultValues: {
      meterCode: '',
      customerId: '',
      installDate: '',
      voltageLevel: '',
      voltageType: ''
    },
    resolver: zodResolver(userSchema(t))
  });

  useEffect(() => {
    if (!isAddMode) {
      if (!userDetail) {
        return router.replace(ROUTES.MANAGE_USER);
      } else {
        // userForm.reset({
        //   ...userDetail
        //   // roleId: userDetail?.roles?.roleId || ''
        // });
      }
    }
  }, [router, userDetail, isAddMode, userForm]);

  const onSubmitSuccess = useCallback(
    (res: any) => {
      DebugUtils.logS(res);
      router.push(ROUTES.METER_MANAGEMENT);
      showToast({
        type: TYPE_TOAST.SUCCESS,
        content: action + ' công tơ thành công'
      });
    },
    [t, router, action]
  );

  const onSubmitFailed = useCallback(() => {
    showToast({
      type: TYPE_TOAST.ERROR,
      content: action + ' công tơ thất bại'
    });
  }, [t, action]);

  const onSubmit = useCallback(
    (data: UserForm) => {
      DebugUtils.logS(data);
      if (isAddMode) {
        const body: AddMeterReq = {
          meterCode: data.meterCode,
          customerId: data.customerId,
          installationDate: '2026-05-10',
          voltageLevel: data.voltageLevel,
          multiplier: 0,
          voltageType: data.voltageType,
          initialReading: 0,
          status: 'ACTIVE'
        };
        dispatch({
          type: ADD_METER,
          payload: {
            body,
            onSuccess: onSubmitSuccess,
            onFailed: onSubmitFailed
          }
        });
      } else if (id) {
        const body: AddMeterReq = {
          meterCode: 'string',
          customerId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
          installationDate: '2026-05-10',
          voltageLevel: 'string',
          multiplier: 0,
          voltageType: 'string',
          initialReading: 0,
          status: 'string'
        };
        dispatch({
          type: EDIT_METER,
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
    roleOptions
  };
}
