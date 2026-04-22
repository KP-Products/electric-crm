import { takeLatestListeners } from '@listener';
import { approvalMatrixActions } from '@redux-slice/approval-matrix';
import { feeCodeActions } from '@redux-slice/fee-code-slice';
import { feeConditionActions } from '@redux-slice/fee-condition-slice';
import { feeScheduleActions } from '@redux-slice/fee-schedule';
import { jobManagementActions } from '@redux-slice/job-management';
import { productActions } from '@redux-slice/product-slice';
import { roleActions } from '@redux-slice/role';
import { sysParameterActions } from '@redux-slice/sys-parameter-slice';
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
    if (!response || !response.token) {
      onFailed();
      return;
    }
    const { token, username, email, fullName, unit, actions } = response;
    listenerApi.dispatch(authActions.setUser({ username, email, fullName, unit } as User));
    listenerApi.dispatch(authActions.setActions(actions));
    listenerApi.dispatch(authActions.setToken(token));
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
    listenerApi.dispatch(approvalMatrixActions.reset());
    listenerApi.dispatch(feeConditionActions.reset());
    listenerApi.dispatch(feeCodeActions.reset());
    listenerApi.dispatch(sysParameterActions.reset());
    listenerApi.dispatch(jobManagementActions.reset());
    listenerApi.dispatch(productActions.reset());
    listenerApi.dispatch(feeScheduleActions.reset());
  }
});
