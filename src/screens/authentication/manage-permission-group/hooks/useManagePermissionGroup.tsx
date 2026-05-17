import { CONSTANTS, DEFAULT_PAGE_SIZE, FILE_EXT, K_SIZE_1 } from '@constant';
import { DELETE_ROLE, DOWNLOAD_LIST_ROLE, GET_LIST_ROLE_SEARCH } from '@redux-action-type/role';
import { dispatch } from '@redux-common';
import { selectRoleList, selectRoleLoadingList, selectRoleTotal } from '@redux-selector/role';
import { showDialog } from 'components/dialog';
import { TYPE_ACTION, TYPE_MESSAGE } from 'components/dialog/type';
import { showToast } from 'components/toast';
import { TYPE_TOAST } from 'components/toast/type';
import { ROUTES } from 'config/routes';
import { debounce } from 'lodash';
import { DeleteRoleReq, DownloadListRoleRes, GetListRoleReq, Role } from 'model/role';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { DownloadUtils } from 'utils/download.utils';
import { useAppTranslation } from 'utils/i18n';

export default function useManagePermissionGroup() {
  const { t } = useAppTranslation();
  const router = useRouter();
  const roleList = useSelector(selectRoleList);
  const totalRole = useSelector(selectRoleTotal);
  const loadingRoleList = useSelector(selectRoleLoadingList);

  const defaultFilter = useMemo(() => ({ search: '' }), []);
  const [filter, setFilter] = useState(defaultFilter);
  const [filterApplied, setFilterApplied] = useState(defaultFilter);
  const [currentPage, setCurrentPage] = useState<number>(K_SIZE_1);

  const pagination = useMemo(
    () => ({
      current: currentPage,
      total: totalRole,
      pageSize: DEFAULT_PAGE_SIZE,
      onChange: (page: number) => setCurrentPage(page),
      showSizeChanger: false
    }),
    [currentPage, totalRole]
  );

  const buildBodyListRole = useCallback(
    (filter: typeof defaultFilter, page: number): GetListRoleReq => {
      return {
        page: page - K_SIZE_1,
        size: DEFAULT_PAGE_SIZE,
        filter: filter.search
      };
    },
    []
  );

  useEffect(() => {
    dispatch({
      type: GET_LIST_ROLE_SEARCH,
      payload: { body: buildBodyListRole(filterApplied, currentPage) }
    });
  }, [filterApplied, currentPage, buildBodyListRole]);

  const onApplySearch = useCallback((search: string) => {
    setFilterApplied((prev) => ({ ...prev, search }));
    setCurrentPage(K_SIZE_1);
  }, []);

  const debouncedApplySearch = useMemo(
    () => debounce(onApplySearch, CONSTANTS.TIME_DEBOUNCE),
    [onApplySearch]
  );

  useEffect(() => {
    return () => {
      debouncedApplySearch.cancel();
    };
  }, [debouncedApplySearch]);

  const onAdd = useCallback(() => {
    return router.push(ROUTES.MANAGE_PERMISSION_GROUP_ADD);
  }, [router]);

  const onDownloadSuccess = useCallback(
    (response: DownloadListRoleRes) => {
      if (response.data) {
        DownloadUtils.downloadBase64Excel(
          response.data,
          t('manage_role:download_file_name', { ext: FILE_EXT.EXCEL })
        );
        showToast({
          type: TYPE_TOAST.SUCCESS,
          content: t('common:download_success')
        });
      }
    },
    [t]
  );

  const onDownload = useCallback(() => {
    dispatch({
      type: DOWNLOAD_LIST_ROLE,
      payload: {
        body: buildBodyListRole(filterApplied, currentPage),
        onSuccess: onDownloadSuccess,
        onFailed: () => {
          showToast({
            type: TYPE_TOAST.ERROR,
            content: t('common:msg_failed', { action: t('common:download') })
          });
        }
      }
    });
  }, [t, filterApplied, currentPage, buildBodyListRole, onDownloadSuccess]);

  const onEdit = useCallback(
    (roleId: string) => {
      return router.push(`${ROUTES.MANAGE_PERMISSION_GROUP_EDIT}?id=${roleId}`);
    },
    [router]
  );

  const onDeleteSuccess = useCallback(() => {
    const body: GetListRoleReq = {
      page: currentPage - K_SIZE_1,
      size: DEFAULT_PAGE_SIZE,
      filter: filterApplied.search
    };
    dispatch({ type: GET_LIST_ROLE_SEARCH, payload: { body } });
    return showToast({
      type: TYPE_TOAST.SUCCESS,
      content: t('manage_role:action_success', { action: t('common:delete') })
    });
  }, [t, filterApplied, currentPage]);

  const onDelete = useCallback(
    (selectedRole?: Role) => {
      return showDialog({
        title: t('common:delete_confirm'),
        content: (
          <>
            Bạn có chắc chắn xoá nhóm quyền <strong>{selectedRole?.name}</strong> này?
          </>
        ),
        type: TYPE_MESSAGE.ALERT,
        actions: [
          {
            title: t('common:agree'),
            type: TYPE_ACTION.PRIMARY,
            onPress: () => {
              const body: DeleteRoleReq = { roleId: selectedRole?.id || '' };
              dispatch({ type: DELETE_ROLE, payload: { body, onSuccess: onDeleteSuccess } });
            }
          },
          {
            title: t('common:cancel'),
            type: TYPE_ACTION.SECONDARY
          }
        ]
      });
    },
    [t, onDeleteSuccess]
  );

  return {
    t,
    router,
    filter,
    setFilter,
    debouncedApplySearch,
    roleList,
    loadingRoleList,
    pagination,
    onAdd,
    onDownload,
    onEdit,
    onDelete
  };
}
