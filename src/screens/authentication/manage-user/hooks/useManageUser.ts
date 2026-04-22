import { DEFAULT_PAGE_SIZE, FILE_EXT, K_SIZE_0, K_SIZE_1, MAX_PAGE_SIZE } from '@constant';
import { GET_LIST_ROLE } from '@redux-action-type/role';
import {
  DOWNLOAD_LIST_USER,
  GET_LIST_DEPARTMENT,
  GET_LIST_UNIT,
  GET_LIST_USER
} from '@redux-action-type/user';
import { dispatch } from '@redux-common';
import { selectRoleList } from '@redux-selector/role';
import {
  selectDepartmentList,
  selectUnitList,
  selectUserList,
  selectUserLoadingList
} from '@redux-selector/user';
import { showToast } from 'components/toast';
import { TYPE_TOAST } from 'components/toast/type';
import { GetListDepartmentReq } from 'model/master-data';
import { GetListRoleReq } from 'model/role';
import { DownloadListUserRes, GetListUserReq } from 'model/user';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  UserFilterDrawerRef,
  UserFilterForm
} from 'screens/authentication/manage-user/components/UserFilterDrawer';
import { filterUser } from 'screens/authentication/manage-user/utils/method';
import { DownloadUtils } from 'utils/download.utils';
import { useAppTranslation } from 'utils/i18n';

export default function useManageUser() {
  const { t } = useAppTranslation();
  const router = useRouter();
  const userList = useSelector(selectUserList);
  const unitList = useSelector(selectUnitList);
  const departmentList = useSelector(selectDepartmentList);
  const loadingUserList = useSelector(selectUserLoadingList);
  const roleList = useSelector(selectRoleList);

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
  const [filterApplied, setFilterApplied] = useState<UserFilterForm>(defaultFilter);
  const [currentPage, setCurrentPage] = useState<number>(K_SIZE_1);

  const filterDrawerRef = useRef<UserFilterDrawerRef>(null);

  const userFiltered = useMemo(
    () => filterUser(userList, filterApplied),
    [userList, filterApplied]
  );

  const roleOptions = useMemo(
    () => roleList.map((role) => ({ value: role.roleId, label: role.name })),
    [roleList]
  );

  const pagination = useMemo(
    () => ({
      current: currentPage,
      total: userFiltered.length,
      pageSize: DEFAULT_PAGE_SIZE,
      onChange: (page: number) => setCurrentPage(page),
      showSizeChanger: false
    }),
    [currentPage, userFiltered]
  );

  const userPaginated = useMemo(() => {
    const start = (pagination.current - K_SIZE_1) * pagination.pageSize;
    return userFiltered.slice(start, start + pagination.pageSize);
  }, [userFiltered, pagination]);

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

  useEffect(() => {
    dispatch({ type: GET_LIST_USER, payload: {} });
  }, []);

  useEffect(() => {
    if (unitList.length === K_SIZE_0) dispatch({ type: GET_LIST_UNIT, payload: {} });
  }, [unitList.length]);

  useEffect(() => {
    if (departmentList.length === K_SIZE_0) {
      const body: GetListDepartmentReq = { unitCode: '' };
      dispatch({ type: GET_LIST_DEPARTMENT, payload: { body } });
    }
  }, [departmentList.length]);

  useEffect(() => {
    const body: GetListRoleReq = {
      page: K_SIZE_0,
      size: MAX_PAGE_SIZE
    };
    dispatch({ type: GET_LIST_ROLE, payload: { body } });
  }, []);

  const onApplyFilter = useCallback((data: UserFilterForm) => {
    setFilterApplied(data);
    setCurrentPage(K_SIZE_1);
  }, []);

  const onResetFilter = useCallback(
    (key?: string) => {
      if (key) {
        setFilterApplied((prev) => ({ ...prev, [key]: '' }));
      } else {
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
  }, [t, filterApplied, currentPage, buildBodyListUser, onDownloadSuccess]);

  return {
    t,
    router,
    onApplyFilter,
    defaultFilter,
    filterApplied,
    userPaginated,
    loadingUserList,
    pagination,
    onDownload,
    onResetFilter,
    filterDrawerRef,
    roleOptions,
    unitList,
    departmentList
  };
}
