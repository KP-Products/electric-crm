import appServices from '@app-services';
import { ApiResponse } from 'model/common';
import {
  CreateMeasuringDeviceReq,
  DeleteMeasuringDeviceRes,
  MeasuringDeviceIdReq,
  MeasuringDeviceRes,
  SearchMeasuringDevicesReq,
  SearchMeasuringDevicesRes,
  UpdateMeasuringDeviceReq
} from 'model/measuring-device';
import { ApiConstants } from './networking/app-apis';

async function searchMeasuringDevices(
  params: SearchMeasuringDevicesReq
): Promise<ApiResponse<SearchMeasuringDevicesRes>> {
  try {
    const response = await appServices.post(ApiConstants.MEASURING_DEVICE_SEARCH, params);
    return response.data;
  } catch (error: any) {
    return error;
  }
}

async function getMeasuringDeviceDetail(
  params: MeasuringDeviceIdReq
): Promise<ApiResponse<MeasuringDeviceRes>> {
  try {
    const response = await appServices.post(ApiConstants.MEASURING_DEVICE_DETAIL, params);
    return response.data;
  } catch (error: any) {
    return error;
  }
}

async function createMeasuringDevice(
  params: CreateMeasuringDeviceReq
): Promise<ApiResponse<MeasuringDeviceRes>> {
  try {
    const response = await appServices.post(ApiConstants.MEASURING_DEVICE_CREATE, params);
    return response.data;
  } catch (error: any) {
    return error;
  }
}

async function updateMeasuringDevice(
  params: UpdateMeasuringDeviceReq
): Promise<ApiResponse<MeasuringDeviceRes>> {
  try {
    const response = await appServices.post(ApiConstants.MEASURING_DEVICE_UPDATE, params);
    return response.data;
  } catch (error: any) {
    return error;
  }
}

async function deleteMeasuringDevice(
  params: MeasuringDeviceIdReq
): Promise<ApiResponse<DeleteMeasuringDeviceRes>> {
  try {
    const response = await appServices.post(ApiConstants.MEASURING_DEVICE_DELETE, params);
    return response.data;
  } catch (error: any) {
    return error;
  }
}

const measuringDeviceServices = {
  searchMeasuringDevices,
  getMeasuringDeviceDetail,
  createMeasuringDevice,
  updateMeasuringDevice,
  deleteMeasuringDevice
};

export default measuringDeviceServices;
