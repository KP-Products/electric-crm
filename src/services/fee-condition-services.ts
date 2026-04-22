import appServices from '@app-services';
import { ApiResponse } from 'model/common';
import {
  CreateFeeConditionParam,
  CreateFeeConditionRes,
  DeleteFeeConditionRes,
  DownloadFeeConditionRes,
  FeeConditionDataField,
  SearchFeeConditionParam,
  SearchFeeConditionRes,
  UpdateFeeConditionRes
} from 'model/fee-condition';
import { ApiConstants } from './networking/app-apis';

async function getFeeCondition(
  param?: SearchFeeConditionParam
): Promise<ApiResponse<SearchFeeConditionRes>> {
  try {
    const rs = await appServices.post(ApiConstants.FEE_CONDITION_LIST, param);
    const data = rs.data;
    return data;
  } catch (error: any) {
    return error;
  }
}

async function createFeeCondition(
  param: CreateFeeConditionParam
): Promise<ApiResponse<CreateFeeConditionRes>> {
  try {
    const rs = await appServices.post(ApiConstants.FEE_CONDITION_CREATE, param);
    const data = rs.data;
    return data;
  } catch (error: any) {
    return error;
  }
}

async function updateFeeCondition({
  id,
  param
}: {
  id: string;
  param: CreateFeeConditionParam;
}): Promise<ApiResponse<UpdateFeeConditionRes>> {
  try {
    const rs = await appServices.post(ApiConstants.FEE_CONDITION_UPDATE, {
      ...param,
      idFeeCondition: id
    });
    const data = rs.data;
    return data;
  } catch (error: any) {
    return error;
  }
}

async function deleteFeeCondition(id: string): Promise<ApiResponse<DeleteFeeConditionRes>> {
  try {
    const rs = await appServices.post(ApiConstants.FEE_CONDITION_DELETE, { id });
    const data = rs.data;
    return data;
  } catch (error: any) {
    return error;
  }
}

async function downloadFeeCondition(
  param: SearchFeeConditionParam
): Promise<ApiResponse<DownloadFeeConditionRes>> {
  try {
    const rs = await appServices.post(ApiConstants.FEE_CONDITION_DOWNLOAD, param);
    const data = rs.data;
    return data;
  } catch (error: any) {
    return error;
  }
}

async function getFeeConditionDataField(
  param: string
): Promise<ApiResponse<FeeConditionDataField>> {
  try {
    const rs = await appServices.post(ApiConstants.FEE_CONDITION_DATA_FIELD, { tableValue: param });
    const data = rs.data;
    return data;
  } catch (error: any) {
    return error;
  }
}

const feeConditionServices = {
  getFeeCondition,
  createFeeCondition,
  updateFeeCondition,
  deleteFeeCondition,
  downloadFeeCondition,
  getFeeConditionDataField
};

export default feeConditionServices;
