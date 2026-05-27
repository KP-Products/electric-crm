import { createDeepEqualSelector } from '@redux-common';
import { initialContract } from '@redux-slice/contract';
import { RootState } from '@store/all-reducers';

const selectDomain = (state: RootState) => state?.contract || initialContract;

export const selectContractList = createDeepEqualSelector(
  selectDomain,
  (state) => state.contractList
);

export const selectContractTotal = createDeepEqualSelector(selectDomain, (state) => state.total);

export const selectContractLoadingList = createDeepEqualSelector(
  selectDomain,
  (state) => state.loadingList
);

export const selectContractLoadingDetail = createDeepEqualSelector(
  selectDomain,
  (state) => state.loadingDetail
);
