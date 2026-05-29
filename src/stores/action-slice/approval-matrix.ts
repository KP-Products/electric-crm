import {
  EDIT_APPROVAL_MATRIX,
  GET_APPROVAL_MATRIX_DETAIL,
  GET_LIST_APPROVAL_FUNCTION
} from '@redux-action-type/approval-matrix';
import { createAction, createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  EditApprovalMatrixReq,
  EditApprovalMatrixRes,
  GetApprovalMatrixDetailReq,
  GetApprovalMatrixDetailRes,
  GetListApprovalFunctionRes
} from 'model/approval-matrix';
import { ErrorBase } from 'model/common';
import { Permission } from 'model/role';
import { SLICE_NAME } from 'stores/types';

export interface ApprovalMatrixState {
  functionList: Permission[];
  loadingList: boolean;
  loadingDetail: boolean;
}

export const initialApprovalMatrix: ApprovalMatrixState = {
  functionList: [],
  loadingList: false,
  loadingDetail: false
};

const approvalMatrixSlice = createSlice({
  name: SLICE_NAME.APPROVAL_MATRIX,
  initialState: initialApprovalMatrix,
  reducers: {
    reset: () => initialApprovalMatrix,
    setLoadingList: (state, { payload }: PayloadAction<boolean>) => {
      state.loadingList = payload;
    },
    setLoadingDetail: (state, { payload }: PayloadAction<boolean>) => {
      state.loadingDetail = payload;
    },
    setFunctionList: (state, { payload }: PayloadAction<Permission[]>) => {
      state.functionList = payload;
    }
  }
});

const getListApprovalFunction = createAction(
  GET_LIST_APPROVAL_FUNCTION,
  (
    onSuccess: (data: GetListApprovalFunctionRes) => void,
    onFailed: (error?: ErrorBase) => void
  ) => ({
    payload: { onSuccess, onFailed }
  })
);

const getApprovalMatrixDetail = createAction(
  GET_APPROVAL_MATRIX_DETAIL,
  (
    body: GetApprovalMatrixDetailReq,
    onSuccess: (data: GetApprovalMatrixDetailRes) => void,
    onFailed: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

const editApprovalMatrix = createAction(
  EDIT_APPROVAL_MATRIX,
  (
    body: EditApprovalMatrixReq,
    onSuccess: (data: EditApprovalMatrixRes) => void,
    onFailed: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

export const approvalMatrixActions = {
  ...approvalMatrixSlice.actions,
  getListApprovalFunction,
  getApprovalMatrixDetail,
  editApprovalMatrix
};

export const approvalMatrixReducer = approvalMatrixSlice.reducer;
