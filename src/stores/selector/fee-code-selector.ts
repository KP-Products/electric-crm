import { createDeepEqualSelector } from '@redux-common';
import { RootState } from '@store/all-reducers';
import { initialFeeCode } from '@redux-slice/fee-code-slice';

const selectDomain = (state: RootState) => state?.feeCode || initialFeeCode;

export const selectFeeCodesLoading = createDeepEqualSelector(
  selectDomain,
  (param) => param.listLoading
);

export const selectFeeCodes = createDeepEqualSelector(selectDomain, (param) => param.feeCodes);

export const selectFeeCodeDetail = createDeepEqualSelector(
  selectDomain,
  (param) => param.feeCodeDetail
);

export const selectFeeCodeProduct = createDeepEqualSelector(selectDomain, (param) => param.product);

export const selectCustomerTypes = createDeepEqualSelector(
  selectDomain,
  (param) => param.customerType
);
