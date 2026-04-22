import { ApiResponse } from 'model/common';
import { appCodes } from 'utils/constant/appCodes';

export const isSuccess = (response: ApiResponse) => {
  if (response?.code === appCodes.SUCCESS) {
    return true;
  }
  return false;
};
