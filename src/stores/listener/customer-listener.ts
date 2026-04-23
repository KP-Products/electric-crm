import { takeLatestListeners } from '@listener';
import { customerActions } from '@redux-slice/customer-slice';
import customerServices from 'services/customer-services';
import { isSuccess } from 'services/networking/app-helper';

takeLatestListeners({
  actionCreator: customerActions.getCustomerList,
  effect: async (action, listenerApi) => {
    const { onSuccess, onFailed } = action.payload;
    listenerApi.dispatch(customerActions.setGroupLoading(true));
    const response = await customerServices.getCustomerList();
    listenerApi.dispatch(customerActions.setGroupLoading(false));

    if (isSuccess(response)) {
      const data = response.data;
      listenerApi.dispatch(customerActions.setCustomergroups(data));
      onSuccess?.(data);
    } else {
      onFailed?.(response);
    }
  }
});

takeLatestListeners({
  actionCreator: customerActions.createCustomer,
  effect: async (action, listenerApi) => {
    const { body, onSuccess, onFailed } = action.payload;
    const response = await customerServices.createCustomer(body);

    if (isSuccess(response)) {
      const data = response.data;
      onSuccess?.(data);
    } else {
      onFailed?.(response);
    }
  }
});

takeLatestListeners({
  actionCreator: customerActions.updateCustomer,
  effect: async (action, listenerApi) => {
    const { body, onSuccess, onFailed } = action.payload;
    const response = await customerServices.updateCustomer(body);

    if (isSuccess(response)) {
      const data = response.data;
      onSuccess?.(data);
    } else {
      onFailed?.(response);
    }
  }
});

takeLatestListeners({
  actionCreator: customerActions.downloadCustomer,
  effect: async (action, listenerApi) => {
    const { body, onSuccess, onFailed } = action.payload;
    const response = await customerServices.downloadCustomer(body);

    if (isSuccess(response)) {
      const data = response.data;
      onSuccess?.(data);
    } else {
      onFailed?.(response);
    }
  }
});
