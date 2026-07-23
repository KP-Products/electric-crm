import { takeLatestListeners } from '@listener';
import { operationContractActions } from '@redux-slice/operation-contract';
import operationContractServices from 'services/operation-contract-services';

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
  actionCreator: operationContractActions.searchOperationContract,
  effect: async (action, listenerApi) => {
    const { body, onSuccess, onFailed } = action.payload;
    listenerApi.dispatch(operationContractActions.setLoadingList(true));
    const response = await operationContractServices.searchOperationContracts(body);
    if (listenerApi.signal.aborted) return;
    listenerApi.dispatch(operationContractActions.setLoadingList(false));

    if (hasError(response) || !response.data) {
      listenerApi.dispatch(operationContractActions.setOperationContractList([]));
      listenerApi.dispatch(operationContractActions.setTotal(0));
      onFailed?.(response);
      return;
    }

    const items = Array.isArray(response.data.items) ? response.data.items : [];
    listenerApi.dispatch(operationContractActions.setOperationContractList(items));
    listenerApi.dispatch(operationContractActions.setTotal(response.data.total || 0));
    onSuccess?.(response);
  }
});

takeLatestListeners({
  actionCreator: operationContractActions.getOperationContractDetail,
  effect: async (action, listenerApi) => {
    const { body, onSuccess, onFailed } = action.payload;
    listenerApi.dispatch(operationContractActions.setLoadingDetail(true));
    const response = await operationContractServices.getOperationContractDetail(body);
    if (listenerApi.signal.aborted) return;
    listenerApi.dispatch(operationContractActions.setLoadingDetail(false));

    if (hasError(response) || !response.data) {
      onFailed?.(response);
      return;
    }

    onSuccess?.(response);
  }
});

takeLatestListeners({
  actionCreator: operationContractActions.createOperationContract,
  effect: async (action, listenerApi) => {
    const { body, onSuccess, onFailed } = action.payload;
    listenerApi.dispatch(operationContractActions.setLoadingDetail(true));
    const response = await operationContractServices.createOperationContract(body);
    if (listenerApi.signal.aborted) return;
    listenerApi.dispatch(operationContractActions.setLoadingDetail(false));

    if (hasError(response) || !response.data) {
      onFailed?.(response);
      return;
    }

    onSuccess?.(response);
  }
});

takeLatestListeners({
  actionCreator: operationContractActions.updateOperationContract,
  effect: async (action, listenerApi) => {
    const { body, onSuccess, onFailed } = action.payload;
    listenerApi.dispatch(operationContractActions.setLoadingDetail(true));
    const response = await operationContractServices.updateOperationContract(body);
    if (listenerApi.signal.aborted) return;
    listenerApi.dispatch(operationContractActions.setLoadingDetail(false));

    if (hasError(response) || !response.data) {
      onFailed?.(response);
      return;
    }

    onSuccess?.(response);
  }
});

takeLatestListeners({
  actionCreator: operationContractActions.deleteOperationContract,
  effect: async (action, listenerApi) => {
    const { body, onSuccess, onFailed } = action.payload;
    listenerApi.dispatch(operationContractActions.setLoadingDetail(true));
    const response = await operationContractServices.deleteOperationContract(body);
    if (listenerApi.signal.aborted) return;
    listenerApi.dispatch(operationContractActions.setLoadingDetail(false));

    if (hasError(response)) {
      onFailed?.(response);
      return;
    }

    onSuccess?.(response);
  }
});
