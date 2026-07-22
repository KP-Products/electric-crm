import { takeLatestListeners } from '@listener';
import { operationPriceActions } from '@redux-slice/operation-price';
import operationPriceServices from 'services/operation-price-services';

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
  actionCreator: operationPriceActions.searchOperationPrice,
  effect: async (action, listenerApi) => {
    const { body, onSuccess, onFailed } = action.payload;
    listenerApi.dispatch(operationPriceActions.setLoadingList(true));
    const response = await operationPriceServices.searchOperationPrices(body);
    if (listenerApi.signal.aborted) return;
    listenerApi.dispatch(operationPriceActions.setLoadingList(false));

    if (hasError(response) || !response.data) {
      listenerApi.dispatch(operationPriceActions.setOperationPriceList([]));
      listenerApi.dispatch(operationPriceActions.setTotal(0));
      onFailed?.(response);
      return;
    }

    const items = Array.isArray(response.data.items) ? response.data.items : [];
    listenerApi.dispatch(operationPriceActions.setOperationPriceList(items));
    listenerApi.dispatch(operationPriceActions.setTotal(response.data.total || 0));
    onSuccess?.(response);
  }
});

takeLatestListeners({
  actionCreator: operationPriceActions.getOperationPriceDetail,
  effect: async (action, listenerApi) => {
    const { body, onSuccess, onFailed } = action.payload;
    listenerApi.dispatch(operationPriceActions.setLoadingDetail(true));
    const response = await operationPriceServices.getOperationPriceDetail(body);
    if (listenerApi.signal.aborted) return;
    listenerApi.dispatch(operationPriceActions.setLoadingDetail(false));

    if (hasError(response) || !response.data) {
      onFailed?.(response);
      return;
    }

    onSuccess?.(response);
  }
});

takeLatestListeners({
  actionCreator: operationPriceActions.createOperationPrice,
  effect: async (action, listenerApi) => {
    const { body, onSuccess, onFailed } = action.payload;
    listenerApi.dispatch(operationPriceActions.setLoadingDetail(true));
    const response = await operationPriceServices.createOperationPrice(body);
    if (listenerApi.signal.aborted) return;
    listenerApi.dispatch(operationPriceActions.setLoadingDetail(false));

    if (hasError(response) || !response.data) {
      onFailed?.(response);
      return;
    }

    onSuccess?.(response);
  }
});

takeLatestListeners({
  actionCreator: operationPriceActions.updateOperationPrice,
  effect: async (action, listenerApi) => {
    const { body, onSuccess, onFailed } = action.payload;
    listenerApi.dispatch(operationPriceActions.setLoadingDetail(true));
    const response = await operationPriceServices.updateOperationPrice(body);
    if (listenerApi.signal.aborted) return;
    listenerApi.dispatch(operationPriceActions.setLoadingDetail(false));

    if (hasError(response) || !response.data) {
      onFailed?.(response);
      return;
    }

    onSuccess?.(response);
  }
});

takeLatestListeners({
  actionCreator: operationPriceActions.deleteOperationPrice,
  effect: async (action, listenerApi) => {
    const { body, onSuccess, onFailed } = action.payload;
    listenerApi.dispatch(operationPriceActions.setLoadingDetail(true));
    const response = await operationPriceServices.deleteOperationPrice(body);
    if (listenerApi.signal.aborted) return;
    listenerApi.dispatch(operationPriceActions.setLoadingDetail(false));

    if (hasError(response)) {
      onFailed?.(response);
      return;
    }

    onSuccess?.(response);
  }
});

takeLatestListeners({
  actionCreator: operationPriceActions.lookupOperationPriceContract,
  effect: async (action, listenerApi) => {
    const { body, onSuccess, onFailed } = action.payload;
    listenerApi.dispatch(operationPriceActions.setLoadingLookup(true));
    const response = await operationPriceServices.lookupOperationContract(body);
    if (listenerApi.signal.aborted) return;
    listenerApi.dispatch(operationPriceActions.setLoadingLookup(false));

    if (hasError(response) || !response.data) {
      onFailed?.(response);
      return;
    }

    onSuccess?.(response);
  }
});
