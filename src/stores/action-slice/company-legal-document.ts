import {
  CREATE_COMPANY_LEGAL_DOCUMENT,
  DELETE_COMPANY_LEGAL_DOCUMENT,
  DELETE_COMPANY_LEGAL_DOCUMENT_ATTACHMENT,
  GET_COMPANY_LEGAL_DOCUMENT_DETAIL,
  SEARCH_COMPANY_LEGAL_DOCUMENTS,
  UPDATE_COMPANY_LEGAL_DOCUMENT,
  UPLOAD_COMPANY_LEGAL_DOCUMENT_ATTACHMENT
} from '@redux-action-type/company-legal-document';
import { createAction, createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  CompanyLegalDocument,
  CompanyLegalDocumentIdReq,
  CompanyLegalDocumentRes,
  CreateCompanyLegalDocumentReq,
  DeleteCompanyLegalDocumentRes,
  SearchCompanyLegalDocumentReq,
  SearchCompanyLegalDocumentRes,
  UpdateCompanyLegalDocumentReq,
  UploadCompanyLegalDocumentAttachmentReq
} from 'model/company-legal-document';
import { ErrorBase } from 'model/common';
import { SLICE_NAME } from 'stores/types';

export interface CompanyLegalDocumentState {
  companyLegalDocumentList: CompanyLegalDocument[];
  total: number;
  loadingList: boolean;
  loadingDetail: boolean;
}

export const initialCompanyLegalDocument: CompanyLegalDocumentState = {
  companyLegalDocumentList: [],
  total: 0,
  loadingList: false,
  loadingDetail: false
};

const companyLegalDocumentSlice = createSlice({
  name: SLICE_NAME.COMPANY_LEGAL_DOCUMENT,
  initialState: initialCompanyLegalDocument,
  reducers: {
    reset: () => initialCompanyLegalDocument,
    setLoadingList: (state, { payload }: PayloadAction<boolean>) => {
      state.loadingList = payload;
    },
    setLoadingDetail: (state, { payload }: PayloadAction<boolean>) => {
      state.loadingDetail = payload;
    },
    setCompanyLegalDocumentList: (state, { payload }: PayloadAction<CompanyLegalDocument[]>) => {
      state.companyLegalDocumentList = payload;
    },
    setTotal: (state, { payload }: PayloadAction<number>) => {
      state.total = payload;
    }
  }
});

const searchCompanyLegalDocuments = createAction(
  SEARCH_COMPANY_LEGAL_DOCUMENTS,
  (
    body: SearchCompanyLegalDocumentReq,
    onSuccess?: (data: SearchCompanyLegalDocumentRes) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

const createCompanyLegalDocument = createAction(
  CREATE_COMPANY_LEGAL_DOCUMENT,
  (
    body: CreateCompanyLegalDocumentReq,
    onSuccess?: (data: CompanyLegalDocumentRes) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

const updateCompanyLegalDocument = createAction(
  UPDATE_COMPANY_LEGAL_DOCUMENT,
  (
    body: UpdateCompanyLegalDocumentReq,
    onSuccess?: (data: CompanyLegalDocumentRes) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

const getCompanyLegalDocumentDetail = createAction(
  GET_COMPANY_LEGAL_DOCUMENT_DETAIL,
  (
    body: CompanyLegalDocumentIdReq,
    onSuccess?: (data: CompanyLegalDocumentRes) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

const deleteCompanyLegalDocument = createAction(
  DELETE_COMPANY_LEGAL_DOCUMENT,
  (
    body: CompanyLegalDocumentIdReq,
    onSuccess?: (data: DeleteCompanyLegalDocumentRes) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

const uploadCompanyLegalDocumentAttachment = createAction(
  UPLOAD_COMPANY_LEGAL_DOCUMENT_ATTACHMENT,
  (
    body: UploadCompanyLegalDocumentAttachmentReq,
    onSuccess?: (data: CompanyLegalDocumentRes) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

const deleteCompanyLegalDocumentAttachment = createAction(
  DELETE_COMPANY_LEGAL_DOCUMENT_ATTACHMENT,
  (
    body: CompanyLegalDocumentIdReq,
    onSuccess?: (data: CompanyLegalDocumentRes) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

export const companyLegalDocumentActions = {
  ...companyLegalDocumentSlice.actions,
  searchCompanyLegalDocuments,
  createCompanyLegalDocument,
  updateCompanyLegalDocument,
  getCompanyLegalDocumentDetail,
  deleteCompanyLegalDocument,
  uploadCompanyLegalDocumentAttachment,
  deleteCompanyLegalDocumentAttachment
};

export const companyLegalDocumentReducer = companyLegalDocumentSlice.reducer;
