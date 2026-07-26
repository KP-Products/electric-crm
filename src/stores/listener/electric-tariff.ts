import { takeLatestListeners } from '@listener';
import { electricTariffActions } from '@redux-slice/electric-tariff';
import { ElectricTariff, TariffDetail } from 'model/electric-tariff';
import electricTariffServices from 'services/electric-tariff-services';

const getTariffRows = (items: Array<TariffDetail | ElectricTariff> = []) =>
  items
    .map((item) => (item && 'tariff' in item ? item.tariff : item))
    .filter((item): item is ElectricTariff => Boolean(item));

const isResponseLike = (
  response: unknown
): response is {
  status?: number | string;
  statusCode?: number | string;
  businessErrorMessage?: unknown;
  systemErrorMessage?: unknown;
  detailMessage?: unknown;
  error?: unknown;
} => typeof response === 'object' && response !== null;

const hasError = (response: unknown) => {
  if (!response) return true;
  if (response instanceof Error) return true;
  if (!isResponseLike(response)) return false;

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
  actionCreator: electricTariffActions.searchElectricTariff,
  effect: async (action, listenerApi) => {
    const { body, onSuccess, onFailed } = action.payload;
    listenerApi.dispatch(electricTariffActions.setLoadingList(true));
    const response = await electricTariffServices.searchTariffs(body);
    if (listenerApi.signal.aborted) return;
    listenerApi.dispatch(electricTariffActions.setLoadingList(false));

    if (!response || !response.data) {
      listenerApi.dispatch(electricTariffActions.setTariffList([]));
      listenerApi.dispatch(electricTariffActions.setTotal(0));
      onFailed?.(response);
      return;
    }

    listenerApi.dispatch(electricTariffActions.setTariffList(getTariffRows(response.data.items)));
    listenerApi.dispatch(electricTariffActions.setTotal(response.data.total || 0));
    onSuccess?.(response);
  }
});

takeLatestListeners({
  actionCreator: electricTariffActions.deleteElectricTariff,
  effect: async (action, listenerApi) => {
    const { body, onSuccess, onFailed } = action.payload;
    listenerApi.dispatch(electricTariffActions.setLoadingDetail(true));
    const response = await electricTariffServices.deleteTariff(body);
    if (listenerApi.signal.aborted) return;
    listenerApi.dispatch(electricTariffActions.setLoadingDetail(false));

    if (hasError(response)) {
      onFailed?.(response);
      return;
    }

    onSuccess?.(response);
  }
});

takeLatestListeners({
  actionCreator: electricTariffActions.uploadElectricTariffDocument,
  effect: async (action, listenerApi) => {
    const { body, onSuccess, onFailed } = action.payload;
    listenerApi.dispatch(electricTariffActions.setLoadingDetail(true));
    const response = await electricTariffServices.uploadTariffDocument(body);
    if (listenerApi.signal.aborted) return;
    listenerApi.dispatch(electricTariffActions.setLoadingDetail(false));

    if (hasError(response) || !response.data) {
      onFailed?.(response);
      return;
    }

    onSuccess?.(response);
  }
});

takeLatestListeners({
  actionCreator: electricTariffActions.deleteElectricTariffDocument,
  effect: async (action, listenerApi) => {
    const { body, onSuccess, onFailed } = action.payload;
    listenerApi.dispatch(electricTariffActions.setLoadingDetail(true));
    const response = await electricTariffServices.deleteTariffDocument(body);
    if (listenerApi.signal.aborted) return;
    listenerApi.dispatch(electricTariffActions.setLoadingDetail(false));

    if (hasError(response) || !response.data) {
      onFailed?.(response);
      return;
    }

    onSuccess?.(response);
  }
});

takeLatestListeners({
  actionCreator: electricTariffActions.getElectricTariffDetail,
  effect: async (action, listenerApi) => {
    const { body, onSuccess, onFailed } = action.payload;
    listenerApi.dispatch(electricTariffActions.setLoadingDetail(true));
    const response = await electricTariffServices.getTariffDetail(body);
    if (listenerApi.signal.aborted) return;
    listenerApi.dispatch(electricTariffActions.setLoadingDetail(false));

    if (!response || !response.data) {
      onFailed?.(response);
      return;
    }

    onSuccess?.(response);
  }
});

takeLatestListeners({
  actionCreator: electricTariffActions.createElectricTariff,
  effect: async (action, listenerApi) => {
    const { body, onSuccess, onFailed } = action.payload;
    listenerApi.dispatch(electricTariffActions.setLoadingDetail(true));
    const response = await electricTariffServices.createTariff(body);
    if (listenerApi.signal.aborted) return;
    listenerApi.dispatch(electricTariffActions.setLoadingDetail(false));

    if (!response || !response.data) {
      onFailed?.(response);
      return;
    }

    onSuccess?.(response);
  }
});

takeLatestListeners({
  actionCreator: electricTariffActions.updateElectricTariff,
  effect: async (action, listenerApi) => {
    const { body, onSuccess, onFailed } = action.payload;
    listenerApi.dispatch(electricTariffActions.setLoadingDetail(true));
    const response = await electricTariffServices.updateTariff(body);
    if (listenerApi.signal.aborted) return;
    listenerApi.dispatch(electricTariffActions.setLoadingDetail(false));

    if (!response || !response.data) {
      onFailed?.(response);
      return;
    }

    onSuccess?.(response);
  }
});
