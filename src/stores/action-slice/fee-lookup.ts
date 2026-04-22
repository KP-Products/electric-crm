import {
  DOWNLOAD_LOOKUP,
  GET_LIST_FEE_COLLECTION_ESTIMATE,
  GET_LIST_FEE_COLLECTION_HISTORY
} from '@redux-action-type/fee-lookup';
import { createAction, createSlice } from '@reduxjs/toolkit';
import { ErrorBase } from 'model/common';
import { FeeLookupBody, FeeLookupListResponse, FeeLookupState } from 'model/fee-lookup';
import { SLICE_NAME } from 'stores/types';
import { DownloadLookupBody, DownloadLookupResponse } from './../../model/fee-lookup';

export const initialFeeLookup: FeeLookupState = {
  loading: false,
  feeCollectionHistory: [],
  feeCollectionEstimate: []
};

export const feeLookupSlice = createSlice({
  name: SLICE_NAME.FEE_LOOKUP,
  initialState: initialFeeLookup,
  reducers: {
    reset: () => initialFeeLookup,
    onChangeState: (state, { payload }: { payload: Partial<FeeLookupState> }) => {
      return { ...state, ...payload };
    }
  }
});

const getListFeeCollectionHistory = createAction(
  GET_LIST_FEE_COLLECTION_HISTORY,
  (
    body?: FeeLookupBody,
    onSuccess?: (response: FeeLookupListResponse) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

const getListFeeCollectionEstimate = createAction(
  GET_LIST_FEE_COLLECTION_ESTIMATE,
  (
    body?: FeeLookupBody,
    onSuccess?: (response: FeeLookupListResponse) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

const downloadLookup = createAction(
  DOWNLOAD_LOOKUP,
  (
    body?: DownloadLookupBody,
    onSuccess?: (response: DownloadLookupResponse) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

export const feeLookupActions = {
  ...feeLookupSlice.actions,
  getListFeeCollectionHistory,
  getListFeeCollectionEstimate,
  downloadLookup
};
