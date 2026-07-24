import { takeLatestListeners } from '@listener';
import { customerActions } from '@redux-slice/customer-slice';
import customerServices from 'services/customer-services';

const SUCCESS_MESSAGES = ['success', 'ok'];
const SUCCESS_CODE_STATUSES = [
  ...SUCCESS_MESSAGES,
  '0',
  '00',
  '000',
  '0000',
  '00000',
  '000000',
  '200',
  '201',
  '204'
];

const normalizeApiText = (value?: unknown) =>
  String(value || '')
    .trim()
    .toLowerCase();

const isSuccessMessage = (message?: unknown) =>
  SUCCESS_MESSAGES.includes(normalizeApiText(message));

const isErrorCodeStatus = (codeStatus?: unknown) => {
  const normalizedCodeStatus = normalizeApiText(codeStatus);
  if (!normalizedCodeStatus) return false;

  return !(
    SUCCESS_CODE_STATUSES.includes(normalizedCodeStatus) || normalizedCodeStatus.startsWith('2')
  );
};

const hasError = (response: any) => {
  if (!response) return true;
  if (response instanceof Error) return true;

  const status = Number(response.status ?? response.statusCode);
  const hasResponseError = Boolean(
    response.businessErrorMessage ||
      response.systemErrorMessage ||
      response.detailMessage ||
      response.error
  );

  if ((Number.isFinite(status) && status >= 400) || hasResponseError) return true;
  if (isSuccessMessage(response.message)) return false;

  return Boolean(isErrorCodeStatus(response.codeStatus));
};

takeLatestListeners({
  actionCreator: customerActions.getCustomerList,
  effect: async (action, listenerApi) => {
    const { onSuccess, onFailed } = action.payload;
    listenerApi.dispatch(customerActions.setGroupLoading(true));
    const response = await customerServices.getCustomerList();
    if (listenerApi.signal.aborted) return;
    listenerApi.dispatch(customerActions.setGroupLoading(false));

    if (hasError(response) || !Array.isArray(response.data)) {
      listenerApi.dispatch(customerActions.setCustomergroups([]));
      onFailed?.(response);
      return;
    }

    listenerApi.dispatch(customerActions.setCustomergroups(response.data));
    onSuccess?.(response.data);
  }
});

takeLatestListeners({
  actionCreator: customerActions.searchCustomer,
  effect: async (action, listenerApi) => {
    const { body, onSuccess, onFailed } = action.payload;
    listenerApi.dispatch(customerActions.setListLoading(true));
    const response = await customerServices.searchCustomer(body);
    if (listenerApi.signal.aborted) return;
    listenerApi.dispatch(customerActions.setListLoading(false));

    if (hasError(response) || !response.data) {
      listenerApi.dispatch(customerActions.setCustomers([]));
      listenerApi.dispatch(customerActions.setTotal(0));
      onFailed?.(response);
      return;
    }

    const items = Array.isArray(response.data.items) ? response.data.items : [];
    listenerApi.dispatch(customerActions.setCustomers(items));
    listenerApi.dispatch(customerActions.setTotal(response.data.total || 0));
    onSuccess?.(response);
  }
});

takeLatestListeners({
  actionCreator: customerActions.getCustomerDetail,
  effect: async (action, listenerApi) => {
    const { body, onSuccess, onFailed } = action.payload;
    listenerApi.dispatch(customerActions.setDetailLoading(true));
    const response = await customerServices.getCustomerDetail(body);
    if (listenerApi.signal.aborted) return;
    listenerApi.dispatch(customerActions.setDetailLoading(false));

    if (hasError(response) || !response.data) {
      onFailed?.(response);
      return;
    }

    onSuccess?.(response);
  }
});

takeLatestListeners({
  actionCreator: customerActions.createCustomer,
  effect: async (action, listenerApi) => {
    const { body, onSuccess, onFailed } = action.payload;
    listenerApi.dispatch(customerActions.setDetailLoading(true));
    const response = await customerServices.createCustomer(body);
    if (listenerApi.signal.aborted) return;
    listenerApi.dispatch(customerActions.setDetailLoading(false));

    if (hasError(response) || !response.data) {
      onFailed?.(response);
      return;
    }

    onSuccess?.(response);
  }
});

takeLatestListeners({
  actionCreator: customerActions.updateCustomer,
  effect: async (action, listenerApi) => {
    const { body, onSuccess, onFailed } = action.payload;
    listenerApi.dispatch(customerActions.setDetailLoading(true));
    const response = await customerServices.updateCustomer(body);
    if (listenerApi.signal.aborted) return;
    listenerApi.dispatch(customerActions.setDetailLoading(false));

    if (hasError(response) || !response.data) {
      onFailed?.(response);
      return;
    }

    onSuccess?.(response);
  }
});

takeLatestListeners({
  actionCreator: customerActions.deleteCustomer,
  effect: async (action, listenerApi) => {
    const { body, onSuccess, onFailed } = action.payload;
    listenerApi.dispatch(customerActions.setDetailLoading(true));
    const response = await customerServices.deleteCustomer(body);
    if (listenerApi.signal.aborted) return;
    listenerApi.dispatch(customerActions.setDetailLoading(false));

    if (hasError(response)) {
      onFailed?.(response);
      return;
    }

    onSuccess?.(response);
  }
});
