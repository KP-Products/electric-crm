import appServices from '@app-services';
import { ApiResponse } from 'model/common';
import {
  CreateGroupCodeFeeResponse,
  DownloadGroupCodeFeeResponse,
  GroupCodeFeeDetailResponse,
  GroupCodeFeeList,
  GroupCodeFeeListBody,
  GroupCodeFeeListResponse,
  UpdateGroupCodeFeeResponse
} from 'model/manage-code-fee-group';
import { ApiConstants } from './networking/app-apis';

async function getListGroupCodeFee(
  body?: GroupCodeFeeListBody
): Promise<ApiResponse<GroupCodeFeeListResponse>> {
  try {
    const { data } = await appServices.post(ApiConstants.GROUP_CODE_FEE_LIST, body);
    return data;
  } catch (error: any) {
    return error;
  }
}

async function getDetailGroupCodeFee(
  id: string | number
): Promise<ApiResponse<GroupCodeFeeDetailResponse>> {
  try {
    const { data } = await appServices.post(ApiConstants.GROUP_CODE_FEE_DETAIL, { id });
    return data;
  } catch (error: any) {
    return error;
  }
}

async function createGroupCodeFee(
  body: GroupCodeFeeList
): Promise<ApiResponse<CreateGroupCodeFeeResponse>> {
  try {
    const { data } = await appServices.post(ApiConstants.GROUP_CODE_FEE_CREATE, body);
    return data;
  } catch (error: any) {
    return error;
  }
}

async function updateGroupCodeFee(
  body: GroupCodeFeeList
): Promise<ApiResponse<UpdateGroupCodeFeeResponse>> {
  try {
    const { data } = await appServices.post(ApiConstants.GROUP_CODE_FEE_UPDATE, body);
    return data;
  } catch (error: any) {
    return error;
  }
}

async function deleteGroupCodeFee(
  id: string | number
): Promise<ApiResponse<GroupCodeFeeDetailResponse>> {
  try {
    const { data } = await appServices.post(ApiConstants.GROUP_CODE_FEE_DELETE, { id });
    return data;
  } catch (error: any) {
    return error;
  }
}

async function downloadGroupCodeFee(
  body?: GroupCodeFeeListBody
): Promise<ApiResponse<DownloadGroupCodeFeeResponse>> {
  try {
    const { data } = await appServices.post(ApiConstants.GROUP_CODE_FEE_DOWNLOAD, body);
    return data;
  } catch (error: any) {
    return error;
  }
}

const groupCodeFeeServices = {
  getListGroupCodeFee,
  getDetailGroupCodeFee,
  createGroupCodeFee,
  updateGroupCodeFee,
  deleteGroupCodeFee,
  downloadGroupCodeFee
};

export default groupCodeFeeServices;
