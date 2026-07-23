import appServices from '@app-services';
import { ApiResponse } from 'model/common';
import {
  CreatePpeItemReq,
  DeletePpeItemRes,
  PpeItemIdReq,
  PpeItemRes,
  SearchPpeItemsReq,
  SearchPpeItemsRes,
  UpdatePpeItemReq
} from 'model/ppe-item';
import { ApiConstants } from './networking/app-apis';

async function searchPpeItems(params: SearchPpeItemsReq): Promise<ApiResponse<SearchPpeItemsRes>> {
  try {
    const rs = await appServices.post(ApiConstants.PPE_ITEM_SEARCH, params);
    return rs.data;
  } catch (error: unknown) {
    return error as ApiResponse<SearchPpeItemsRes>;
  }
}

async function getPpeItemDetail(params: PpeItemIdReq): Promise<ApiResponse<PpeItemRes>> {
  try {
    const rs = await appServices.post(ApiConstants.PPE_ITEM_DETAIL, params);
    return rs.data;
  } catch (error: unknown) {
    return error as ApiResponse<PpeItemRes>;
  }
}

async function createPpeItem(params: CreatePpeItemReq): Promise<ApiResponse<PpeItemRes>> {
  try {
    const rs = await appServices.post(ApiConstants.PPE_ITEM_CREATE, params);
    return rs.data;
  } catch (error: unknown) {
    return error as ApiResponse<PpeItemRes>;
  }
}

async function updatePpeItem(params: UpdatePpeItemReq): Promise<ApiResponse<PpeItemRes>> {
  try {
    const rs = await appServices.post(ApiConstants.PPE_ITEM_UPDATE, params);
    return rs.data;
  } catch (error: unknown) {
    return error as ApiResponse<PpeItemRes>;
  }
}

async function deletePpeItem(params: PpeItemIdReq): Promise<ApiResponse<DeletePpeItemRes>> {
  try {
    const rs = await appServices.post(ApiConstants.PPE_ITEM_DELETE, params);
    return rs.data;
  } catch (error: unknown) {
    return error as ApiResponse<DeletePpeItemRes>;
  }
}

const ppeItemServices = {
  searchPpeItems,
  getPpeItemDetail,
  createPpeItem,
  updatePpeItem,
  deletePpeItem
};

export default ppeItemServices;
