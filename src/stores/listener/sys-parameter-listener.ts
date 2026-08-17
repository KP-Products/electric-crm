import { takeLatestListeners } from '@listener';
import { sysParameterActions } from '@redux-slice/sys-parameter-slice';
import { isSuccess } from 'services/networking/app-helper';
import sysParameterServices from 'services/sys-parameter-services';

takeLatestListeners({
  actionCreator: sysParameterActions.searchSysParameters,
  effect: async (action, listenerApi) => {
    const { body, onSuccess, onFailed } = action.payload;
    listenerApi.dispatch(sysParameterActions.setListLoading(true));
    const response = await sysParameterServices.searchSysParameters(body);
    listenerApi.dispatch(sysParameterActions.setListLoading(false));

    if (isSuccess(response) && response.data) {
      const items = response.data.items || [];
      listenerApi.dispatch(sysParameterActions.setSysParameters(items));
      listenerApi.dispatch(sysParameterActions.setTotal(response.data.total || 0));
      onSuccess?.(items);
      return;
    }

    onFailed?.(response);
  }
});

takeLatestListeners({
  actionCreator: sysParameterActions.createSysParameter,
  effect: async (action, listenerApi) => {
    const { body, onSuccess, onFailed } = action.payload;
    listenerApi.dispatch(sysParameterActions.setSubmitting(true));
    const response = await sysParameterServices.createSysParameter(body);
    listenerApi.dispatch(sysParameterActions.setSubmitting(false));

    if (isSuccess(response) && response.data) {
      onSuccess?.(response.data);
      return;
    }

    onFailed?.(response);
  }
});

takeLatestListeners({
  actionCreator: sysParameterActions.updateSysParameter,
  effect: async (action, listenerApi) => {
    const { body, onSuccess, onFailed } = action.payload;
    listenerApi.dispatch(sysParameterActions.setSubmitting(true));
    const response = await sysParameterServices.updateSysParameter(body);
    listenerApi.dispatch(sysParameterActions.setSubmitting(false));

    if (isSuccess(response) && response.data) {
      onSuccess?.(response.data);
      return;
    }

    onFailed?.(response);
  }
});

takeLatestListeners({
  actionCreator: sysParameterActions.deleteSysParameter,
  effect: async (action, listenerApi) => {
    const { body, onSuccess, onFailed } = action.payload;
    listenerApi.dispatch(sysParameterActions.setSubmitting(true));
    const response = await sysParameterServices.deleteSysParameter(body);
    listenerApi.dispatch(sysParameterActions.setSubmitting(false));

    // API xoá trả data = null nên chỉ căn cứ codeStatus, không kiểm tra response.data.
    if (isSuccess(response)) {
      onSuccess?.();
      return;
    }

    onFailed?.(response);
  }
});
