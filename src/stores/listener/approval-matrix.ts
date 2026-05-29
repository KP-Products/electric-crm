import { takeLatestListeners, takeLeadingListeners } from '@listener';
import { approvalMatrixActions } from '@redux-slice/approval-matrix';
import { Permission } from 'model/role';
import approvalMatrixServices from 'services/approval-matrix-services';

const isApprovalPermission = (permission: Permission) =>
  permission.isApproval === 1 || permission.isApproval === '1' || permission.isApproval === true;

takeLatestListeners({
  actionCreator: approvalMatrixActions.getListApprovalFunction,
  effect: async (action, listenerApi) => {
    const { onSuccess, onFailed } = action.payload;
    listenerApi.dispatch(approvalMatrixActions.setLoadingList(true));
    const response = await approvalMatrixServices.getListApprovalFunction();
    listenerApi.dispatch(approvalMatrixActions.setLoadingList(false));
    if (!response || !response?.data) {
      onFailed?.();
      return;
    }
    const approvalPermissions = (response.data || []).filter(isApprovalPermission);
    listenerApi.dispatch(approvalMatrixActions.setFunctionList(approvalPermissions));
    onSuccess?.({
      ...response,
      data: approvalPermissions
    });
  }
});

takeLeadingListeners({
  actionCreator: approvalMatrixActions.getApprovalMatrixDetail,
  effect: async (action, listenerApi) => {
    const { body, onSuccess, onFailed } = action.payload;
    listenerApi.dispatch(approvalMatrixActions.setLoadingDetail(true));
    const response = await approvalMatrixServices.getApprovalMatrixDetail(body);
    listenerApi.dispatch(approvalMatrixActions.setLoadingDetail(false));
    if (!response || !response?.data) {
      onFailed?.();
      return;
    }
    onSuccess?.(response);
  }
});

takeLatestListeners({
  actionCreator: approvalMatrixActions.editApprovalMatrix,
  effect: async (action, listenerApi) => {
    const { body, onSuccess, onFailed } = action.payload;
    listenerApi.dispatch(approvalMatrixActions.setLoadingDetail(true));
    const response = await approvalMatrixServices.editApprovalMatrix(body);
    listenerApi.dispatch(approvalMatrixActions.setLoadingDetail(false));
    if (!response || !response?.data) {
      onFailed?.();
      return;
    }
    onSuccess?.(response);
  }
});
