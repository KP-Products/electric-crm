import { DEFAULT_PAGE_SIZE, K_SIZE_1 } from '@constant';
import { createAction, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ErrorBase, PaginationRes, ResultBase } from 'model/common';
import { SLICE_NAME } from 'stores/types';
import { FeeFormula, FeeFormulaCreate, FeeFormulaSearch, FeeFormulaUpdate } from 'model/fee-code';
import {
  FEE_FORMULA_CREATE,
  FEE_FORMULA_DELETE,
  FEE_FORMULA_DOWNLOAD,
  FEE_FORMULA_LIST,
  FEE_FORMULA_UPDATE
} from '@redux-action-type/fee-formula-type';

export interface FeeFormulaState {
  feeFormulas?: FeeFormula[];
  listLoading: boolean;
  filter: FeeFormulaSearch;
}

export const initialFeeFormula: FeeFormulaState = {
  listLoading: false,
  filter: {
    size: DEFAULT_PAGE_SIZE,
    page: K_SIZE_1
  }
};

const feeFormulaSlice = createSlice({
  name: SLICE_NAME.FEE_CONDITION,
  initialState: initialFeeFormula,
  reducers: {
    reset: () => initialFeeFormula,
    setFeeFormulas: (state, { payload }: PayloadAction<FeeFormula[] | undefined>) => {
      state.feeFormulas = payload;
    },
    setListLoading: (state, { payload }: PayloadAction<boolean>) => {
      state.listLoading = payload;
    },
    setFilter: (state, { payload }: PayloadAction<FeeFormulaSearch>) => {
      state.filter = payload;
    },
    setFieldFilter: (
      state,
      { payload }: PayloadAction<{ key: keyof FeeFormulaSearch; value: string | number }>
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

const getFeeFormulaList = createAction(
  FEE_FORMULA_LIST,
  (
    body: FeeFormulaSearch,
    onSuccess?: (data?: PaginationRes<FeeFormula>) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

const createFeeFormula = createAction(
  FEE_FORMULA_CREATE,
  (
    body: FeeFormulaCreate,
    onSuccess?: (data?: ResultBase<FeeFormula>) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

const updateFeeFormula = createAction(
  FEE_FORMULA_UPDATE,
  (
    body: FeeFormulaUpdate,
    onSuccess?: (data?: ResultBase<FeeFormula>) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

const deleteFeeFormula = createAction(
  FEE_FORMULA_DELETE,
  (
    body: string,
    onSuccess?: (data?: ResultBase<string>) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

const downloadFeeFormula = createAction(
  FEE_FORMULA_DOWNLOAD,
  (onSuccess?: (data?: ResultBase<string>) => void, onFailed?: (error?: ErrorBase) => void) => ({
    payload: {
      onSuccess,
      onFailed
    }
  })
);

export const feeFormulaActions = {
  ...feeFormulaSlice.actions,
  getFeeFormulaList,
  createFeeFormula,
  updateFeeFormula,
  deleteFeeFormula,
  downloadFeeFormula
};

export const feeFormulaReducer = feeFormulaSlice.reducer;
