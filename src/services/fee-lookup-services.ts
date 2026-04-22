import appServices from '@app-services';
import { ApiResponse } from 'model/common';
import {
  DownloadLookupBody,
  DownloadLookupResponse,
  FeeLookupBody,
  FeeLookupListResponse
} from 'model/fee-lookup';
import { ApiConstants } from './networking/app-apis';

async function getListFeeCollectionHistory(
  body?: FeeLookupBody
): Promise<ApiResponse<FeeLookupListResponse>> {
  try {
    const { data } = await appServices.post(ApiConstants.FEE_LOOKUP_COLLECTION_HISTORY, body);
    return data;
  } catch (error: any) {
    return error;
  }
}

async function getListFeeCollectionEstimate(
  body?: FeeLookupBody
): Promise<ApiResponse<FeeLookupListResponse>> {
  try {
    const { data } = await appServices.post(ApiConstants.FEE_LOOKUP_COLLECTION_ESTIMATE, body);
    return data;
  } catch (error: any) {
    return error;
  }
}

async function downloadLookup(
  body?: DownloadLookupBody
): Promise<ApiResponse<DownloadLookupResponse>> {
  try {
    const { data } = await appServices.post(ApiConstants.DOWNLOAD_LOOKUP, body);
    return data;
  } catch (error: any) {
    return error;
  }
}

const feeLookupServices = {
  getListFeeCollectionHistory,
  getListFeeCollectionEstimate,
  downloadLookup
};

export default feeLookupServices;
