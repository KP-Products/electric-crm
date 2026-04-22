import appServices from '@app-services';
import { ApiResponse, ResultBase } from 'model/common';
import {
  CreateFeeCode,
  CreateFeeCodeRes,
  FeeCode,
  FeeCodeByCifRequest,
  MasterDataCusSegment,
  MasterDataCusType,
  UpdateStatusFeeCode
} from 'model/fee-code';
import { ApiConstants } from 'services/networking/app-apis';

async function getFeeCodeList(): Promise<ApiResponse<ResultBase<FeeCode[]>>> {
  try {
    const rs = await appServices.post(ApiConstants.FEE_CODE_LIST);
    const data = rs.data;
    return data;
  } catch (error: any) {
    return error;
  }
}

async function createFeeCode(
  param: CreateFeeCode
): Promise<ApiResponse<ResultBase<CreateFeeCodeRes>>> {
  try {
    const rs = await appServices.post(ApiConstants.FEE_CODE_CREATE, param);
    const data = rs.data;
    return data;
  } catch (error: any) {
    return error;
  }
}

async function deleteFeeCode(param: string): Promise<ApiResponse<ResultBase<{ status: string }>>> {
  try {
    const rs = await appServices.post(ApiConstants.FEE_CODE_DELETE, { id: param });
    const data = rs.data;
    return data;
  } catch (error: any) {
    return error;
  }
}

async function updateStatusFeeCode(
  param: UpdateStatusFeeCode
): Promise<ApiResponse<ResultBase<{ status: string }>>> {
  try {
    const rs = await appServices.post(ApiConstants.FEE_CODE_UPDATE_STATUS, param);
    const data = rs.data;
    return data;
  } catch (error: any) {
    return error;
  }
}

async function updateFeeCode(
  param: CreateFeeCode
): Promise<ApiResponse<ResultBase<CreateFeeCodeRes>>> {
  try {
    const rs = await appServices.post(ApiConstants.FEE_CODE_UPDATE, param);
    const data = rs.data;
    return data;
  } catch (error: any) {
    return error;
  }
}

async function getMaterDataFormulaSegment(): Promise<
  ApiResponse<ResultBase<MasterDataCusSegment[]>>
> {
  try {
    const rs = await appServices.post(ApiConstants.MASTERDATA_CUS_SEGMENT);
    const data = rs.data;
    return data;
  } catch (error: any) {
    return error;
  }
}

async function getMaterDataCusType(): Promise<ApiResponse<ResultBase<MasterDataCusType[]>>> {
  try {
    const rs = await appServices.post(ApiConstants.MASTERDATA_CUS_TYPE);
    const data = rs.data;
    return data;
  } catch (error: any) {
    return error;
  }
}

async function downloadUnused(): Promise<
  ApiResponse<
    ResultBase<{
      base64Data: string;
    }>
  >
> {
  try {
    const rs = await appServices.post(ApiConstants.DOWNLOAD_UNUSED_FEE_CODE);
    const data = rs.data;
    return data;
  } catch (error: any) {
    return error;
  }
}

async function getFeeCodeByCif(
  param: FeeCodeByCifRequest
): Promise<ApiResponse<ResultBase<FeeCode[]>>> {
  try {
    const rs = await appServices.post(ApiConstants.FEE_CODE_BY_CIF, param);
    const data = rs.data;
    return data;
  } catch (error: any) {
    return error;
  }
}

const feeCodeServices = {
  getFeeCodeList,
  createFeeCode,
  deleteFeeCode,
  updateFeeCode,
  updateStatusFeeCode,
  getMaterDataFormulaSegment,
  getMaterDataCusType,
  downloadUnused,
  getFeeCodeByCif
};

export default feeCodeServices;
