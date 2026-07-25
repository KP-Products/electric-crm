import appServices from '@app-services';
import { ApiResponse } from 'model/common';
import {
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
import { ApiConstants } from 'services/networking/app-apis';

const customerServices = {
  getCustomerList: async (): Promise<ApiResponse<CustomerListRes>> => {
    try {
      const rs = await appServices.post(ApiConstants.CUSTOMER_LIST);
      return rs.data;
    } catch (error: any) {
      return error;
    }
  },

  searchCustomer: async (param: CustomerSearchReq): Promise<ApiResponse<CustomerSearchRes>> => {
    try {
      const rs = await appServices.post(ApiConstants.CUSTOMER_SEARCH, param);
      return rs.data;
    } catch (error: any) {
      return error;
    }
  },

  getCustomerDetail: async (param: CustomerIdReq): Promise<ApiResponse<CustomerDetailRes>> => {
    try {
      const rs = await appServices.post(ApiConstants.CUSTOMER_DETAIL, param);
      return rs.data;
    } catch (error: any) {
      return error;
    }
  },

  createCustomer: async (param: CreateCustomerReq): Promise<ApiResponse<CustomerRes>> => {
    try {
      const rs = await appServices.post(ApiConstants.CUSTOMER_CREATE, param);
      return rs.data;
    } catch (error: any) {
      return error;
    }
  },

  updateCustomer: async (param: UpdateCustomerReq): Promise<ApiResponse<CustomerRes>> => {
    try {
      const rs = await appServices.post(ApiConstants.CUSTOMER_UPDATE, param);
      return rs.data;
    } catch (error: any) {
      return error;
    }
  },

  deleteCustomer: async (param: CustomerIdReq): Promise<ApiResponse<DeleteCustomerRes>> => {
    try {
      const rs = await appServices.post(ApiConstants.CUSTOMER_DELETE, param);
      return rs.data;
    } catch (error: any) {
      return error;
    }
  }
};

export default customerServices;
