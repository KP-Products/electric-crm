import {
  CREATE_METER_CHANGE_EVENT,
  DELETE_METER_CHANGE_EVENT,
  GET_METER_CHANGE_EVENT_DETAIL,
  SEARCH_METER_CHANGE_EVENT,
  UPDATE_METER_CHANGE_EVENT
} from '@redux-action-type/meter-change-event';
import { createAction, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ErrorBase } from 'model/common';
import {
  CreateMeterChangeEventReq,
  DeleteMeterChangeEventRes,
  MeterChangeEventIdReq,
  MeterChangeEventRes,
  MeterChangeEventWithDetails,
  SearchMeterChangeEventsReq,
  SearchMeterChangeEventsRes,
  UpdateMeterChangeEventReq
} from 'model/meter-change-event';
import { SLICE_NAME } from 'stores/types';

export interface MeterChangeEventState {
  meterChangeEventList: MeterChangeEventWithDetails[];
  total: number;
  loadingList: boolean;
  loadingDetail: boolean;
}

export const initialMeterChangeEvent: MeterChangeEventState = {
  meterChangeEventList: [],
  total: 0,
  loadingList: false,
  loadingDetail: false
};

const meterChangeEventSlice = createSlice({
  name: SLICE_NAME.METER_CHANGE_EVENT,
  initialState: initialMeterChangeEvent,
  reducers: {
    reset: () => initialMeterChangeEvent,
    setLoadingList: (state, { payload }: PayloadAction<boolean>) => {
      state.loadingList = payload;
    },
    setLoadingDetail: (state, { payload }: PayloadAction<boolean>) => {
      state.loadingDetail = payload;
    },
    setMeterChangeEventList: (state, { payload }: PayloadAction<MeterChangeEventWithDetails[]>) => {
      state.meterChangeEventList = payload;
    },
    setTotal: (state, { payload }: PayloadAction<number>) => {
      state.total = payload;
    }
  }
});

const searchMeterChangeEvent = createAction(
  SEARCH_METER_CHANGE_EVENT,
  (
    body: SearchMeterChangeEventsReq,
    onSuccess?: (data: SearchMeterChangeEventsRes) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

const getMeterChangeEventDetail = createAction(
  GET_METER_CHANGE_EVENT_DETAIL,
  (
    body: MeterChangeEventIdReq,
    onSuccess?: (data: MeterChangeEventRes) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

const createMeterChangeEvent = createAction(
  CREATE_METER_CHANGE_EVENT,
  (
    body: CreateMeterChangeEventReq,
    onSuccess?: (data: MeterChangeEventRes) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

const updateMeterChangeEvent = createAction(
  UPDATE_METER_CHANGE_EVENT,
  (
    body: UpdateMeterChangeEventReq,
    onSuccess?: (data: MeterChangeEventRes) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

const deleteMeterChangeEvent = createAction(
  DELETE_METER_CHANGE_EVENT,
  (
    body: MeterChangeEventIdReq,
    onSuccess?: (data: DeleteMeterChangeEventRes) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

export const meterChangeEventActions = {
  ...meterChangeEventSlice.actions,
  searchMeterChangeEvent,
  getMeterChangeEventDetail,
  createMeterChangeEvent,
  updateMeterChangeEvent,
  deleteMeterChangeEvent
};

export const meterChangeEventReducer = meterChangeEventSlice.reducer;
