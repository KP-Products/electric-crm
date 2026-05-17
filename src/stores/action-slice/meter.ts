import { createAction, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ErrorBase } from 'model/common';

import { SLICE_NAME } from 'stores/types';
import {
  ADD_METER,
  DELETE_METER,
  EDIT_METER,
  GET_METER_SEARCH_LIST,
  METER_DETAIL
} from '@redux-action-type/meter';
import {
  AddMeterReq,
  AddMeterRes,
  DeleteMeterReq,
  DeleteMeterRes,
  GetListMeterReq,
  GetListMeterRes,
  Meter
} from '../../model/meter';

export interface MeterState {
  loadingList: boolean;
  loadingDetail: boolean;
  meterList: Meter[];
}

export const initialRole: MeterState = {
  loadingList: false,
  loadingDetail: false,
  meterList: []
};

const meterSlice = createSlice({
  name: SLICE_NAME.METER,
  initialState: initialRole,
  reducers: {
    reset: () => initialRole,
    setLoadingList: (state, { payload }: PayloadAction<boolean>) => {
      state.loadingList = payload;
    },
    setLoadingDetail: (state, { payload }: PayloadAction<boolean>) => {
      state.loadingDetail = payload;
    },
    setMeterList: (state, { payload }: PayloadAction<Meter[]>) => {
      state.meterList = payload;
    }
  }
});

const getListMeterSearch = createAction(
  GET_METER_SEARCH_LIST,
  (
    body: GetListMeterReq,
    onSuccess: (data: GetListMeterRes) => void,
    onFailed: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);
const getMeterDetail = createAction(
  METER_DETAIL,
  (
    body: GetListMeterReq,
    onSuccess: (data: GetListMeterRes) => void,
    onFailed: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

const addMeter = createAction(
  ADD_METER,
  (
    body: AddMeterReq,
    onSuccess: (data: AddMeterRes) => void,
    onFailed: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

const editMeter = createAction(
  EDIT_METER,
  (
    body: AddMeterReq,
    onSuccess: (data: AddMeterRes) => void,
    onFailed: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

const deleteMeter = createAction(
  DELETE_METER,
  (
    body: DeleteMeterReq,
    onSuccess: (data: DeleteMeterRes) => void,
    onFailed: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

export const meterActions = {
  ...meterSlice.actions,
  getListMeterSearch,
  getMeterDetail,
  addMeter,
  editMeter,
  deleteMeter
};

export const meterReducer = meterSlice.reducer;
