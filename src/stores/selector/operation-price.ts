import { createDeepEqualSelector } from '@redux-common';
import { initialOperationPrice } from '@redux-slice/operation-price';
import { RootState } from '@store/all-reducers';

const selectDomain = (state: RootState) => state?.operationPrice || initialOperationPrice;

export const selectOperationPriceList = createDeepEqualSelector(
  selectDomain,
  (state) => state.operationPriceList
);

export const selectOperationPriceTotal = createDeepEqualSelector(
  selectDomain,
  (state) => state.total
);

export const selectOperationPriceLoadingList = createDeepEqualSelector(
  selectDomain,
  (state) => state.loadingList
);

export const selectOperationPriceLoadingDetail = createDeepEqualSelector(
  selectDomain,
  (state) => state.loadingDetail
);

export const selectOperationPriceLoadingLookup = createDeepEqualSelector(
  selectDomain,
  (state) => state.loadingLookup
);
