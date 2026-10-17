import appServices from '@app-services';
import { ApiResponse } from 'model/common';
import {
  AvailableMeterListRes,
  AvailableMetersReq,
  ContractDeleteRes,
  ContractListRes,
  ContractRes,
  ContractSearchReq,
  ContractSearchRes,
  CreateContractReq,
  DeleteContractReq,
  ExportContractsPdfReq,
  GetContractReq,
  UpdateContractReq
} from 'model/contract';
import { BlobFileResponse, getFileNameFromDisposition } from 'utils/blob-response';
import { ApiConstants } from './networking/app-apis';

async function searchContract(params: ContractSearchReq): Promise<ApiResponse<ContractSearchRes>> {
  try {
    const rs = await appServices.post(ApiConstants.CONTRACT_SEARCH, params);
    return rs.data;
  } catch (error: any) {
    return error;
  }
}

async function listContract(): Promise<ApiResponse<ContractListRes>> {
  try {
    const rs = await appServices.post(ApiConstants.CONTRACT_LIST);
    return rs.data;
  } catch (error: any) {
    return error;
  }
}

async function createContract(params: CreateContractReq): Promise<ApiResponse<ContractRes>> {
  try {
    const rs = await appServices.post(ApiConstants.CONTRACT_CREATE, params);
    return rs.data;
  } catch (error: any) {
    return error;
  }
}

async function updateContract(params: UpdateContractReq): Promise<ApiResponse<ContractRes>> {
  try {
    const rs = await appServices.post(ApiConstants.CONTRACT_UPDATE, params);
    return rs.data;
  } catch (error: any) {
    return error;
  }
}

async function getContract(params: GetContractReq): Promise<ApiResponse<ContractRes>> {
  try {
    const rs = await appServices.post(ApiConstants.CONTRACT_DETAIL, params);
    return rs.data;
  } catch (error: any) {
    return error;
  }
}

async function deleteContract(params: DeleteContractReq): Promise<ApiResponse<ContractDeleteRes>> {
  try {
    const rs = await appServices.post(ApiConstants.CONTRACT_DELETE, params);
    return rs.data;
  } catch (error: any) {
    return error;
  }
}

async function exportContractsPdf(
  params: ExportContractsPdfReq
): Promise<BlobFileResponse | unknown> {
  try {
    const rs = await appServices.post(ApiConstants.CONTRACT_EXPORT_PDF, params, {
      responseType: 'blob'
    });
    return {
      blob: rs.data,
      contentType: rs.headers['content-type'],
      fileName: getFileNameFromDisposition(rs.headers['content-disposition'])
    };
  } catch (error: any) {
    return error;
  }
}

async function getAvailableMeters(
  params: AvailableMetersReq
): Promise<ApiResponse<AvailableMeterListRes>> {
  try {
    const rs = await appServices.post(ApiConstants.CONTRACT_AVAILABLE_METERS, params);
    return rs.data;
  } catch (error: any) {
    return error;
  }
}

async function getFeeders(
  params: AvailableMetersReq = {}
): Promise<ApiResponse<AvailableMeterListRes>> {
  try {
    const rs = await appServices.post(ApiConstants.CONTRACT_FEEDERS, params);
    return rs.data;
  } catch (error: any) {
    return error;
  }
}

const contractServices = {
  searchContract,
  listContract,
  createContract,
  updateContract,
  getContract,
  deleteContract,
  exportContractsPdf,
  getAvailableMeters,
  getFeeders
};

export default contractServices;
