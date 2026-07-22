import {
  CREATE_OPERATION_PRICE,
  DELETE_OPERATION_PRICE,
  GET_OPERATION_PRICE_DETAIL,
  LOOKUP_OPERATION_PRICE_CONTRACT,
  SEARCH_OPERATION_PRICE,
  UPDATE_OPERATION_PRICE
} from '@redux-action-type/operation-price';
import { createAction, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ErrorBase } from 'model/common';
import {
  ContractLookupReq,
  ContractLookupRes,
  CreateOperationPriceReq,
  DeleteOperationPriceRes,
  OperationPrice,
  OperationPriceIdReq,
  OperationPriceRes,
  SearchOperationPricesReq,
  SearchOperationPricesRes,
  UpdateOperationPriceReq
} from 'model/operation-price';
import { SLICE_NAME } from 'stores/types';

export interface OperationPriceState {
  operationPriceList: OperationPrice[];
  total: number;
  loadingList: boolean;
  loadingDetail: boolean;
  loadingLookup: boolean;
}

export const initialOperationPrice: OperationPriceState = {
  operationPriceList: [],
  total: 0,
  loadingList: false,
  loadingDetail: false,
  loadingLookup: false
};

const operationPriceSlice = createSlice({
  name: SLICE_NAME.OPERATION_PRICE,
  initialState: initialOperationPrice,
  reducers: {
    reset: () => initialOperationPrice,
    setLoadingList: (state, { payload }: PayloadAction<boolean>) => {
      state.loadingList = payload;
    },
    setLoadingDetail: (state, { payload }: PayloadAction<boolean>) => {
      state.loadingDetail = payload;
    },
    setLoadingLookup: (state, { payload }: PayloadAction<boolean>) => {
      state.loadingLookup = payload;
    },
    setOperationPriceList: (state, { payload }: PayloadAction<OperationPrice[]>) => {
      state.operationPriceList = payload;
    },
    setTotal: (state, { payload }: PayloadAction<number>) => {
      state.total = payload;
    }
  }
});

const searchOperationPrice = createAction(
  SEARCH_OPERATION_PRICE,
  (
    body: SearchOperationPricesReq,
    onSuccess?: (data: SearchOperationPricesRes) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

const getOperationPriceDetail = createAction(
  GET_OPERATION_PRICE_DETAIL,
  (
    body: OperationPriceIdReq,
    onSuccess?: (data: OperationPriceRes) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

const createOperationPrice = createAction(
  CREATE_OPERATION_PRICE,
  (
    body: CreateOperationPriceReq,
    onSuccess?: (data: OperationPriceRes) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

const updateOperationPrice = createAction(
  UPDATE_OPERATION_PRICE,
  (
    body: UpdateOperationPriceReq,
    onSuccess?: (data: OperationPriceRes) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

const deleteOperationPrice = createAction(
  DELETE_OPERATION_PRICE,
  (
    body: OperationPriceIdReq,
    onSuccess?: (data: DeleteOperationPriceRes) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

const lookupOperationPriceContract = createAction(
  LOOKUP_OPERATION_PRICE_CONTRACT,
  (
    body: ContractLookupReq,
    onSuccess?: (data: ContractLookupRes) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

export const operationPriceActions = {
  ...operationPriceSlice.actions,
  searchOperationPrice,
  getOperationPriceDetail,
  createOperationPrice,
  updateOperationPrice,
  deleteOperationPrice,
  lookupOperationPriceContract
};

export const operationPriceReducer = operationPriceSlice.reducer;
