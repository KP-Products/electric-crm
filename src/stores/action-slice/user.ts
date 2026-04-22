import {
  ADD_LIST_USER,
  ADD_USER,
  DOWNLOAD_LIST_USER,
  EDIT_USER,
  GET_LIST_DEPARTMENT,
  GET_LIST_UNIT,
  GET_LIST_USER,
  GET_USER_TEMPLATE,
  UPLOAD_USER
} from '@redux-action-type/user';
import { createAction, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ErrorBase } from 'model/common';
import {
  Department,
  GetListDepartmentReq,
  GetListDepartmentRes,
  GetListUnitRes,
  GetTemplateRes,
  Unit
} from 'model/master-data';
import {
  AddListUserReq,
  AddListUserRes,
  AddUserReq,
  AddUserRes,
  DownloadListUserRes,
  EditUserReq,
  EditUserRes,
  GetListUserReq,
  GetListUserRes,
  UploadUserReq,
  UploadUserRes,
  User
} from 'model/user';
import { SLICE_NAME } from 'stores/types';

export interface UserState {
  userList: User[];
  unitList: Unit[];
  departmentList: Department[];
  loadingList: boolean;
  loadingDetail: boolean;
}

export const initialUser: UserState = {
  userList: [],
  unitList: [],
  departmentList: [],
  loadingList: false,
  loadingDetail: false
};

const userSlice = createSlice({
  name: SLICE_NAME.USER,
  initialState: initialUser,
  reducers: {
    reset: () => initialUser,
    setLoadingList: (state, { payload }: PayloadAction<boolean>) => {
      state.loadingList = payload;
    },
    setLoadingDetail: (state, { payload }: PayloadAction<boolean>) => {
      state.loadingDetail = payload;
    },
    setUserList: (state, { payload }: PayloadAction<User[]>) => {
      state.userList = payload;
    },
    setUnitList: (state, { payload }: PayloadAction<Unit[]>) => {
      state.unitList = payload;
    },
    setDepartmentList: (state, { payload }: PayloadAction<Department[]>) => {
      state.departmentList = payload;
    }
  }
});

const getListUser = createAction(
  GET_LIST_USER,
  (
    body: GetListUserReq,
    onSuccess: (data: GetListUserRes) => void,
    onFailed: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

const downloadListUser = createAction(
  DOWNLOAD_LIST_USER,
  (
    body: GetListUserReq,
    onSuccess: (data: DownloadListUserRes) => void,
    onFailed: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

const addUser = createAction(
  ADD_USER,
  (
    body: AddUserReq,
    onSuccess: (data: AddUserRes) => void,
    onFailed: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

const getUserTemplate = createAction(
  GET_USER_TEMPLATE,
  (onSuccess: (data: GetTemplateRes) => void, onFailed: (error?: ErrorBase) => void) => ({
    payload: { onSuccess, onFailed }
  })
);

const uploadUser = createAction(
  UPLOAD_USER,
  (
    body: UploadUserReq,
    onSuccess: (data: UploadUserRes) => void,
    onFailed: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

const addListUser = createAction(
  ADD_LIST_USER,
  (
    body: AddListUserReq,
    onSuccess: (data: AddListUserRes) => void,
    onFailed: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

const editUser = createAction(
  EDIT_USER,
  (
    body: EditUserReq,
    onSuccess: (data: EditUserRes) => void,
    onFailed: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

const getListUnit = createAction(
  GET_LIST_UNIT,
  (onSuccess: (data: GetListUnitRes) => void, onFailed: (error?: ErrorBase) => void) => ({
    payload: { onSuccess, onFailed }
  })
);

const getListDepartment = createAction(
  GET_LIST_DEPARTMENT,
  (
    body: GetListDepartmentReq,
    onSuccess: (data: GetListDepartmentRes) => void,
    onFailed: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

export const userActions = {
  ...userSlice.actions,
  getListUser,
  downloadListUser,
  addUser,
  getUserTemplate,
  uploadUser,
  addListUser,
  editUser,
  getListUnit,
  getListDepartment
};

export const userReducer = userSlice.reducer;
