import appServices from '@app-services';
import { ApiResponse } from 'model/common';
import {
  CreateServiceLocationReq,
  DeleteServiceLocationReq,
  GetServiceLocationReq,
  ServiceLocationListRes,
  ServiceLocationRes,
  ServiceLocationSearchReq,
  ServiceLocationSearchRes,
  UpdateServiceLocationReq
} from 'model/service-location';
import { ApiConstants } from './networking/app-apis';

async function searchServiceLocation(
  params: ServiceLocationSearchReq
): Promise<ApiResponse<ServiceLocationSearchRes>> {
  try {
    const rs = await appServices.post(ApiConstants.SERVICE_LOCATION_SEARCH, params);
    return rs.data;
  } catch (error: any) {
    return error;
  }
}

async function listServiceLocation(): Promise<ApiResponse<ServiceLocationListRes>> {
  try {
    const rs = await appServices.post(ApiConstants.SERVICE_LOCATION_LIST);
    return rs.data;
  } catch (error: any) {
    return error;
  }
}

async function createServiceLocation(
  params: CreateServiceLocationReq
): Promise<ApiResponse<ServiceLocationRes>> {
  try {
    const rs = await appServices.post(ApiConstants.SERVICE_LOCATION_CREATE, params);
    return rs.data;
  } catch (error: any) {
    return error;
  }
}

async function updateServiceLocation(
  params: UpdateServiceLocationReq
): Promise<ApiResponse<ServiceLocationRes>> {
  try {
    const rs = await appServices.post(ApiConstants.SERVICE_LOCATION_UPDATE, params);
    return rs.data;
  } catch (error: any) {
    return error;
  }
}

async function getServiceLocation(
  params: GetServiceLocationReq
): Promise<ApiResponse<ServiceLocationRes>> {
  try {
    const rs = await appServices.post(ApiConstants.SERVICE_LOCATION_DETAIL, params);
    return rs.data;
  } catch (error: any) {
    return error;
  }
}

async function deleteServiceLocation(
  params: DeleteServiceLocationReq
): Promise<ApiResponse<ServiceLocationRes>> {
  try {
    const rs = await appServices.post(ApiConstants.SERVICE_LOCATION_DELETE, params);
    return rs.data;
  } catch (error: any) {
    return error;
  }
}

const serviceLocationServices = {
  searchServiceLocation,
  listServiceLocation,
  createServiceLocation,
  updateServiceLocation,
  getServiceLocation,
  deleteServiceLocation
};

export default serviceLocationServices;
