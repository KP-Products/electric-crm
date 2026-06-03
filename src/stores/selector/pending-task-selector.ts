import { createDeepEqualSelector } from '@redux-common';
import { RootState } from '@store/all-reducers';
import { initialPending } from '@redux-slice/pending-task-slice';

const selectDomain = (state: RootState) => state?.pendingTask || initialPending;

export const selectMyRequest = createDeepEqualSelector(selectDomain, (parma) => parma.myRequests);

export const selectMyRequestLoading = createDeepEqualSelector(
  selectDomain,
  (parma) => parma.myRequestLoading
);

export const selectApprovalList = createDeepEqualSelector(
  selectDomain,
  (parma) => parma.approvalList
);

export const selectApprovalListLoading = createDeepEqualSelector(
  selectDomain,
  (parma) => parma.approvalListLoading
);

export const selectPendingTaskFilter = createDeepEqualSelector(
  selectDomain,
  (parma) => parma.filter
);

export const selectPendingTaskOptionFeature = createDeepEqualSelector(
  selectDomain,
  (parma) => parma.optionFeature
);
