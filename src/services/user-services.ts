import appServices from '@app-services';
import { ApiResponse } from 'model/common';
import {
  AddListUserReq,
  AddListUserRes,
  AddUserReq,
  AddUserRes,
  DownloadListUserRes,
  EditUserReq,
  EditUserRes,
  GetListUserReq,
  GetListUserRes,
  UploadUserReq,
  UploadUserRes
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

async function downloadListUser(params: GetListUserReq): Promise<ApiResponse<DownloadListUserRes>> {
  try {
    const rs = await appServices.post(ApiConstants.DOWNLOAD_LIST_USER, params);
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

async function uploadUser(params: UploadUserReq): Promise<ApiResponse<UploadUserRes>> {
  try {
    const rs = await appServices.post(ApiConstants.UPLOAD_USER, params);
    const data = rs.data;
    return data;
  } catch (error: any) {
    return error;
  }
}

async function addListUser(params: AddListUserReq): Promise<ApiResponse<AddListUserRes>> {
  try {
    const rs = await appServices.post(ApiConstants.ADD_LIST_USER, params);
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

const userServices = {
  getListUser,
  downloadListUser,
  addUser,
  uploadUser,
  addListUser,
  editUser
};

export default userServices;
