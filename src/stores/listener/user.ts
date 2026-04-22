import { TEMPLATE_NAME } from '@constant';
import { takeLatestListeners } from '@listener';
import { userActions } from '@redux-slice/user';
import masterDataServices from 'services/master-data-services';
import userServices from 'services/user-services';

takeLatestListeners({
  actionCreator: userActions.getListUser,
  effect: async (action, listenerApi) => {
    const { body, onSuccess, onFailed } = action.payload;
    listenerApi.dispatch(userActions.setLoadingList(true));
    const response = await userServices.getListUser(body);
    listenerApi.dispatch(userActions.setLoadingList(false));
    if (!response || !response?.data) {
      onFailed?.();
      return;
    }
    const userList = response?.data || [];
    listenerApi.dispatch(
      userActions.setUserList(
        userList.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      )
    );
    onSuccess?.(response);
  }
});

takeLatestListeners({
  actionCreator: userActions.downloadListUser,
  effect: async (action, listenerApi) => {
    const { body, onSuccess, onFailed } = action.payload;
    listenerApi.dispatch(userActions.setLoadingDetail(true));
    const response = await userServices.downloadListUser(body);
    listenerApi.dispatch(userActions.setLoadingDetail(false));
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
  actionCreator: userActions.getUserTemplate,
  effect: async (action) => {
    const { onSuccess, onFailed } = action.payload;
    const response = await masterDataServices.getTemplate({
      templateName: TEMPLATE_NAME.UPLOAD_USER
    });
    if (!response || !response.data?.base64Data) {
      onFailed?.();
      return;
    }
    onSuccess?.(response);
  }
});

takeLatestListeners({
  actionCreator: userActions.uploadUser,
  effect: async (action, listenerApi) => {
    const { body, onSuccess, onFailed } = action.payload;
    listenerApi.dispatch(userActions.setLoadingList(true));
    const response = await userServices.uploadUser(body);
    listenerApi.dispatch(userActions.setLoadingList(false));
    if (!response || !response?.data) {
      onFailed?.();
      return;
    }
    onSuccess?.(response);
  }
});

takeLatestListeners({
  actionCreator: userActions.addListUser,
  effect: async (action, listenerApi) => {
    const { body, onSuccess, onFailed } = action.payload;
    listenerApi.dispatch(userActions.setLoadingDetail(true));
    const response = await userServices.addListUser(body);
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
  actionCreator: userActions.getListUnit,
  effect: async (action, listenerApi) => {
    const { onSuccess, onFailed } = action.payload;
    const response = await masterDataServices.getListUnit();
    if (!response || !response.data) {
      onFailed?.();
      return;
    }
    listenerApi.dispatch(userActions.setUnitList(response?.data || []));
    onSuccess?.(response);
  }
});

takeLatestListeners({
  actionCreator: userActions.getListDepartment,
  effect: async (action, listenerApi) => {
    const { body, onSuccess, onFailed } = action.payload;
    const response = await masterDataServices.getListDepartment(body);
    if (!response || !response.data) {
      onFailed?.();
      return;
    }
    listenerApi.dispatch(userActions.setDepartmentList(response?.data || []));
    onSuccess?.(response);
  }
});
