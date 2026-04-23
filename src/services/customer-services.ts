import appServices from '@app-services';
import { ApiResponse, ResultBase } from 'model/common';
import {
  CreateCustomerGroupReq,
  Customer,
  CustomerGroup,
  UpdateCustomerGroupReq
} from 'model/customer';
import { ApiConstants } from 'services/networking/app-apis';

const customerServices = {
  getCustomerList: async (): Promise<ApiResponse<ResultBase<Customer[]>>> => {
    try {
      const rs = await appServices.post(ApiConstants.CUSTOMER_LIST);
      return rs.data;
    } catch (error: any) {
      return error;
    }
  },

  createCustomer: async (
    param: CreateCustomerGroupReq
  ): Promise<ApiResponse<ResultBase<CustomerGroup>>> => {
    try {
      const rs = await appServices.post(ApiConstants.CUSTOMER_CREATE, param);
      return rs.data;
    } catch (error: any) {
      return error;
    }
  },

  updateCustomer: async (
    param: UpdateCustomerGroupReq
  ): Promise<ApiResponse<ResultBase<CustomerGroup>>> => {
    try {
      const rs = await appServices.post(ApiConstants.CUSTOMER_UPDATE, param);
      return rs.data;
    } catch (error: any) {
      return error;
    }
  },

  downloadCustomer: async (keyword: string): Promise<ApiResponse<ResultBase<string>>> => {
    try {
      const rs = await appServices.post(ApiConstants.CUSTOMER_DOWNLOAD, { keyword: keyword });
      return rs.data;
    } catch (error: any) {
      return error;
    }
  }
};

export default customerServices;
