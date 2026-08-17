import appServices from '@app-services';
import { ApiResponse } from 'model/common';
import {
  AddUserReq,
  AddUserRes,
  AssignUserRoleReq,
  DeleteUserReq,
  EditUserReq,
  EditUserRes,
  GetListUserRes,
  UserSearchReq,
  UserSearchRes
} from 'model/user';
import { ApiConstants } from './networking/app-apis';

async function getListUser(): Promise<ApiResponse<GetListUserRes>> {
  try {
    const rs = await appServices.post(ApiConstants.GET_LIST_USER);
    const data = rs.data;
    return data;
  } catch (error: any) {
    return error;
  }
}
async function getUserSearchList(params: UserSearchReq): Promise<ApiResponse<UserSearchRes>> {
  try {
    const rs = await appServices.post(ApiConstants.GET_USER_SEARCH_LIST, params);
    const data = rs.data;
    return data;
  } catch (error: any) {
    return error;
  }
}


async function addUser(params: AddUserReq): Promise<ApiResponse<AddUserRes>> {
  try {
    const rs = await appServices.post(ApiConstants.ADD_USER, params);
    const data = rs.data;
    return data;
  } catch (error: any) {
    return error;
  }
}



async function editUser(params: EditUserReq): Promise<ApiResponse<EditUserRes>> {
  try {
    const rs = await appServices.post(ApiConstants.EDIT_USER, params);
    const data = rs.data;
    return data;
  } catch (error: any) {
    return error;
  }
}
async function deleteUser(params: DeleteUserReq): Promise<ApiResponse<EditUserRes>> {
  try {
    const rs = await appServices.post(ApiConstants.DELETE_USER, params);
    const data = rs.data;
    return data;
  } catch (error: any) {
    return error;
  }
}
async function assignRoleUser(params: AssignUserRoleReq): Promise<ApiResponse<EditUserRes>> {
  try {
    const rs = await appServices.post(ApiConstants.ASSIGN_ROLE_USER, params);
    const data = rs.data;
    return data;
  } catch (error: any) {
    return error;
  }
}
async function revokeRoleUser(params: AssignUserRoleReq): Promise<ApiResponse<EditUserRes>> {
  try {
    const rs = await appServices.post(ApiConstants.REVOKE_ROLE_USER, params);
    const data = rs.data;
    return data;
  } catch (error: any) {
    return error;
  }
}

const userServices = {
  getListUser,
  addUser,
  editUser,
  deleteUser,
  getUserSearchList,
  assignRoleUser,
  revokeRoleUser
};

export default userServices;
