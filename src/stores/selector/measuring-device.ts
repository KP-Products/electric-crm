import { createDeepEqualSelector } from '@redux-common';
import { initialMeasuringDevice } from '@redux-slice/measuring-device';
import { RootState } from '@store/all-reducers';

const selectDomain = (state: RootState) => state.measuringDevice || initialMeasuringDevice;
export const selectMeasuringDeviceItems = createDeepEqualSelector(
  selectDomain,
  (state) => state.items
);
export const selectMeasuringDeviceTotal = createDeepEqualSelector(
  selectDomain,
  (state) => state.total
);
export const selectMeasuringDeviceLoadingList = createDeepEqualSelector(
  selectDomain,
  (state) => state.loadingList
);
export const selectMeasuringDeviceLoadingDetail = createDeepEqualSelector(
  selectDomain,
  (state) => state.loadingDetail
);
