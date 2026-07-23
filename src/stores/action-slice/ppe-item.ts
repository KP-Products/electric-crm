import {
  CREATE_PPE_ITEM,
  DELETE_PPE_ITEM,
  GET_PPE_ITEM_DETAIL,
  SEARCH_PPE_ITEM,
  UPDATE_PPE_ITEM
} from '@redux-action-type/ppe-item';
import { createAction, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ErrorBase } from 'model/common';
import {
  CreatePpeItemReq,
  DeletePpeItemRes,
  PpeItem,
  PpeItemIdReq,
  PpeItemRes,
  SearchPpeItemsReq,
  SearchPpeItemsRes,
  UpdatePpeItemReq
} from 'model/ppe-item';
import { SLICE_NAME } from 'stores/types';

export interface PpeItemState {
  ppeItemList: PpeItem[];
  total: number;
  loadingList: boolean;
  loadingDetail: boolean;
}

export const initialPpeItem: PpeItemState = {
  ppeItemList: [],
  total: 0,
  loadingList: false,
  loadingDetail: false
};

const ppeItemSlice = createSlice({
  name: SLICE_NAME.PPE_ITEM,
  initialState: initialPpeItem,
  reducers: {
    reset: () => initialPpeItem,
    setLoadingList: (state, { payload }: PayloadAction<boolean>) => {
      state.loadingList = payload;
    },
    setLoadingDetail: (state, { payload }: PayloadAction<boolean>) => {
      state.loadingDetail = payload;
    },
    setPpeItemList: (state, { payload }: PayloadAction<PpeItem[]>) => {
      state.ppeItemList = payload;
    },
    setTotal: (state, { payload }: PayloadAction<number>) => {
      state.total = payload;
    }
  }
});

const searchPpeItem = createAction(
  SEARCH_PPE_ITEM,
  (
    body: SearchPpeItemsReq,
    onSuccess?: (data: SearchPpeItemsRes) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

const getPpeItemDetail = createAction(
  GET_PPE_ITEM_DETAIL,
  (
    body: PpeItemIdReq,
    onSuccess?: (data: PpeItemRes) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

const createPpeItem = createAction(
  CREATE_PPE_ITEM,
  (
    body: CreatePpeItemReq,
    onSuccess?: (data: PpeItemRes) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

const updatePpeItem = createAction(
  UPDATE_PPE_ITEM,
  (
    body: UpdatePpeItemReq,
    onSuccess?: (data: PpeItemRes) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

const deletePpeItem = createAction(
  DELETE_PPE_ITEM,
  (
    body: PpeItemIdReq,
    onSuccess?: (data: DeletePpeItemRes) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

export const ppeItemActions = {
  ...ppeItemSlice.actions,
  searchPpeItem,
  getPpeItemDetail,
  createPpeItem,
  updatePpeItem,
  deletePpeItem
};

export const ppeItemReducer = ppeItemSlice.reducer;
