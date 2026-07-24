import {
  CUSTOMER_CREATE,
  CUSTOMER_DELETE,
  CUSTOMER_DETAIL,
  CUSTOMER_LIST,
  CUSTOMER_SEARCH,
  CUSTOMER_UPDATE,
  SLICE_NAME
} from '@redux-action-type/customer-type';
import { createAction, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ErrorBase } from 'model/common';
import {
  Customer,
  CreateCustomerReq,
  CustomerDetailRes,
  CustomerIdReq,
  CustomerListRes,
  CustomerRes,
  CustomerSearchReq,
  CustomerSearchRes,
  DeleteCustomerRes,
  UpdateCustomerReq
} from 'model/customer';

export interface CustomerState {
  customers: Customer[];
  total: number;
  listLoading: boolean;
  detailLoading: boolean;
  customerGroups?: Customer[];
  listGroupLoading: boolean;
}

export const initialCustomer: CustomerState = {
  customers: [],
  total: 0,
  listLoading: false,
  detailLoading: false,
  listGroupLoading: false
};

const customerSlice = createSlice({
  name: SLICE_NAME.CUSTOMER,
  initialState: initialCustomer,
  reducers: {
    reset: () => initialCustomer,
    setCustomers: (state, { payload }: PayloadAction<Customer[]>) => {
      state.customers = payload;
    },
    setTotal: (state, { payload }: PayloadAction<number>) => {
      state.total = payload;
    },
    setListLoading: (state, { payload }: PayloadAction<boolean>) => {
      state.listLoading = payload;
    },
    setDetailLoading: (state, { payload }: PayloadAction<boolean>) => {
      state.detailLoading = payload;
    },
    setCustomergroups: (state, { payload }: PayloadAction<Customer[]>) => {
      state.customerGroups = payload;
    },
    setGroupLoading: (state, { payload }: PayloadAction<boolean>) => {
      state.listGroupLoading = payload;
    }
  }
});

const getCustomerList = createAction(
  CUSTOMER_LIST,
  (
    onSuccess?: (data?: CustomerListRes['data']) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({
    payload: { onSuccess, onFailed }
  })
);

const searchCustomer = createAction(
  CUSTOMER_SEARCH,
  (
    body: CustomerSearchReq,
    onSuccess?: (data: CustomerSearchRes) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

const getCustomerDetail = createAction(
  CUSTOMER_DETAIL,
  (
    body: CustomerIdReq,
    onSuccess?: (data: CustomerDetailRes) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

const createCustomer = createAction(
  CUSTOMER_CREATE,
  (
    body: CreateCustomerReq,
    onSuccess?: (data: CustomerRes) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

const updateCustomer = createAction(
  CUSTOMER_UPDATE,
  (
    body: UpdateCustomerReq,
    onSuccess?: (data: CustomerRes) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

const deleteCustomer = createAction(
  CUSTOMER_DELETE,
  (
    body: CustomerIdReq,
    onSuccess?: (data: DeleteCustomerRes) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

export const customerActions = {
  ...customerSlice.actions,
  getCustomerList,
  searchCustomer,
  getCustomerDetail,
  createCustomer,
  updateCustomer,
  deleteCustomer
};

export const customerReducer = customerSlice.reducer;
