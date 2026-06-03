import { takeLatestListeners } from '@listener';
import { pendingTaskActions } from '@redux-slice/pending-task-slice';
import { isSuccess } from 'services/networking/app-helper';
import pendingTaskServices from 'services/pending-task-services';

takeLatestListeners({
  actionCreator: pendingTaskActions.getMyRequests,
  effect: async (action, listenerApi) => {
    listenerApi.dispatch(pendingTaskActions.setMyRequestLoading(true));
    const { body, onSuccess, onFailed } = action.payload;
    const response = await pendingTaskServices.getMyRequest(body);
    listenerApi.dispatch(pendingTaskActions.setMyRequestLoading(false));
    if (isSuccess(response) && response.data) {
      onSuccess?.(response.data);
      listenerApi.dispatch(pendingTaskActions.setMyRequests(response.data?.content || []));
      return;
    }
    onFailed?.(response);
  }
});

takeLatestListeners({
  actionCreator: pendingTaskActions.getApprovalList,
  effect: async (action, listenerApi) => {
    listenerApi.dispatch(pendingTaskActions.setApprovalListLoading(true));
    const { body, onSuccess, onFailed } = action.payload;
    const response = await pendingTaskServices.getTaskPendings(body);
    listenerApi.dispatch(pendingTaskActions.setApprovalListLoading(false));
    if (isSuccess(response) && response.data) {
      onSuccess?.(response.data);
      return;
    }
    onFailed?.(response);
  }
});

takeLatestListeners({
  actionCreator: pendingTaskActions.getApprovalDetail,
  effect: async (action, listenerApi) => {
    const { body, onSuccess, onFailed } = action.payload;
    const response = await pendingTaskServices.getTaskDetail(body);
    if (isSuccess(response) && response.data) {
      onSuccess?.(response.data);
      return;
    }
    onFailed?.(response);
  }
});

takeLatestListeners({
  actionCreator: pendingTaskActions.approveTask,
  effect: async (action, listenerApi) => {
    const { body, onSuccess, onFailed } = action.payload;
    const response = await pendingTaskServices.approveTask(body);
    if (isSuccess(response) && response.data) {
      onSuccess?.(response.data?.success);
      return;
    }
    onFailed?.(response);
  }
});

takeLatestListeners({
  actionCreator: pendingTaskActions.rejectTask,
  effect: async (action, listenerApi) => {
    const { body, onSuccess, onFailed } = action.payload;
    const response = await pendingTaskServices.rejectTask(body);
    if (isSuccess(response) && response.data) {
      onSuccess?.(response.data?.success);
      return;
    }
    onFailed?.(response);
  }
});

takeLatestListeners({
  actionCreator: pendingTaskActions.deleteTask,
  effect: async (action, listenerApi) => {
    const { body, onSuccess, onFailed } = action.payload;
    const response = await pendingTaskServices.deleteTask(body);
    if (isSuccess(response) && response.data) {
      onSuccess?.(response.data?.success);
      return;
    }
    onFailed?.(response);
  }
});

takeLatestListeners({
  actionCreator: pendingTaskActions.historyTask,
  effect: async (action, listenerApi) => {
    const { body, onSuccess, onFailed } = action.payload;
    const response = await pendingTaskServices.historyTask(body);
    if (isSuccess(response) && response.data) {
      onSuccess?.(response.data?.content);
      return;
    }
    onFailed?.(response);
  }
});
