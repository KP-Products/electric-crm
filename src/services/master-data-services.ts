import appServices from '@app-services';
import { ApiResponse } from 'model/common';
import {
  GetListDepartmentReq,
  GetListDepartmentRes,
  GetListUnitRes,
  GetTemplateReq,
  GetTemplateRes
} from 'model/master-data';
import { ApiConstants } from './networking/app-apis';

async function getTemplate(params: GetTemplateReq): Promise<ApiResponse<GetTemplateRes>> {
  try {
    const rs = await appServices.post(ApiConstants.MASTER_DATA_TEMPLATE, params);
    const data = rs.data;
    return data;
  } catch (error: any) {
    return error;
  }
}

async function getListUnit(): Promise<ApiResponse<GetListUnitRes>> {
  try {
    const rs = await appServices.post(ApiConstants.MASTER_DATA_UNIT);
    const data = rs.data;
    return data;
  } catch (error: any) {
    return error;
  }
}

async function getListDepartment(
  params: GetListDepartmentReq
): Promise<ApiResponse<GetListDepartmentRes>> {
  try {
    const rs = await appServices.post(ApiConstants.MASTER_DATA_DEPARTMENT, params);
    const data = rs.data;
    return data;
  } catch (error: any) {
    return error;
  }
}

const masterDataServices = {
  getTemplate,
  getListUnit,
  getListDepartment
};

export default masterDataServices;
