import { createDeepEqualSelector } from '@redux-common';
import { initialIncomingDocument } from '@redux-slice/incoming-document';
import { RootState } from '@store/all-reducers';

const selectDomain = (state: RootState) => state?.incomingDocument || initialIncomingDocument;

export const selectIncomingDocumentList = createDeepEqualSelector(
  selectDomain,
  (incomingDocument) => incomingDocument.incomingDocumentList
);

export const selectIncomingDocumentTotal = createDeepEqualSelector(
  selectDomain,
  (incomingDocument) => incomingDocument.total
);

export const selectIncomingDocumentLoadingList = createDeepEqualSelector(
  selectDomain,
  (incomingDocument) => incomingDocument.loadingList
);

export const selectIncomingDocumentLoadingDetail = createDeepEqualSelector(
  selectDomain,
  (incomingDocument) => incomingDocument.loadingDetail
);
