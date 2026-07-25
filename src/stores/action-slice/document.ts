import {
  DELETE_DOCUMENT,
  GET_DOCUMENT_DETAIL,
  LIST_DOCUMENTS_BY_UNIT,
  SEARCH_DOCUMENT,
  UPDATE_DOCUMENT,
  UPLOAD_DOCUMENT
} from '@redux-action-type/document';
import { createAction, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ErrorBase } from 'model/common';
import {
  DeleteDocumentReq,
  DeleteDocumentRes,
  DocumentDetailRes,
  DocumentItem,
  DocumentRes,
  GetDocumentReq,
  ListDocumentsByUnitReq,
  ListDocumentsByUnitRes,
  SearchDocumentReq,
  SearchDocumentRes,
  UpdateDocumentReq,
  UploadDocumentReq
} from 'model/document';
import { SLICE_NAME } from 'stores/types';

type DocumentByUnitClientFilter = Partial<Omit<SearchDocumentReq, 'page' | 'size'>>;

export interface DocumentState {
  documentList: DocumentItem[];
  total: number;
  loadingList: boolean;
  loadingDetail: boolean;
}

export const initialDocument: DocumentState = {
  documentList: [],
  total: 0,
  loadingList: false,
  loadingDetail: false
};

const documentSlice = createSlice({
  name: SLICE_NAME.DOCUMENT,
  initialState: initialDocument,
  reducers: {
    reset: () => initialDocument,
    setLoadingList: (state, { payload }: PayloadAction<boolean>) => {
      state.loadingList = payload;
    },
    setLoadingDetail: (state, { payload }: PayloadAction<boolean>) => {
      state.loadingDetail = payload;
    },
    setDocumentList: (state, { payload }: PayloadAction<DocumentItem[]>) => {
      state.documentList = payload;
    },
    setTotal: (state, { payload }: PayloadAction<number>) => {
      state.total = payload;
    }
  }
});

const searchDocument = createAction(
  SEARCH_DOCUMENT,
  (
    body: SearchDocumentReq,
    onSuccess?: (data: SearchDocumentRes) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

const uploadDocument = createAction(
  UPLOAD_DOCUMENT,
  (
    body: UploadDocumentReq,
    onSuccess?: (data: DocumentRes) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

const updateDocument = createAction(
  UPDATE_DOCUMENT,
  (
    body: UpdateDocumentReq,
    onSuccess?: (data: DocumentRes) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

const deleteDocument = createAction(
  DELETE_DOCUMENT,
  (
    body: DeleteDocumentReq,
    onSuccess?: (data: DeleteDocumentRes) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

const getDocumentDetail = createAction(
  GET_DOCUMENT_DETAIL,
  (
    body: GetDocumentReq,
    onSuccess?: (data: DocumentDetailRes) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

const listDocumentsByUnit = createAction(
  LIST_DOCUMENTS_BY_UNIT,
  (
    body: ListDocumentsByUnitReq,
    clientFilter?: DocumentByUnitClientFilter,
    onSuccess?: (data: ListDocumentsByUnitRes) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({
    payload: { body, clientFilter, onSuccess, onFailed }
  })
);

export const documentActions = {
  ...documentSlice.actions,
  searchDocument,
  uploadDocument,
  updateDocument,
  deleteDocument,
  getDocumentDetail,
  listDocumentsByUnit
};

export const documentReducer = documentSlice.reducer;
