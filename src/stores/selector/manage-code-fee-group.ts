import { createDeepEqualSelector } from '@redux-common';
import { initialGroupCodeFee } from '@redux-slice/manage-code-fee-group';
import { RootState } from '@store/all-reducers';

const selectDomain = (state: RootState) => state?.manageCodeFeeGroup || initialGroupCodeFee;

export const selectLoading = createDeepEqualSelector(selectDomain, (app) => app?.loading);
export const selectGroupCodeFeeList = createDeepEqualSelector(
  selectDomain,
  (app) => app?.groupCodeFeeList
);
