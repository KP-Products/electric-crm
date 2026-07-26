import { DEFAULT_PAGE_SIZE, FILE_EXT, K_SIZE_1 } from '@constant';
import { DELETE_USER, DOWNLOAD_LIST_USER, GET_USER_SEARCH_LIST } from '@redux-action-type/user';
import { selectRoleList } from '@redux-selector/role';
import { selectUserLoadingList } from '@redux-selector/user';
import { showToast } from 'components/toast';
import { TYPE_TOAST } from 'components/toast/type';
import {
  DeleteUserReq,
  DownloadListUserRes,
  GetListUserReq,
  User,
  UserSearchItem
} from 'model/user';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DownloadUtils } from 'utils/download.utils';
import { useAppTranslation } from 'utils/i18n';
import { userActions } from '@redux-slice/user';
import { showDialog } from '../../../../components/dialog';
import { TYPE_ACTION, TYPE_MESSAGE } from '../../../../components/dialog/type';

export interface UserFilterForm {
  username: string;
  fullName: string;
  unitId: string;
  departmentId: string;
  status: string;
  roleId: string;
  email: string;
}

export default function useManageUser() {
  const { t } = useAppTranslation();
  const router = useRouter();
  const loadingUserList = useSelector(selectUserLoadingList);
  const roleList = useSelector(selectRoleList);
  const dispatch = useDispatch();
  const defaultFilter: UserFilterForm = useMemo(
    () => ({
      username: '',
      fullName: '',
      unitId: '',
      departmentId: '',
      status: '',
      roleId: '',
      email: ''
    }),
    []
  );
  const [filter, setFilter] = useState<UserFilterForm>(defaultFilter);
  const [filterApplied, setFilterApplied] = useState<UserFilterForm>(defaultFilter);
  const [currentPage, setCurrentPage] = useState<number>(K_SIZE_1);
  const [userList, setUserList] = useState<UserSearchItem[]>([]);
  const [totalUser, setTotalUser] = useState<number>(0);

  const roleOptions = useMemo(
    () => roleList.map((role) => ({ value: role.id, label: role.name })),
    [roleList]
  );

  const pagination = useMemo(
    () => ({
      current: currentPage,
      total: totalUser,
      pageSize: DEFAULT_PAGE_SIZE,
      onChange: (page: number) => setCurrentPage(page),
      showSizeChanger: false
    }),
    [currentPage, totalUser]
  );

  const userPaginated = userList;

  const buildBodyListUser = useCallback((filter: UserFilterForm, page: number): GetListUserReq => {
    const normalizeFilterApplied = Object.fromEntries(
      Object.entries(filter).filter(([_, value]) => value)
    );
    return {
      page: page - K_SIZE_1,
      size: DEFAULT_PAGE_SIZE,
      ...normalizeFilterApplied
    };
  }, []);

  const onGetUserSearchListSuccess = useCallback(
    (response: any) => {
      const items = Array.isArray(response?.data?.items) ? response.data.items : [];
      const sortedItems = [...items].sort(
        (a: UserSearchItem, b: UserSearchItem) =>
          new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime()
      );

      setUserList(sortedItems);
      dispatch(userActions.setUserList(sortedItems));
      setTotalUser(response?.data?.total || 0);
    },
    [dispatch]
  );

  const onGetUserSearchListFailed = useCallback(() => {
    setUserList([]);
    setTotalUser(0);
  }, []);

  const getUserSearchList = useCallback(
    (page: number) => {
      dispatch({
        type: GET_USER_SEARCH_LIST,
        payload: {
          body: buildBodyListUser(filterApplied, page),
          onSuccess: onGetUserSearchListSuccess,
          onFailed: onGetUserSearchListFailed
        }
      });
    },
    [
      dispatch,
      filterApplied,
      buildBodyListUser,
      onGetUserSearchListSuccess,
      onGetUserSearchListFailed
    ]
  );
  useEffect(() => {
    getUserSearchList(currentPage);
  }, [currentPage, getUserSearchList]);

  // useEffect(() => {
  //   const body: GetListRoleReq = {
  //     page: K_SIZE_0,
  //     size: MAX_PAGE_SIZE
  //   };
  //   dispatch({ type: GET_LIST_ROLE, payload: { body } });
  // }, []);

  const onChangeFilter = useCallback((key: keyof UserFilterForm, value: string) => {
    setFilter((prev) => ({ ...prev, [key]: value }));
  }, []);

  const onApplyFilter = useCallback(() => {
    setFilterApplied(filter);
    setCurrentPage(K_SIZE_1);
  }, [filter]);

  const onResetFilter = useCallback(
    (key?: keyof UserFilterForm) => {
      if (key) {
        setFilter((prev) => ({ ...prev, [key]: '' }));
        setFilterApplied((prev) => ({ ...prev, [key]: '' }));
      } else {
        setFilter(defaultFilter);
        setFilterApplied(defaultFilter);
      }
      setCurrentPage(K_SIZE_1);
    },
    [defaultFilter]
  );

  const onDownloadSuccess = useCallback(
    (response: DownloadListUserRes) => {
      if (response.data) {
        DownloadUtils.downloadBase64Excel(
          response.data,
          t('manage_user:download_file_name', { ext: FILE_EXT.EXCEL })
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
      type: DOWNLOAD_LIST_USER,
      payload: {
        body: buildBodyListUser(filterApplied, currentPage),
        onSuccess: onDownloadSuccess,
        onFailed: () => {
          showToast({
            type: TYPE_TOAST.ERROR,
            content: t('common:msg_failed', { action: t('common:download') })
          });
        }
      }
    });
  }, [t, dispatch, filterApplied, currentPage, buildBodyListUser, onDownloadSuccess]);

  const onDeleteSuccess = useCallback(() => {
    getUserSearchList(currentPage);

    showToast({
      type: TYPE_TOAST.SUCCESS,
      content: 'Xoá người dùng thành công'
    });
  }, [currentPage, getUserSearchList]);

  const onDelete = useCallback(
    (selectedUser: User) => {
      return showDialog({
        title: t('common:delete_confirm'),
        content: (
          <>
            Bạn có chắc chắn xoá người dùng <strong>{selectedUser?.username}</strong> này?
          </>
        ),
        type: TYPE_MESSAGE.ALERT,
        actions: [
          {
            title: t('common:agree'),
            type: TYPE_ACTION.PRIMARY,
            onPress: () => {
              const body: DeleteUserReq = { userId: selectedUser?.id || '' };
              dispatch({ type: DELETE_USER, payload: { body, onSuccess: onDeleteSuccess } });
            }
          },
          {
            title: t('common:cancel'),
            type: TYPE_ACTION.SECONDARY
          }
        ]
      });
    },
    [t, dispatch, onDeleteSuccess]
  );
  return {
    t,
    router,
    filter,
    onChangeFilter,
    onApplyFilter,
    defaultFilter,
    filterApplied,
    userPaginated,
    loadingUserList,
    pagination,
    onDownload,
    onResetFilter,
    roleOptions,
    onDelete
  };
}
