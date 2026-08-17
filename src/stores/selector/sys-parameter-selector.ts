import { createDeepEqualSelector } from '@redux-common';
import { RootState } from '@store/all-reducers';
import { initialSysParam } from '@redux-slice/sys-parameter-slice';

const selectDomain = (state: RootState) => state?.sysParameter || initialSysParam;

export const selectParamListLoading = createDeepEqualSelector(
  selectDomain,
  (param) => param.listLoading
);

export const selectParamList = createDeepEqualSelector(
  selectDomain,
  (param) => param.sysParameters
);

export const selectParamTotal = createDeepEqualSelector(selectDomain, (param) => param.total);

export const selectParamSubmitting = createDeepEqualSelector(
  selectDomain,
  (param) => param.submitting
);
