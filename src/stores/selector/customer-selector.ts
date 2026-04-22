import { createDeepEqualSelector } from '@redux-common';
import { RootState } from '@store/all-reducers';

export const selectCustomerState = (state: RootState) => state.customer;

export const selectCustomers = createDeepEqualSelector(
  selectCustomerState,
  (state) => state.customers || []
);

export const selectCustomerLoading = createDeepEqualSelector(
  selectCustomerState,
  (state) => state.listLoading
);
