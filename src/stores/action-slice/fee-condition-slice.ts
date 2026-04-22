import { DEFAULT_PAGE_SIZE, K_SIZE_1 } from '@constant';
import {
  FEE_CONDITION_CREATE,
  FEE_CONDITION_DATA_FIELD,
  FEE_CONDITION_DELETE,
  FEE_CONDITION_DOWNLOAD,
  FEE_CONDITION_LIST,
  FEE_CONDITION_UPDATE
} from '@redux-action-type/fee-condition-type';
import { createAction, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ErrorBase, PaginationRes } from 'model/common';
import {
  CreateFeeConditionParam,
  CreateFeeConditionRes,
  DeleteFeeConditionRes,
  DownloadFeeConditionRes,
  FeeCondition,
  SearchFeeConditionParam,
  UpdateFeeConditionRes
} from 'model/fee-condition';
import { SLICE_NAME } from 'stores/types';

export interface FeeConditionState {
  feeConditions: FeeCondition[];
  listLoading: boolean;
  filter: SearchFeeConditionParam;
}

export const initialFeeCondition: FeeConditionState = {
  feeConditions: [],
  listLoading: false,
  filter: {
    code: '',
    dataSource: '',
    mappingNoteMsg: '',
    tableValue: '',
    description: '',
    dataType: '',
    status: '',
    note: '',
    size: DEFAULT_PAGE_SIZE,
    page: K_SIZE_1
  }
};

const feeConditionSlice = createSlice({
  name: SLICE_NAME.FEE_CONDITION,
  initialState: initialFeeCondition,
  reducers: {
    reset: () => initialFeeCondition,
    setFeeConditions: (state, { payload }: PayloadAction<FeeCondition[]>) => {
      state.feeConditions = payload;
    },
    setListLoading: (state, { payload }: PayloadAction<boolean>) => {
      state.listLoading = payload;
    },
    setFilter: (state, { payload }: PayloadAction<SearchFeeConditionParam>) => {
      state.filter = payload;
    },
    setFieldFilter: (
      state,
      { payload }: PayloadAction<{ key: keyof CreateFeeConditionParam; value: string }>
    ) => {
      const { key, value } = payload;
      state.filter = {
        ...state.filter,
        [key]: value
      };
    },
    setCurrentPage: (state, { payload }: PayloadAction<number>) => {
      state.filter.page = payload;
    }
  }
});

const getFeeConditionList = createAction(
  FEE_CONDITION_LIST,
  (
    body?: SearchFeeConditionParam,
    onSuccess?: (data?: PaginationRes<FeeCondition>) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

const createFeeCondition = createAction(
  FEE_CONDITION_CREATE,
  (
    body: CreateFeeConditionParam,
    onSuccess?: (data?: CreateFeeConditionRes) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

const updateFeeCondition = createAction(
  FEE_CONDITION_UPDATE,
  (
    body: { id: string; param: CreateFeeConditionParam },
    onSuccess?: (data?: UpdateFeeConditionRes) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

const deleteFeeCondition = createAction(
  FEE_CONDITION_DELETE,
  (
    body: string,
    onSuccess?: (data?: DeleteFeeConditionRes) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

const downloadFeeCondition = createAction(
  FEE_CONDITION_DOWNLOAD,
  (
    body: SearchFeeConditionParam,
    onSuccess?: (data?: DownloadFeeConditionRes) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({
    payload: {
      body,
      onSuccess,
      onFailed
    }
  })
);

const getFeeConditionDataField = createAction(
  FEE_CONDITION_DATA_FIELD,
  (
    body: string,
    onSuccess?: (data?: string[]) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({
    payload: {
      body,
      onSuccess,
      onFailed
    }
  })
);

export const feeConditionActions = {
  ...feeConditionSlice.actions,
  getFeeConditionList,
  createFeeCondition,
  updateFeeCondition,
  deleteFeeCondition,
  downloadFeeCondition,
  getFeeConditionDataField
};

export const feeConditionReducer = feeConditionSlice.reducer;
