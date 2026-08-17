import {
  SYSTEM_PARAMETER_CREATE,
  SYSTEM_PARAMETER_DELETE,
  SYSTEM_PARAMETER_LIST,
  SYSTEM_PARAMETER_UPDATE
} from '@redux-action-type/sys-parameter-type';
import { createAction, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ErrorBase } from 'model/common';
import {
  CreateSystemParameterReq,
  SearchSystemParameterReq,
  SystemParameter,
  SystemParameterIdReq,
  UpdateSystemParameterReq
} from 'model/system-parameter';
import { SLICE_NAME } from 'stores/types';

export interface SysParamState {
  sysParameters: SystemParameter[];
  total: number;
  listLoading: boolean;
  submitting: boolean;
}

export const initialSysParam: SysParamState = {
  sysParameters: [],
  total: 0,
  listLoading: false,
  submitting: false
};

const sysParameterSlice = createSlice({
  name: SLICE_NAME.SYSTEM_PARAMETER,
  initialState: initialSysParam,
  reducers: {
    reset: () => initialSysParam,
    setSysParameters: (state, { payload }: PayloadAction<SystemParameter[]>) => {
      state.sysParameters = payload;
    },
    setTotal: (state, { payload }: PayloadAction<number>) => {
      state.total = payload;
    },
    setListLoading: (state, { payload }: PayloadAction<boolean>) => {
      state.listLoading = payload;
    },
    setSubmitting: (state, { payload }: PayloadAction<boolean>) => {
      state.submitting = payload;
    }
  }
});

const searchSysParameters = createAction(
  SYSTEM_PARAMETER_LIST,
  (
    body: SearchSystemParameterReq,
    onSuccess?: (data: SystemParameter[]) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

const createSysParameter = createAction(
  SYSTEM_PARAMETER_CREATE,
  (
    body: CreateSystemParameterReq,
    onSuccess?: (data: SystemParameter) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

const updateSysParameter = createAction(
  SYSTEM_PARAMETER_UPDATE,
  (
    body: UpdateSystemParameterReq,
    onSuccess?: (data: SystemParameter) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

const deleteSysParameter = createAction(
  SYSTEM_PARAMETER_DELETE,
  (body: SystemParameterIdReq, onSuccess?: () => void, onFailed?: (error?: ErrorBase) => void) => ({
    payload: { body, onSuccess, onFailed }
  })
);

export const sysParameterActions = {
  ...sysParameterSlice.actions,
  searchSysParameters,
  createSysParameter,
  updateSysParameter,
  deleteSysParameter
};

export const sysParameterReducer = sysParameterSlice.reducer;
