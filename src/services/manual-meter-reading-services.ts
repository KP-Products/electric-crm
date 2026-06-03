import appServices from '@app-services';
import { ApiResponse } from 'model/common';
import {
  CreateReadingPeriodReq,
  CreateReadingPeriodRes,
  DeleteReadingPeriodReq,
  DeleteReadingPeriodRes,
  GetReadingPeriodReq,
  GetReadingPeriodRes,
  SearchReadingPeriodsReq,
  SearchReadingPeriodsRes,
  UpdateReadingPeriodReq,
  UpdateReadingPeriodRes
} from 'model/manual-meter-reading';
import { ApiConstants } from './networking/app-apis';

async function searchReadingPeriods(
  params: SearchReadingPeriodsReq
): Promise<ApiResponse<SearchReadingPeriodsRes>> {
  try {
    const rs = await appServices.post(ApiConstants.BILLING_READING_PERIOD_SEARCH, params);
    return rs.data;
  } catch (error: any) {
    return error;
  }
}

async function getReadingPeriod(
  params: GetReadingPeriodReq
): Promise<ApiResponse<GetReadingPeriodRes>> {
  try {
    const rs = await appServices.post(ApiConstants.BILLING_READING_PERIOD_GET, params);
    return rs.data;
  } catch (error: any) {
    return error;
  }
}

async function createReadingPeriod(
  params: CreateReadingPeriodReq
): Promise<ApiResponse<CreateReadingPeriodRes>> {
  try {
    const rs = await appServices.post(ApiConstants.BILLING_READING_PERIOD_CREATE, params);
    return rs.data;
  } catch (error: any) {
    return error;
  }
}

async function updateReadingPeriod(
  params: UpdateReadingPeriodReq
): Promise<ApiResponse<UpdateReadingPeriodRes>> {
  try {
    const rs = await appServices.post(ApiConstants.BILLING_READING_PERIOD_UPDATE, params);
    return rs.data;
  } catch (error: any) {
    return error;
  }
}

async function deleteReadingPeriod(
  params: DeleteReadingPeriodReq
): Promise<ApiResponse<DeleteReadingPeriodRes>> {
  try {
    const rs = await appServices.post(ApiConstants.BILLING_READING_PERIOD_DELETE, params);
    return rs.data;
  } catch (error: any) {
    return error;
  }
}

const manualMeterReadingServices = {
  searchReadingPeriods,
  getReadingPeriod,
  createReadingPeriod,
  updateReadingPeriod,
  deleteReadingPeriod
};

export default manualMeterReadingServices;
