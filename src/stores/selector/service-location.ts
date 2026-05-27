import { createDeepEqualSelector } from '@redux-common';
import { initialServiceLocation } from '@redux-slice/service-location';
import { RootState } from '@store/all-reducers';

const selectDomain = (state: RootState) => state?.serviceLocation || initialServiceLocation;

export const selectServiceLocationList = createDeepEqualSelector(
  selectDomain,
  (state) => state.serviceLocationList
);

export const selectServiceLocationTotal = createDeepEqualSelector(
  selectDomain,
  (state) => state.total
);

export const selectServiceLocationLoadingList = createDeepEqualSelector(
  selectDomain,
  (state) => state.loadingList
);

export const selectServiceLocationLoadingDetail = createDeepEqualSelector(
  selectDomain,
  (state) => state.loadingDetail
);
