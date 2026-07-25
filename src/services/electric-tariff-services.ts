import appServices from '@app-services';
import { ApiResponse } from 'model/common';
import {
  CreateTariffReq,
  CreateTariffRes,
  GetTariffDetailReq,
  GetTariffDetailRes,
  SearchTariffsReq,
  SearchTariffsRes,
  UpdateTariffReq,
  UpdateTariffRes
} from 'model/electric-tariff';
import { ApiConstants } from './networking/app-apis';

async function searchTariffs(params: SearchTariffsReq): Promise<ApiResponse<SearchTariffsRes>> {
  try {
    const rs = await appServices.post(ApiConstants.BILLING_TARIFF_LIST, params);
    return rs.data;
  } catch (error: any) {
    return error;
  }
}

async function getTariffDetail(
  params: GetTariffDetailReq
): Promise<ApiResponse<GetTariffDetailRes>> {
  try {
    const rs = await appServices.post(ApiConstants.BILLING_TARIFF_DETAIL, params);
    return rs.data;
  } catch (error: any) {
    return error;
  }
}

async function createTariff(params: CreateTariffReq): Promise<ApiResponse<CreateTariffRes>> {
  try {
    const rs = await appServices.post(ApiConstants.BILLING_TARIFF_CREATE, params);
    return rs.data;
  } catch (error: any) {
    return error;
  }
}

async function updateTariff(params: UpdateTariffReq): Promise<ApiResponse<UpdateTariffRes>> {
  try {
    const rs = await appServices.post(ApiConstants.BILLING_TARIFF_UPDATE, params);
    return rs.data;
  } catch (error: any) {
    return error;
  }
}

const electricTariffServices = {
  searchTariffs,
  getTariffDetail,
  createTariff,
  updateTariff
};

export default electricTariffServices;
