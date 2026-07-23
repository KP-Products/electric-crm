import { createDeepEqualSelector } from '@redux-common';
import { initialPpeItem } from '@redux-slice/ppe-item';
import { RootState } from '@store/all-reducers';

const selectDomain = (state: RootState) => state?.ppeItem || initialPpeItem;

export const selectPpeItemList = createDeepEqualSelector(
  selectDomain,
  (state) => state.ppeItemList
);

export const selectPpeItemTotal = createDeepEqualSelector(selectDomain, (state) => state.total);

export const selectPpeItemLoadingList = createDeepEqualSelector(
  selectDomain,
  (state) => state.loadingList
);

export const selectPpeItemLoadingDetail = createDeepEqualSelector(
  selectDomain,
  (state) => state.loadingDetail
);
