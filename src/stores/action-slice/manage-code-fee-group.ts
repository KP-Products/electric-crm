import {
  CREATE_GROUP_CODE_FEE,
  DELETE_GROUP_CODE_FEE,
  DOWNLOAD_GROUP_CODE_FEE,
  GET_DETAIL_GROUP_CODE_FEE,
  GET_LIST_GROUP_CODE_FEE,
  UPDATE_GROUP_CODE_FEE
} from '@redux-action-type/manage-code-fee-group';
import { createAction, createSlice } from '@reduxjs/toolkit';
import { ErrorBase } from 'model/common';
import {
  CreateGroupCodeFeeResponse,
  DeleteGroupCodeFeeResponse,
  DownloadGroupCodeFeeResponse,
  GroupCodeFeeDetailResponse,
  GroupCodeFeeList,
  GroupCodeFeeListBody,
  GroupCodeFeeListResponse,
  GroupCodeFeeState,
  UpdateGroupCodeFeeResponse
} from 'model/manage-code-fee-group';
import { SLICE_NAME } from 'stores/types';

export const initialGroupCodeFee: GroupCodeFeeState = {
  loading: false,
  groupCodeFeeList: []
};

export const groupCodeFeeSlice = createSlice({
  name: SLICE_NAME.MANAGE_CODE_FEE_GROUP,
  initialState: initialGroupCodeFee,
  reducers: {
    reset: () => initialGroupCodeFee,
    onChangeState: (state, { payload }: { payload: Partial<GroupCodeFeeState> }) => {
      return { ...state, ...payload };
    }
  }
});

const getListGroupCodeFee = createAction(
  GET_LIST_GROUP_CODE_FEE,
  (
    body?: GroupCodeFeeListBody,
    onSuccess?: (response: GroupCodeFeeListResponse) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

const createGroupCodeFee = createAction(
  CREATE_GROUP_CODE_FEE,
  (
    body: GroupCodeFeeList,
    onSuccess?: (response: CreateGroupCodeFeeResponse) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

const updateGroupCodeFee = createAction(
  UPDATE_GROUP_CODE_FEE,
  (
    body: GroupCodeFeeList,
    onSuccess?: (response: UpdateGroupCodeFeeResponse) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

const getDetailGroupCodeFee = createAction(
  GET_DETAIL_GROUP_CODE_FEE,
  (
    id: string | number,
    onSuccess?: (response: GroupCodeFeeDetailResponse) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({
    payload: { id, onSuccess, onFailed }
  })
);

const deleteGroupCodeFee = createAction(
  DELETE_GROUP_CODE_FEE,
  (
    id: string | number,
    onSuccess?: (response: DeleteGroupCodeFeeResponse) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({
    payload: { id, onSuccess, onFailed }
  })
);

const downloadGroupCodeFee = createAction(
  DOWNLOAD_GROUP_CODE_FEE,
  (
    body?: GroupCodeFeeListBody,
    onSuccess?: (response: DownloadGroupCodeFeeResponse) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({ payload: { body, onSuccess, onFailed } })
);

export const groupCodeFeeActions = {
  ...groupCodeFeeSlice.actions,
  getListGroupCodeFee,
  createGroupCodeFee,
  updateGroupCodeFee,
  getDetailGroupCodeFee,
  deleteGroupCodeFee,
  downloadGroupCodeFee
};
