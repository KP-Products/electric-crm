import { takeLatestListeners } from '@listener';
import { meterChangeEventActions } from '@redux-slice/meter-change-event';
import meterChangeEventServices from 'services/meter-change-event-services';

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
  actionCreator: meterChangeEventActions.searchMeterChangeEvent,
  effect: async (action, listenerApi) => {
    const { body, onSuccess, onFailed } = action.payload;
    listenerApi.dispatch(meterChangeEventActions.setLoadingList(true));
    const response = await meterChangeEventServices.searchMeterChangeEvents(body);
    if (listenerApi.signal.aborted) return;
    listenerApi.dispatch(meterChangeEventActions.setLoadingList(false));

    if (hasError(response) || !response.data) {
      listenerApi.dispatch(meterChangeEventActions.setMeterChangeEventList([]));
      listenerApi.dispatch(meterChangeEventActions.setTotal(0));
      onFailed?.(response);
      return;
    }

    const items = Array.isArray(response.data.items) ? response.data.items : [];
    listenerApi.dispatch(meterChangeEventActions.setMeterChangeEventList(items));
    listenerApi.dispatch(meterChangeEventActions.setTotal(response.data.total || 0));
    onSuccess?.(response);
  }
});

takeLatestListeners({
  actionCreator: meterChangeEventActions.getMeterChangeEventDetail,
  effect: async (action, listenerApi) => {
    const { body, onSuccess, onFailed } = action.payload;
    listenerApi.dispatch(meterChangeEventActions.setLoadingDetail(true));
    const response = await meterChangeEventServices.getMeterChangeEventDetail(body);
    if (listenerApi.signal.aborted) return;
    listenerApi.dispatch(meterChangeEventActions.setLoadingDetail(false));

    if (hasError(response) || !response.data) {
      onFailed?.(response);
      return;
    }

    onSuccess?.(response);
  }
});

takeLatestListeners({
  actionCreator: meterChangeEventActions.createMeterChangeEvent,
  effect: async (action, listenerApi) => {
    const { body, onSuccess, onFailed } = action.payload;
    listenerApi.dispatch(meterChangeEventActions.setLoadingDetail(true));
    const response = await meterChangeEventServices.createMeterChangeEvent(body);
    if (listenerApi.signal.aborted) return;
    listenerApi.dispatch(meterChangeEventActions.setLoadingDetail(false));

    if (hasError(response) || !response.data) {
      onFailed?.(response);
      return;
    }

    onSuccess?.(response);
  }
});

takeLatestListeners({
  actionCreator: meterChangeEventActions.updateMeterChangeEvent,
  effect: async (action, listenerApi) => {
    const { body, onSuccess, onFailed } = action.payload;
    listenerApi.dispatch(meterChangeEventActions.setLoadingDetail(true));
    const response = await meterChangeEventServices.updateMeterChangeEvent(body);
    if (listenerApi.signal.aborted) return;
    listenerApi.dispatch(meterChangeEventActions.setLoadingDetail(false));

    if (hasError(response) || !response.data) {
      onFailed?.(response);
      return;
    }

    onSuccess?.(response);
  }
});

takeLatestListeners({
  actionCreator: meterChangeEventActions.deleteMeterChangeEvent,
  effect: async (action, listenerApi) => {
    const { body, onSuccess, onFailed } = action.payload;
    listenerApi.dispatch(meterChangeEventActions.setLoadingDetail(true));
    const response = await meterChangeEventServices.deleteMeterChangeEvent(body);
    if (listenerApi.signal.aborted) return;
    listenerApi.dispatch(meterChangeEventActions.setLoadingDetail(false));

    if (hasError(response)) {
      onFailed?.(response);
      return;
    }

    onSuccess?.(response);
  }
});
