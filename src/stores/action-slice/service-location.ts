import {
  CREATE_SERVICE_LOCATION,
  DELETE_SERVICE_LOCATION,
  GET_SERVICE_LOCATION_DETAIL,
  SEARCH_SERVICE_LOCATION,
  UPDATE_SERVICE_LOCATION
} from '@redux-action-type/service-location';
import { createAction, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ErrorBase } from 'model/common';
import {
  CreateServiceLocationReq,
  DeleteServiceLocationReq,
  GetServiceLocationReq,
  ServiceLocation,
  ServiceLocationRes,
  ServiceLocationSearchReq,
  ServiceLocationSearchRes,
  UpdateServiceLocationReq
} from 'model/service-location';
import { SLICE_NAME } from 'stores/types';

export interface ServiceLocationState {
  serviceLocationList: ServiceLocation[];
  total: number;
  loadingList: boolean;
  loadingDetail: boolean;
}

export const initialServiceLocation: ServiceLocationState = {
  serviceLocationList: [],
  total: 0,
  loadingList: false,
  loadingDetail: false
};

const serviceLocationSlice = createSlice({
  name: SLICE_NAME.SERVICE_LOCATION,
  initialState: initialServiceLocation,
  reducers: {
    reset: () => initialServiceLocation,
    setLoadingList: (state, { payload }: PayloadAction<boolean>) => {
      state.loadingList = payload;
    },
    setLoadingDetail: (state, { payload }: PayloadAction<boolean>) => {
      state.loadingDetail = payload;
    },
    setServiceLocationList: (state, { payload }: PayloadAction<ServiceLocation[]>) => {
      state.serviceLocationList = payload;
    },
    setTotal: (state, { payload }: PayloadAction<number>) => {
      state.total = payload;
    }
  }
});

const searchServiceLocation = createAction(
  SEARCH_SERVICE_LOCATION,
  (
    body: ServiceLocationSearchReq,
    onSuccess?: (data: ServiceLocationSearchRes) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

const createServiceLocation = createAction(
  CREATE_SERVICE_LOCATION,
  (
    body: CreateServiceLocationReq,
    onSuccess?: (data: ServiceLocationRes) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

const updateServiceLocation = createAction(
  UPDATE_SERVICE_LOCATION,
  (
    body: UpdateServiceLocationReq,
    onSuccess?: (data: ServiceLocationRes) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

const getServiceLocationDetail = createAction(
  GET_SERVICE_LOCATION_DETAIL,
  (
    body: GetServiceLocationReq,
    onSuccess?: (data: ServiceLocationRes) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

const deleteServiceLocation = createAction(
  DELETE_SERVICE_LOCATION,
  (
    body: DeleteServiceLocationReq,
    onSuccess?: (data: ServiceLocationRes) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

export const serviceLocationActions = {
  ...serviceLocationSlice.actions,
  searchServiceLocation,
  createServiceLocation,
  updateServiceLocation,
  getServiceLocationDetail,
  deleteServiceLocation
};

export const serviceLocationReducer = serviceLocationSlice.reducer;
