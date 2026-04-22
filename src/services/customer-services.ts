import appServices from '@app-services';
import { ApiResponse, ResultBase } from 'model/common';
import {
  CreateCustomerGroupReq,
  Customer,
  CustomerFilter,
  CustomerGroup,
  UpdateCustomerGroupReq
} from 'model/customer';
import { ApiConstants } from 'services/networking/app-apis';

const customerServices = {
  getCustomerList: async (body: CustomerFilter): Promise<ApiResponse<ResultBase<Customer[]>>> => {
    try {
      const rs = await appServices.post(ApiConstants.CUSTOMER_LIST, body);
      return rs.data;
    } catch (error: any) {
      return error;
    }
  },

  getCustomerGroupList: async (): Promise<ApiResponse<ResultBase<CustomerGroup[]>>> => {
    try {
      const rs = await appServices.post(ApiConstants.CUSTOMER_GROUP_LIST);
      return rs.data;
    } catch (error: any) {
      return error;
    }
  },

  createCustomerGroup: async (
    param: CreateCustomerGroupReq
  ): Promise<ApiResponse<ResultBase<CustomerGroup>>> => {
    try {
      const rs = await appServices.post(ApiConstants.CUSTOMER_GROUP_CREATE, param);
      return rs.data;
    } catch (error: any) {
      return error;
    }
  },

  updateCustomerGroup: async (
    param: UpdateCustomerGroupReq
  ): Promise<ApiResponse<ResultBase<CustomerGroup>>> => {
    try {
      const rs = await appServices.post(ApiConstants.CUSTOMER_GROUP_UPDATE, param);
      return rs.data;
    } catch (error: any) {
      return error;
    }
  },

  downloadCustomerGroup: async (keyword: string): Promise<ApiResponse<ResultBase<string>>> => {
    try {
      const rs = await appServices.post(ApiConstants.CUSTOMER_GROUP_DOWNLOAD, { keyword: keyword });
      return rs.data;
    } catch (error: any) {
      return error;
    }
  }
};

export default customerServices;
