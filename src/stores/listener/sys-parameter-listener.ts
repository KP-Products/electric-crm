import { takeLatestListeners } from '@listener';
import { sysParameterActions } from '@redux-slice/sys-parameter-slice';
import sysParameterServices from 'services/sys-parameter-services';
import { isSuccess } from 'services/networking/app-helper';

takeLatestListeners({
  actionCreator: sysParameterActions.getSysParameterList,
  effect: async (action, listenerApi) => {
    const { onSuccess, onFailed } = action.payload;
    listenerApi.dispatch(sysParameterActions.setListLoading(true));
    const response = await sysParameterServices.getSysParameterList();
    listenerApi.dispatch(sysParameterActions.setListLoading(false));
    if (isSuccess(response) && response.data) {
      onSuccess?.(response.data);
      listenerApi.dispatch(sysParameterActions.setSysParameters(response.data));
      return;
    }

    onFailed?.(response);
  }
});
takeLatestListeners({
  actionCreator: sysParameterActions.updateSysParameter,
  effect: async (action, listenerApi) => {
    const { body, onSuccess, onFailed } = action.payload;
    const response = await sysParameterServices.updateSysParameter(body);
    if (isSuccess(response) && response.data) {
      onSuccess?.(response.data);
      return;
    }
    onFailed?.();
  }
});
