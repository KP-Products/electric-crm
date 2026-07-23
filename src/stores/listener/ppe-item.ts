import { takeLatestListeners } from '@listener';
import { ppeItemActions } from '@redux-slice/ppe-item';
import ppeItemServices from 'services/ppe-item-services';

const hasError = (response: unknown) => {
  if (!response) return true;
  if (response instanceof Error) return true;
  if (typeof response !== 'object') return false;

  const responseData = response as {
    status?: number;
    statusCode?: number;
    businessErrorMessage?: string;
    systemErrorMessage?: string;
    detailMessage?: string;
    error?: unknown;
  };
  const status = Number(responseData.status ?? responseData.statusCode);

  return Boolean(
    (Number.isFinite(status) && status >= 400) ||
      responseData.businessErrorMessage ||
      responseData.systemErrorMessage ||
      responseData.detailMessage ||
      responseData.error
  );
};

takeLatestListeners({
  actionCreator: ppeItemActions.searchPpeItem,
  effect: async (action, listenerApi) => {
    const { body, onSuccess, onFailed } = action.payload;
    listenerApi.dispatch(ppeItemActions.setLoadingList(true));
    const response = await ppeItemServices.searchPpeItems(body);
    if (listenerApi.signal.aborted) return;
    listenerApi.dispatch(ppeItemActions.setLoadingList(false));

    if (hasError(response) || !response.data) {
      listenerApi.dispatch(ppeItemActions.setPpeItemList([]));
      listenerApi.dispatch(ppeItemActions.setTotal(0));
      onFailed?.(response);
      return;
    }

    listenerApi.dispatch(ppeItemActions.setPpeItemList(response.data.items || []));
    listenerApi.dispatch(ppeItemActions.setTotal(response.data.total || 0));
    onSuccess?.(response);
  }
});

takeLatestListeners({
  actionCreator: ppeItemActions.getPpeItemDetail,
  effect: async (action, listenerApi) => {
    const { body, onSuccess, onFailed } = action.payload;
    listenerApi.dispatch(ppeItemActions.setLoadingDetail(true));
    const response = await ppeItemServices.getPpeItemDetail(body);
    if (listenerApi.signal.aborted) return;
    listenerApi.dispatch(ppeItemActions.setLoadingDetail(false));

    if (hasError(response) || !response.data) {
      onFailed?.(response);
      return;
    }

    onSuccess?.(response);
  }
});

takeLatestListeners({
  actionCreator: ppeItemActions.createPpeItem,
  effect: async (action, listenerApi) => {
    const { body, onSuccess, onFailed } = action.payload;
    listenerApi.dispatch(ppeItemActions.setLoadingDetail(true));
    const response = await ppeItemServices.createPpeItem(body);
    if (listenerApi.signal.aborted) return;
    listenerApi.dispatch(ppeItemActions.setLoadingDetail(false));

    if (hasError(response) || !response.data) {
      onFailed?.(response);
      return;
    }

    onSuccess?.(response);
  }
});

takeLatestListeners({
  actionCreator: ppeItemActions.updatePpeItem,
  effect: async (action, listenerApi) => {
    const { body, onSuccess, onFailed } = action.payload;
    listenerApi.dispatch(ppeItemActions.setLoadingDetail(true));
    const response = await ppeItemServices.updatePpeItem(body);
    if (listenerApi.signal.aborted) return;
    listenerApi.dispatch(ppeItemActions.setLoadingDetail(false));

    if (hasError(response) || !response.data) {
      onFailed?.(response);
      return;
    }

    onSuccess?.(response);
  }
});

takeLatestListeners({
  actionCreator: ppeItemActions.deletePpeItem,
  effect: async (action, listenerApi) => {
    const { body, onSuccess, onFailed } = action.payload;
    listenerApi.dispatch(ppeItemActions.setLoadingDetail(true));
    const response = await ppeItemServices.deletePpeItem(body);
    if (listenerApi.signal.aborted) return;
    listenerApi.dispatch(ppeItemActions.setLoadingDetail(false));

    if (hasError(response)) {
      onFailed?.(response);
      return;
    }

    onSuccess?.(response);
  }
});
