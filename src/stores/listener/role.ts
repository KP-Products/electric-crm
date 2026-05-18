import { takeLatestListeners } from '@listener';
import { roleActions } from '@redux-slice/role';
import roleServices from 'services/role-services';

takeLatestListeners({
  actionCreator: roleActions.getListRole,
  effect: async (action, listenerApi) => {
    const { onSuccess, onFailed } = action.payload;
    listenerApi.dispatch(roleActions.setLoadingList(true));
    const response = await roleServices.getListRole();
    listenerApi.dispatch(roleActions.setLoadingList(false));
    if (!response || !response?.data) {
      onFailed?.();
      return;
    }
    listenerApi.dispatch(roleActions.setRoleList(response?.data || []));
    // listenerApi.dispatch(roleActions.setTotal(Number(response?.data?.totalElements || K_SIZE_0)));
    onSuccess?.(response);
  }
});
takeLatestListeners({
  actionCreator: roleActions.getSearchListRole,
  effect: async (action, listenerApi) => {
    const { body, onSuccess, onFailed } = action.payload;
    listenerApi.dispatch(roleActions.setLoadingList(true));
    const response = await roleServices.getListRoleSearch(body);
    listenerApi.dispatch(roleActions.setLoadingList(false));
    if (!response || !response?.data) {
      onFailed?.();
      return;
    }
    listenerApi.dispatch(roleActions.setRoleList(response?.data.items || []));
    // listenerApi.dispatch(roleActions.setTotal(Number(response?.data?.totalElements || K_SIZE_0)));
    onSuccess?.(response);
  }
});

takeLatestListeners({
  actionCreator: roleActions.downloadListRole,
  effect: async (action, listenerApi) => {
    const { body, onSuccess, onFailed } = action.payload;
    listenerApi.dispatch(roleActions.setLoadingList(true));
    const response = await roleServices.downloadListRole(body);
    listenerApi.dispatch(roleActions.setLoadingList(false));
    if (!response || !response?.data) {
      onFailed?.();
      return;
    }
    onSuccess?.(response);
  }
});

takeLatestListeners({
  actionCreator: roleActions.getRoleDetail,
  effect: async (action, listenerApi) => {
    const { body, onSuccess, onFailed } = action.payload;
    listenerApi.dispatch(roleActions.setLoadingDetail(true));
    const response = await roleServices.getRolDetail(body);
    listenerApi.dispatch(roleActions.setLoadingDetail(false));
    if (!response || !response?.data) {
      onFailed?.();
      return;
    }
    onSuccess?.(response);
  }
});

takeLatestListeners({
  actionCreator: roleActions.getListPermission,
  effect: async (action, listenerApi) => {
    const { onSuccess, onFailed } = action.payload;
    listenerApi.dispatch(roleActions.setLoadingList(true));
    const response = await roleServices.getListPermission();
    listenerApi.dispatch(roleActions.setLoadingList(false));
    if (!response || !response?.data) {
      onFailed?.();
      return;
    }
    listenerApi.dispatch(roleActions.setPermissionList(response?.data || []));
    onSuccess?.(response);
  }
});

takeLatestListeners({
  actionCreator: roleActions.addRole,
  effect: async (action, listenerApi) => {
    const { body, onSuccess, onFailed } = action.payload;
    listenerApi.dispatch(roleActions.setLoadingDetail(true));
    const response = await roleServices.addRole(body);
    listenerApi.dispatch(roleActions.setLoadingDetail(false));
    if (!response || !response?.data) {
      onFailed?.();
      return;
    }
    onSuccess?.(response);
  }
});

takeLatestListeners({
  actionCreator: roleActions.editRole,
  effect: async (action, listenerApi) => {
    const { body, onSuccess, onFailed } = action.payload;
    listenerApi.dispatch(roleActions.setLoadingDetail(true));
    const response = await roleServices.editRole(body);
    listenerApi.dispatch(roleActions.setLoadingDetail(false));
    if (!response || !response?.data) {
      onFailed?.();
      return;
    }
    onSuccess?.(response);
  }
});

takeLatestListeners({
  actionCreator: roleActions.deleteRole,
  effect: async (action, listenerApi) => {
    const { body, onSuccess, onFailed } = action.payload;
    listenerApi.dispatch(roleActions.setLoadingDetail(true));
    const response = await roleServices.deleteRole(body);
    listenerApi.dispatch(roleActions.setLoadingDetail(false));
    if (!response || !response?.data) {
      onFailed?.();
      return;
    }
    onSuccess?.(response);
  }
});
takeLatestListeners({
  actionCreator: roleActions.assignPermission,
  effect: async (action, listenerApi) => {
    const { body, onSuccess, onFailed } = action.payload;
    listenerApi.dispatch(roleActions.setLoadingDetail(true));
    const response = await roleServices.assignPermission(body);
    listenerApi.dispatch(roleActions.setLoadingDetail(false));
    if (!response || !response?.data) {
      onFailed?.();
      return;
    }
    onSuccess?.(response);
  }
});
takeLatestListeners({
  actionCreator: roleActions.removePermission,
  effect: async (action, listenerApi) => {
    const { body, onSuccess, onFailed } = action.payload;
    listenerApi.dispatch(roleActions.setLoadingDetail(true));
    const response = await roleServices.removePermission(body);
    listenerApi.dispatch(roleActions.setLoadingDetail(false));
    if (!response || !response?.data) {
      onFailed?.();
      return;
    }
    onSuccess?.(response);
  }
});
