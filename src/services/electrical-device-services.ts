import appServices from '@app-services';
import { ApiResponse } from 'model/common';
import {
  CreateElectricalDeviceReq,
  CreateInspectionLocationReq,
  CreateMasterDeviceReq,
  ElectricalDeviceIdReq,
  ElectricalDeviceRes,
  ElectricalDeviceSearchReq,
  ElectricalDeviceSearchRes,
  InspectionLocationIdReq,
  InspectionLocationRes,
  MasterDeviceSearchReq,
  MasterDeviceSearchRes,
  MasterDeviceIdReq,
  MasterDeviceRes,
  SearchInspectionLocationsReq,
  SearchInspectionLocationsRes,
  UpdateElectricalDeviceReq,
  UpdateInspectionLocationReq,
  UpdateMasterDeviceReq
} from 'model/electrical-device';
import { ApiConstants } from './networking/app-apis';

async function searchElectricalDevices(
  body: ElectricalDeviceSearchReq
): Promise<ApiResponse<ElectricalDeviceSearchRes>> {
  try {
    return (await appServices.post(ApiConstants.ELECTRICAL_DEVICE_SEARCH, body)).data;
  } catch (error: any) {
    return error;
  }
}

async function getElectricalDeviceDetail(
  body: ElectricalDeviceIdReq
): Promise<ApiResponse<ElectricalDeviceRes>> {
  try {
    return (await appServices.post(ApiConstants.ELECTRICAL_DEVICE_DETAIL, body)).data;
  } catch (error: any) {
    return error;
  }
}

async function createElectricalDevice(
  body: CreateElectricalDeviceReq
): Promise<ApiResponse<ElectricalDeviceRes>> {
  try {
    const { file, ...fields } = body;
    const query = new URLSearchParams();
    Object.entries(fields).forEach(([key, value]) => {
      if (value !== undefined && value !== '') query.set(key, String(value));
    });
    const formData = new FormData();
    if (file) formData.append('file', file);
    const url = `${ApiConstants.ELECTRICAL_DEVICE_CREATE}?${query.toString()}`;
    return (await appServices.post(url, formData)).data;
  } catch (error: any) {
    return error;
  }
}

async function updateElectricalDevice(
  body: UpdateElectricalDeviceReq
): Promise<ApiResponse<ElectricalDeviceRes>> {
  try {
    return (await appServices.post(ApiConstants.ELECTRICAL_DEVICE_UPDATE, body)).data;
  } catch (error: any) {
    return error;
  }
}

async function searchInspectionLocations(
  body: SearchInspectionLocationsReq
): Promise<ApiResponse<SearchInspectionLocationsRes>> {
  try {
    return (await appServices.post(ApiConstants.INSPECTION_LOCATION_SEARCH, body)).data;
  } catch (error: any) {
    return error;
  }
}

async function getInspectionLocationDetail(
  body: InspectionLocationIdReq
): Promise<ApiResponse<InspectionLocationRes>> {
  try {
    return (await appServices.post(ApiConstants.INSPECTION_LOCATION_DETAIL, body)).data;
  } catch (error: any) {
    return error;
  }
}

async function createInspectionLocation(
  body: CreateInspectionLocationReq
): Promise<ApiResponse<InspectionLocationRes>> {
  try {
    return (await appServices.post(ApiConstants.INSPECTION_LOCATION_CREATE, body)).data;
  } catch (error: any) {
    return error;
  }
}

async function updateInspectionLocation(
  body: UpdateInspectionLocationReq
): Promise<ApiResponse<InspectionLocationRes>> {
  try {
    return (await appServices.post(ApiConstants.INSPECTION_LOCATION_UPDATE, body)).data;
  } catch (error: any) {
    return error;
  }
}

async function deleteInspectionLocation(body: InspectionLocationIdReq): Promise<ApiResponse> {
  try {
    return (await appServices.post(ApiConstants.INSPECTION_LOCATION_DELETE, body)).data;
  } catch (error: any) {
    return error;
  }
}

async function searchMasterDevices(
  body: MasterDeviceSearchReq
): Promise<ApiResponse<MasterDeviceSearchRes>> {
  try {
    return (await appServices.post(ApiConstants.MASTER_DEVICE_SEARCH, body)).data;
  } catch (error: any) {
    return error;
  }
}

async function getMasterDeviceDetail(
  body: MasterDeviceIdReq
): Promise<ApiResponse<MasterDeviceRes>> {
  try {
    return (await appServices.post(ApiConstants.MASTER_DEVICE_DETAIL, body)).data;
  } catch (error: any) {
    return error;
  }
}

async function createMasterDevice(
  body: CreateMasterDeviceReq
): Promise<ApiResponse<MasterDeviceRes>> {
  try {
    return (await appServices.post(ApiConstants.MASTER_DEVICE_CREATE, body)).data;
  } catch (error: any) {
    return error;
  }
}

async function updateMasterDevice(
  body: UpdateMasterDeviceReq
): Promise<ApiResponse<MasterDeviceRes>> {
  try {
    return (await appServices.post(ApiConstants.MASTER_DEVICE_UPDATE, body)).data;
  } catch (error: any) {
    return error;
  }
}

async function deleteMasterDevice(body: MasterDeviceIdReq): Promise<ApiResponse> {
  try {
    return (await appServices.post(ApiConstants.MASTER_DEVICE_DELETE, body)).data;
  } catch (error: any) {
    return error;
  }
}

const electricalDeviceServices = {
  searchElectricalDevices,
  getElectricalDeviceDetail,
  createElectricalDevice,
  updateElectricalDevice,
  searchInspectionLocations,
  getInspectionLocationDetail,
  createInspectionLocation,
  updateInspectionLocation,
  deleteInspectionLocation,
  searchMasterDevices,
  getMasterDeviceDetail,
  createMasterDevice,
  updateMasterDevice,
  deleteMasterDevice
};

export default electricalDeviceServices;
