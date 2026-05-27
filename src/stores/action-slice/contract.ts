import {
  CREATE_CONTRACT,
  DELETE_CONTRACT,
  GET_CONTRACT_DETAIL,
  SEARCH_CONTRACT,
  UPDATE_CONTRACT
} from '@redux-action-type/contract';
import { createAction, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ErrorBase } from 'model/common';
import {
  Contract,
  ContractDeleteRes,
  ContractRes,
  ContractSearchReq,
  ContractSearchRes,
  CreateContractReq,
  DeleteContractReq,
  GetContractReq,
  UpdateContractReq
} from 'model/contract';
import { SLICE_NAME } from 'stores/types';

export interface ContractState {
  contractList: Contract[];
  total: number;
  loadingList: boolean;
  loadingDetail: boolean;
}

export const initialContract: ContractState = {
  contractList: [],
  total: 0,
  loadingList: false,
  loadingDetail: false
};

const contractSlice = createSlice({
  name: SLICE_NAME.CONTRACT,
  initialState: initialContract,
  reducers: {
    reset: () => initialContract,
    setLoadingList: (state, { payload }: PayloadAction<boolean>) => {
      state.loadingList = payload;
    },
    setLoadingDetail: (state, { payload }: PayloadAction<boolean>) => {
      state.loadingDetail = payload;
    },
    setContractList: (state, { payload }: PayloadAction<Contract[]>) => {
      state.contractList = payload;
    },
    setTotal: (state, { payload }: PayloadAction<number>) => {
      state.total = payload;
    }
  }
});

const searchContract = createAction(
  SEARCH_CONTRACT,
  (
    body: ContractSearchReq,
    onSuccess?: (data: ContractSearchRes) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

const createContract = createAction(
  CREATE_CONTRACT,
  (
    body: CreateContractReq,
    onSuccess?: (data: ContractRes) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

const updateContract = createAction(
  UPDATE_CONTRACT,
  (
    body: UpdateContractReq,
    onSuccess?: (data: ContractRes) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

const getContractDetail = createAction(
  GET_CONTRACT_DETAIL,
  (
    body: GetContractReq,
    onSuccess?: (data: ContractRes) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

const deleteContract = createAction(
  DELETE_CONTRACT,
  (
    body: DeleteContractReq,
    onSuccess?: (data: ContractDeleteRes) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

export const contractActions = {
  ...contractSlice.actions,
  searchContract,
  createContract,
  updateContract,
  getContractDetail,
  deleteContract
};

export const contractReducer = contractSlice.reducer;
