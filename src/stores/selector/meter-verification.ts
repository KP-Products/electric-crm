import { createDeepEqualSelector } from '@redux-common';
import { initialMeterVerification } from '@redux-slice/meter-verification';
import { RootState } from '@store/all-reducers';

const selectDomain = (state: RootState) => state?.meterVerification || initialMeterVerification;

export const selectMeterVerificationList = createDeepEqualSelector(
  selectDomain,
  (state) => state.meterVerificationList
);

export const selectMeterVerificationTotal = createDeepEqualSelector(
  selectDomain,
  (state) => state.total
);

export const selectMeterVerificationLoadingList = createDeepEqualSelector(
  selectDomain,
  (state) => state.loadingList
);

export const selectMeterVerificationLoadingDetail = createDeepEqualSelector(
  selectDomain,
  (state) => state.loadingDetail
);

export const selectMeterVerificationFileLoading = createDeepEqualSelector(
  selectDomain,
  (state) => state.fileLoading
);
