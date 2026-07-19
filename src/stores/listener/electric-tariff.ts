import { takeLatestListeners } from '@listener';
import { electricTariffActions } from '@redux-slice/electric-tariff';
import electricTariffServices from 'services/electric-tariff-services';

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

    listenerApi.dispatch(electricTariffActions.setTariffList(response.data.items || []));
    listenerApi.dispatch(electricTariffActions.setTotal(response.data.total || 0));
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
  actionCreator: electricTariffActions.listElectricTariffTouPrice,
  effect: async (action, listenerApi) => {
    const { body, onSuccess, onFailed } = action.payload;
    listenerApi.dispatch(electricTariffActions.setLoadingDetail(true));
    const response = await electricTariffServices.listTouPrices(body);
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
  actionCreator: electricTariffActions.createElectricTariffTouPrice,
  effect: async (action, listenerApi) => {
    const { body, onSuccess, onFailed } = action.payload;
    listenerApi.dispatch(electricTariffActions.setLoadingDetail(true));
    const response = await electricTariffServices.createTouPrice(body);
    if (listenerApi.signal.aborted) return;
    listenerApi.dispatch(electricTariffActions.setLoadingDetail(false));

    if (!response || !response.data) {
      onFailed?.(response);
      return;
    }

    onSuccess?.(response);
  }
});
