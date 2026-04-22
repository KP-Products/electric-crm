import { createDeepEqualSelector } from '@redux-common';
import { initialFeeLookup } from '@redux-slice/fee-lookup';
import { RootState } from '@store/all-reducers';

const selectDomain = (state: RootState) => state?.feeLookup || initialFeeLookup;

export const selectLoading = createDeepEqualSelector(selectDomain, (app) => app?.loading);
export const selectFeeCollectionHistory = createDeepEqualSelector(
  selectDomain,
  (app) => app?.feeCollectionHistory
);
export const selectFeeCollectionEstimate = createDeepEqualSelector(
  selectDomain,
  (app) => app?.feeCollectionEstimate
);
