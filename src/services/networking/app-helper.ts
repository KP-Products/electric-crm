import { ApiResponse } from 'model/common';
import { appCodes } from 'utils/constant/appCodes';

export const isSuccess = (response: ApiResponse) => {
  if (response?.message?.toLowerCase() === appCodes.SUCCESS.toLowerCase()) {
    return true;
  }
  return false;
};
