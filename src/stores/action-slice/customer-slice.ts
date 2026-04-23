import {
  CUSTOMER_CREATE,
  CUSTOMER_DOWNLOAD,
  CUSTOMER_LIST,
  CUSTOMER_UPDATE,
  SLICE_NAME
} from '@redux-action-type/customer-type';
import { createAction, createSlice } from '@reduxjs/toolkit';
import { ErrorBase } from 'model/common';
import {
  CreateCustomerGroupReq,
  Customer,
  CustomerGroup,
  UpdateCustomerGroupReq
} from 'model/customer';

export interface CustomerState {
  customers?: Customer[];
  listLoading: boolean;
  customerGroups?: CustomerGroup[];
  listGroupLoading: boolean;
}

export const initialCustomer: CustomerState = {
  customers: undefined,
  listLoading: false,
  listGroupLoading: false
};

const customerSlice = createSlice({
  name: SLICE_NAME.CUSTOMER,
  initialState: initialCustomer,
  reducers: {
    reset: () => initialCustomer,
    setCustomers: (state, { payload }) => {
      state.customers = payload;
    },
    setListLoading: (state, { payload }) => {
      state.listLoading = payload;
    },
    setCustomergroups: (state, { payload }) => {
      state.customerGroups = payload;
    },
    setGroupLoading: (state, { payload }) => {
      state.listGroupLoading = payload;
    }
  }
});

const getCustomerList = createAction(
  CUSTOMER_LIST,
  (onSuccess?: (data?: Customer[]) => void, onFailed?: (error?: ErrorBase) => void) => ({
    payload: { onSuccess, onFailed }
  })
);

const createCustomer = createAction(
  CUSTOMER_CREATE,
  (
    body: CreateCustomerGroupReq,
    onSuccess?: (data?: CustomerGroup) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

const updateCustomer = createAction(
  CUSTOMER_UPDATE,
  (
    body: UpdateCustomerGroupReq,
    onSuccess?: (data?: CustomerGroup) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

const downloadCustomer = createAction(
  CUSTOMER_DOWNLOAD,
  (body: string, onSuccess?: (data?: string) => void, onFailed?: (error?: ErrorBase) => void) => ({
    payload: { body, onSuccess, onFailed }
  })
);

export const customerActions = {
  ...customerSlice.actions,
  getCustomerList,
  createCustomer,
  updateCustomer,
  downloadCustomer
};

export const customerReducer = customerSlice.reducer;
