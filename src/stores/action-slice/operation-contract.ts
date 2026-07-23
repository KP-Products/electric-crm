import {
  CREATE_OPERATION_CONTRACT,
  DELETE_OPERATION_CONTRACT,
  GET_OPERATION_CONTRACT_DETAIL,
  SEARCH_OPERATION_CONTRACT,
  UPDATE_OPERATION_CONTRACT
} from '@redux-action-type/operation-contract';
import { createAction, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ErrorBase } from 'model/common';
import {
  CreateOperationContractReq,
  DeleteOperationContractRes,
  OperationContract,
  OperationContractIdReq,
  OperationContractRes,
  SearchOperationContractsReq,
  SearchOperationContractsRes,
  UpdateOperationContractReq
} from 'model/operation-contract';
import { SLICE_NAME } from 'stores/types';

export interface OperationContractState {
  operationContractList: OperationContract[];
  total: number;
  loadingList: boolean;
  loadingDetail: boolean;
}

export const initialOperationContract: OperationContractState = {
  operationContractList: [],
  total: 0,
  loadingList: false,
  loadingDetail: false
};

const operationContractSlice = createSlice({
  name: SLICE_NAME.OPERATION_CONTRACT,
  initialState: initialOperationContract,
  reducers: {
    reset: () => initialOperationContract,
    setLoadingList: (state, { payload }: PayloadAction<boolean>) => {
      state.loadingList = payload;
    },
    setLoadingDetail: (state, { payload }: PayloadAction<boolean>) => {
      state.loadingDetail = payload;
    },
    setOperationContractList: (state, { payload }: PayloadAction<OperationContract[]>) => {
      state.operationContractList = payload;
    },
    setTotal: (state, { payload }: PayloadAction<number>) => {
      state.total = payload;
    }
  }
});

const searchOperationContract = createAction(
  SEARCH_OPERATION_CONTRACT,
  (
    body: SearchOperationContractsReq,
    onSuccess?: (data: SearchOperationContractsRes) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

const createOperationContract = createAction(
  CREATE_OPERATION_CONTRACT,
  (
    body: CreateOperationContractReq,
    onSuccess?: (data: OperationContractRes) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

const updateOperationContract = createAction(
  UPDATE_OPERATION_CONTRACT,
  (
    body: UpdateOperationContractReq,
    onSuccess?: (data: OperationContractRes) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

const getOperationContractDetail = createAction(
  GET_OPERATION_CONTRACT_DETAIL,
  (
    body: OperationContractIdReq,
    onSuccess?: (data: OperationContractRes) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

const deleteOperationContract = createAction(
  DELETE_OPERATION_CONTRACT,
  (
    body: OperationContractIdReq,
    onSuccess?: (data: DeleteOperationContractRes) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

export const operationContractActions = {
  ...operationContractSlice.actions,
  searchOperationContract,
  createOperationContract,
  updateOperationContract,
  getOperationContractDetail,
  deleteOperationContract
};

export const operationContractReducer = operationContractSlice.reducer;
