import { takeLatestListeners } from '@listener';
import { measuringDeviceActions } from '@redux-slice/measuring-device';
import measuringDeviceServices from 'services/measuring-device-services';

const hasError = (response: any) =>
  !response ||
  response instanceof Error ||
  response.businessErrorMessage ||
  response.systemErrorMessage ||
  response.detailMessage ||
  Number(response.status || response.statusCode) >= 400;

takeLatestListeners({
  actionCreator: measuringDeviceActions.search,
  effect: async (action, api) => {
    const { body, onSuccess, onFailed } = action.payload;
    api.dispatch(measuringDeviceActions.setLoadingList(true));
    const response = await measuringDeviceServices.searchMeasuringDevices(body);
    if (api.signal.aborted) return;
    api.dispatch(measuringDeviceActions.setLoadingList(false));
    if (hasError(response) || !response.data) {
      api.dispatch(measuringDeviceActions.setItems([]));
      api.dispatch(measuringDeviceActions.setTotal(0));
      onFailed?.(response);
      return;
    }
    api.dispatch(measuringDeviceActions.setItems(response.data.items || []));
    api.dispatch(measuringDeviceActions.setTotal(response.data.total || 0));
    onSuccess?.(response);
  }
});

const detailEffect = (service: (body: any) => Promise<any>) => async (action: any, api: any) => {
  const { body, onSuccess, onFailed } = action.payload;
  api.dispatch(measuringDeviceActions.setLoadingDetail(true));
  const response = await service(body);
  if (api.signal.aborted) return;
  api.dispatch(measuringDeviceActions.setLoadingDetail(false));
  if (hasError(response) || !response.data) {
    onFailed?.(response);
    return;
  }
  onSuccess?.(response);
};
takeLatestListeners({
  actionCreator: measuringDeviceActions.detail,
  effect: detailEffect(measuringDeviceServices.getMeasuringDeviceDetail)
});
takeLatestListeners({
  actionCreator: measuringDeviceActions.create,
  effect: detailEffect(measuringDeviceServices.createMeasuringDevice)
});
takeLatestListeners({
  actionCreator: measuringDeviceActions.update,
  effect: detailEffect(measuringDeviceServices.updateMeasuringDevice)
});
takeLatestListeners({
  actionCreator: measuringDeviceActions.remove,
  effect: async (action, api) => {
    const { body, onSuccess, onFailed } = action.payload;
    api.dispatch(measuringDeviceActions.setLoadingDetail(true));
    const response = await measuringDeviceServices.deleteMeasuringDevice(body);
    if (api.signal.aborted) return;
    api.dispatch(measuringDeviceActions.setLoadingDetail(false));
    if (hasError(response)) {
      onFailed?.(response);
      return;
    }
    onSuccess?.(response);
  }
});
