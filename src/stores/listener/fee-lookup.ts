import { takeLatestListeners } from '@listener';
import { feeLookupActions } from '@redux-slice/fee-lookup';
import feeLookupServices from 'services/fee-lookup-services';
import { isSuccess } from 'services/networking/app-helper';

takeLatestListeners({
  actionCreator: feeLookupActions.getListFeeCollectionHistory,
  effect: async ({ payload }, listenerApi) => {
    listenerApi.dispatch(feeLookupActions.onChangeState({ loading: true }));

    const res = await feeLookupServices.getListFeeCollectionHistory(payload?.body);

    listenerApi.dispatch(
      feeLookupActions.onChangeState({
        feeCollectionHistory: res?.data ?? []
      })
    );

    if (isSuccess(res)) {
      payload?.onSuccess?.(res);
    } else {
      payload?.onFailed?.(res);
    }

    listenerApi.dispatch(feeLookupActions.onChangeState({ loading: false }));
  }
});

takeLatestListeners({
  actionCreator: feeLookupActions.getListFeeCollectionEstimate,
  effect: async ({ payload }, listenerApi) => {
    listenerApi.dispatch(feeLookupActions.onChangeState({ loading: true }));

    const res = await feeLookupServices.getListFeeCollectionEstimate(payload?.body);

    listenerApi.dispatch(
      feeLookupActions.onChangeState({
        feeCollectionEstimate: res?.data ?? []
      })
    );

    if (isSuccess(res)) {
      payload?.onSuccess?.(res);
    } else {
      payload?.onFailed?.(res);
    }

    listenerApi.dispatch(feeLookupActions.onChangeState({ loading: false }));
  }
});

takeLatestListeners({
  actionCreator: feeLookupActions.downloadLookup,
  effect: async ({ payload }, listenerApi) => {
    listenerApi.dispatch(feeLookupActions.onChangeState({ loading: true }));

    const res = await feeLookupServices.downloadLookup(payload?.body);

    if (isSuccess(res)) {
      payload?.onSuccess?.(res);
    } else {
      payload?.onFailed?.(res);
    }

    listenerApi.dispatch(feeLookupActions.onChangeState({ loading: false }));
  }
});
