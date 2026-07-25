import { takeLatestListeners } from '@listener';
import { documentActions } from '@redux-slice/document';
import { DocumentItem, SearchDocumentReq, UnitContractDocuments } from 'model/document';
import documentServices from 'services/document-services';

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

const flattenUnitDocuments = (groups?: UnitContractDocuments[]) => {
  const documentMap = new Map<string, DocumentItem>();

  (Array.isArray(groups) ? groups : []).forEach((group) => {
    const documents = Array.isArray(group.documents) ? group.documents : [];
    documents.forEach((document) => {
      if (document.id) documentMap.set(document.id, document);
    });
  });

  return Array.from(documentMap.values());
};

type DocumentByUnitClientFilter = Partial<Omit<SearchDocumentReq, 'page' | 'size'>>;

const matchesClientFilter = (document: DocumentItem, filter?: DocumentByUnitClientFilter) => {
  if (!filter) return true;
  if (filter.ownerType && document.ownerType !== filter.ownerType) return false;
  if (filter.ownerId && document.ownerId !== filter.ownerId) return false;
  if (filter.docType && document.docType !== filter.docType) return false;
  if (filter.status && document.status !== filter.status) return false;

  const keyword = normalizeApiText(filter.keyword);
  if (!keyword) return true;

  return [
    document.originalFileName,
    document.note,
    document.format,
    document.uploadedBy,
    document.updatedBy
  ]
    .map(normalizeApiText)
    .some((value) => value.includes(keyword));
};

takeLatestListeners({
  actionCreator: documentActions.searchDocument,
  effect: async (action, listenerApi) => {
    const { body, onSuccess, onFailed } = action.payload;
    listenerApi.dispatch(documentActions.setLoadingList(true));
    const response = await documentServices.searchDocument(body);
    if (listenerApi.signal.aborted) return;
    listenerApi.dispatch(documentActions.setLoadingList(false));

    if (hasError(response) || !response.data) {
      listenerApi.dispatch(documentActions.setDocumentList([]));
      listenerApi.dispatch(documentActions.setTotal(0));
      onFailed?.(response);
      return;
    }

    const items = Array.isArray(response.data.items) ? response.data.items : [];
    listenerApi.dispatch(documentActions.setDocumentList(items));
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
    if (listenerApi.signal.aborted) return;
    listenerApi.dispatch(documentActions.setLoadingDetail(false));

    if (hasError(response) || !response.data) {
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
    if (listenerApi.signal.aborted) return;
    listenerApi.dispatch(documentActions.setLoadingDetail(false));

    if (hasError(response) || !response.data) {
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
    if (listenerApi.signal.aborted) return;
    listenerApi.dispatch(documentActions.setLoadingDetail(false));

    if (hasError(response)) {
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
    if (listenerApi.signal.aborted) return;
    listenerApi.dispatch(documentActions.setLoadingDetail(false));

    if (hasError(response) || !response.data) {
      onFailed?.(response);
      return;
    }

    onSuccess?.(response);
  }
});

takeLatestListeners({
  actionCreator: documentActions.listDocumentsByUnit,
  effect: async (action, listenerApi) => {
    const { body, clientFilter, onSuccess, onFailed } = action.payload;
    listenerApi.dispatch(documentActions.setLoadingList(true));
    const response = await documentServices.listDocumentsByUnit(body);
    if (listenerApi.signal.aborted) return;
    listenerApi.dispatch(documentActions.setLoadingList(false));

    if (hasError(response) || !response.data) {
      listenerApi.dispatch(documentActions.setDocumentList([]));
      listenerApi.dispatch(documentActions.setTotal(0));
      onFailed?.(response);
      return;
    }

    const documents = flattenUnitDocuments(response.data).filter((document) =>
      matchesClientFilter(document, clientFilter)
    );
    listenerApi.dispatch(documentActions.setDocumentList(documents));
    listenerApi.dispatch(documentActions.setTotal(documents.length));
    onSuccess?.(response);
  }
});
