import { takeLatestListeners } from '@listener';
import { meterActions } from '@redux-slice/meter';
import meterServices from '../../services/meter-services';

takeLatestListeners({
  actionCreator: meterActions.getListMeterSearch,
  effect: async (action, listenerApi) => {
    const { body, onSuccess, onFailed } = action.payload;
    listenerApi.dispatch(meterActions.setLoadingList(true));
    const response = await meterServices.getMeterSearchList(body);
    listenerApi.dispatch(meterActions.setLoadingList(false));
    if (!response || !response?.data) {
      onFailed?.();
      return;
    }
    const meterList = response?.data?.items || [];

    listenerApi.dispatch(
      meterActions.setMeterList(
        meterList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      )
    );
    onSuccess?.(response);
  }
});
takeLatestListeners({
  actionCreator: meterActions.addMeter,
  effect: async (action, listenerApi) => {
    const { body, onSuccess, onFailed } = action.payload;
    listenerApi.dispatch(meterActions.setLoadingDetail(true));
    const response = await meterServices.addMeter(body);
    listenerApi.dispatch(meterActions.setLoadingDetail(false));
    if (!response || !response?.data) {
      onFailed?.();
      return;
    }
    onSuccess?.(response);
  }
});
takeLatestListeners({
  actionCreator: meterActions.editMeter,
  effect: async (action, listenerApi) => {
    const { body, onSuccess, onFailed } = action.payload;
    listenerApi.dispatch(meterActions.setLoadingDetail(true));
    const response = await meterServices.editMeter(body);
    listenerApi.dispatch(meterActions.setLoadingDetail(false));
    if (!response || !response?.data) {
      onFailed?.();
      return;
    }
    onSuccess?.(response);
  }
});
takeLatestListeners({
  actionCreator: meterActions.deleteMeter,
  effect: async (action, listenerApi) => {
    const { body, onSuccess, onFailed } = action.payload;
    listenerApi.dispatch(meterActions.setLoadingDetail(true));
    const response = await meterServices.deleteMeter(body);
    listenerApi.dispatch(meterActions.setLoadingDetail(false));
    if (!response || !response?.data) {
      onFailed?.();
      return;
    }
    onSuccess?.(response);
  }
});
