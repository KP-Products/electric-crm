import { createDeepEqualSelector } from '@redux-common';
import { RootState } from '@store/all-reducers';
import { initialSysParam } from '@redux-slice/sys-parameter-slice';
import { PRODUCT_LEVEL } from 'model/product';

const selectDomain = (state: RootState) => state?.sysParameter || initialSysParam;

export const selectParamListLoading = createDeepEqualSelector(
  selectDomain,
  (param) => param.listLoading
);

export const selectParamList = createDeepEqualSelector(
  selectDomain,
  (param) => param.sysParameters
);

export const selectProductLevel = createDeepEqualSelector(selectDomain, (param) => {
  const list = param.sysParameters;
  const paramData = list?.find((c) => c.paramCode === PRODUCT_LEVEL);
  return paramData ? Number(paramData.paramValue) : paramData;
});
