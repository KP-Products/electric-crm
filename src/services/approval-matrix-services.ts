import appServices from '@app-services';
import {
  EditApprovalMatrixReq,
  EditApprovalMatrixRes,
  GetApprovalMatrixDetailReq,
  GetApprovalMatrixDetailRes,
  GetListApprovalFunctionRes
} from 'model/approval-matrix';
import { ApiResponse } from 'model/common';
import { ApiConstants } from './networking/app-apis';

async function getListApprovalFunction(): Promise<ApiResponse<GetListApprovalFunctionRes>> {
  try {
    const rs = await appServices.post(ApiConstants.GET_LIST_APPROVAL_FUNCTION);
    const data = rs.data;
    return data;
  } catch (error: any) {
    return error;
  }
}

async function getApprovalMatrixDetail(
  params: GetApprovalMatrixDetailReq
): Promise<ApiResponse<GetApprovalMatrixDetailRes>> {
  try {
    const rs = await appServices.post(ApiConstants.APPROVAL_MATRIX_DETAIL, params);
    const data = rs.data;
    return data;
  } catch (error: any) {
    return error;
  }
}

async function editApprovalMatrix(
  params: EditApprovalMatrixReq
): Promise<ApiResponse<EditApprovalMatrixRes>> {
  try {
    const rs = await appServices.post(ApiConstants.EDIT_APPROVAL_MATRIX, params);
    const data = rs.data;
    return data;
  } catch (error: any) {
    return error;
  }
}

const approvalMatrixServices = {
  getListApprovalFunction,
  getApprovalMatrixDetail,
  editApprovalMatrix
};

export default approvalMatrixServices;
