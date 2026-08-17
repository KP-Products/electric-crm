import { takeLatestListeners } from '@listener';
import { userActions } from '@redux-slice/user';
import userServices from 'services/user-services';

takeLatestListeners({
  actionCreator: userActions.getListUser,
  effect: async (action, listenerApi) => {
    const { onSuccess, onFailed } = action.payload;
    listenerApi.dispatch(userActions.setLoadingList(true));
    const response = await userServices.getListUser();
    listenerApi.dispatch(userActions.setLoadingList(false));
    if (!response || !response?.data) {
      onFailed?.();
      return;
    }
    // const userList = response?.data || [];
    // listenerApi.dispatch(
    //   userActions.setUserList(
    //     userList.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    //   )
    // );
    onSuccess?.(response);
  }
});
takeLatestListeners({
  actionCreator: userActions.getUserSearchList,
  effect: async (action, listenerApi) => {
    const { body, onSuccess, onFailed } = action.payload;
    listenerApi.dispatch(userActions.setLoadingList(true));
    const response = await userServices.getUserSearchList(body);
    listenerApi.dispatch(userActions.setLoadingList(false));
    if (!response || !response?.data) {
      onFailed?.();
      return;
    }
    onSuccess?.(response);
  }
});

takeLatestListeners({
  actionCreator: userActions.addUser,
  effect: async (action, listenerApi) => {
    const { body, onSuccess, onFailed } = action.payload;
    listenerApi.dispatch(userActions.setLoadingDetail(true));
    const response = await userServices.addUser(body);
    listenerApi.dispatch(userActions.setLoadingDetail(false));
    if (!response || !response?.data) {
      onFailed?.();
      return;
    }
    onSuccess?.(response);
  }
});



takeLatestListeners({
  actionCreator: userActions.editUser,
  effect: async (action, listenerApi) => {
    const { body, onSuccess, onFailed } = action.payload;
    listenerApi.dispatch(userActions.setLoadingDetail(true));
    const response = await userServices.editUser(body);
    listenerApi.dispatch(userActions.setLoadingDetail(false));
    if (!response || !response?.data) {
      onFailed?.();
      return;
    }
    onSuccess?.(response);
  }
});
takeLatestListeners({
  actionCreator: userActions.deleteUser,
  effect: async (action, listenerApi) => {
    const { body, onSuccess, onFailed } = action.payload;
    listenerApi.dispatch(userActions.setLoadingDetail(true));
    const response = await userServices.deleteUser(body);
    listenerApi.dispatch(userActions.setLoadingDetail(false));
    if (!response || !response?.data) {
      onFailed?.();
      return;
    }
    onSuccess?.(response);
  }
});
takeLatestListeners({
  actionCreator: userActions.assignRoleUser,
  effect: async (action, listenerApi) => {
    const { body, onSuccess, onFailed } = action.payload;
    listenerApi.dispatch(userActions.setLoadingDetail(true));
    const response = await userServices.assignRoleUser(body);
    listenerApi.dispatch(userActions.setLoadingDetail(false));
    if (!response || !response?.data) {
      onFailed?.();
      return;
    }
    onSuccess?.(response);
  }
});
takeLatestListeners({
  actionCreator: userActions.revokeRoleUser,
  effect: async (action, listenerApi) => {
    const { body, onSuccess, onFailed } = action.payload;
    listenerApi.dispatch(userActions.setLoadingDetail(true));
    const response = await userServices.revokeRoleUser(body);
    listenerApi.dispatch(userActions.setLoadingDetail(false));
    if (!response || !response?.data) {
      onFailed?.();
      return;
    }
    onSuccess?.(response);
  }
});
