import { createAction, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SLICE_NAME } from 'stores/types';
import { ErrorBase, PaginationRes } from 'model/common';
import {
  ChangeFeeProductReq,
  CreateProduct,
  Product,
  ProductDownload,
  ProductFilter,
  UpdateProduct
} from 'model/product';
import { K_SIZE_1, K_SIZE_20 } from '@constant';
import {
  PRODUCT_CHANGE_FEE,
  PRODUCT_CHANGE_FEE_REVISE,
  PRODUCT_CREATE,
  PRODUCT_DETAIL,
  PRODUCT_DOWNLOAD,
  PRODUCT_LIST,
  PRODUCT_REVISE,
  PRODUCT_UPDATE
} from '@redux-action-type/product-type';

export interface ProductState {
  products?: Product[];
  listLoading: boolean;
  filter: ProductFilter;
}

export const initialProduct: ProductState = {
  products: undefined,
  listLoading: false,
  filter: {
    page: K_SIZE_1,
    size: K_SIZE_20
  }
};

const productSlice = createSlice({
  name: SLICE_NAME.FEE_CODE,
  initialState: initialProduct,
  reducers: {
    reset: () => initialProduct,
    setProducts: (state, { payload }: PayloadAction<Product[] | undefined>) => {
      state.products = payload;
    },
    setListLoading: (state, { payload }: PayloadAction<boolean>) => {
      state.listLoading = payload;
    },
    setFilter: (state, { payload }: PayloadAction<ProductFilter>) => {
      state.filter = payload;
    },
    setFieldFilter: (
      state,
      { payload }: PayloadAction<{ key: keyof ProductFilter; value: string | number }>
    ) => {
      const { key, value } = payload;
      state.filter = {
        ...state.filter,
        [key]: value
      };
    }
  }
});

const getProducts = createAction(
  PRODUCT_LIST,
  (
    body: ProductFilter,
    onSuccess?: (data: PaginationRes<Product>) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

const getProductDetail = createAction(
  PRODUCT_DETAIL,
  (body: string, onSuccess?: (data: Product) => void, onFailed?: (error?: ErrorBase) => void) => ({
    payload: { body, onSuccess, onFailed }
  })
);

const createProducts = createAction(
  PRODUCT_CREATE,
  (
    body: CreateProduct,
    onSuccess?: (data?: Product) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

const updateProducts = createAction(
  PRODUCT_UPDATE,
  (
    body: UpdateProduct,
    onSuccess?: (data?: Product) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

const downloadProducts = createAction(
  PRODUCT_DOWNLOAD,
  (
    body: ProductDownload,
    onSuccess?: (data: string) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

const reviseProduct = createAction(
  PRODUCT_REVISE,
  (
    body: UpdateProduct,
    onSuccess?: (data?: Product) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

const changeFee = createAction(
  PRODUCT_CHANGE_FEE,
  (
    body: ChangeFeeProductReq,
    onSuccess?: (data?: null) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

const changeFeeRevise = createAction(
  PRODUCT_CHANGE_FEE_REVISE,
  (
    body: ChangeFeeProductReq,
    onSuccess?: (data: Product) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

export const productActions = {
  ...productSlice.actions,
  getProducts,
  getProductDetail,
  createProducts,
  updateProducts,
  downloadProducts,
  reviseProduct,
  changeFee,
  changeFeeRevise
};

export const productReducer = productSlice.reducer;
