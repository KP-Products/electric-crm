import appServices from '@app-services';
import { ApiResponse } from 'model/common';
import {
  BranchListRes,
  BranchRes,
  BranchSearchReq,
  BranchSearchRes,
  BranchUsersReq,
  BranchUsersRes,
  CreateBranchReq,
  DeleteBranchReq,
  GetBranchReq,
  UpdateBranchReq
} from 'model/branch';
import { ApiConstants } from './networking/app-apis';

async function searchBranch(params: BranchSearchReq): Promise<ApiResponse<BranchSearchRes>> {
  try {
    const rs = await appServices.post(ApiConstants.BRANCH_SEARCH, params);
    return rs.data;
  } catch (error: any) {
    return error;
  }
}

async function listBranch(): Promise<ApiResponse<BranchListRes>> {
  try {
    const rs = await appServices.post(ApiConstants.BRANCH_LIST);
    return rs.data;
  } catch (error: any) {
    return error;
  }
}

async function getBranch(params: GetBranchReq): Promise<ApiResponse<BranchRes>> {
  try {
    const rs = await appServices.post(ApiConstants.BRANCH_DETAIL, params);
    return rs.data;
  } catch (error: any) {
    return error;
  }
}

async function createBranch(params: CreateBranchReq): Promise<ApiResponse<BranchRes>> {
  try {
    const rs = await appServices.post(ApiConstants.BRANCH_CREATE, params);
    return rs.data;
  } catch (error: any) {
    return error;
  }
}

async function updateBranch(params: UpdateBranchReq): Promise<ApiResponse<BranchRes>> {
  try {
    const rs = await appServices.post(ApiConstants.BRANCH_UPDATE, params);
    return rs.data;
  } catch (error: any) {
    return error;
  }
}

async function deleteBranch(params: DeleteBranchReq): Promise<ApiResponse<BranchRes>> {
  try {
    const rs = await appServices.post(ApiConstants.BRANCH_DELETE, params);
    return rs.data;
  } catch (error: any) {
    return error;
  }
}

async function getBranchUsers(params: BranchUsersReq): Promise<ApiResponse<BranchUsersRes>> {
  try {
    const rs = await appServices.post(ApiConstants.BRANCH_USERS, params);
    return rs.data;
  } catch (error: any) {
    return error;
  }
}

const branchServices = {
  searchBranch,
  listBranch,
  getBranch,
  createBranch,
  updateBranch,
  deleteBranch,
  getBranchUsers
};

export default branchServices;
