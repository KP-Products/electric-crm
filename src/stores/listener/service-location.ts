import { takeLatestListeners } from '@listener';
import { serviceLocationActions } from '@redux-slice/service-location';
import serviceLocationServices from 'services/service-location-services';

takeLatestListeners({
  actionCreator: serviceLocationActions.searchServiceLocation,
  effect: async (action, listenerApi) => {
    const { body, onSuccess, onFailed } = action.payload;
    listenerApi.dispatch(serviceLocationActions.setLoadingList(true));
    const response = await serviceLocationServices.searchServiceLocation(body);
    listenerApi.dispatch(serviceLocationActions.setLoadingList(false));

    if (!response || !response.data) {
      onFailed?.(response);
      return;
    }

    listenerApi.dispatch(serviceLocationActions.setServiceLocationList(response.data.items || []));
    listenerApi.dispatch(serviceLocationActions.setTotal(response.data.total || 0));
    onSuccess?.(response);
  }
});

takeLatestListeners({
  actionCreator: serviceLocationActions.createServiceLocation,
  effect: async (action, listenerApi) => {
    const { body, onSuccess, onFailed } = action.payload;
    listenerApi.dispatch(serviceLocationActions.setLoadingDetail(true));
    const response = await serviceLocationServices.createServiceLocation(body);
    listenerApi.dispatch(serviceLocationActions.setLoadingDetail(false));

    if (!response || !response.data) {
      onFailed?.(response);
      return;
    }

    onSuccess?.(response);
  }
});

takeLatestListeners({
  actionCreator: serviceLocationActions.updateServiceLocation,
  effect: async (action, listenerApi) => {
    const { body, onSuccess, onFailed } = action.payload;
    listenerApi.dispatch(serviceLocationActions.setLoadingDetail(true));
    const response = await serviceLocationServices.updateServiceLocation(body);
    listenerApi.dispatch(serviceLocationActions.setLoadingDetail(false));

    if (!response || !response.data) {
      onFailed?.(response);
      return;
    }

    onSuccess?.(response);
  }
});

takeLatestListeners({
  actionCreator: serviceLocationActions.getServiceLocationDetail,
  effect: async (action, listenerApi) => {
    const { body, onSuccess, onFailed } = action.payload;
    listenerApi.dispatch(serviceLocationActions.setLoadingDetail(true));
    const response = await serviceLocationServices.getServiceLocation(body);
    listenerApi.dispatch(serviceLocationActions.setLoadingDetail(false));

    if (!response || !response.data) {
      onFailed?.(response);
      return;
    }

    onSuccess?.(response);
  }
});

takeLatestListeners({
  actionCreator: serviceLocationActions.deleteServiceLocation,
  effect: async (action, listenerApi) => {
    const { body, onSuccess, onFailed } = action.payload;
    listenerApi.dispatch(serviceLocationActions.setLoadingDetail(true));
    const response = await serviceLocationServices.deleteServiceLocation(body);
    listenerApi.dispatch(serviceLocationActions.setLoadingDetail(false));

    if (!response) {
      onFailed?.(response);
      return;
    }

    onSuccess?.(response);
  }
});
