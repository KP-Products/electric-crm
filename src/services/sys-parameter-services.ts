import appServices from '@app-services';
import { ApiResponse } from 'model/common';
import {
  CreateSystemParameterReq,
  DeleteSystemParameterRes,
  SearchSystemParameterReq,
  SearchSystemParameterRes,
  SystemParameterIdReq,
  SystemParameterRes,
  UpdateSystemParameterReq
} from 'model/system-parameter';
import { ApiConstants } from './networking/app-apis';

async function searchSysParameters(
  params: SearchSystemParameterReq
): Promise<ApiResponse<SearchSystemParameterRes>> {
  try {
    const rs = await appServices.post(ApiConstants.SYSTEM_PARAMETER_LIST, params);
    return rs.data;
  } catch (error: any) {
    return error;
  }
}

async function getSysParameterDetail(
  params: SystemParameterIdReq
): Promise<ApiResponse<SystemParameterRes>> {
  try {
    const rs = await appServices.post(ApiConstants.SYSTEM_PARAMETER_DETAIL, params);
    return rs.data;
  } catch (error: any) {
    return error;
  }
}

async function createSysParameter(
  params: CreateSystemParameterReq
): Promise<ApiResponse<SystemParameterRes>> {
  try {
    const rs = await appServices.post(ApiConstants.SYSTEM_PARAMETER_CREATE, params);
    return rs.data;
  } catch (error: any) {
    return error;
  }
}

async function updateSysParameter(
  params: UpdateSystemParameterReq
): Promise<ApiResponse<SystemParameterRes>> {
  try {
    const rs = await appServices.post(ApiConstants.SYSTEM_PARAMETER_UPDATE, params);
    return rs.data;
  } catch (error: any) {
    return error;
  }
}

async function deleteSysParameter(
  params: SystemParameterIdReq
): Promise<ApiResponse<DeleteSystemParameterRes>> {
  try {
    const rs = await appServices.post(ApiConstants.SYSTEM_PARAMETER_DELETE, params);
    return rs.data;
  } catch (error: any) {
    return error;
  }
}

const sysParameterServices = {
  searchSysParameters,
  getSysParameterDetail,
  createSysParameter,
  updateSysParameter,
  deleteSysParameter
};

export default sysParameterServices;
