import {
  CUSTOMER_GROUP_CREATE,
  CUSTOMER_GROUP_DOWNLOAD,
  CUSTOMER_GROUP_LIST,
  CUSTOMER_GROUP_UPDATE,
  CUSTOMER_LIST,
  SLICE_NAME
} from '@redux-action-type/customer-type';
import { createAction, createSlice } from '@reduxjs/toolkit';
import { ErrorBase } from 'model/common';
import {
  CreateCustomerGroupReq,
  Customer,
  CustomerFilter,
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

const getCustomers = createAction(
  CUSTOMER_LIST,
  (
    body: CustomerFilter,
    onSuccess?: (data?: Customer[]) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

const getCustomerGroupList = createAction(
  CUSTOMER_GROUP_LIST,
  (onSuccess?: (data?: CustomerGroup[]) => void, onFailed?: (error?: ErrorBase) => void) => ({
    payload: { onSuccess, onFailed }
  })
);

const createCustomerGroup = createAction(
  CUSTOMER_GROUP_CREATE,
  (
    body: CreateCustomerGroupReq,
    onSuccess?: (data?: CustomerGroup) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

const updateCustomerGroup = createAction(
  CUSTOMER_GROUP_UPDATE,
  (
    body: UpdateCustomerGroupReq,
    onSuccess?: (data?: CustomerGroup) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

const downloadCustomerGroup = createAction(
  CUSTOMER_GROUP_DOWNLOAD,
  (body: string, onSuccess?: (data?: string) => void, onFailed?: (error?: ErrorBase) => void) => ({
    payload: { body, onSuccess, onFailed }
  })
);

export const customerActions = {
  ...customerSlice.actions,
  getCustomers,
  getCustomerGroupList,
  createCustomerGroup,
  updateCustomerGroup,
  downloadCustomerGroup
};

export const customerReducer = customerSlice.reducer;
