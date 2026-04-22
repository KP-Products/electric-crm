import { takeLatestListeners } from '@listener';
import { feeScheduleActions } from '@redux-slice/fee-schedule';
import feeScheduleServices from 'services/fee-schedule-services';
import { isSuccess } from 'services/networking/app-helper';

takeLatestListeners({
  actionCreator: feeScheduleActions.getListFeeSchedule,
  effect: async ({ payload }, listenerApi) => {
    listenerApi.dispatch(feeScheduleActions.onChangeState({ loading: true }));

    const res = await feeScheduleServices.getListFeeSchedule(payload?.body);

    listenerApi.dispatch(
      feeScheduleActions.onChangeState({
        feeScheduleList: res?.data?.content ?? [],
        totalElements: res?.data?.totalElements ?? 0
      })
    );

    if (isSuccess(res)) {
      payload?.onSuccess?.(res);
    } else {
      payload?.onFailed?.(res);
    }

    listenerApi.dispatch(feeScheduleActions.onChangeState({ loading: false }));
  }
});

takeLatestListeners({
  actionCreator: feeScheduleActions.createFeeSchedule,
  effect: async ({ payload }, listenerApi) => {
    listenerApi.dispatch(feeScheduleActions.onChangeState({ loading: true }));

    const res = await feeScheduleServices.createFeeSchedule(payload?.body);

    if (isSuccess(res)) {
      payload?.onSuccess?.(res);
    } else {
      payload?.onFailed?.(res);
    }

    listenerApi.dispatch(feeScheduleActions.onChangeState({ loading: false }));
  }
});

takeLatestListeners({
  actionCreator: feeScheduleActions.updateFeeSchedule,
  effect: async ({ payload }, listenerApi) => {
    listenerApi.dispatch(feeScheduleActions.onChangeState({ loading: true }));

    const res = await feeScheduleServices.updateFeeSchedule(payload?.body);

    if (isSuccess(res)) {
      payload?.onSuccess?.(res);
    } else {
      payload?.onFailed?.(res);
    }

    listenerApi.dispatch(feeScheduleActions.onChangeState({ loading: false }));
  }
});

takeLatestListeners({
  actionCreator: feeScheduleActions.getDetailFeeSchedule,
  effect: async ({ payload }, listenerApi) => {
    listenerApi.dispatch(feeScheduleActions.onChangeState({ loading: true }));

    const res = await feeScheduleServices.getDetailFeeSchedule(payload?.feeScheduleId);

    listenerApi.dispatch(
      feeScheduleActions.onChangeState({
        feeScheduleDetail: res?.data ?? {}
      })
    );

    if (isSuccess(res)) {
      payload?.onSuccess?.(res);
    } else {
      payload?.onFailed?.(res);
    }

    listenerApi.dispatch(feeScheduleActions.onChangeState({ loading: false }));
  }
});

takeLatestListeners({
  actionCreator: feeScheduleActions.downloadListFeeSchedule,
  effect: async ({ payload }, listenerApi) => {
    listenerApi.dispatch(feeScheduleActions.onChangeState({ loading: true }));

    const res = await feeScheduleServices.downloadListFeeSchedule(payload?.body);

    if (isSuccess(res)) {
      payload?.onSuccess?.(res);
    } else {
      payload?.onFailed?.(res);
    }

    listenerApi.dispatch(feeScheduleActions.onChangeState({ loading: false }));
  }
});

takeLatestListeners({
  actionCreator: feeScheduleActions.changeFeeCode,
  effect: async ({ payload }, listenerApi) => {
    listenerApi.dispatch(feeScheduleActions.onChangeState({ loading: true }));

    const res = await feeScheduleServices.changeFeeCode(payload?.body);

    if (isSuccess(res)) {
      payload?.onSuccess?.(res);
    } else {
      payload?.onFailed?.(res);
    }

    listenerApi.dispatch(feeScheduleActions.onChangeState({ loading: false }));
  }
});

takeLatestListeners({
  actionCreator: feeScheduleActions.downloadFeeCodeByFeeSchedule,
  effect: async ({ payload }, listenerApi) => {
    listenerApi.dispatch(feeScheduleActions.onChangeState({ loading: true }));

    const res = await feeScheduleServices.downloadFeeCodeByFeeSchedule(payload?.feeScheduleId);

    if (isSuccess(res)) {
      payload?.onSuccess?.(res);
    } else {
      payload?.onFailed?.(res);
    }

    listenerApi.dispatch(feeScheduleActions.onChangeState({ loading: false }));
  }
});

takeLatestListeners({
  actionCreator: feeScheduleActions.uploadFeeCode,
  effect: async ({ payload }, listenerApi) => {
    listenerApi.dispatch(feeScheduleActions.onChangeState({ loading: true }));

    const res = await feeScheduleServices.uploadFeeCode(payload?.file);

    if (isSuccess(res)) {
      payload?.onSuccess?.(res);
    } else {
      payload?.onFailed?.(res);
    }

    listenerApi.dispatch(feeScheduleActions.onChangeState({ loading: false }));
  }
});

takeLatestListeners({
  actionCreator: feeScheduleActions.getDetailRequestChangeFeeCode,
  effect: async ({ payload }, listenerApi) => {
    listenerApi.dispatch(feeScheduleActions.onChangeState({ loading: true }));

    const res = await feeScheduleServices.getDetailRequestChangeFeeCode(payload?.requestId);

    if (isSuccess(res)) {
      payload?.onSuccess?.(res);
    } else {
      payload?.onFailed?.(res);
    }

    listenerApi.dispatch(feeScheduleActions.onChangeState({ loading: false }));
  }
});
