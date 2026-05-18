import { takeLatestListeners } from '@listener';
import { roleActions } from '@redux-slice/role';
import { userActions } from '@redux-slice/user';
import { User } from 'model/user';
import authServices from 'services/auth-services';
import { authActions } from 'stores/action-slice/auth';

takeLatestListeners({
  actionCreator: authActions.login,
  effect: async (action, listenerApi) => {
    const { body, onSuccess, onFailed } = action.payload;
    listenerApi.dispatch(authActions.startLogin());
    const response = await authServices.login(body);
    listenerApi.dispatch(authActions.endLogin());
    if (!response || !response.data?.accessToken) {
      onFailed();
      return;
    }
    const { accessToken, username, roles } = response.data;
    listenerApi.dispatch(authActions.setUser({ username } as User));
    listenerApi.dispatch(authActions.setToken(accessToken));
    listenerApi.dispatch(authActions.setActions(roles));

    onSuccess(response);
  }
});

takeLatestListeners({
  actionCreator: authActions.logout,
  effect: async (action, listenerApi) => {
    const { onSuccess } = action.payload;
    authServices.logout();
    listenerApi.dispatch(authActions.clearStore());
    onSuccess();
  }
});

takeLatestListeners({
  actionCreator: authActions.clearStore,
  effect: async (_, listenerApi) => {
    listenerApi.dispatch(authActions.reset());
    listenerApi.dispatch(userActions.reset());
    listenerApi.dispatch(roleActions.reset());
  }
});
