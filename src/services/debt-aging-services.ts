import appServices from '@app-services';
import { ApiResponse } from 'model/common';
import { DebtAgingFileRes, DebtAgingRequest, DebtAgingRes } from 'model/debt-aging';
import { ApiConstants } from './networking/app-apis';

const getFileName = (contentDisposition?: string, fallback = 'ket-qua-tinh-tuoi-no.xlsx') =>
  contentDisposition?.match(/filename\*=UTF-8''([^;]+)/i)?.[1] ||
  contentDisposition?.match(/filename="?([^";]+)"?/i)?.[1] ||
  fallback;

async function calculate(params: DebtAgingRequest): Promise<ApiResponse<DebtAgingRes>> {
  try {
    const response = await appServices.post(ApiConstants.BILLING_DEBT_AGING_CALCULATE, params);
    return response.data;
  } catch (error: any) {
    return error;
  }
}

async function exportExcel(params: DebtAgingRequest): Promise<DebtAgingFileRes> {
  try {
    const response = await appServices.post(ApiConstants.BILLING_DEBT_AGING_EXPORT, params, {
      responseType: 'blob'
    });
    return {
      data: response.data,
      fileName: decodeURIComponent(getFileName(response.headers['content-disposition']))
    };
  } catch (error: any) {
    return error;
  }
}

const debtAgingServices = { calculate, exportExcel };

export default debtAgingServices;
