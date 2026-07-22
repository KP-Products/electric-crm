import appServices from '@app-services';
import { ApiResponse } from 'model/common';
import {
  CreateOperationUnitReq,
  DeleteOperationUnitRes,
  OperationUnitIdReq,
  OperationUnitRes,
  SearchOperationUnitsReq,
  SearchOperationUnitsRes,
  UpdateOperationUnitReq
} from 'model/operation-unit';
import { ApiConstants } from './networking/app-apis';

async function searchOperationUnits(
  params: SearchOperationUnitsReq
): Promise<ApiResponse<SearchOperationUnitsRes>> {
  try {
    const rs = await appServices.post(ApiConstants.OPERATION_UNIT_SEARCH, params);
    return rs.data;
  } catch (error: any) {
    return error;
  }
}

async function getOperationUnitDetail(
  params: OperationUnitIdReq
): Promise<ApiResponse<OperationUnitRes>> {
  try {
    const rs = await appServices.post(ApiConstants.OPERATION_UNIT_DETAIL, params);
    return rs.data;
  } catch (error: any) {
    return error;
  }
}

async function createOperationUnit(
  params: CreateOperationUnitReq
): Promise<ApiResponse<OperationUnitRes>> {
  try {
    const rs = await appServices.post(ApiConstants.OPERATION_UNIT_CREATE, params);
    return rs.data;
  } catch (error: any) {
    return error;
  }
}

async function updateOperationUnit(
  params: UpdateOperationUnitReq
): Promise<ApiResponse<OperationUnitRes>> {
  try {
    const rs = await appServices.post(ApiConstants.OPERATION_UNIT_UPDATE, params);
    return rs.data;
  } catch (error: any) {
    return error;
  }
}

async function deleteOperationUnit(
  params: OperationUnitIdReq
): Promise<ApiResponse<DeleteOperationUnitRes>> {
  try {
    const rs = await appServices.post(ApiConstants.OPERATION_UNIT_DELETE, params);
    return rs.data;
  } catch (error: any) {
    return error;
  }
}

const operationUnitServices = {
  searchOperationUnits,
  getOperationUnitDetail,
  createOperationUnit,
  updateOperationUnit,
  deleteOperationUnit
};

export default operationUnitServices;
