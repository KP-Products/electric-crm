import { takeLatestListeners } from '@listener';
import { isSuccess } from 'services/networking/app-helper';
import { feeFormulaActions } from '@redux-slice/fee-formula-slice';
import feeFormulaServices from 'services/fee-formula-services';

takeLatestListeners({
  actionCreator: feeFormulaActions.getFeeFormulaList,
  effect: async (action, listenerApi) => {
    listenerApi.dispatch(feeFormulaActions.setListLoading(true));
    const { body, onSuccess, onFailed } = action.payload;
    const response = await feeFormulaServices.getListFormula(body);
    listenerApi.dispatch(feeFormulaActions.setListLoading(false));
    if (isSuccess(response) && response.data) {
      onSuccess?.(response.data);
      listenerApi.dispatch(feeFormulaActions.setFeeFormulas(response.data.content));
      return;
    }
    onFailed?.(response);
  }
});

takeLatestListeners({
  actionCreator: feeFormulaActions.createFeeFormula,
  effect: async (action, listenerApi) => {
    const { body, onSuccess, onFailed } = action.payload;
    const response = await feeFormulaServices.createFormula(body);
    if (isSuccess(response) && response.data) {
      onSuccess?.(response);
      return;
    }
    onFailed?.(response);
  }
});

takeLatestListeners({
  actionCreator: feeFormulaActions.updateFeeFormula,
  effect: async (action, listenerApi) => {
    const { body, onSuccess, onFailed } = action.payload;
    const response = await feeFormulaServices.updateFormula(body);
    if (isSuccess(response) && response.data) {
      onSuccess?.(response);
      return;
    }
    onFailed?.(response);
  }
});

takeLatestListeners({
  actionCreator: feeFormulaActions.deleteFeeFormula,
  effect: async (action, listenerApi) => {
    const { body, onSuccess, onFailed } = action.payload;
    const response = await feeFormulaServices.deleteFormula(body);
    if (isSuccess(response) && response.data) {
      onSuccess?.(response);
      return;
    }
    onFailed?.(response);
  }
});

takeLatestListeners({
  actionCreator: feeFormulaActions.downloadFeeFormula,
  effect: async (action, listenerApi) => {
    const { onSuccess, onFailed } = action.payload;
    const response = await feeFormulaServices.downloadFormula();
    if (isSuccess(response) && response.data) {
      onSuccess?.(response);
      return;
    }
    onFailed?.(response);
  }
});
