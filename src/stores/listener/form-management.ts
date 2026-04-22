import { takeLatestListeners } from '@listener';
import { formManagementActions } from '@redux-slice/form-management';
import formManagementServices from 'services/form-management-services';
import { isSuccess } from 'services/networking/app-helper';

takeLatestListeners({
  actionCreator: formManagementActions.getListFormManagement,
  effect: async ({ payload }, listenerApi) => {
    listenerApi.dispatch(formManagementActions.onChangeState({ loading: true }));

    const res = await formManagementServices.getListFormManagement(payload?.body);

    listenerApi.dispatch(
      formManagementActions.onChangeState({
        formManagementList: res?.data?.content ?? [],
        totalElements: res?.data?.totalElements ?? 0
      })
    );

    if (isSuccess(res)) {
      payload?.onSuccess?.(res);
    } else {
      payload?.onFailed?.(res);
    }

    listenerApi.dispatch(formManagementActions.onChangeState({ loading: false }));
  }
});

takeLatestListeners({
  actionCreator: formManagementActions.createFormManagement,
  effect: async ({ payload }, listenerApi) => {
    listenerApi.dispatch(formManagementActions.onChangeState({ loading: true }));

    const res = await formManagementServices.createFormManagement(payload?.body);

    if (isSuccess(res)) {
      payload?.onSuccess?.(res);
    } else {
      payload?.onFailed?.(res);
    }

    listenerApi.dispatch(formManagementActions.onChangeState({ loading: false }));
  }
});

takeLatestListeners({
  actionCreator: formManagementActions.updateFormManagement,
  effect: async ({ payload }, listenerApi) => {
    listenerApi.dispatch(formManagementActions.onChangeState({ loading: true }));

    const res = await formManagementServices.updateFormManagement(payload?.body);

    if (isSuccess(res)) {
      payload?.onSuccess?.(res);
    } else {
      payload?.onFailed?.(res);
    }

    listenerApi.dispatch(formManagementActions.onChangeState({ loading: false }));
  }
});

takeLatestListeners({
  actionCreator: formManagementActions.getDetailFormManagement,
  effect: async ({ payload }, listenerApi) => {
    listenerApi.dispatch(formManagementActions.onChangeState({ loading: true }));

    const res = await formManagementServices.getDetailFormManagement(payload?.templateId);

    if (isSuccess(res)) {
      payload?.onSuccess?.(res);
    } else {
      payload?.onFailed?.(res);
    }

    listenerApi.dispatch(formManagementActions.onChangeState({ loading: false }));
  }
});

takeLatestListeners({
  actionCreator: formManagementActions.getSourceTable,
  effect: async ({ payload }, listenerApi) => {
    listenerApi.dispatch(formManagementActions.onChangeState({ loading: true }));

    const res = await formManagementServices.getSourceTable();

    listenerApi.dispatch(
      formManagementActions.onChangeState({
        sourceTable: res?.data ?? []
      })
    );

    if (isSuccess(res)) {
      payload?.onSuccess?.(res);
    } else {
      payload?.onFailed?.(res);
    }

    listenerApi.dispatch(formManagementActions.onChangeState({ loading: false }));
  }
});
