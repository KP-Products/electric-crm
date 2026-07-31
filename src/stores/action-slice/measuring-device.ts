import {
  CREATE_MEASURING_DEVICE,
  DELETE_MEASURING_DEVICE,
  GET_MEASURING_DEVICE_DETAIL,
  SEARCH_MEASURING_DEVICE,
  UPDATE_MEASURING_DEVICE
} from '@redux-action-type/measuring-device';
import { createAction, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ErrorBase } from 'model/common';
import {
  CreateMeasuringDeviceReq,
  DeleteMeasuringDeviceRes,
  MeasuringDevice,
  MeasuringDeviceIdReq,
  MeasuringDeviceRes,
  SearchMeasuringDevicesReq,
  SearchMeasuringDevicesRes,
  UpdateMeasuringDeviceReq
} from 'model/measuring-device';
import { SLICE_NAME } from 'stores/types';

export interface MeasuringDeviceState {
  items: MeasuringDevice[];
  total: number;
  loadingList: boolean;
  loadingDetail: boolean;
}

export const initialMeasuringDevice: MeasuringDeviceState = {
  items: [],
  total: 0,
  loadingList: false,
  loadingDetail: false
};

const measuringDeviceSlice = createSlice({
  name: SLICE_NAME.MEASURING_DEVICE,
  initialState: initialMeasuringDevice,
  reducers: {
    reset: () => initialMeasuringDevice,
    setLoadingList: (state, { payload }: PayloadAction<boolean>) => {
      state.loadingList = payload;
    },
    setLoadingDetail: (state, { payload }: PayloadAction<boolean>) => {
      state.loadingDetail = payload;
    },
    setItems: (state, { payload }: PayloadAction<MeasuringDevice[]>) => {
      state.items = payload;
    },
    setTotal: (state, { payload }: PayloadAction<number>) => {
      state.total = payload;
    }
  }
});

const search = createAction(
  SEARCH_MEASURING_DEVICE,
  (
    body: SearchMeasuringDevicesReq,
    onSuccess?: (data: SearchMeasuringDevicesRes) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({ payload: { body, onSuccess, onFailed } })
);
const detail = createAction(
  GET_MEASURING_DEVICE_DETAIL,
  (
    body: MeasuringDeviceIdReq,
    onSuccess?: (data: MeasuringDeviceRes) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({ payload: { body, onSuccess, onFailed } })
);
const create = createAction(
  CREATE_MEASURING_DEVICE,
  (
    body: CreateMeasuringDeviceReq,
    onSuccess?: (data: MeasuringDeviceRes) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({ payload: { body, onSuccess, onFailed } })
);
const update = createAction(
  UPDATE_MEASURING_DEVICE,
  (
    body: UpdateMeasuringDeviceReq,
    onSuccess?: (data: MeasuringDeviceRes) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({ payload: { body, onSuccess, onFailed } })
);
const remove = createAction(
  DELETE_MEASURING_DEVICE,
  (
    body: MeasuringDeviceIdReq,
    onSuccess?: (data: DeleteMeasuringDeviceRes) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({ payload: { body, onSuccess, onFailed } })
);

export const measuringDeviceActions = {
  ...measuringDeviceSlice.actions,
  search,
  detail,
  create,
  update,
  remove
};
export const measuringDeviceReducer = measuringDeviceSlice.reducer;
