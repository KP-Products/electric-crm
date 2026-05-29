import { createDeepEqualSelector } from '@redux-common';
import { initialApprovalMatrix } from '@redux-slice/approval-matrix';
import { RootState } from '@store/all-reducers';

const selectDomain = (state: RootState) => state?.approvalMatrix || initialApprovalMatrix;

export const selectApprovalMatrixLoadingList = createDeepEqualSelector(
  selectDomain,
  (approvalMatrix) => approvalMatrix.loadingList
);

export const selectApprovalMatrixLoadingDetail = createDeepEqualSelector(
  selectDomain,
  (approvalMatrix) => approvalMatrix.loadingDetail
);

export const selectApprovalMatrixList = createDeepEqualSelector(
  selectDomain,
  (approvalMatrix) => approvalMatrix.functionList
);
