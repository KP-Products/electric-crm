import { createDeepEqualSelector } from '@redux-common';
import { initialBranch } from '@redux-slice/branch';
import { RootState } from '@store/all-reducers';

const selectDomain = (state: RootState) => state?.branch || initialBranch;

export const selectBranchList = createDeepEqualSelector(selectDomain, (state) => state.branchList);

export const selectBranchUsers = createDeepEqualSelector(
  selectDomain,
  (state) => state.branchUsers
);

export const selectBranchTotal = createDeepEqualSelector(selectDomain, (state) => state.total);

export const selectBranchLoadingList = createDeepEqualSelector(
  selectDomain,
  (state) => state.loadingList
);

export const selectBranchLoadingDetail = createDeepEqualSelector(
  selectDomain,
  (state) => state.loadingDetail
);

export const selectBranchLoadingUsers = createDeepEqualSelector(
  selectDomain,
  (state) => state.loadingUsers
);
