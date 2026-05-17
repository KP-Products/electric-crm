import { DEFAULT_PAGE_SIZE, K_SIZE_0, K_SIZE_1 } from '@constant';
import { GET_USER_SEARCH_LIST } from '@redux-action-type/user';
import { dispatch } from '@redux-common';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  UserFilterDrawerRef,
  UserFilterForm
} from 'screens/authentication/manage-user/components/UserFilterDrawer';
import { useAppTranslation } from 'utils/i18n';
import { GET_METER_SEARCH_LIST } from '@redux-action-type/meter';
import { DebugUtils } from '../../../../utils/debug-utils';
import { ErrorBase } from '../../../../model/common';
import { GetListMeterRes, Meter } from '../../../../model/meter';
import { selectMeterLoadingList } from '@redux-selector/meter';

export default function useManageMeter() {
  const { t } = useAppTranslation();
  const router = useRouter();
  const loadingMeterList = useSelector(selectMeterLoadingList);
  const [meterList, setMeterList] = useState<Meter[]>([]);
  const [total, setTotal] = useState<number>(K_SIZE_0);
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

  const fetchMeterList = () => {
    const body = {
      meterCodeContains: '',
      customerId: '',
      voltageType: '',
      status: '',
      page: currentPage - K_SIZE_1,
      size: DEFAULT_PAGE_SIZE
    };
    dispatch({
      type: GET_METER_SEARCH_LIST,
      payload: {
        body,
        onSuccess: (res: GetListMeterRes) => {
          setMeterList(res?.data?.items || []);
          setTotal(res?.data?.total || K_SIZE_0);
          DebugUtils.logS(['METER LIST data', res]);
        },
        onFailed: (error?: ErrorBase) => {
          DebugUtils.logS(['CUSTOMER_GROUP_LIST error', error]);
        }
      }
    });
  };
  useEffect(() => {
    fetchMeterList();
  }, []);

  const pagination = useMemo(
    () => ({
      current: currentPage,
      total: 0,
      pageSize: DEFAULT_PAGE_SIZE,
      onChange: (page: number) => setCurrentPage(page),
      showSizeChanger: false
    }),
    [currentPage]
  );

  const onApplyFilter = useCallback((data: UserFilterForm) => {
    setFilterApplied(data);
    setCurrentPage(K_SIZE_1);
    const body = {
      usernameContains: data?.username,
      emailContains: '',
      fullNameContains: '',
      status: '',
      enabled: true,
      roleCode: '',
      page: 0,
      size: 0
    };
    dispatch({
      type: GET_USER_SEARCH_LIST,
      payload: {
        body
      }
    });
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

  return {
    t,
    router,
    onApplyFilter,
    defaultFilter,
    filterApplied,
    loadingMeterList,
    pagination,
    onResetFilter,
    filterDrawerRef,
    meterList,
    total
  };
}
