import appServices from '@app-services';
import { ApiResponse } from 'model/common';
import { SystemLogHistoryReq, SystemLogHistoryRes } from 'model/system-log';
import { ApiConstants } from './networking/app-apis';

async function getHistory(params: SystemLogHistoryReq): Promise<ApiResponse<SystemLogHistoryRes>> {
  try {
    const response = await appServices.post(ApiConstants.SYSTEM_LOG_HISTORY, params);
    return response.data;
  } catch (error: any) {
    return error;
  }
}

const systemLogServices = { getHistory };

export default systemLogServices;
