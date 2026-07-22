import { takeLatestListeners } from '@listener';
import { employeeActions } from '@redux-slice/employee';
import employeeServices from 'services/employee-services';

const hasError = (response: any) => {
  if (!response) return true;
  if (response instanceof Error) return true;

  const status = Number(response.status ?? response.statusCode);
  return Boolean(
    (Number.isFinite(status) && status >= 400) ||
      response.businessErrorMessage ||
      response.systemErrorMessage ||
      response.detailMessage ||
      response.error
  );
};

takeLatestListeners({
  actionCreator: employeeActions.searchEmployees,
  effect: async (action, listenerApi) => {
    const { body, onSuccess, onFailed } = action.payload;
    listenerApi.dispatch(employeeActions.setLoadingList(true));
    const response = await employeeServices.searchEmployees(body);
    listenerApi.dispatch(employeeActions.setLoadingList(false));

    if (hasError(response) || !response.data) {
      listenerApi.dispatch(employeeActions.setEmployeeList([]));
      listenerApi.dispatch(employeeActions.setTotal(0));
      onFailed?.(response);
      return;
    }

    listenerApi.dispatch(employeeActions.setEmployeeList(response.data.items || []));
    listenerApi.dispatch(employeeActions.setTotal(response.data.total || 0));
    onSuccess?.(response);
  }
});

takeLatestListeners({
  actionCreator: employeeActions.createEmployee,
  effect: async (action, listenerApi) => {
    const { body, onSuccess, onFailed } = action.payload;
    listenerApi.dispatch(employeeActions.setLoadingDetail(true));
    const response = await employeeServices.createEmployee(body);
    listenerApi.dispatch(employeeActions.setLoadingDetail(false));

    if (hasError(response) || !response.data) {
      onFailed?.(response);
      return;
    }

    listenerApi.dispatch(employeeActions.setSelectedEmployee(response.data));
    onSuccess?.(response);
  }
});

takeLatestListeners({
  actionCreator: employeeActions.updateEmployee,
  effect: async (action, listenerApi) => {
    const { body, onSuccess, onFailed } = action.payload;
    listenerApi.dispatch(employeeActions.setLoadingDetail(true));
    const response = await employeeServices.updateEmployee(body);
    listenerApi.dispatch(employeeActions.setLoadingDetail(false));

    if (hasError(response) || !response.data) {
      onFailed?.(response);
      return;
    }

    listenerApi.dispatch(employeeActions.setSelectedEmployee(response.data));
    onSuccess?.(response);
  }
});

takeLatestListeners({
  actionCreator: employeeActions.getEmployeeDetail,
  effect: async (action, listenerApi) => {
    const { body, onSuccess, onFailed } = action.payload;
    listenerApi.dispatch(employeeActions.setLoadingDetail(true));
    const response = await employeeServices.getEmployeeDetail(body);
    listenerApi.dispatch(employeeActions.setLoadingDetail(false));

    if (hasError(response) || !response.data) {
      listenerApi.dispatch(employeeActions.setSelectedEmployee(undefined));
      onFailed?.(response);
      return;
    }

    listenerApi.dispatch(employeeActions.setSelectedEmployee(response.data));
    onSuccess?.(response);
  }
});

takeLatestListeners({
  actionCreator: employeeActions.deleteEmployee,
  effect: async (action, listenerApi) => {
    const { body, onSuccess, onFailed } = action.payload;
    listenerApi.dispatch(employeeActions.setLoadingDetail(true));
    const response = await employeeServices.deleteEmployee(body);
    listenerApi.dispatch(employeeActions.setLoadingDetail(false));

    if (hasError(response)) {
      onFailed?.(response);
      return;
    }

    onSuccess?.(response);
  }
});

takeLatestListeners({
  actionCreator: employeeActions.uploadEmployeeAvatar,
  effect: async (action, listenerApi) => {
    const { body, onSuccess, onFailed } = action.payload;
    listenerApi.dispatch(employeeActions.setLoadingDetail(true));
    const response = await employeeServices.uploadEmployeeAvatar(body);
    listenerApi.dispatch(employeeActions.setLoadingDetail(false));

    if (hasError(response) || !response.data) {
      onFailed?.(response);
      return;
    }

    onSuccess?.(response);
  }
});

takeLatestListeners({
  actionCreator: employeeActions.deleteEmployeeAvatar,
  effect: async (action, listenerApi) => {
    const { body, onSuccess, onFailed } = action.payload;
    listenerApi.dispatch(employeeActions.setLoadingDetail(true));
    const response = await employeeServices.deleteEmployeeAvatar(body);
    listenerApi.dispatch(employeeActions.setLoadingDetail(false));

    if (hasError(response) || !response.data) {
      onFailed?.(response);
      return;
    }

    onSuccess?.(response);
  }
});

takeLatestListeners({
  actionCreator: employeeActions.uploadEmployeeContractFile,
  effect: async (action, listenerApi) => {
    const { body, onSuccess, onFailed } = action.payload;
    listenerApi.dispatch(employeeActions.setLoadingDetail(true));
    const response = await employeeServices.uploadEmployeeContractFile(body);
    listenerApi.dispatch(employeeActions.setLoadingDetail(false));

    if (hasError(response) || !response.data) {
      onFailed?.(response);
      return;
    }

    onSuccess?.(response);
  }
});

takeLatestListeners({
  actionCreator: employeeActions.deleteEmployeeContractFile,
  effect: async (action, listenerApi) => {
    const { body, onSuccess, onFailed } = action.payload;
    listenerApi.dispatch(employeeActions.setLoadingDetail(true));
    const response = await employeeServices.deleteEmployeeContractFile(body);
    listenerApi.dispatch(employeeActions.setLoadingDetail(false));

    if (hasError(response) || !response.data) {
      onFailed?.(response);
      return;
    }

    onSuccess?.(response);
  }
});

takeLatestListeners({
  actionCreator: employeeActions.addSalaryHistory,
  effect: async (action, listenerApi) => {
    const { body, onSuccess, onFailed } = action.payload;
    listenerApi.dispatch(employeeActions.setLoadingDetail(true));
    const response = await employeeServices.addSalaryHistory(body);
    listenerApi.dispatch(employeeActions.setLoadingDetail(false));

    if (hasError(response) || !response.data) {
      onFailed?.(response);
      return;
    }

    listenerApi.dispatch(employeeActions.setSelectedEmployee(response.data));
    onSuccess?.(response);
  }
});

takeLatestListeners({
  actionCreator: employeeActions.deleteSalaryHistory,
  effect: async (action, listenerApi) => {
    const { body, onSuccess, onFailed } = action.payload;
    listenerApi.dispatch(employeeActions.setLoadingDetail(true));
    const response = await employeeServices.deleteSalaryHistory(body);
    listenerApi.dispatch(employeeActions.setLoadingDetail(false));

    if (hasError(response)) {
      onFailed?.(response);
      return;
    }

    onSuccess?.(response);
  }
});
