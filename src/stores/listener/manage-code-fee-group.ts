import { takeLatestListeners } from '@listener';
import { groupCodeFeeActions } from '@redux-slice/manage-code-fee-group';
import groupCodeFeeServices from 'services/manage-code-fee-group-services';
import { isSuccess } from 'services/networking/app-helper';

takeLatestListeners({
  actionCreator: groupCodeFeeActions.getListGroupCodeFee,
  effect: async ({ payload }, listenerApi) => {
    listenerApi.dispatch(groupCodeFeeActions.onChangeState({ loading: true }));

    const res = await groupCodeFeeServices.getListGroupCodeFee(payload?.body);

    listenerApi.dispatch(
      groupCodeFeeActions.onChangeState({
        groupCodeFeeList: res?.data ?? []
      })
    );

    if (isSuccess(res)) {
      payload?.onSuccess?.(res);
    } else {
      payload?.onFailed?.(res);
    }

    listenerApi.dispatch(groupCodeFeeActions.onChangeState({ loading: false }));
  }
});

takeLatestListeners({
  actionCreator: groupCodeFeeActions.createGroupCodeFee,
  effect: async ({ payload }, listenerApi) => {
    listenerApi.dispatch(groupCodeFeeActions.onChangeState({ loading: true }));

    const res = await groupCodeFeeServices.createGroupCodeFee(payload?.body);

    if (isSuccess(res)) {
      payload?.onSuccess?.(res);
    } else {
      payload?.onFailed?.(res);
    }

    listenerApi.dispatch(groupCodeFeeActions.onChangeState({ loading: false }));
  }
});

takeLatestListeners({
  actionCreator: groupCodeFeeActions.updateGroupCodeFee,
  effect: async ({ payload }, listenerApi) => {
    listenerApi.dispatch(groupCodeFeeActions.onChangeState({ loading: true }));

    const res = await groupCodeFeeServices.updateGroupCodeFee(payload?.body);

    if (isSuccess(res)) {
      payload?.onSuccess?.(res);
    } else {
      payload?.onFailed?.(res);
    }

    listenerApi.dispatch(groupCodeFeeActions.onChangeState({ loading: false }));
  }
});

takeLatestListeners({
  actionCreator: groupCodeFeeActions.getDetailGroupCodeFee,
  effect: async ({ payload }, listenerApi) => {
    listenerApi.dispatch(groupCodeFeeActions.onChangeState({ loading: true }));

    const res = await groupCodeFeeServices.getDetailGroupCodeFee(payload?.id);

    if (isSuccess(res)) {
      payload?.onSuccess?.(res);
    } else {
      payload?.onFailed?.(res);
    }

    listenerApi.dispatch(groupCodeFeeActions.onChangeState({ loading: false }));
  }
});

takeLatestListeners({
  actionCreator: groupCodeFeeActions.deleteGroupCodeFee,
  effect: async ({ payload }, listenerApi) => {
    listenerApi.dispatch(groupCodeFeeActions.onChangeState({ loading: true }));

    const res = await groupCodeFeeServices.deleteGroupCodeFee(payload?.id);

    if (isSuccess(res)) {
      payload?.onSuccess?.(res);
    } else {
      payload?.onFailed?.(res);
    }

    listenerApi.dispatch(groupCodeFeeActions.onChangeState({ loading: false }));
  }
});

takeLatestListeners({
  actionCreator: groupCodeFeeActions.downloadGroupCodeFee,
  effect: async ({ payload }, listenerApi) => {
    listenerApi.dispatch(groupCodeFeeActions.onChangeState({ loading: true }));

    const res = await groupCodeFeeServices.downloadGroupCodeFee(payload?.body);

    if (isSuccess(res)) {
      payload?.onSuccess?.(res);
    } else {
      payload?.onFailed?.(res);
    }

    listenerApi.dispatch(groupCodeFeeActions.onChangeState({ loading: false }));
  }
});
