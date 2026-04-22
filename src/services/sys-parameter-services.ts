import appServices from '@app-services';
import { ApiResponse } from 'model/common';
import { SystemParameter, SystemParameterResult } from 'model/system-parameter';
import { ApiConstants } from './networking/app-apis';

async function getSysParameterList(): Promise<ApiResponse<SystemParameterResult>> {
  try {
    const rs = await appServices.post(ApiConstants.SYSTEM_PARAMETER_LIST);
    const data = rs.data;
    return data;
  } catch (error: any) {
    return error;
  }
}

async function updateSysParameter(param: SystemParameter): Promise<ApiResponse<any>> {
  try {
    const rs = await appServices.post(ApiConstants.SYSTEM_PARAMETER_UPDATE, {
      paramCode: param.paramCode,
      paramValue: param.paramValue,
      valueType: param.valueType,
      description: param.description,
      idParameter: param.id
    });
    const data = rs.data;
    return data;
  } catch (error: any) {
    return error;
  }
}

const sysParameterServices = {
  getSysParameterList,
  updateSysParameter
};

export default sysParameterServices;
