import {
  SYSTEM_PARAMETER_LIST,
  SYSTEM_PARAMETER_UPDATE
} from '@redux-action-type/sys-parameter-type';
import { createAction, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ErrorBase } from 'model/common';
import { SystemParameter } from 'model/system-parameter';
import { SLICE_NAME } from 'stores/types';

export interface SysParamState {
  sysParameters: SystemParameter[];
  listLoading: boolean;
}

export const initialSysParam: SysParamState = {
  sysParameters: [],
  listLoading: false
};

const sysParameterSlice = createSlice({
  name: SLICE_NAME.SYSTEM_PARAMETER,
  initialState: initialSysParam,
  reducers: {
    reset: () => initialSysParam,
    setSysParameters: (state, { payload }: PayloadAction<SystemParameter[]>) => {
      state.sysParameters = payload;
    },
    setListLoading: (state, { payload }: PayloadAction<boolean>) => {
      state.listLoading = payload;
    }
  }
});

const getSysParameterList = createAction(
  SYSTEM_PARAMETER_LIST,
  (onSuccess?: (data: SystemParameter[]) => void, onFailed?: (error?: ErrorBase) => void) => ({
    payload: { onSuccess, onFailed }
  })
);

const updateSysParameter = createAction(
  SYSTEM_PARAMETER_UPDATE,
  (
    body: SystemParameter,
    onSuccess?: (data: any) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

export const sysParameterActions = {
  ...sysParameterSlice.actions,
  getSysParameterList,
  updateSysParameter
};

export const sysParameterReducer = sysParameterSlice.reducer;
