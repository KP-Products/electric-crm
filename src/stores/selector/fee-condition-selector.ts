import { createDeepEqualSelector } from '@redux-common';
import { RootState } from '@store/all-reducers';
import { initialFeeCondition } from '@redux-slice/fee-condition-slice';

const selectDomain = (state: RootState) => state?.feeCondition || initialFeeCondition;

export const selectFeeConditionLoading = createDeepEqualSelector(
  selectDomain,
  (param) => param.listLoading
);

export const selectFeeConditionFilter = createDeepEqualSelector(
  selectDomain,
  (param) => param.filter
);

export const selectFeeConditions = createDeepEqualSelector(
  selectDomain,
  (param) => param.feeConditions
);

export const selectFeeConditionCurrentPage = createDeepEqualSelector(
  selectDomain,
  (param) => param.filter.page
);
