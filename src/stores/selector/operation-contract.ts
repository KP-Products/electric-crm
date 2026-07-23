import { createDeepEqualSelector } from '@redux-common';
import { initialOperationContract } from '@redux-slice/operation-contract';
import { RootState } from '@store/all-reducers';

const selectDomain = (state: RootState) => state?.operationContract || initialOperationContract;

export const selectOperationContractList = createDeepEqualSelector(
  selectDomain,
  (operationContract) => operationContract.operationContractList
);

export const selectOperationContractTotal = createDeepEqualSelector(
  selectDomain,
  (operationContract) => operationContract.total
);

export const selectOperationContractLoadingList = createDeepEqualSelector(
  selectDomain,
  (operationContract) => operationContract.loadingList
);

export const selectOperationContractLoadingDetail = createDeepEqualSelector(
  selectDomain,
  (operationContract) => operationContract.loadingDetail
);
