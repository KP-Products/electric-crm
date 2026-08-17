import appServices from '@app-services';
import { ApiResponse } from 'model/common';
import { SystemParameter, SystemParameterResult } from 'model/system-parameter';
import { ApiConstants } from './networking/app-apis';

// BE dùng paramKey/paraType và trả khối phân trang {items,total,...}; FE giữ nguyên
// paramCode/valueType nên dịch ngay tại service để màn hình không phải sửa.
async function getSysParameterList(): Promise<ApiResponse<SystemParameterResult>> {
  try {
    const rs = await appServices.post(ApiConstants.SYSTEM_PARAMETER_LIST, { page: 0, size: 100 });
    const data = rs.data;
    const items = data?.data?.items || [];
    return {
      ...data,
      data: items.map((item: any) => ({
        id: item.id,
        paramCode: item.paramKey,
        valueType: item.paraType,
        paramValue: item.paramValue,
        description: item.description
      }))
    };
  } catch (error: any) {
    return error;
  }
}

async function updateSysParameter(param: SystemParameter): Promise<ApiResponse<any>> {
  try {
    const rs = await appServices.post(ApiConstants.SYSTEM_PARAMETER_UPDATE, {
      id: param.id,
      paramKey: param.paramCode,
      paramValue: param.paramValue,
      paraType: param.valueType,
      description: param.description
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
