import { createDeepEqualSelector } from '@redux-common';
import { initialCompanyLegalDocument } from '@redux-slice/company-legal-document';
import { RootState } from '@store/all-reducers';

const selectDomain = (state: RootState) =>
  state?.companyLegalDocument || initialCompanyLegalDocument;

export const selectCompanyLegalDocumentList = createDeepEqualSelector(
  selectDomain,
  (companyLegalDocument) => companyLegalDocument.companyLegalDocumentList
);

export const selectCompanyLegalDocumentTotal = createDeepEqualSelector(
  selectDomain,
  (companyLegalDocument) => companyLegalDocument.total
);

export const selectCompanyLegalDocumentLoadingList = createDeepEqualSelector(
  selectDomain,
  (companyLegalDocument) => companyLegalDocument.loadingList
);

export const selectCompanyLegalDocumentLoadingDetail = createDeepEqualSelector(
  selectDomain,
  (companyLegalDocument) => companyLegalDocument.loadingDetail
);
