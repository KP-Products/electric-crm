import appServices from '@app-services';
import { ApiResponse } from 'model/common';
import {
  ChangeFeeCodeBody,
  ChangeFeeCodeDetailResponse,
  ChangeFeeCodeResponse,
  CreateFeeScheduleResponse,
  DownloadFeeCodeByFeeScheduleResponse,
  DownloadListFeeScheduleResponse,
  FeeScheduleDetailBody,
  FeeScheduleDetailResponse,
  FeeScheduleListBody,
  FeeScheduleListResponse,
  UpdateFeeScheduleResponse
} from 'model/fee-schedule';
import { UploadFeeCodeResponse } from './../model/fee-schedule';
import { ApiConstants } from './networking/app-apis';

async function getListFeeSchedule(
  body?: FeeScheduleListBody
): Promise<ApiResponse<FeeScheduleListResponse>> {
  try {
    const { data } = await appServices.post(ApiConstants.FEE_SCHEDULE_LIST, body);
    return data;
  } catch (error: any) {
    return error;
  }
}

async function createFeeSchedule(
  body?: FeeScheduleDetailBody
): Promise<ApiResponse<CreateFeeScheduleResponse>> {
  try {
    const { data } = await appServices.post(ApiConstants.CREATE_FEE_SCHEDULE, body);
    return data;
  } catch (error: any) {
    return error;
  }
}

async function updateFeeSchedule(
  body?: FeeScheduleDetailBody
): Promise<ApiResponse<UpdateFeeScheduleResponse>> {
  try {
    const { data } = await appServices.post(ApiConstants.UPDATE_FEE_SCHEDULE, body);
    return data;
  } catch (error: any) {
    return error;
  }
}

async function getDetailFeeSchedule(
  feeScheduleId: string | number
): Promise<ApiResponse<FeeScheduleDetailResponse>> {
  try {
    const { data } = await appServices.post(ApiConstants.FEE_SCHEDULE_DETAIL, { feeScheduleId });
    return data;
  } catch (error: any) {
    return error;
  }
}

async function downloadListFeeSchedule(
  body?: FeeScheduleListBody
): Promise<ApiResponse<DownloadListFeeScheduleResponse>> {
  try {
    const { data } = await appServices.post(ApiConstants.DOWNLOAD_LIST_FEE_SCHEDULE, body);
    return data;
  } catch (error: any) {
    return error;
  }
}

async function changeFeeCode(
  body?: ChangeFeeCodeBody
): Promise<ApiResponse<ChangeFeeCodeResponse>> {
  try {
    const { data } = await appServices.post(ApiConstants.CHANGE_FEE_CODE, body);
    return data;
  } catch (error: any) {
    return error;
  }
}

async function downloadFeeCodeByFeeSchedule(
  feeScheduleId: string | number
): Promise<ApiResponse<DownloadFeeCodeByFeeScheduleResponse>> {
  try {
    const { data } = await appServices.post(ApiConstants.DOWNLOAD_FEE_CODE_BY_FEE_SCHEDULE, {
      feeScheduleId
    });
    return data;
  } catch (error: any) {
    return error;
  }
}

async function uploadFeeCode(file: File): Promise<ApiResponse<UploadFeeCodeResponse>> {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const { data } = await appServices.post(ApiConstants.UPLOAD_FEE_CODE, formData);

    return data;
  } catch (error: any) {
    return error;
  }
}

async function getDetailRequestChangeFeeCode(
  requestId: string | number
): Promise<ApiResponse<ChangeFeeCodeDetailResponse>> {
  try {
    const { data } = await appServices.post(ApiConstants.GET_DETAIL_REQUEST_CHANGE_FEE_CODE, {
      requestId
    });
    return data;
  } catch (error: any) {
    return error;
  }
}

const feeScheduleServices = {
  getListFeeSchedule,
  createFeeSchedule,
  updateFeeSchedule,
  getDetailFeeSchedule,
  downloadListFeeSchedule,
  changeFeeCode,
  downloadFeeCodeByFeeSchedule,
  uploadFeeCode,
  getDetailRequestChangeFeeCode
};

export default feeScheduleServices;
