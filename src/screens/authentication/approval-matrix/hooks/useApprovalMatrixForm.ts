import { K_SIZE_0, K_SIZE_1 } from '@constant';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  EDIT_APPROVAL_MATRIX,
  GET_APPROVAL_MATRIX_DETAIL
} from '@redux-action-type/approval-matrix';
import { GET_LIST_USER } from '@redux-action-type/user';
import { dispatch } from '@redux-common';
import { selectApprovalMatrixList } from '@redux-selector/approval-matrix';
import { selectUserList, selectUserLoadingDetail } from '@redux-selector/user';
import { showToast } from 'components/toast';
import { TYPE_TOAST } from 'components/toast/type';
import { ROUTES } from 'config/routes';
import {
  EditApprovalMatrixReq,
  GetApprovalMatrixDetailReq,
  GetApprovalMatrixDetailRes
} from 'model/approval-matrix';
import { Permission } from 'model/role';
import { UserSearchItem } from 'model/user';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { SelectUserModalRef } from 'screens/authentication/approval-matrix/form/components/SelectUserModal';
import { ViewUserModalRef } from 'screens/authentication/approval-matrix/form/components/ViewUserModal';
import {
  mapLevelFromServer,
  mapLevelToServer
} from 'screens/authentication/approval-matrix/utils/method';
import { DebugUtils } from 'utils/debug-utils';
import { useAppTranslation } from 'utils/i18n/useAppTranslation';
import { z } from 'zod';

const approvalMatrixSchema = () => {
  return z.object({
    function: z.custom<Permission>(),
    approvalLevel: z
      .object({
        user: z.custom<UserSearchItem>().array().min(K_SIZE_1)
      })
      .array()
      .min(K_SIZE_1)
  });
};

export type ApprovalMatrixForm = z.infer<ReturnType<typeof approvalMatrixSchema>>;

export interface ApprovalMatrixFormProps {
  isView: boolean;
}

export default function useApprovalMatrixForm({ isView }: ApprovalMatrixFormProps) {
  const { t } = useAppTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const userList = useSelector(selectUserList);
  const functionList = useSelector(selectApprovalMatrixList);
  const loading = useSelector(selectUserLoadingDetail);

  const id = searchParams.get('id');
  const functionDetail = useMemo(() => {
    return functionList.find((f) => f.id === id);
  }, [id, functionList]);

  const action = useMemo(() => (isView ? t('common:view_detail') : t('common:edit')), [t, isView]);

  const selectUserModalRef = useRef<SelectUserModalRef>(null);
  const viewUserModalRef = useRef<ViewUserModalRef>(null);

  const defaultApprovalLevel = useMemo(() => ({ user: [] }), []);

  const approvalMatrixForm = useForm<ApprovalMatrixForm>({
    mode: 'onTouched',
    defaultValues: {
      function: functionDetail,
      approvalLevel: []
    },
    resolver: zodResolver(approvalMatrixSchema())
  });

  const {
    fields: approvalLevel,
    append,
    remove
  } = useFieldArray({
    control: approvalMatrixForm.control,
    name: 'approvalLevel'
  });

  const onAddLevel = useCallback(
    () => append(defaultApprovalLevel),
    [defaultApprovalLevel, append]
  );

  const onDeleteLevel = useCallback((index: number) => remove(index), [remove]);

  const onSubmitSuccess = useCallback(
    (res: any) => {
      DebugUtils.logS(res);
      router.push(ROUTES.APPROVAL_MATRIX);
      showToast({
        type: TYPE_TOAST.SUCCESS,
        content: t('approval_matrix:action_success', { action })
      });
    },
    [t, router, action]
  );

  const onSubmitFailed = useCallback(() => {
    showToast({
      type: TYPE_TOAST.ERROR,
      content: t('approval_matrix:action_failed', { action })
    });
  }, [t, action]);

  const onSubmit = useCallback(
    (data: ApprovalMatrixForm) => {
      DebugUtils.logS(data);
      const body: EditApprovalMatrixReq = {
        actionId: data.function.actionCode,
        levels: data.approvalLevel.map(mapLevelToServer)
      };
      dispatch({
        type: EDIT_APPROVAL_MATRIX,
        payload: {
          body,
          onSuccess: onSubmitSuccess,
          onFailed: onSubmitFailed
        }
      });
    },
    [onSubmitSuccess, onSubmitFailed]
  );

  const onBack = useCallback(() => router.back(), [router]);

  const onEdit = useCallback(
    () => router.push(`${ROUTES.APPROVAL_MATRIX_EDIT}?id=${id}`),
    [router, id]
  );

  useEffect(() => {
    if (userList.length === K_SIZE_0) dispatch({ type: GET_LIST_USER, payload: {} });
  }, [userList.length]);

  const getApprovalMatrixDetailSuccess = useCallback(
    (
      response: GetApprovalMatrixDetailRes,
      functionDetail: Permission,
      userList: UserSearchItem[]
    ) => {
      const approvalMatrix = response.data?.[0];
      if (approvalMatrix) {
        let approvalLevel: ApprovalMatrixForm['approvalLevel'];
        if (approvalMatrix.levels?.length > K_SIZE_0) {
          approvalLevel = approvalMatrix.levels.map((item) => mapLevelFromServer(item, userList));
        } else if (isView) {
          approvalLevel = [];
        } else {
          approvalLevel = [defaultApprovalLevel];
        }
        approvalMatrixForm.reset({
          function: functionDetail,
          approvalLevel
        });
      }
    },
    [approvalMatrixForm, defaultApprovalLevel, isView]
  );

  useEffect(() => {
    if (!functionDetail?.actionCode) {
      return router.replace(ROUTES.APPROVAL_MATRIX);
    }
    if (userList.length === K_SIZE_0) return;
    const body: GetApprovalMatrixDetailReq = {
      actionId: functionDetail?.actionCode || ''
    };

    dispatch({
      type: GET_APPROVAL_MATRIX_DETAIL,
      payload: {
        body,
        onSuccess: (response: GetApprovalMatrixDetailRes) =>
          getApprovalMatrixDetailSuccess(response, functionDetail, userList)
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [functionDetail?.action, getApprovalMatrixDetailSuccess, router, userList.length]);

  return {
    t,
    action,
    onSubmit,
    approvalMatrixForm,
    approvalLevel,
    onAddLevel,
    onDeleteLevel,
    loading,
    onBack,
    onEdit,
    selectUserModalRef,
    viewUserModalRef
  };
}
