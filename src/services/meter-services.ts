import { ApiResponse } from '../model/common';
import appServices from '@app-services';
import { ApiConstants } from './networking/app-apis';
import {
  AddMeterReq,
  AddMeterRes,
  DeleteMeterReq,
  DeleteMeterRes,
  EditMeterReq,
  GetMeterDetailReq,
  GetMeterDetailRes,
  GetListMeterReq,
  GetListMeterRes
} from '../model/meter';

async function getListMeter(): Promise<ApiResponse<GetListMeterRes>> {
  try {
    const rs = await appServices.post(ApiConstants.GET_LIST_METER);
    const data = rs.data;
    return data;
  } catch (error: any) {
    return error;
  }
}
async function getMeterSearchList(params: GetListMeterReq): Promise<ApiResponse<GetListMeterRes>> {
  try {
    const rs = await appServices.post(ApiConstants.GET_METER_SEARCH_LIST, params);
    const data = rs.data;
    return data;
  } catch (error: any) {
    return error;
  }
}
async function getMeterDetail(params: GetMeterDetailReq): Promise<ApiResponse<GetMeterDetailRes>> {
  try {
    const rs = await appServices.post(ApiConstants.METER_DETAIL, params);
    const data = rs.data;
    return data;
  } catch (error: any) {
    return error;
  }
}
async function addMeter(params: AddMeterReq): Promise<ApiResponse<AddMeterRes>> {
  try {
    const rs = await appServices.post(ApiConstants.ADD_METER, params);
    const data = rs.data;
    return data;
  } catch (error: any) {
    return error;
  }
}
async function editMeter(params: EditMeterReq): Promise<ApiResponse<AddMeterRes>> {
  try {
    const rs = await appServices.post(ApiConstants.EDIT_METER, params);
    const data = rs.data;
    return data;
  } catch (error: any) {
    return error;
  }
}
async function deleteMeter(params: DeleteMeterReq): Promise<ApiResponse<DeleteMeterRes>> {
  try {
    const rs = await appServices.post(ApiConstants.DELETE_METER, params);
    const data = rs.data;
    return data;
  } catch (error: any) {
    return error;
  }
}
const meterServices = {
  getListMeter,
  getMeterSearchList,
  getMeterDetail,
  addMeter,
  editMeter,
  deleteMeter
};

export default meterServices;
