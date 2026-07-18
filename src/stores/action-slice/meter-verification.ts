import {
  CREATE_METER_VERIFICATION,
  DELETE_METER_VERIFICATION,
  DOWNLOAD_METER_VERIFICATION_FILE,
  SEARCH_METER_VERIFICATION,
  UPDATE_METER_VERIFICATION,
  VIEW_METER_VERIFICATION_FILE
} from '@redux-action-type/meter-verification';
import { createAction, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ErrorBase } from 'model/common';
import {
  CreateMeterVerificationReq,
  DeleteMeterVerificationReq,
  DeleteMeterVerificationRes,
  MeterVerification,
  MeterVerificationFileRes,
  MeterVerificationRes,
  MeterVerificationSearchReq,
  SearchMeterVerificationRes,
  UpdateMeterVerificationReq
} from 'model/meter-verification';
import { SLICE_NAME } from 'stores/types';

export interface MeterVerificationState {
  meterVerificationList: MeterVerification[];
  total: number;
  loadingList: boolean;
  loadingDetail: boolean;
  fileLoading: boolean;
}

export const initialMeterVerification: MeterVerificationState = {
  meterVerificationList: [],
  total: 0,
  loadingList: false,
  loadingDetail: false,
  fileLoading: false
};

const meterVerificationSlice = createSlice({
  name: SLICE_NAME.METER_VERIFICATION,
  initialState: initialMeterVerification,
  reducers: {
    reset: () => initialMeterVerification,
    setLoadingList: (state, { payload }: PayloadAction<boolean>) => {
      state.loadingList = payload;
    },
    setLoadingDetail: (state, { payload }: PayloadAction<boolean>) => {
      state.loadingDetail = payload;
    },
    setFileLoading: (state, { payload }: PayloadAction<boolean>) => {
      state.fileLoading = payload;
    },
    setMeterVerificationList: (state, { payload }: PayloadAction<MeterVerification[]>) => {
      state.meterVerificationList = payload;
    },
    setTotal: (state, { payload }: PayloadAction<number>) => {
      state.total = payload;
    }
  }
});

const searchMeterVerification = createAction(
  SEARCH_METER_VERIFICATION,
  (
    body: MeterVerificationSearchReq,
    onSuccess?: (data: SearchMeterVerificationRes) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

const createMeterVerification = createAction(
  CREATE_METER_VERIFICATION,
  (
    body: CreateMeterVerificationReq,
    onSuccess?: (data: MeterVerificationRes) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

const updateMeterVerification = createAction(
  UPDATE_METER_VERIFICATION,
  (
    body: UpdateMeterVerificationReq,
    onSuccess?: (data: MeterVerificationRes) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

const deleteMeterVerification = createAction(
  DELETE_METER_VERIFICATION,
  (
    body: DeleteMeterVerificationReq,
    onSuccess?: (data: DeleteMeterVerificationRes) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

const viewMeterVerificationFile = createAction(
  VIEW_METER_VERIFICATION_FILE,
  (
    body: number,
    onSuccess?: (data: MeterVerificationFileRes) => void,
    onFailed?: (error?: MeterVerificationFileRes) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

const downloadMeterVerificationFile = createAction(
  DOWNLOAD_METER_VERIFICATION_FILE,
  (
    body: number,
    onSuccess?: (data: MeterVerificationFileRes) => void,
    onFailed?: (error?: MeterVerificationFileRes) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

export const meterVerificationActions = {
  ...meterVerificationSlice.actions,
  searchMeterVerification,
  createMeterVerification,
  updateMeterVerification,
  deleteMeterVerification,
  viewMeterVerificationFile,
  downloadMeterVerificationFile
};

export const meterVerificationReducer = meterVerificationSlice.reducer;
