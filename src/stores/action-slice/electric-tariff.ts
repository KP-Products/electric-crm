import {
  CREATE_ELECTRIC_TARIFF,
  DELETE_ELECTRIC_TARIFF_DOCUMENT,
  DELETE_ELECTRIC_TARIFF,
  GET_ELECTRIC_TARIFF_DETAIL,
  SEARCH_ELECTRIC_TARIFF,
  UPLOAD_ELECTRIC_TARIFF_DOCUMENT,
  UPDATE_ELECTRIC_TARIFF
} from '@redux-action-type/electric-tariff';
import { createAction, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ErrorBase } from 'model/common';
import {
  CreateTariffReq,
  CreateTariffRes,
  DeleteTariffRes,
  ElectricTariff,
  GetTariffDetailReq,
  GetTariffDetailRes,
  SearchTariffsReq,
  SearchTariffsRes,
  TariffDocumentRes,
  UploadTariffDocumentReq,
  UpdateTariffReq,
  UpdateTariffRes
} from 'model/electric-tariff';
import { SLICE_NAME } from 'stores/types';

export interface ElectricTariffState {
  tariffList: ElectricTariff[];
  total: number;
  loadingList: boolean;
  loadingDetail: boolean;
}

export const initialElectricTariff: ElectricTariffState = {
  tariffList: [],
  total: 0,
  loadingList: false,
  loadingDetail: false
};

const electricTariffSlice = createSlice({
  name: SLICE_NAME.ELECTRIC_TARIFF,
  initialState: initialElectricTariff,
  reducers: {
    reset: () => initialElectricTariff,
    setLoadingList: (state, { payload }: PayloadAction<boolean>) => {
      state.loadingList = payload;
    },
    setLoadingDetail: (state, { payload }: PayloadAction<boolean>) => {
      state.loadingDetail = payload;
    },
    setTariffList: (state, { payload }: PayloadAction<ElectricTariff[]>) => {
      state.tariffList = payload;
    },
    setTotal: (state, { payload }: PayloadAction<number>) => {
      state.total = payload;
    }
  }
});

const searchElectricTariff = createAction(
  SEARCH_ELECTRIC_TARIFF,
  (
    body: SearchTariffsReq,
    onSuccess?: (data: SearchTariffsRes) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

const getElectricTariffDetail = createAction(
  GET_ELECTRIC_TARIFF_DETAIL,
  (
    body: GetTariffDetailReq,
    onSuccess?: (data: GetTariffDetailRes) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

const createElectricTariff = createAction(
  CREATE_ELECTRIC_TARIFF,
  (
    body: CreateTariffReq,
    onSuccess?: (data: CreateTariffRes) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

const updateElectricTariff = createAction(
  UPDATE_ELECTRIC_TARIFF,
  (
    body: UpdateTariffReq,
    onSuccess?: (data: UpdateTariffRes) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

const deleteElectricTariff = createAction(
  DELETE_ELECTRIC_TARIFF,
  (
    body: GetTariffDetailReq,
    onSuccess?: (data: DeleteTariffRes) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

const uploadElectricTariffDocument = createAction(
  UPLOAD_ELECTRIC_TARIFF_DOCUMENT,
  (
    body: UploadTariffDocumentReq,
    onSuccess?: (data: TariffDocumentRes) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

const deleteElectricTariffDocument = createAction(
  DELETE_ELECTRIC_TARIFF_DOCUMENT,
  (
    body: GetTariffDetailReq,
    onSuccess?: (data: TariffDocumentRes) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

export const electricTariffActions = {
  ...electricTariffSlice.actions,
  searchElectricTariff,
  getElectricTariffDetail,
  createElectricTariff,
  updateElectricTariff,
  deleteElectricTariff,
  uploadElectricTariffDocument,
  deleteElectricTariffDocument
};

export const electricTariffReducer = electricTariffSlice.reducer;
