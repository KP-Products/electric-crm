import {
  CREATE_ELECTRIC_TARIFF,
  CREATE_ELECTRIC_TARIFF_TOU_PRICE,
  GET_ELECTRIC_TARIFF_DETAIL,
  LIST_ELECTRIC_TARIFF_TOU_PRICE,
  SEARCH_ELECTRIC_TARIFF
} from '@redux-action-type/electric-tariff';
import { createAction, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ErrorBase } from 'model/common';
import {
  CreateTariffReq,
  CreateTariffRes,
  CreateTouPriceReq,
  CreateTouPriceRes,
  ElectricTariff,
  GetTariffDetailReq,
  GetTariffDetailRes,
  ListTouPricesReq,
  ListTouPricesRes,
  SearchTariffsReq,
  SearchTariffsRes
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

const listElectricTariffTouPrice = createAction(
  LIST_ELECTRIC_TARIFF_TOU_PRICE,
  (
    body: ListTouPricesReq,
    onSuccess?: (data: ListTouPricesRes) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

const createElectricTariffTouPrice = createAction(
  CREATE_ELECTRIC_TARIFF_TOU_PRICE,
  (
    body: CreateTouPriceReq,
    onSuccess?: (data: CreateTouPriceRes) => void,
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
  listElectricTariffTouPrice,
  createElectricTariffTouPrice
};

export const electricTariffReducer = electricTariffSlice.reducer;
