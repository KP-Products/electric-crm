import { DEFAULT_PAGE_SIZE, FILE_EXT, K_SIZE_0, K_SIZE_1 } from '@constant';
import { ADD_LIST_USER, GET_USER_TEMPLATE, UPLOAD_USER } from '@redux-action-type/user';
import { dispatch } from '@redux-common';
import { selectUserLoadingDetail, selectUserLoadingList } from '@redux-selector/user';
import { showToast } from 'components/toast';
import { TYPE_TOAST } from 'components/toast/type';
import { ROUTES } from 'config/routes';
import { GetTemplateRes } from 'model/master-data';
import { AddListUserReq, UploadUserRes, UserUpload } from 'model/user';
import { useRouter } from 'next/navigation';
import type { UploadRequestOption } from 'rc-upload/lib/interface';
import { useCallback, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { USER_STATUS_UPLOAD } from 'screens/authentication/manage-user/utils/constant';
import { DebugUtils } from 'utils/debug-utils';
import { DownloadUtils } from 'utils/download.utils';
import { useAppTranslation } from 'utils/i18n';

export default function useManageUserUpload() {
  const { t } = useAppTranslation();
  const router = useRouter();
  const loadingUserList = useSelector(selectUserLoadingList);
  const loadingUserDetail = useSelector(selectUserLoadingDetail);

  const [userUploaded, setUserUploaded] = useState<UserUpload[]>([]);
  const [isError, setIsError] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(K_SIZE_1);

  const isEmpty = useMemo(() => userUploaded.length === K_SIZE_0, [userUploaded]);

  const pagination = useMemo(
    () => ({
      current: currentPage,
      total: userUploaded.length,
      pageSize: DEFAULT_PAGE_SIZE,
      onChange: (page: number) => setCurrentPage(page),
      showSizeChanger: false
    }),
    [currentPage, userUploaded]
  );

  const userPaginated = useMemo(() => {
    const start = (pagination.current - K_SIZE_1) * pagination.pageSize;
    return userUploaded.slice(start, start + pagination.pageSize);
  }, [userUploaded, pagination]);

  const onUploadSuccess = useCallback((response: UploadUserRes) => {
    DebugUtils.logS(response);
    const dataUploaded = response.data || [];
    const errorUsers = dataUploaded.filter(
      (user) => user.statusUpload === USER_STATUS_UPLOAD.FAILED
    );
    const hasError = errorUsers.length > K_SIZE_0;
    setIsError(hasError);
    setUserUploaded(hasError ? errorUsers : dataUploaded);
  }, []);

  const onUploadFailed = useCallback(() => {
    showToast({
      type: TYPE_TOAST.ERROR,
      content: t('common:upload_fail')
    });
  }, [t]);

  const onUpload = useCallback(
    ({ file }: UploadRequestOption) => {
      DebugUtils.logS(file);
      const formData = new FormData();
      formData.append('file', file as File);
      dispatch({
        type: UPLOAD_USER,
        payload: {
          body: formData,
          onSuccess: onUploadSuccess,
          onFailed: onUploadFailed
        }
      });
    },
    [onUploadSuccess, onUploadFailed]
  );

  const onSubmitSuccess = useCallback(
    (response: UploadUserRes) => {
      DebugUtils.logS(response);
      router.push(ROUTES.MANAGE_USER);
      showToast({
        type: TYPE_TOAST.SUCCESS,
        content: t('manage_user:action_success', { action: t('common:add_new') })
      });
    },
    [t, router]
  );

  const onSubmitFailed = useCallback(() => {
    showToast({
      type: TYPE_TOAST.ERROR,
      content: t('manage_user:action_failed', { action: t('common:add_new') })
    });
  }, [t]);

  const onSubmit = useCallback(() => {
    DebugUtils.logS(userUploaded);
    const body: AddListUserReq = userUploaded.map((user) => ({
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      unitId: user.unitId,
      departmentId: user.departmentId,
      status: user.statusCode,
      roleId: user.roleId
    }));
    dispatch({
      type: ADD_LIST_USER,
      payload: {
        body,
        onSuccess: onSubmitSuccess,
        onFailed: onSubmitFailed
      }
    });
  }, [userUploaded, onSubmitSuccess, onSubmitFailed]);

  const onDownloadTemplateSuccess = useCallback(
    (response: GetTemplateRes) => {
      if (response.data?.base64Data) {
        DownloadUtils.downloadBase64Excel(
          response.data.base64Data,
          t('manage_user:download_template_file_name', { ext: FILE_EXT.EXCEL })
        );
        showToast({
          type: TYPE_TOAST.SUCCESS,
          content: t('common:download_success')
        });
      }
    },
    [t]
  );

  const onDownloadTemplate = useCallback(() => {
    dispatch({
      type: GET_USER_TEMPLATE,
      payload: {
        onSuccess: onDownloadTemplateSuccess,
        onFailed: () => {
          showToast({
            type: TYPE_TOAST.ERROR,
            content: t('common:msg_failed', { action: t('common:download') })
          });
        }
      }
    });
  }, [t, onDownloadTemplateSuccess]);

  const onBack = useCallback(() => router.back(), [router]);

  return {
    t,
    isError,
    isEmpty,
    userPaginated,
    loadingUserList,
    pagination,
    onUpload,
    onDownloadTemplate,
    onSubmit,
    onBack,
    loadingUserDetail
  };
}
