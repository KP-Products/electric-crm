import appServices from '@app-services';
import { ApiResponse } from 'model/common';
import {
  CreatePpeItemHistoryReq,
  DeletePpeItemHistoryRes,
  PpeItemHistoryIdReq,
  PpeItemHistoryRes,
  SearchPpeItemHistoryReq,
  SearchPpeItemHistoryRes,
  UpdatePpeItemHistoryReq
} from 'model/ppe-item-history';
import { ApiConstants } from './networking/app-apis';

async function searchPpeItemHistory(
  params: SearchPpeItemHistoryReq
): Promise<ApiResponse<SearchPpeItemHistoryRes>> {
  try {
    const rs = await appServices.post(ApiConstants.PPE_ITEM_HISTORY_SEARCH, params);
    return rs.data;
  } catch (error: unknown) {
    return error as ApiResponse<SearchPpeItemHistoryRes>;
  }
}

async function getPpeItemHistoryDetail(
  params: PpeItemHistoryIdReq
): Promise<ApiResponse<PpeItemHistoryRes>> {
  try {
    const rs = await appServices.post(ApiConstants.PPE_ITEM_HISTORY_DETAIL, params);
    return rs.data;
  } catch (error: unknown) {
    return error as ApiResponse<PpeItemHistoryRes>;
  }
}

async function createPpeItemHistory(
  params: CreatePpeItemHistoryReq
): Promise<ApiResponse<PpeItemHistoryRes>> {
  try {
    const rs = await appServices.post(ApiConstants.PPE_ITEM_HISTORY_CREATE, params);
    return rs.data;
  } catch (error: unknown) {
    return error as ApiResponse<PpeItemHistoryRes>;
  }
}

async function updatePpeItemHistory(
  params: UpdatePpeItemHistoryReq
): Promise<ApiResponse<PpeItemHistoryRes>> {
  try {
    const rs = await appServices.post(ApiConstants.PPE_ITEM_HISTORY_UPDATE, params);
    return rs.data;
  } catch (error: unknown) {
    return error as ApiResponse<PpeItemHistoryRes>;
  }
}

async function deletePpeItemHistory(
  params: PpeItemHistoryIdReq
): Promise<ApiResponse<DeletePpeItemHistoryRes>> {
  try {
    const rs = await appServices.post(ApiConstants.PPE_ITEM_HISTORY_DELETE, params);
    return rs.data;
  } catch (error: unknown) {
    return error as ApiResponse<DeletePpeItemHistoryRes>;
  }
}

const ppeItemHistoryServices = {
  searchPpeItemHistory,
  getPpeItemHistoryDetail,
  createPpeItemHistory,
  updatePpeItemHistory,
  deletePpeItemHistory
};

export default ppeItemHistoryServices;
