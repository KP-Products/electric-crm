import { takeLatestListeners } from '@listener';
import { feeCodeActions } from '@redux-slice/fee-code-slice';
import feeCodeServices from 'services/fee-code-services';
import { isSuccess } from 'services/networking/app-helper';
import { DebugUtils } from 'utils/debug-utils';

takeLatestListeners({
  actionCreator: feeCodeActions.getFeeCodeList,
  effect: async (action, listenerApi) => {
    const { onSuccess, onFailed } = action.payload;
    listenerApi.dispatch(feeCodeActions.setListLoading(true));
    const response = await feeCodeServices.getFeeCodeList();
    listenerApi.dispatch(feeCodeActions.setListLoading(false));
    if (isSuccess(response) && response.data) {
      listenerApi.dispatch(feeCodeActions.setFeeCodes(response.data));
      onSuccess?.(response.data);
      return;
    }
    onFailed?.(response);
  }
});

takeLatestListeners({
  actionCreator: feeCodeActions.createFeeCode,
  effect: async (action, listenerApi) => {
    const { body, onSuccess, onFailed } = action.payload;
    const response = await feeCodeServices.createFeeCode(body);
    if (isSuccess(response) && response.data) {
      onSuccess?.(response.data);
      return;
    }
    onFailed?.(response);
  }
});

takeLatestListeners({
  actionCreator: feeCodeActions.deleteFeeCode,
  effect: async (action, listenerApi) => {
    const { body, onSuccess, onFailed } = action.payload;
    const response = await feeCodeServices.deleteFeeCode(body);
    if (isSuccess(response) && response.data) {
      onSuccess?.(response.data);
      return;
    }
    onFailed?.(response);
  }
});

takeLatestListeners({
  actionCreator: feeCodeActions.updateFeeCode,
  effect: async (action, listenerApi) => {
    const { body, onSuccess, onFailed } = action.payload;
    const response = await feeCodeServices.updateFeeCode(body);
    if (isSuccess(response) && response.data) {
      onSuccess?.(response.data);
      return;
    }
    onFailed?.(response);
  }
});

takeLatestListeners({
  actionCreator: feeCodeActions.updateStatusFeeCode,
  effect: async (action, listenerApi) => {
    const { body, onSuccess, onFailed } = action.payload;
    const response = await feeCodeServices.updateStatusFeeCode(body);
    if (isSuccess(response) && response.data) {
      onSuccess?.(response.data);
      return;
    }
    onFailed?.(response);
  }
});

takeLatestListeners({
  actionCreator: feeCodeActions.getMaterDataFormulaSegment,
  effect: async (action, listenerApi) => {
    const { onSuccess, onFailed } = action.payload;
    const response = await feeCodeServices.getMaterDataFormulaSegment();
    if (isSuccess(response) && response.data) {
      onSuccess?.(response.data);
      return;
    }
    onFailed?.(response);
  }
});

takeLatestListeners({
  actionCreator: feeCodeActions.getMaterDataCusType,
  effect: async (action, listenerApi) => {
    const { onSuccess, onFailed } = action.payload;
    const response = await feeCodeServices.getMaterDataCusType();
    if (isSuccess(response) && response.data) {
      onSuccess?.(response.data);
      listenerApi.dispatch(feeCodeActions.setCustomerType(response.data));
      return;
    }
    onFailed?.(response);
  }
});

takeLatestListeners({
  actionCreator: feeCodeActions.downloadUnused,
  effect: async (action, listenerApi) => {
    const { onSuccess, onFailed } = action.payload;
    const response = await feeCodeServices.downloadUnused();
    if (isSuccess(response) && response.data) {
      onSuccess?.(response.data.base64Data);
      return;
    }
    onFailed?.(response);
  }
});

takeLatestListeners({
  actionCreator: feeCodeActions.getFeeCodeByCif,
  effect: async (action, listenerApi) => {
    const { body, onSuccess, onFailed } = action.payload;
    DebugUtils.logS(['feeCodeActions.getFeeCodeByCif listener triggered', body]);
    listenerApi.dispatch(feeCodeActions.setListLoading(true));
    const response = await feeCodeServices.getFeeCodeByCif(body);
    listenerApi.dispatch(feeCodeActions.setListLoading(false));
    if (isSuccess(response) && response.data) {
      const feeCodes = Array.isArray(response.data) ? response.data : [];
      listenerApi.dispatch(feeCodeActions.setFeeCodes(feeCodes));
      onSuccess?.(feeCodes);
      return;
    }
    onFailed?.(response);
  }
});
