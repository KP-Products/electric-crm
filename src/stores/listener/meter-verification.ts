import { takeLatestListeners } from '@listener';
import { meterVerificationActions } from '@redux-slice/meter-verification';
import meterVerificationServices from 'services/meter-verification-services';

takeLatestListeners({
  actionCreator: meterVerificationActions.searchMeterVerification,
  effect: async (action, listenerApi) => {
    const { body, onSuccess, onFailed } = action.payload;
    listenerApi.dispatch(meterVerificationActions.setLoadingList(true));
    const response = await meterVerificationServices.searchMeterVerifications(body);
    if (listenerApi.signal.aborted) return;
    listenerApi.dispatch(meterVerificationActions.setLoadingList(false));

    if (!response || !response.data) {
      listenerApi.dispatch(meterVerificationActions.setMeterVerificationList([]));
      listenerApi.dispatch(meterVerificationActions.setTotal(0));
      onFailed?.(response);
      return;
    }

    listenerApi.dispatch(
      meterVerificationActions.setMeterVerificationList(response.data.items || [])
    );
    listenerApi.dispatch(meterVerificationActions.setTotal(response.data.total || 0));
    onSuccess?.(response);
  }
});

takeLatestListeners({
  actionCreator: meterVerificationActions.createMeterVerification,
  effect: async (action, listenerApi) => {
    const { body, onSuccess, onFailed } = action.payload;
    listenerApi.dispatch(meterVerificationActions.setLoadingDetail(true));
    const response = await meterVerificationServices.createMeterVerification(body);
    if (listenerApi.signal.aborted) return;
    listenerApi.dispatch(meterVerificationActions.setLoadingDetail(false));

    if (!response || !response.data) {
      onFailed?.(response);
      return;
    }

    onSuccess?.(response);
  }
});

takeLatestListeners({
  actionCreator: meterVerificationActions.updateMeterVerification,
  effect: async (action, listenerApi) => {
    const { body, onSuccess, onFailed } = action.payload;
    listenerApi.dispatch(meterVerificationActions.setLoadingDetail(true));
    const response = await meterVerificationServices.updateMeterVerification(body);
    if (listenerApi.signal.aborted) return;
    listenerApi.dispatch(meterVerificationActions.setLoadingDetail(false));

    if (!response || !response.data) {
      onFailed?.(response);
      return;
    }

    onSuccess?.(response);
  }
});

takeLatestListeners({
  actionCreator: meterVerificationActions.deleteMeterVerification,
  effect: async (action, listenerApi) => {
    const { body, onSuccess, onFailed } = action.payload;
    listenerApi.dispatch(meterVerificationActions.setLoadingDetail(true));
    const response = await meterVerificationServices.deleteMeterVerification(body);
    if (listenerApi.signal.aborted) return;
    listenerApi.dispatch(meterVerificationActions.setLoadingDetail(false));

    if (!response) {
      onFailed?.(response);
      return;
    }

    onSuccess?.(response);
  }
});

takeLatestListeners({
  actionCreator: meterVerificationActions.viewMeterVerificationFile,
  effect: async (action, listenerApi) => {
    const { body, onSuccess, onFailed } = action.payload;
    listenerApi.dispatch(meterVerificationActions.setFileLoading(true));
    const response = await meterVerificationServices.viewMeterVerificationFile(body);
    if (listenerApi.signal.aborted) return;
    listenerApi.dispatch(meterVerificationActions.setFileLoading(false));

    if (!response || !response.data) {
      onFailed?.(response);
      return;
    }

    onSuccess?.(response);
  }
});

takeLatestListeners({
  actionCreator: meterVerificationActions.downloadMeterVerificationFile,
  effect: async (action, listenerApi) => {
    const { body, onSuccess, onFailed } = action.payload;
    listenerApi.dispatch(meterVerificationActions.setFileLoading(true));
    const response = await meterVerificationServices.downloadMeterVerificationFile(body);
    if (listenerApi.signal.aborted) return;
    listenerApi.dispatch(meterVerificationActions.setFileLoading(false));

    if (!response || !response.data) {
      onFailed?.(response);
      return;
    }

    onSuccess?.(response);
  }
});
