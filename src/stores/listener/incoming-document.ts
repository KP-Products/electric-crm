import { takeLatestListeners } from '@listener';
import { incomingDocumentActions } from '@redux-slice/incoming-document';
import incomingDocumentServices from 'services/incoming-document-services';

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
  actionCreator: incomingDocumentActions.searchIncomingDocuments,
  effect: async (action, listenerApi) => {
    const { body, onSuccess, onFailed } = action.payload;
    listenerApi.dispatch(incomingDocumentActions.setLoadingList(true));
    const response = await incomingDocumentServices.searchIncomingDocuments(body);
    listenerApi.dispatch(incomingDocumentActions.setLoadingList(false));

    if (hasError(response) || !response.data) {
      listenerApi.dispatch(incomingDocumentActions.setIncomingDocumentList([]));
      listenerApi.dispatch(incomingDocumentActions.setTotal(0));
      onFailed?.(response);
      return;
    }

    listenerApi.dispatch(
      incomingDocumentActions.setIncomingDocumentList(response.data.items || [])
    );
    listenerApi.dispatch(incomingDocumentActions.setTotal(response.data.total || 0));
    onSuccess?.(response);
  }
});

takeLatestListeners({
  actionCreator: incomingDocumentActions.createIncomingDocument,
  effect: async (action, listenerApi) => {
    const { body, onSuccess, onFailed } = action.payload;
    listenerApi.dispatch(incomingDocumentActions.setLoadingDetail(true));
    const response = await incomingDocumentServices.createIncomingDocument(body);
    listenerApi.dispatch(incomingDocumentActions.setLoadingDetail(false));

    if (hasError(response) || !response.data) {
      onFailed?.(response);
      return;
    }

    onSuccess?.(response);
  }
});

takeLatestListeners({
  actionCreator: incomingDocumentActions.updateIncomingDocument,
  effect: async (action, listenerApi) => {
    const { body, onSuccess, onFailed } = action.payload;
    listenerApi.dispatch(incomingDocumentActions.setLoadingDetail(true));
    const response = await incomingDocumentServices.updateIncomingDocument(body);
    listenerApi.dispatch(incomingDocumentActions.setLoadingDetail(false));

    if (hasError(response) || !response.data) {
      onFailed?.(response);
      return;
    }

    onSuccess?.(response);
  }
});

takeLatestListeners({
  actionCreator: incomingDocumentActions.getIncomingDocumentDetail,
  effect: async (action, listenerApi) => {
    const { body, onSuccess, onFailed } = action.payload;
    listenerApi.dispatch(incomingDocumentActions.setLoadingDetail(true));
    const response = await incomingDocumentServices.getIncomingDocumentDetail(body);
    listenerApi.dispatch(incomingDocumentActions.setLoadingDetail(false));

    if (hasError(response) || !response.data) {
      onFailed?.(response);
      return;
    }

    onSuccess?.(response);
  }
});

takeLatestListeners({
  actionCreator: incomingDocumentActions.deleteIncomingDocument,
  effect: async (action, listenerApi) => {
    const { body, onSuccess, onFailed } = action.payload;
    listenerApi.dispatch(incomingDocumentActions.setLoadingDetail(true));
    const response = await incomingDocumentServices.deleteIncomingDocument(body);
    listenerApi.dispatch(incomingDocumentActions.setLoadingDetail(false));

    if (hasError(response)) {
      onFailed?.(response);
      return;
    }

    onSuccess?.(response);
  }
});

takeLatestListeners({
  actionCreator: incomingDocumentActions.uploadIncomingDocumentAttachment,
  effect: async (action, listenerApi) => {
    const { body, onSuccess, onFailed } = action.payload;
    listenerApi.dispatch(incomingDocumentActions.setLoadingDetail(true));
    const response = await incomingDocumentServices.uploadIncomingDocumentAttachment(body);
    listenerApi.dispatch(incomingDocumentActions.setLoadingDetail(false));

    if (hasError(response) || !response.data) {
      onFailed?.(response);
      return;
    }

    onSuccess?.(response);
  }
});

takeLatestListeners({
  actionCreator: incomingDocumentActions.deleteIncomingDocumentAttachment,
  effect: async (action, listenerApi) => {
    const { body, onSuccess, onFailed } = action.payload;
    listenerApi.dispatch(incomingDocumentActions.setLoadingDetail(true));
    const response = await incomingDocumentServices.deleteIncomingDocumentAttachment(body);
    listenerApi.dispatch(incomingDocumentActions.setLoadingDetail(false));

    if (hasError(response) || !response.data) {
      onFailed?.(response);
      return;
    }

    onSuccess?.(response);
  }
});
