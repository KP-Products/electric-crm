import appServices from '@app-services';
import { ApiResponse } from 'model/common';
import {
  CreateMeterChangeEventReq,
  DeleteMeterChangeEventRes,
  MeterChangeEventIdReq,
  MeterChangeEventRes,
  SearchMeterChangeEventsReq,
  SearchMeterChangeEventsRes,
  UpdateMeterChangeEventReq
} from 'model/meter-change-event';
import { ApiConstants } from './networking/app-apis';

async function searchMeterChangeEvents(
  params: SearchMeterChangeEventsReq
): Promise<ApiResponse<SearchMeterChangeEventsRes>> {
  try {
    const rs = await appServices.post(ApiConstants.METER_CHANGE_EVENT_SEARCH, params);
    return rs.data;
  } catch (error: unknown) {
    return error as ApiResponse<SearchMeterChangeEventsRes>;
  }
}

async function getMeterChangeEventDetail(
  params: MeterChangeEventIdReq
): Promise<ApiResponse<MeterChangeEventRes>> {
  try {
    const rs = await appServices.post(ApiConstants.METER_CHANGE_EVENT_DETAIL, params);
    return rs.data;
  } catch (error: unknown) {
    return error as ApiResponse<MeterChangeEventRes>;
  }
}

async function createMeterChangeEvent(
  params: CreateMeterChangeEventReq
): Promise<ApiResponse<MeterChangeEventRes>> {
  try {
    const rs = await appServices.post(ApiConstants.METER_CHANGE_EVENT_CREATE, params);
    return rs.data;
  } catch (error: unknown) {
    return error as ApiResponse<MeterChangeEventRes>;
  }
}

async function updateMeterChangeEvent(
  params: UpdateMeterChangeEventReq
): Promise<ApiResponse<MeterChangeEventRes>> {
  try {
    const rs = await appServices.post(ApiConstants.METER_CHANGE_EVENT_UPDATE, params);
    return rs.data;
  } catch (error: unknown) {
    return error as ApiResponse<MeterChangeEventRes>;
  }
}

async function deleteMeterChangeEvent(
  params: MeterChangeEventIdReq
): Promise<ApiResponse<DeleteMeterChangeEventRes>> {
  try {
    const rs = await appServices.post(ApiConstants.METER_CHANGE_EVENT_DELETE, params);
    return rs.data;
  } catch (error: unknown) {
    return error as ApiResponse<DeleteMeterChangeEventRes>;
  }
}

const meterChangeEventServices = {
  searchMeterChangeEvents,
  getMeterChangeEventDetail,
  createMeterChangeEvent,
  updateMeterChangeEvent,
  deleteMeterChangeEvent
};

export default meterChangeEventServices;
