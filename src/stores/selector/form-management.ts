import { createDeepEqualSelector } from '@redux-common';
import { initialFormManagement } from '@redux-slice/form-management';
import { RootState } from '@store/all-reducers';

const selectDomain = (state: RootState) => state?.formManagement || initialFormManagement;

export const selectLoading = createDeepEqualSelector(selectDomain, (app) => app?.loading);
export const selectFormManagementList = createDeepEqualSelector(
  selectDomain,
  (app) => app?.formManagementList
);
export const selectTotalElements = createDeepEqualSelector(
  selectDomain,
  (app) => app?.totalElements
);
export const selectSourceTable = createDeepEqualSelector(selectDomain, (app) => app?.sourceTable);
