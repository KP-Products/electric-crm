import { DEFAULT_PAGE_SIZE, K_SIZE_1 } from '@constant';
import { GET_LIST_APPROVAL_FUNCTION } from '@redux-action-type/approval-matrix';
import { dispatch } from '@redux-common';
import {
  selectApprovalMatrixList,
  selectApprovalMatrixLoadingList
} from '@redux-selector/approval-matrix';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useAppTranslation } from 'utils/i18n';

export default function useApprovalMatrix() {
  const { t } = useAppTranslation();
  const router = useRouter();
  const functionList = useSelector(selectApprovalMatrixList);
  const loadingFunctionList = useSelector(selectApprovalMatrixLoadingList);

  const [currentPage, setCurrentPage] = useState<number>(K_SIZE_1);

  const pagination = useMemo(
    () => ({
      current: currentPage,
      total: functionList.length,
      pageSize: DEFAULT_PAGE_SIZE,
      onChange: (page: number) => setCurrentPage(page),
      showSizeChanger: false
    }),
    [currentPage, functionList]
  );

  useEffect(() => {
    dispatch({
      type: GET_LIST_APPROVAL_FUNCTION,
      payload: {}
    });
  }, []);

  return {
    t,
    router,
    functionList,
    loadingFunctionList,
    pagination
  };
}
