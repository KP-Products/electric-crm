import { createDeepEqualSelector } from '@redux-common';
import { initialRole } from '@redux-slice/meter';
import { RootState } from '@store/all-reducers';

const selectDomain = (state: RootState) => state?.meter || initialRole;

export const selectMeterLoadingList = createDeepEqualSelector(
  selectDomain,
  (user) => user.loadingList
);

export const selectMeterLoadingDetail = createDeepEqualSelector(
  selectDomain,
  (user) => user.loadingDetail
);
export const selectMeterList = createDeepEqualSelector(selectDomain, (user) => user.meterList);
