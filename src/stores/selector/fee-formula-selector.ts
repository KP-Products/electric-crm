import { createDeepEqualSelector } from '@redux-common';
import { RootState } from '@store/all-reducers';
import { initialFeeFormula } from '@redux-slice/fee-formula-slice';

const selectDomain = (state: RootState) => state?.feeFormula || initialFeeFormula;

export const selectFeeFormulaLoading = createDeepEqualSelector(
  selectDomain,
  (param) => param.listLoading
);

export const selectFeeFormulaFilter = createDeepEqualSelector(
  selectDomain,
  (param) => param.filter
);

export const selectFeeFormulas = createDeepEqualSelector(
  selectDomain,
  (param) => param.feeFormulas
);
