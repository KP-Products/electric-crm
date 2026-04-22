import { createDeepEqualSelector } from '@redux-common';
import { initialJobManagement } from '@redux-slice/job-management';
import { RootState } from '@store/all-reducers';

const selectDomain = (state: RootState) => state?.jobManagement || initialJobManagement;

export const selectLoading = createDeepEqualSelector(selectDomain, (app) => app?.loading);
export const selectJobList = createDeepEqualSelector(selectDomain, (app) => app?.jobList);
export const selectExecutionLogs = createDeepEqualSelector(
  selectDomain,
  (app) => app?.executionLogs
);
export const selectJobDetail = createDeepEqualSelector(selectDomain, (app) => app?.jobDetail);
