import appServices from '@app-services';
import { ApiResponse, ResultBase } from 'model/common';
import {
  AddRoleReq,
  AddRoleRes,
  AssignPermissionReq,
  AssignPermissionRes,
  DeleteRoleReq,
  DeleteRoleRes,
  DownloadListRoleRes,
  EditRoleReq,
  EditRoleRes,
  GetListPermissionRes,
  GetListRoleReq,
  GetListRoleRes,
  GetRoleDetailReq,
  GetRoleDetailRes,
  Role
} from 'model/role';
import { ApiConstants } from './networking/app-apis';

async function getListRole(): Promise<ApiResponse<ResultBase<Role[]>>> {
  try {
    const rs = await appServices.post(ApiConstants.GET_LIST_ROLE);
    const data = rs.data;
    return data;
  } catch (error: any) {
    return error;
  }
}
async function getListRoleSearch(params: GetListRoleReq): Promise<ApiResponse<GetListRoleRes>> {
  try {
    const rs = await appServices.post(ApiConstants.GET_LIST_ROLE_SEARCH, params);
    const data = rs.data;
    return data;
  } catch (error: any) {
    return error;
  }
}

async function downloadListRole(params: GetListRoleReq): Promise<ApiResponse<DownloadListRoleRes>> {
  try {
    const rs = await appServices.post(ApiConstants.DOWNLOAD_LIST_ROLE, params);
    const data = rs.data;
    return data;
  } catch (error: any) {
    return error;
  }
}

async function getRolDetail(params: GetRoleDetailReq): Promise<ApiResponse<GetRoleDetailRes>> {
  try {
    const rs = await appServices.post(ApiConstants.GET_ROLE_DETAIL, params);
    const data = rs.data;
    return data;
  } catch (error: any) {
    return error;
  }
}

async function getListPermission(): Promise<ApiResponse<GetListPermissionRes>> {
  try {
    const rs = await appServices.post(ApiConstants.GET_LIST_PERMISSION);
    const data = rs.data;
    return data;
  } catch (error: any) {
    return error;
  }
}

async function addRole(params: AddRoleReq): Promise<ApiResponse<AddRoleRes>> {
  try {
    const rs = await appServices.post(ApiConstants.ADD_ROLE, params);
    const data = rs.data;
    return data;
  } catch (error: any) {
    return error;
  }
}

async function editRole(params: EditRoleReq): Promise<ApiResponse<EditRoleRes>> {
  try {
    const rs = await appServices.post(ApiConstants.EDIT_ROLE, params);
    const data = rs.data;
    return data;
  } catch (error: any) {
    return error;
  }
}

async function deleteRole(params: DeleteRoleReq): Promise<ApiResponse<DeleteRoleRes>> {
  try {
    const rs = await appServices.post(ApiConstants.DELETE_ROLE, params);
    const data = rs.data;
    return data;
  } catch (error: any) {
    return error;
  }
}
async function assignPermission(
  params: AssignPermissionReq
): Promise<ApiResponse<AssignPermissionRes>> {
  try {
    const rs = await appServices.post(ApiConstants.ASSIGN_PERMISSION, params);
    const data = rs.data;
    return data;
  } catch (error: any) {
    return error;
  }
}
async function removePermission(
  params: AssignPermissionReq
): Promise<ApiResponse<AssignPermissionRes>> {
  try {
    const rs = await appServices.post(ApiConstants.REMOVE_PERMISSION, params);
    const data = rs.data;
    return data;
  } catch (error: any) {
    return error;
  }
}
const roleServices = {
  getListRole,
  getListRoleSearch,
  downloadListRole,
  getRolDetail,
  getListPermission,
  addRole,
  editRole,
  deleteRole,
  assignPermission,
  removePermission
};

export default roleServices;
