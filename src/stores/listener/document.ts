import { takeLatestListeners } from '@listener';
import { documentActions } from '@redux-slice/document';
import documentServices from 'services/document-services';

takeLatestListeners({
  actionCreator: documentActions.searchDocument,
  effect: async (action, listenerApi) => {
    const { body, onSuccess, onFailed } = action.payload;
    listenerApi.dispatch(documentActions.setLoadingList(true));
    const response = await documentServices.searchDocument(body);
    listenerApi.dispatch(documentActions.setLoadingList(false));

    if (!response || !response.data) {
      onFailed?.(response);
      return;
    }

    listenerApi.dispatch(documentActions.setDocumentList(response.data.items || []));
    listenerApi.dispatch(documentActions.setTotal(response.data.total || 0));
    onSuccess?.(response);
  }
});

takeLatestListeners({
  actionCreator: documentActions.uploadDocument,
  effect: async (action, listenerApi) => {
    const { body, onSuccess, onFailed } = action.payload;
    listenerApi.dispatch(documentActions.setLoadingDetail(true));
    const response = await documentServices.uploadDocument(body);
    listenerApi.dispatch(documentActions.setLoadingDetail(false));

    if (!response || !response.data) {
      onFailed?.(response);
      return;
    }

    onSuccess?.(response);
  }
});

takeLatestListeners({
  actionCreator: documentActions.updateDocument,
  effect: async (action, listenerApi) => {
    const { body, onSuccess, onFailed } = action.payload;
    listenerApi.dispatch(documentActions.setLoadingDetail(true));
    const response = await documentServices.updateDocument(body);
    listenerApi.dispatch(documentActions.setLoadingDetail(false));

    if (!response || response.businessErrorMessage || response.systemErrorMessage) {
      onFailed?.(response);
      return;
    }

    onSuccess?.(response);
  }
});

takeLatestListeners({
  actionCreator: documentActions.deleteDocument,
  effect: async (action, listenerApi) => {
    const { body, onSuccess, onFailed } = action.payload;
    listenerApi.dispatch(documentActions.setLoadingDetail(true));
    const response = await documentServices.deleteDocument(body);
    listenerApi.dispatch(documentActions.setLoadingDetail(false));

    if (!response) {
      onFailed?.(response);
      return;
    }

    onSuccess?.(response);
  }
});

takeLatestListeners({
  actionCreator: documentActions.getDocumentDetail,
  effect: async (action, listenerApi) => {
    const { body, onSuccess, onFailed } = action.payload;
    listenerApi.dispatch(documentActions.setLoadingDetail(true));
    const response = await documentServices.getDocumentDetail(body);
    listenerApi.dispatch(documentActions.setLoadingDetail(false));
    const responseAny = response as any;
    const responseLink =
      responseAny?.viewUrl ||
      responseAny?.downloadUrl ||
      responseAny?.fileUrl ||
      responseAny?.url ||
      responseAny?.link ||
      responseAny?.path;
    const normalizedResponse =
      typeof (response as unknown) === 'string'
        ? ({ data: response as unknown as string } as typeof response)
        : ({
            ...response,
            data: responseAny?.data ?? (responseLink ? response : undefined)
          } as typeof response);

    if (
      !normalizedResponse ||
      normalizedResponse.data === undefined ||
      normalizedResponse.data === null
    ) {
      onFailed?.(normalizedResponse);
      return;
    }

    onSuccess?.(normalizedResponse);
  }
});
