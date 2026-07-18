import { takeLatestListeners } from '@listener';
import { Meter, normalizeMeterSearchItem } from 'model/meter';
import { meterActions } from '@redux-slice/meter';
import meterServices from '../../services/meter-services';

const getCreatedTime = (createdAt?: string) => (createdAt ? new Date(createdAt).getTime() : 0);

takeLatestListeners({
  actionCreator: meterActions.getListMeterSearch,
  effect: async (action, listenerApi) => {
    const { body, onSuccess, onFailed } = action.payload;
    listenerApi.dispatch(meterActions.setLoadingList(true));
    const response = await meterServices.getMeterSearchList(body);
    listenerApi.dispatch(meterActions.setLoadingList(false));
    if (!response || !response?.data) {
      onFailed?.(response);
      return;
    }
    const meterList = (response?.data?.items || [])
      .map(normalizeMeterSearchItem)
      .filter((meter): meter is Meter => Boolean(meter));

    listenerApi.dispatch(
      meterActions.setMeterList(
        meterList.sort((a, b) => getCreatedTime(b.createdAt) - getCreatedTime(a.createdAt))
      )
    );
    onSuccess?.(response);
  }
});
takeLatestListeners({
  actionCreator: meterActions.getMeterDetail,
  effect: async (action, listenerApi) => {
    const { body, onSuccess, onFailed } = action.payload;
    listenerApi.dispatch(meterActions.setLoadingDetail(true));
    const response = await meterServices.getMeterDetail(body);
    listenerApi.dispatch(meterActions.setLoadingDetail(false));
    if (!response || !response?.data) {
      onFailed?.(response);
      return;
    }
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
      onFailed?.(response);
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
      onFailed?.(response);
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
      onFailed?.(response);
      return;
    }
    onSuccess?.(response);
  }
});
