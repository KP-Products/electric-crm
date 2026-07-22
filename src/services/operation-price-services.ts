import appServices from '@app-services';
import { ApiResponse } from 'model/common';
import {
  ContractLookupReq,
  ContractLookupRes,
  CreateOperationPriceReq,
  DeleteOperationPriceRes,
  OperationPriceIdReq,
  OperationPriceRes,
  SearchOperationPricesReq,
  SearchOperationPricesRes,
  UpdateOperationPriceReq
} from 'model/operation-price';
import { ApiConstants } from './networking/app-apis';

async function searchOperationPrices(
  params: SearchOperationPricesReq
): Promise<ApiResponse<SearchOperationPricesRes>> {
  try {
    const rs = await appServices.post(ApiConstants.BILLING_OPERATION_PRICE_SEARCH, params);
    return rs.data;
  } catch (error: any) {
    return error;
  }
}

async function getOperationPriceDetail(
  params: OperationPriceIdReq
): Promise<ApiResponse<OperationPriceRes>> {
  try {
    const rs = await appServices.post(ApiConstants.BILLING_OPERATION_PRICE_DETAIL, params);
    return rs.data;
  } catch (error: any) {
    return error;
  }
}

async function createOperationPrice(
  params: CreateOperationPriceReq
): Promise<ApiResponse<OperationPriceRes>> {
  try {
    const rs = await appServices.post(ApiConstants.BILLING_OPERATION_PRICE_CREATE, params);
    return rs.data;
  } catch (error: any) {
    return error;
  }
}

async function updateOperationPrice(
  params: UpdateOperationPriceReq
): Promise<ApiResponse<OperationPriceRes>> {
  try {
    const rs = await appServices.post(ApiConstants.BILLING_OPERATION_PRICE_UPDATE, params);
    return rs.data;
  } catch (error: any) {
    return error;
  }
}

async function deleteOperationPrice(
  params: OperationPriceIdReq
): Promise<ApiResponse<DeleteOperationPriceRes>> {
  try {
    const rs = await appServices.post(ApiConstants.BILLING_OPERATION_PRICE_DELETE, params);
    return rs.data;
  } catch (error: any) {
    return error;
  }
}

async function lookupOperationContract(
  params: ContractLookupReq
): Promise<ApiResponse<ContractLookupRes>> {
  try {
    const rs = await appServices.post(ApiConstants.BILLING_OPERATION_PRICE_CONTRACT_LOOKUP, params);
    return rs.data;
  } catch (error: any) {
    return error;
  }
}

const operationPriceServices = {
  searchOperationPrices,
  getOperationPriceDetail,
  createOperationPrice,
  updateOperationPrice,
  deleteOperationPrice,
  lookupOperationContract
};

export default operationPriceServices;
