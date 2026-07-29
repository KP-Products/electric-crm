import appServices from '@app-services';
import { ApiResponse } from 'model/common';
import { SearchMeasuringDevicesReq, SearchMeasuringDevicesRes } from 'model/measuring-device';
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

const measuringDeviceServices = {
  searchMeasuringDevices
};

export default measuringDeviceServices;
