import { createDeepEqualSelector } from '@redux-common';
import { initialOperationUnit } from '@redux-slice/operation-unit';
import { RootState } from '@store/all-reducers';

const selectDomain = (state: RootState) => state?.operationUnit || initialOperationUnit;

export const selectOperationUnitList = createDeepEqualSelector(
  selectDomain,
  (state) => state.operationUnitList
);

export const selectOperationUnitTotal = createDeepEqualSelector(
  selectDomain,
  (state) => state.total
);

export const selectOperationUnitLoadingList = createDeepEqualSelector(
  selectDomain,
  (state) => state.loadingList
);

export const selectOperationUnitLoadingDetail = createDeepEqualSelector(
  selectDomain,
  (state) => state.loadingDetail
);
