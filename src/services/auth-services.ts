import appServices from '@app-services';
import { LoginParams, LoginResult } from 'model/auth';
import { ApiResponse } from 'model/common';
import { ApiConstants } from './networking/app-apis';

async function login(params: LoginParams): Promise<ApiResponse<LoginResult>> {
  try {
    const rs = await appServices.post(ApiConstants.LOGIN, params);
    const data = rs.data;
    return data;
  } catch (error: any) {
    return error;
  }
}


const authServices = {
  login
};

export default authServices;
