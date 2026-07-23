import appServices from '@app-services';
import { ApiResponse } from 'model/common';
import {
  CreateOperationContractReq,
  DeleteOperationContractRes,
  OperationContractIdReq,
  OperationContractRes,
  SearchOperationContractsReq,
  SearchOperationContractsRes,
  UpdateOperationContractReq
} from 'model/operation-contract';
import { ApiConstants } from './networking/app-apis';

async function searchOperationContracts(
  params: SearchOperationContractsReq
): Promise<ApiResponse<SearchOperationContractsRes>> {
  try {
    const rs = await appServices.post(ApiConstants.OPERATION_CONTRACT_SEARCH, params);
    return rs.data;
  } catch (error: any) {
    return error;
  }
}

async function getOperationContractDetail(
  params: OperationContractIdReq
): Promise<ApiResponse<OperationContractRes>> {
  try {
    const rs = await appServices.post(ApiConstants.OPERATION_CONTRACT_DETAIL, params);
    return rs.data;
  } catch (error: any) {
    return error;
  }
}

async function createOperationContract(
  params: CreateOperationContractReq
): Promise<ApiResponse<OperationContractRes>> {
  try {
    const rs = await appServices.post(ApiConstants.OPERATION_CONTRACT_CREATE, params);
    return rs.data;
  } catch (error: any) {
    return error;
  }
}

async function updateOperationContract(
  params: UpdateOperationContractReq
): Promise<ApiResponse<OperationContractRes>> {
  try {
    const rs = await appServices.post(ApiConstants.OPERATION_CONTRACT_UPDATE, params);
    return rs.data;
  } catch (error: any) {
    return error;
  }
}

async function deleteOperationContract(
  params: OperationContractIdReq
): Promise<ApiResponse<DeleteOperationContractRes>> {
  try {
    const rs = await appServices.post(ApiConstants.OPERATION_CONTRACT_DELETE, params);
    return rs.data;
  } catch (error: any) {
    return error;
  }
}

const operationContractServices = {
  searchOperationContracts,
  getOperationContractDetail,
  createOperationContract,
  updateOperationContract,
  deleteOperationContract
};

export default operationContractServices;
