import { createDeepEqualSelector } from '@redux-common';
import { RootState } from '@store/all-reducers';
import { initialProduct } from '@redux-slice/product-slice';

const selectDomain = (state: RootState) => state?.product || initialProduct;

export const selectProductsLoading = createDeepEqualSelector(
  selectDomain,
  (parma) => parma.listLoading
);

export const selectProducts = createDeepEqualSelector(selectDomain, (parma) => parma.products);

export const selectProductFilter = createDeepEqualSelector(selectDomain, (parma) => parma.filter);
