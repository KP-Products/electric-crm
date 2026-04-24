import { K_SIZE_0 } from '@constant';
import {
  ADD_ROLE,
  DELETE_ROLE,
  DOWNLOAD_LIST_ROLE,
  EDIT_ROLE,
  GET_LIST_PERMISSION,
  GET_LIST_ROLE,
  GET_ROLE_DETAIL
} from '@redux-action-type/role';
import { createAction, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ErrorBase } from 'model/common';
import {
  AddRoleReq,
  AddRoleRes,
  DeleteRoleReq,
  DeleteRoleRes,
  DownloadListRoleRes,
  EditRoleReq,
  EditRoleRes,
  GetListPermissionRes,
  GetListRoleReq,
  GetListRoleRes,
  GetRoleDetailReq,
  GetRoleDetailRes,
  Permission,
  Role
} from 'model/role';
import { SLICE_NAME } from 'stores/types';

export interface RoleState {
  roleList: Role[];
  permissionList: Permission[];
  total: number;
  loadingList: boolean;
  loadingDetail: boolean;
}

export const initialRole: RoleState = {
  roleList: [],
  permissionList: [],
  total: K_SIZE_0,
  loadingList: false,
  loadingDetail: false
};

const roleSlice = createSlice({
  name: SLICE_NAME.ROLE,
  initialState: initialRole,
  reducers: {
    reset: () => initialRole,
    setLoadingList: (state, { payload }: PayloadAction<boolean>) => {
      state.loadingList = payload;
    },
    setLoadingDetail: (state, { payload }: PayloadAction<boolean>) => {
      state.loadingDetail = payload;
    },
    setRoleList: (state, { payload }: PayloadAction<Role[]>) => {
      state.roleList = payload;
    },
    setTotal: (state, { payload }: PayloadAction<number>) => {
      state.total = payload;
    },
    setPermissionList: (state, { payload }: PayloadAction<Permission[]>) => {
      state.permissionList = payload;
    }
  }
});

const getListRole = createAction(
  GET_LIST_ROLE,
  (
    onSuccess: (data: GetListRoleRes) => void,
    onFailed: (error?: ErrorBase) => void
  ) => ({
    payload: { onSuccess, onFailed }
  })
);

const downloadListRole = createAction(
  DOWNLOAD_LIST_ROLE,
  (
    body: GetListRoleReq,
    onSuccess: (data: DownloadListRoleRes) => void,
    onFailed: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

const getRoleDetail = createAction(
  GET_ROLE_DETAIL,
  (
    body: GetRoleDetailReq,
    onSuccess: (data: GetRoleDetailRes) => void,
    onFailed: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

const getListPermission = createAction(
  GET_LIST_PERMISSION,
  (onSuccess: (data: GetListPermissionRes) => void, onFailed: (error?: ErrorBase) => void) => ({
    payload: { onSuccess, onFailed }
  })
);

const addRole = createAction(
  ADD_ROLE,
  (
    body: AddRoleReq,
    onSuccess: (data: AddRoleRes) => void,
    onFailed: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

const editRole = createAction(
  EDIT_ROLE,
  (
    body: EditRoleReq,
    onSuccess: (data: EditRoleRes) => void,
    onFailed: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

const deleteRole = createAction(
  DELETE_ROLE,
  (
    body: DeleteRoleReq,
    onSuccess: (data: DeleteRoleRes) => void,
    onFailed: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

export const roleActions = {
  ...roleSlice.actions,
  getListRole,
  downloadListRole,
  getRoleDetail,
  getListPermission,
  addRole,
  editRole,
  deleteRole
};

export const roleReducer = roleSlice.reducer;
