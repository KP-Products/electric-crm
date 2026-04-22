import { createDeepEqualSelector } from '@redux-common';
import { initialJobManagement } from '@redux-slice/job-management';
import { RootState } from '@store/all-reducers';

const selectDomain = (state: RootState) => state?.feeSchedule || initialJobManagement;

export const selectLoading = createDeepEqualSelector(selectDomain, (app) => app?.loading);
export const selectFeeScheduleList = createDeepEqualSelector(
  selectDomain,
  (app) => app?.feeScheduleList
);
export const selectTotalElements = createDeepEqualSelector(
  selectDomain,
  (app) => app?.totalElements
);
export const selectFeeScheduleDetail = createDeepEqualSelector(
  selectDomain,
  (app) => app?.feeScheduleDetail
);

export const selectChangedFeeCodes = createDeepEqualSelector(
  selectDomain,
  (app) => app?.changedFeeCodes
);
