import {
  CREATE_OPERATION_UNIT,
  DELETE_OPERATION_UNIT,
  GET_OPERATION_UNIT_DETAIL,
  SEARCH_OPERATION_UNIT,
  UPDATE_OPERATION_UNIT
} from '@redux-action-type/operation-unit';
import { createAction, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ErrorBase } from 'model/common';
import {
  CreateOperationUnitReq,
  DeleteOperationUnitRes,
  OperationUnit,
  OperationUnitIdReq,
  OperationUnitRes,
  SearchOperationUnitsReq,
  SearchOperationUnitsRes,
  UpdateOperationUnitReq
} from 'model/operation-unit';
import { SLICE_NAME } from 'stores/types';

export interface OperationUnitState {
  operationUnitList: OperationUnit[];
  total: number;
  loadingList: boolean;
  loadingDetail: boolean;
}

export const initialOperationUnit: OperationUnitState = {
  operationUnitList: [],
  total: 0,
  loadingList: false,
  loadingDetail: false
};

const operationUnitSlice = createSlice({
  name: SLICE_NAME.OPERATION_UNIT,
  initialState: initialOperationUnit,
  reducers: {
    reset: () => initialOperationUnit,
    setLoadingList: (state, { payload }: PayloadAction<boolean>) => {
      state.loadingList = payload;
    },
    setLoadingDetail: (state, { payload }: PayloadAction<boolean>) => {
      state.loadingDetail = payload;
    },
    setOperationUnitList: (state, { payload }: PayloadAction<OperationUnit[]>) => {
      state.operationUnitList = payload;
    },
    setTotal: (state, { payload }: PayloadAction<number>) => {
      state.total = payload;
    }
  }
});

const searchOperationUnit = createAction(
  SEARCH_OPERATION_UNIT,
  (
    body: SearchOperationUnitsReq,
    onSuccess?: (data: SearchOperationUnitsRes) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

const createOperationUnit = createAction(
  CREATE_OPERATION_UNIT,
  (
    body: CreateOperationUnitReq,
    onSuccess?: (data: OperationUnitRes) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

const updateOperationUnit = createAction(
  UPDATE_OPERATION_UNIT,
  (
    body: UpdateOperationUnitReq,
    onSuccess?: (data: OperationUnitRes) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

const getOperationUnitDetail = createAction(
  GET_OPERATION_UNIT_DETAIL,
  (
    body: OperationUnitIdReq,
    onSuccess?: (data: OperationUnitRes) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

const deleteOperationUnit = createAction(
  DELETE_OPERATION_UNIT,
  (
    body: OperationUnitIdReq,
    onSuccess?: (data: DeleteOperationUnitRes) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

export const operationUnitActions = {
  ...operationUnitSlice.actions,
  searchOperationUnit,
  createOperationUnit,
  updateOperationUnit,
  getOperationUnitDetail,
  deleteOperationUnit
};

export const operationUnitReducer = operationUnitSlice.reducer;
