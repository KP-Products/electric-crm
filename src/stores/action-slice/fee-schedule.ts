import {
  CHANGE_FEE_CODE,
  CREATE_FEE_SCHEDULE,
  DOWNLOAD_FEE_CODE_BY_FEE_SCHEDULE,
  DOWNLOAD_LIST_FEE_SCHEDULE,
  GET_DETAIL_FEE_SCHEDULE,
  GET_DETAIL_REQUEST_CHANGE_FEE_CODE,
  GET_LIST_FEE_SCHEDULE,
  UPDATE_FEE_SCHEDULE,
  UPLOAD_FEE_CODE
} from '@redux-action-type/fee-schedule';
import { createAction, createSlice } from '@reduxjs/toolkit';
import { ErrorBase } from 'model/common';
import {
  ChangeFeeCodeBody,
  ChangeFeeCodeDetailResponse,
  ChangeFeeCodeResponse,
  CreateFeeScheduleResponse,
  DownloadFeeCodeByFeeScheduleResponse,
  DownloadListFeeScheduleResponse,
  FeeScheduleDetailBody,
  FeeScheduleDetailResponse,
  FeeScheduleListBody,
  FeeScheduleListResponse,
  FeeScheduleState,
  UpdateFeeScheduleResponse,
  UploadFeeCodeResponse
} from 'model/fee-schedule';
import { SLICE_NAME } from 'stores/types';

export const initialFeeSchedule: FeeScheduleState = {
  loading: false,
  feeScheduleList: [],
  totalElements: 0,
  feeScheduleDetail: {},
  changedFeeCodes: []
};

export const feeScheduleSlice = createSlice({
  name: SLICE_NAME.FEE_SCHEDULE,
  initialState: initialFeeSchedule,
  reducers: {
    reset: () => initialFeeSchedule,
    onChangeState: (state, { payload }: { payload: Partial<FeeScheduleState> }) => {
      return { ...state, ...payload };
    }
  }
});

const getListFeeSchedule = createAction(
  GET_LIST_FEE_SCHEDULE,
  (
    body?: FeeScheduleListBody,
    onSuccess?: (response: FeeScheduleListResponse) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

const createFeeSchedule = createAction(
  CREATE_FEE_SCHEDULE,
  (
    body: FeeScheduleDetailBody,
    onSuccess?: (response: CreateFeeScheduleResponse) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

const updateFeeSchedule = createAction(
  UPDATE_FEE_SCHEDULE,
  (
    body: FeeScheduleDetailBody,
    onSuccess?: (response: UpdateFeeScheduleResponse) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

const getDetailFeeSchedule = createAction(
  GET_DETAIL_FEE_SCHEDULE,
  (
    feeScheduleId: string | number,
    onSuccess?: (response: FeeScheduleDetailResponse) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({
    payload: { feeScheduleId, onSuccess, onFailed }
  })
);

const downloadListFeeSchedule = createAction(
  DOWNLOAD_LIST_FEE_SCHEDULE,
  (
    body?: FeeScheduleListBody,
    onSuccess?: (response: DownloadListFeeScheduleResponse) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

const changeFeeCode = createAction(
  CHANGE_FEE_CODE,
  (
    body?: ChangeFeeCodeBody,
    onSuccess?: (response: ChangeFeeCodeResponse) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

const downloadFeeCodeByFeeSchedule = createAction(
  DOWNLOAD_FEE_CODE_BY_FEE_SCHEDULE,
  (
    feeScheduleId: string | number,
    onSuccess?: (response: DownloadFeeCodeByFeeScheduleResponse) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({
    payload: { feeScheduleId, onSuccess, onFailed }
  })
);

const uploadFeeCode = createAction(
  UPLOAD_FEE_CODE,
  (
    file: File,
    onSuccess?: (response: UploadFeeCodeResponse) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({
    payload: { file, onSuccess, onFailed }
  })
);

const getDetailRequestChangeFeeCode = createAction(
  GET_DETAIL_REQUEST_CHANGE_FEE_CODE,
  (
    requestId: string | number,
    onSuccess?: (response: ChangeFeeCodeDetailResponse) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({ payload: { requestId, onSuccess, onFailed } })
);

export const feeScheduleActions = {
  ...feeScheduleSlice.actions,
  getListFeeSchedule,
  createFeeSchedule,
  updateFeeSchedule,
  getDetailFeeSchedule,
  downloadListFeeSchedule,
  changeFeeCode,
  downloadFeeCodeByFeeSchedule,
  uploadFeeCode,
  getDetailRequestChangeFeeCode
};
