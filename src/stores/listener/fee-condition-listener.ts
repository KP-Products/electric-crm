import { takeLatestListeners } from '@listener';
import { feeConditionActions } from '@redux-slice/fee-condition-slice';
import feeConditionServices from 'services/fee-condition-services';
import { isSuccess } from 'services/networking/app-helper';

takeLatestListeners({
  actionCreator: feeConditionActions.getFeeConditionList,
  effect: async (action, listenerApi) => {
    listenerApi.dispatch(feeConditionActions.setListLoading(true));
    const { body, onSuccess, onFailed } = action.payload;
    const response = await feeConditionServices.getFeeCondition(body);
    listenerApi.dispatch(feeConditionActions.setListLoading(false));
    if (isSuccess(response) && response.data) {
      onSuccess?.(response.data);
      listenerApi.dispatch(feeConditionActions.setFeeConditions(response.data.content));
      return;
    }
    onFailed?.(response);
  }
});

takeLatestListeners({
  actionCreator: feeConditionActions.createFeeCondition,
  effect: async (action, listenerApi) => {
    const { body, onSuccess, onFailed } = action.payload;
    const response = await feeConditionServices.createFeeCondition(body);
    if (isSuccess(response) && response.data) {
      onSuccess?.(response);
      return;
    }
    onFailed?.(response);
  }
});

takeLatestListeners({
  actionCreator: feeConditionActions.updateFeeCondition,
  effect: async (action, listenerApi) => {
    const { body, onSuccess, onFailed } = action.payload;
    const response = await feeConditionServices.updateFeeCondition(body);
    if (isSuccess(response) && response.data) {
      onSuccess?.(response);
      return;
    }
    onFailed?.(response);
  }
});

takeLatestListeners({
  actionCreator: feeConditionActions.deleteFeeCondition,
  effect: async (action, listenerApi) => {
    const { body, onSuccess, onFailed } = action.payload;
    const response = await feeConditionServices.deleteFeeCondition(body);
    if (isSuccess(response) && response.data) {
      onSuccess?.(response);
      return;
    }
    onFailed?.(response);
  }
});

takeLatestListeners({
  actionCreator: feeConditionActions.downloadFeeCondition,
  effect: async (action, listenerApi) => {
    const { body, onSuccess, onFailed } = action.payload;
    const response = await feeConditionServices.downloadFeeCondition(body);
    if (isSuccess(response) && response.data) {
      onSuccess?.(response);
      return;
    }
    onFailed?.(response);
  }
});

takeLatestListeners({
  actionCreator: feeConditionActions.getFeeConditionDataField,
  effect: async (action, listenerApi) => {
    const { body, onSuccess, onFailed } = action.payload;
    const response = await feeConditionServices.getFeeConditionDataField(body);
    if (isSuccess(response) && response.data) {
      onSuccess?.(response.data.dataField);
      return;
    }
    onFailed?.(response);
  }
});
