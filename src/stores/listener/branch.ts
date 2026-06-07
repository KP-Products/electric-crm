import { takeLatestListeners } from '@listener';
import { branchActions } from '@redux-slice/branch';
import branchServices from 'services/branch-services';

takeLatestListeners({
  actionCreator: branchActions.searchBranch,
  effect: async (action, listenerApi) => {
    const { body, onSuccess, onFailed } = action.payload;
    listenerApi.dispatch(branchActions.setLoadingList(true));
    const response = await branchServices.searchBranch(body);
    if (listenerApi.signal.aborted) return;
    listenerApi.dispatch(branchActions.setLoadingList(false));

    if (!response || !response.data) {
      listenerApi.dispatch(branchActions.setBranchList([]));
      listenerApi.dispatch(branchActions.setTotal(0));
      onFailed?.(response);
      return;
    }

    const items = Array.isArray(response.data.items) ? response.data.items : [];
    listenerApi.dispatch(branchActions.setBranchList(items));
    listenerApi.dispatch(branchActions.setTotal(response.data.total || 0));
    onSuccess?.(response);
  }
});

takeLatestListeners({
  actionCreator: branchActions.createBranch,
  effect: async (action, listenerApi) => {
    const { body, onSuccess, onFailed } = action.payload;
    listenerApi.dispatch(branchActions.setLoadingDetail(true));
    const response = await branchServices.createBranch(body);
    if (listenerApi.signal.aborted) return;
    listenerApi.dispatch(branchActions.setLoadingDetail(false));

    if (!response || !response.data) {
      onFailed?.(response);
      return;
    }

    onSuccess?.(response);
  }
});

takeLatestListeners({
  actionCreator: branchActions.updateBranch,
  effect: async (action, listenerApi) => {
    const { body, onSuccess, onFailed } = action.payload;
    listenerApi.dispatch(branchActions.setLoadingDetail(true));
    const response = await branchServices.updateBranch(body);
    if (listenerApi.signal.aborted) return;
    listenerApi.dispatch(branchActions.setLoadingDetail(false));

    if (!response || !response.data) {
      onFailed?.(response);
      return;
    }

    onSuccess?.(response);
  }
});

takeLatestListeners({
  actionCreator: branchActions.getBranchDetail,
  effect: async (action, listenerApi) => {
    const { body, onSuccess, onFailed } = action.payload;
    listenerApi.dispatch(branchActions.setLoadingDetail(true));
    const response = await branchServices.getBranch(body);
    if (listenerApi.signal.aborted) return;
    listenerApi.dispatch(branchActions.setLoadingDetail(false));

    if (!response || !response.data) {
      onFailed?.(response);
      return;
    }

    onSuccess?.(response);
  }
});

takeLatestListeners({
  actionCreator: branchActions.deleteBranch,
  effect: async (action, listenerApi) => {
    const { body, onSuccess, onFailed } = action.payload;
    listenerApi.dispatch(branchActions.setLoadingDetail(true));
    const response = await branchServices.deleteBranch(body);
    if (listenerApi.signal.aborted) return;
    listenerApi.dispatch(branchActions.setLoadingDetail(false));

    if (!response) {
      onFailed?.(response);
      return;
    }

    onSuccess?.(response);
  }
});

takeLatestListeners({
  actionCreator: branchActions.getBranchUsers,
  effect: async (action, listenerApi) => {
    const { body, onSuccess, onFailed } = action.payload;
    listenerApi.dispatch(branchActions.setLoadingUsers(true));
    const response = await branchServices.getBranchUsers(body);
    if (listenerApi.signal.aborted) return;
    listenerApi.dispatch(branchActions.setLoadingUsers(false));

    if (!response || !response.data) {
      listenerApi.dispatch(branchActions.setBranchUsers([]));
      onFailed?.(response);
      return;
    }

    const items = Array.isArray(response.data.items) ? response.data.items : [];
    listenerApi.dispatch(branchActions.setBranchUsers(items));
    onSuccess?.(response);
  }
});
