import { takeLatestListeners } from '@listener';
import { contractActions } from '@redux-slice/contract';
import contractServices from 'services/contract-services';

takeLatestListeners({
  actionCreator: contractActions.searchContract,
  effect: async (action, listenerApi) => {
    const { body, onSuccess, onFailed } = action.payload;
    listenerApi.dispatch(contractActions.setLoadingList(true));
    const response = await contractServices.searchContract(body);
    listenerApi.dispatch(contractActions.setLoadingList(false));

    if (!response || !response.data) {
      onFailed?.(response);
      return;
    }

    listenerApi.dispatch(contractActions.setContractList(response.data.items || []));
    listenerApi.dispatch(contractActions.setTotal(response.data.total || 0));
    onSuccess?.(response);
  }
});

takeLatestListeners({
  actionCreator: contractActions.createContract,
  effect: async (action, listenerApi) => {
    const { body, onSuccess, onFailed } = action.payload;
    listenerApi.dispatch(contractActions.setLoadingDetail(true));
    const response = await contractServices.createContract(body);
    listenerApi.dispatch(contractActions.setLoadingDetail(false));

    if (!response || !response.data) {
      onFailed?.(response);
      return;
    }

    onSuccess?.(response);
  }
});

takeLatestListeners({
  actionCreator: contractActions.updateContract,
  effect: async (action, listenerApi) => {
    const { body, onSuccess, onFailed } = action.payload;
    listenerApi.dispatch(contractActions.setLoadingDetail(true));
    const response = await contractServices.updateContract(body);
    listenerApi.dispatch(contractActions.setLoadingDetail(false));

    if (!response || !response.data) {
      onFailed?.(response);
      return;
    }

    onSuccess?.(response);
  }
});

takeLatestListeners({
  actionCreator: contractActions.getContractDetail,
  effect: async (action, listenerApi) => {
    const { body, onSuccess, onFailed } = action.payload;
    listenerApi.dispatch(contractActions.setLoadingDetail(true));
    const response = await contractServices.getContract(body);
    listenerApi.dispatch(contractActions.setLoadingDetail(false));

    if (!response || !response.data) {
      onFailed?.(response);
      return;
    }

    onSuccess?.(response);
  }
});

takeLatestListeners({
  actionCreator: contractActions.deleteContract,
  effect: async (action, listenerApi) => {
    const { body, onSuccess, onFailed } = action.payload;
    listenerApi.dispatch(contractActions.setLoadingDetail(true));
    const response = await contractServices.deleteContract(body);
    listenerApi.dispatch(contractActions.setLoadingDetail(false));

    if (!response) {
      onFailed?.(response);
      return;
    }

    onSuccess?.(response);
  }
});
