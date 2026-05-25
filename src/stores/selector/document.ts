import { createDeepEqualSelector } from '@redux-common';
import { initialDocument } from '@redux-slice/document';
import { RootState } from '@store/all-reducers';

const selectDomain = (state: RootState) => state?.document || initialDocument;

export const selectDocumentList = createDeepEqualSelector(
  selectDomain,
  (document) => document.documentList
);

export const selectDocumentTotal = createDeepEqualSelector(
  selectDomain,
  (document) => document.total
);

export const selectDocumentLoadingList = createDeepEqualSelector(
  selectDomain,
  (document) => document.loadingList
);

export const selectDocumentLoadingDetail = createDeepEqualSelector(
  selectDomain,
  (document) => document.loadingDetail
);
