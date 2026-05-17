import { createDeepEqualSelector } from '@redux-common';
import { initialUser } from '@redux-slice/user';
import { RootState } from '@store/all-reducers';

const selectDomain = (state: RootState) => state?.meter || initialUser;

export const selectMeterLoadingList = createDeepEqualSelector(
  selectDomain,
  (user) => user.loadingList
);

export const selectMeterLoadingDetail = createDeepEqualSelector(
  selectDomain,
  (user) => user.loadingDetail
);
export const selectMeterList = createDeepEqualSelector(selectDomain, (user) => user.meterList);
