import {
  CREATE_BRANCH,
  DELETE_BRANCH,
  GET_BRANCH_DETAIL,
  GET_BRANCH_USERS,
  SEARCH_BRANCH,
  UPDATE_BRANCH
} from '@redux-action-type/branch';
import { createAction, createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  Branch,
  BranchRes,
  BranchSearchReq,
  BranchSearchRes,
  BranchUser,
  BranchUsersReq,
  BranchUsersRes,
  CreateBranchReq,
  DeleteBranchReq,
  GetBranchReq,
  UpdateBranchReq
} from 'model/branch';
import { ErrorBase } from 'model/common';
import { SLICE_NAME } from 'stores/types';

export interface BranchState {
  branchList: Branch[];
  branchUsers: BranchUser[];
  total: number;
  loadingList: boolean;
  loadingDetail: boolean;
  loadingUsers: boolean;
}

export const initialBranch: BranchState = {
  branchList: [],
  branchUsers: [],
  total: 0,
  loadingList: false,
  loadingDetail: false,
  loadingUsers: false
};

const branchSlice = createSlice({
  name: SLICE_NAME.BRANCH,
  initialState: initialBranch,
  reducers: {
    reset: () => initialBranch,
    setLoadingList: (state, { payload }: PayloadAction<boolean>) => {
      state.loadingList = payload;
    },
    setLoadingDetail: (state, { payload }: PayloadAction<boolean>) => {
      state.loadingDetail = payload;
    },
    setLoadingUsers: (state, { payload }: PayloadAction<boolean>) => {
      state.loadingUsers = payload;
    },
    setBranchList: (state, { payload }: PayloadAction<Branch[]>) => {
      state.branchList = payload;
    },
    setBranchUsers: (state, { payload }: PayloadAction<BranchUser[]>) => {
      state.branchUsers = payload;
    },
    setTotal: (state, { payload }: PayloadAction<number>) => {
      state.total = payload;
    }
  }
});

const searchBranch = createAction(
  SEARCH_BRANCH,
  (
    body: BranchSearchReq,
    onSuccess?: (data: BranchSearchRes) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

const createBranch = createAction(
  CREATE_BRANCH,
  (
    body: CreateBranchReq,
    onSuccess?: (data: BranchRes) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

const updateBranch = createAction(
  UPDATE_BRANCH,
  (
    body: UpdateBranchReq,
    onSuccess?: (data: BranchRes) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

const getBranchDetail = createAction(
  GET_BRANCH_DETAIL,
  (
    body: GetBranchReq,
    onSuccess?: (data: BranchRes) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

const deleteBranch = createAction(
  DELETE_BRANCH,
  (
    body: DeleteBranchReq,
    onSuccess?: (data: BranchRes) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

const getBranchUsers = createAction(
  GET_BRANCH_USERS,
  (
    body: BranchUsersReq,
    onSuccess?: (data: BranchUsersRes) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

export const branchActions = {
  ...branchSlice.actions,
  searchBranch,
  createBranch,
  updateBranch,
  getBranchDetail,
  deleteBranch,
  getBranchUsers
};

export const branchReducer = branchSlice.reducer;
