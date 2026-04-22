import { takeLatestListeners } from '@listener';
import { customerActions } from '@redux-slice/customer-slice';
import customerServices from 'services/customer-services';
import { isSuccess } from 'services/networking/app-helper';

takeLatestListeners({
  actionCreator: customerActions.getCustomers,
  effect: async (action, listenerApi) => {
    const { body, onSuccess, onFailed } = action.payload;
    listenerApi.dispatch(customerActions.setListLoading(true));
    const response = await customerServices.getCustomerList(body);
    listenerApi.dispatch(customerActions.setListLoading(false));

    if (isSuccess(response)) {
      const data = response.data;
      listenerApi.dispatch(customerActions.setCustomers(data));
      onSuccess?.(data);
    } else {
      onFailed?.(response);
    }
  }
});

takeLatestListeners({
  actionCreator: customerActions.getCustomerGroupList,
  effect: async (action, listenerApi) => {
    const { onSuccess, onFailed } = action.payload;
    listenerApi.dispatch(customerActions.setGroupLoading(true));
    const response = await customerServices.getCustomerGroupList();
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
  actionCreator: customerActions.createCustomerGroup,
  effect: async (action, listenerApi) => {
    const { body, onSuccess, onFailed } = action.payload;
    const response = await customerServices.createCustomerGroup(body);

    if (isSuccess(response)) {
      const data = response.data;
      onSuccess?.(data);
    } else {
      onFailed?.(response);
    }
  }
});

takeLatestListeners({
  actionCreator: customerActions.updateCustomerGroup,
  effect: async (action, listenerApi) => {
    const { body, onSuccess, onFailed } = action.payload;
    const response = await customerServices.updateCustomerGroup(body);

    if (isSuccess(response)) {
      const data = response.data;
      onSuccess?.(data);
    } else {
      onFailed?.(response);
    }
  }
});

takeLatestListeners({
  actionCreator: customerActions.downloadCustomerGroup,
  effect: async (action, listenerApi) => {
    const { body, onSuccess, onFailed } = action.payload;
    const response = await customerServices.downloadCustomerGroup(body);

    if (isSuccess(response)) {
      const data = response.data;
      onSuccess?.(data);
    } else {
      onFailed?.(response);
    }
  }
});
