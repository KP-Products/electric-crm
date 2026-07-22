import { takeLatestListeners } from '@listener';
import { operationUnitActions } from '@redux-slice/operation-unit';
import operationUnitServices from 'services/operation-unit-services';

const hasError = (response: any) => {
  if (!response) return true;
  if (response instanceof Error) return true;

  const status = Number(response.status ?? response.statusCode);
  return Boolean(
    (Number.isFinite(status) && status >= 400) ||
      response.businessErrorMessage ||
      response.systemErrorMessage ||
      response.detailMessage ||
      response.error
  );
};

takeLatestListeners({
  actionCreator: operationUnitActions.searchOperationUnit,
  effect: async (action, listenerApi) => {
    const { body, onSuccess, onFailed } = action.payload;
    listenerApi.dispatch(operationUnitActions.setLoadingList(true));
    const response = await operationUnitServices.searchOperationUnits(body);
    if (listenerApi.signal.aborted) return;
    listenerApi.dispatch(operationUnitActions.setLoadingList(false));

    if (hasError(response) || !response.data) {
      listenerApi.dispatch(operationUnitActions.setOperationUnitList([]));
      listenerApi.dispatch(operationUnitActions.setTotal(0));
      onFailed?.(response);
      return;
    }

    const items = Array.isArray(response.data.items) ? response.data.items : [];
    listenerApi.dispatch(operationUnitActions.setOperationUnitList(items));
    listenerApi.dispatch(operationUnitActions.setTotal(response.data.total || 0));
    onSuccess?.(response);
  }
});

takeLatestListeners({
  actionCreator: operationUnitActions.getOperationUnitDetail,
  effect: async (action, listenerApi) => {
    const { body, onSuccess, onFailed } = action.payload;
    listenerApi.dispatch(operationUnitActions.setLoadingDetail(true));
    const response = await operationUnitServices.getOperationUnitDetail(body);
    if (listenerApi.signal.aborted) return;
    listenerApi.dispatch(operationUnitActions.setLoadingDetail(false));

    if (hasError(response) || !response.data) {
      onFailed?.(response);
      return;
    }

    onSuccess?.(response);
  }
});

takeLatestListeners({
  actionCreator: operationUnitActions.createOperationUnit,
  effect: async (action, listenerApi) => {
    const { body, onSuccess, onFailed } = action.payload;
    listenerApi.dispatch(operationUnitActions.setLoadingDetail(true));
    const response = await operationUnitServices.createOperationUnit(body);
    if (listenerApi.signal.aborted) return;
    listenerApi.dispatch(operationUnitActions.setLoadingDetail(false));

    if (hasError(response) || !response.data) {
      onFailed?.(response);
      return;
    }

    onSuccess?.(response);
  }
});

takeLatestListeners({
  actionCreator: operationUnitActions.updateOperationUnit,
  effect: async (action, listenerApi) => {
    const { body, onSuccess, onFailed } = action.payload;
    listenerApi.dispatch(operationUnitActions.setLoadingDetail(true));
    const response = await operationUnitServices.updateOperationUnit(body);
    if (listenerApi.signal.aborted) return;
    listenerApi.dispatch(operationUnitActions.setLoadingDetail(false));

    if (hasError(response) || !response.data) {
      onFailed?.(response);
      return;
    }

    onSuccess?.(response);
  }
});

takeLatestListeners({
  actionCreator: operationUnitActions.deleteOperationUnit,
  effect: async (action, listenerApi) => {
    const { body, onSuccess, onFailed } = action.payload;
    listenerApi.dispatch(operationUnitActions.setLoadingDetail(true));
    const response = await operationUnitServices.deleteOperationUnit(body);
    if (listenerApi.signal.aborted) return;
    listenerApi.dispatch(operationUnitActions.setLoadingDetail(false));

    if (hasError(response)) {
      onFailed?.(response);
      return;
    }

    onSuccess?.(response);
  }
});
