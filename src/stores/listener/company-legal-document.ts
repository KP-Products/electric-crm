import { takeLatestListeners } from '@listener';
import { companyLegalDocumentActions } from '@redux-slice/company-legal-document';
import companyLegalDocumentServices from 'services/company-legal-document-services';

const hasError = (response: any) =>
  !response || response.businessErrorMessage || response.systemErrorMessage;

takeLatestListeners({
  actionCreator: companyLegalDocumentActions.searchCompanyLegalDocuments,
  effect: async (action, listenerApi) => {
    const { body, onSuccess, onFailed } = action.payload;
    listenerApi.dispatch(companyLegalDocumentActions.setLoadingList(true));
    const response = await companyLegalDocumentServices.searchCompanyLegalDocuments(body);
    listenerApi.dispatch(companyLegalDocumentActions.setLoadingList(false));

    if (!response || !response.data) {
      onFailed?.(response);
      return;
    }

    listenerApi.dispatch(
      companyLegalDocumentActions.setCompanyLegalDocumentList(response.data.items || [])
    );
    listenerApi.dispatch(companyLegalDocumentActions.setTotal(response.data.total || 0));
    onSuccess?.(response);
  }
});

takeLatestListeners({
  actionCreator: companyLegalDocumentActions.createCompanyLegalDocument,
  effect: async (action, listenerApi) => {
    const { body, onSuccess, onFailed } = action.payload;
    listenerApi.dispatch(companyLegalDocumentActions.setLoadingDetail(true));
    const response = await companyLegalDocumentServices.createCompanyLegalDocument(body);
    listenerApi.dispatch(companyLegalDocumentActions.setLoadingDetail(false));

    if (hasError(response) || !response.data) {
      onFailed?.(response);
      return;
    }

    onSuccess?.(response);
  }
});

takeLatestListeners({
  actionCreator: companyLegalDocumentActions.updateCompanyLegalDocument,
  effect: async (action, listenerApi) => {
    const { body, onSuccess, onFailed } = action.payload;
    listenerApi.dispatch(companyLegalDocumentActions.setLoadingDetail(true));
    const response = await companyLegalDocumentServices.updateCompanyLegalDocument(body);
    listenerApi.dispatch(companyLegalDocumentActions.setLoadingDetail(false));

    if (hasError(response) || !response.data) {
      onFailed?.(response);
      return;
    }

    onSuccess?.(response);
  }
});

takeLatestListeners({
  actionCreator: companyLegalDocumentActions.getCompanyLegalDocumentDetail,
  effect: async (action, listenerApi) => {
    const { body, onSuccess, onFailed } = action.payload;
    listenerApi.dispatch(companyLegalDocumentActions.setLoadingDetail(true));
    const response = await companyLegalDocumentServices.getCompanyLegalDocumentDetail(body);
    listenerApi.dispatch(companyLegalDocumentActions.setLoadingDetail(false));

    if (hasError(response) || !response.data) {
      onFailed?.(response);
      return;
    }

    onSuccess?.(response);
  }
});

takeLatestListeners({
  actionCreator: companyLegalDocumentActions.deleteCompanyLegalDocument,
  effect: async (action, listenerApi) => {
    const { body, onSuccess, onFailed } = action.payload;
    listenerApi.dispatch(companyLegalDocumentActions.setLoadingDetail(true));
    const response = await companyLegalDocumentServices.deleteCompanyLegalDocument(body);
    listenerApi.dispatch(companyLegalDocumentActions.setLoadingDetail(false));

    if (hasError(response)) {
      onFailed?.(response);
      return;
    }

    onSuccess?.(response);
  }
});

takeLatestListeners({
  actionCreator: companyLegalDocumentActions.uploadCompanyLegalDocumentAttachment,
  effect: async (action, listenerApi) => {
    const { body, onSuccess, onFailed } = action.payload;
    listenerApi.dispatch(companyLegalDocumentActions.setLoadingDetail(true));
    const response = await companyLegalDocumentServices.uploadCompanyLegalDocumentAttachment(body);
    listenerApi.dispatch(companyLegalDocumentActions.setLoadingDetail(false));

    if (hasError(response) || !response.data) {
      onFailed?.(response);
      return;
    }

    onSuccess?.(response);
  }
});

takeLatestListeners({
  actionCreator: companyLegalDocumentActions.deleteCompanyLegalDocumentAttachment,
  effect: async (action, listenerApi) => {
    const { body, onSuccess, onFailed } = action.payload;
    listenerApi.dispatch(companyLegalDocumentActions.setLoadingDetail(true));
    const response = await companyLegalDocumentServices.deleteCompanyLegalDocumentAttachment(body);
    listenerApi.dispatch(companyLegalDocumentActions.setLoadingDetail(false));

    if (hasError(response) || !response.data) {
      onFailed?.(response);
      return;
    }

    onSuccess?.(response);
  }
});
