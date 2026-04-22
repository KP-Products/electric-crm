import {
  FEE_CODE_CREATE,
  FEE_CODE_DELETE,
  FEE_CODE_LIST,
  FEE_CODE_UPDATE,
  FEE_CODE_UPDATE_STATUS,
  MASTERDATA_CUS_SEGMENT,
  MASTERDATA_CUS_TYPE
} from '@redux-action-type/fee-code-type';
import { createAction, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ErrorBase } from 'model/common';
import {
  CreateFeeCode,
  CreateFeeCodeRes,
  FeeCode,
  FeeCodeByCifRequest,
  MasterDataCusSegment,
  MasterDataCusType,
  UpdateStatusFeeCode
} from 'model/fee-code';
import { Product } from 'model/product';
import { SLICE_NAME } from 'stores/types';
import { DOWNLOAD_UNUSED_FEE_CODE, FEE_CODE_BY_CIF } from './../action-type/fee-code-type';

export interface FeeCodeState {
  feeCodes?: FeeCode[];
  listLoading: boolean;
  feeCodeDetail?: FeeCode;
  product?: Product;
  customerType?: MasterDataCusType[];
}

export const initialFeeCode: FeeCodeState = {
  feeCodes: undefined,
  listLoading: false,
  feeCodeDetail: undefined,
  product: undefined
};

const feeCodeSlice = createSlice({
  name: SLICE_NAME.FEE_CODE,
  initialState: initialFeeCode,
  reducers: {
    reset: () => initialFeeCode,
    setFeeCodes: (state, { payload }: PayloadAction<FeeCode[] | undefined>) => {
      state.feeCodes = payload;
    },
    setListLoading: (state, { payload }: PayloadAction<boolean>) => {
      state.listLoading = payload;
    },
    setFeeCodeDetail: (state, { payload }: PayloadAction<FeeCode | undefined>) => {
      state.feeCodeDetail = payload;
    },
    setProduct: (state, { payload }: PayloadAction<Product | undefined>) => {
      state.product = payload;
    },
    setCustomerType: (state, { payload }: PayloadAction<MasterDataCusType[] | undefined>) => {
      state.customerType = payload;
    }
  }
});

const getFeeCodeList = createAction(
  FEE_CODE_LIST,
  (onSuccess?: (data: FeeCode[]) => void, onFailed?: (error?: any) => void) => ({
    payload: { onSuccess, onFailed }
  })
);

const createFeeCode = createAction(
  FEE_CODE_CREATE,
  (
    body: CreateFeeCode,
    onSuccess?: (data: CreateFeeCodeRes) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

const deleteFeeCode = createAction(
  FEE_CODE_DELETE,
  (
    body: string,
    onSuccess?: (data: { status: string }) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

const updateFeeCode = createAction(
  FEE_CODE_UPDATE,
  (
    body: CreateFeeCode,
    onSuccess?: (data: CreateFeeCodeRes) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

const updateStatusFeeCode = createAction(
  FEE_CODE_UPDATE_STATUS,
  (
    body: UpdateStatusFeeCode,
    onSuccess?: (data: { status: string }) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

const getMaterDataFormulaSegment = createAction(
  MASTERDATA_CUS_SEGMENT,
  (onSuccess?: (data: MasterDataCusSegment[]) => void, onFailed?: (error?: ErrorBase) => void) => ({
    payload: { onSuccess, onFailed }
  })
);

const getMaterDataCusType = createAction(
  MASTERDATA_CUS_TYPE,
  (onSuccess?: (data: MasterDataCusType[]) => void, onFailed?: (error?: ErrorBase) => void) => ({
    payload: { onSuccess, onFailed }
  })
);

const downloadUnused = createAction(
  DOWNLOAD_UNUSED_FEE_CODE,
  (onSuccess?: (data: string) => void, onFailed?: (error?: ErrorBase) => void) => ({
    payload: { onSuccess, onFailed }
  })
);

const getFeeCodeByCif = createAction(
  FEE_CODE_BY_CIF,
  (
    body: FeeCodeByCifRequest,
    onSuccess?: (data: FeeCode[]) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

export const feeCodeActions = {
  ...feeCodeSlice.actions,
  getFeeCodeList,
  createFeeCode,
  deleteFeeCode,
  updateFeeCode,
  updateStatusFeeCode,
  getMaterDataFormulaSegment,
  getMaterDataCusType,
  downloadUnused,
  getFeeCodeByCif
};

export const feeCodeReducer = feeCodeSlice.reducer;
