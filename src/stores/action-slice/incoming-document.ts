import {
  CREATE_INCOMING_DOCUMENT,
  DELETE_INCOMING_DOCUMENT,
  DELETE_INCOMING_DOCUMENT_ATTACHMENT,
  GET_INCOMING_DOCUMENT_DETAIL,
  SEARCH_INCOMING_DOCUMENTS,
  UPDATE_INCOMING_DOCUMENT,
  UPLOAD_INCOMING_DOCUMENT_ATTACHMENT
} from '@redux-action-type/incoming-document';
import { createAction, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ErrorBase } from 'model/common';
import {
  CreateIncomingDocumentReq,
  DeleteIncomingDocumentRes,
  IncomingDocument,
  IncomingDocumentIdReq,
  IncomingDocumentRes,
  SearchIncomingDocumentRes,
  SearchIncomingDocumentsReq,
  UpdateIncomingDocumentReq,
  UploadIncomingDocumentAttachmentReq
} from 'model/incoming-document';
import { SLICE_NAME } from 'stores/types';

export interface IncomingDocumentState {
  incomingDocumentList: IncomingDocument[];
  total: number;
  loadingList: boolean;
  loadingDetail: boolean;
}

export const initialIncomingDocument: IncomingDocumentState = {
  incomingDocumentList: [],
  total: 0,
  loadingList: false,
  loadingDetail: false
};

const incomingDocumentSlice = createSlice({
  name: SLICE_NAME.INCOMING_DOCUMENT,
  initialState: initialIncomingDocument,
  reducers: {
    reset: () => initialIncomingDocument,
    setLoadingList: (state, { payload }: PayloadAction<boolean>) => {
      state.loadingList = payload;
    },
    setLoadingDetail: (state, { payload }: PayloadAction<boolean>) => {
      state.loadingDetail = payload;
    },
    setIncomingDocumentList: (state, { payload }: PayloadAction<IncomingDocument[]>) => {
      state.incomingDocumentList = payload;
    },
    setTotal: (state, { payload }: PayloadAction<number>) => {
      state.total = payload;
    }
  }
});

const searchIncomingDocuments = createAction(
  SEARCH_INCOMING_DOCUMENTS,
  (
    body: SearchIncomingDocumentsReq,
    onSuccess?: (data: SearchIncomingDocumentRes) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

const createIncomingDocument = createAction(
  CREATE_INCOMING_DOCUMENT,
  (
    body: CreateIncomingDocumentReq,
    onSuccess?: (data: IncomingDocumentRes) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

const updateIncomingDocument = createAction(
  UPDATE_INCOMING_DOCUMENT,
  (
    body: UpdateIncomingDocumentReq,
    onSuccess?: (data: IncomingDocumentRes) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

const getIncomingDocumentDetail = createAction(
  GET_INCOMING_DOCUMENT_DETAIL,
  (
    body: IncomingDocumentIdReq,
    onSuccess?: (data: IncomingDocumentRes) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

const deleteIncomingDocument = createAction(
  DELETE_INCOMING_DOCUMENT,
  (
    body: IncomingDocumentIdReq,
    onSuccess?: (data: DeleteIncomingDocumentRes) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

const uploadIncomingDocumentAttachment = createAction(
  UPLOAD_INCOMING_DOCUMENT_ATTACHMENT,
  (
    body: UploadIncomingDocumentAttachmentReq,
    onSuccess?: (data: IncomingDocumentRes) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

const deleteIncomingDocumentAttachment = createAction(
  DELETE_INCOMING_DOCUMENT_ATTACHMENT,
  (
    body: IncomingDocumentIdReq,
    onSuccess?: (data: IncomingDocumentRes) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

export const incomingDocumentActions = {
  ...incomingDocumentSlice.actions,
  searchIncomingDocuments,
  createIncomingDocument,
  updateIncomingDocument,
  getIncomingDocumentDetail,
  deleteIncomingDocument,
  uploadIncomingDocumentAttachment,
  deleteIncomingDocumentAttachment
};

export const incomingDocumentReducer = incomingDocumentSlice.reducer;
