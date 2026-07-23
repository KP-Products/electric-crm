import { createDeepEqualSelector } from '@redux-common';
import { initialMeterChangeEvent } from '@redux-slice/meter-change-event';
import { RootState } from '@store/all-reducers';

const selectDomain = (state: RootState) => state?.meterChangeEvent || initialMeterChangeEvent;

export const selectMeterChangeEventList = createDeepEqualSelector(
  selectDomain,
  (state) => state.meterChangeEventList
);

export const selectMeterChangeEventTotal = createDeepEqualSelector(
  selectDomain,
  (state) => state.total
);

export const selectMeterChangeEventLoadingList = createDeepEqualSelector(
  selectDomain,
  (state) => state.loadingList
);

export const selectMeterChangeEventLoadingDetail = createDeepEqualSelector(
  selectDomain,
  (state) => state.loadingDetail
);
