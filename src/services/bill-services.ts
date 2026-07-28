import appServices from '@app-services';
import { ApiResponse } from 'model/common';
import {
  BillDetailReq,
  BillDetailRes,
  BillRes,
  ConfirmBillReq,
  ConfirmBillRes,
  CreateBillForPeriodReq,
  ExportBillNoticeReq,
  ExportBillNoticeRes,
  SearchBillsReq,
  SearchBillsRes
} from 'model/bill';
import { ApiConstants } from './networking/app-apis';

const getFileNameFromDisposition = (contentDisposition?: string) => {
  if (!contentDisposition) return undefined;

  const utf8FileName = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i)?.[1];
  if (utf8FileName) return decodeURIComponent(utf8FileName);

  return contentDisposition.match(/filename="?([^";]+)"?/i)?.[1];
};

async function searchBills(params: SearchBillsReq): Promise<ApiResponse<SearchBillsRes>> {
  try {
    const rs = await appServices.post(ApiConstants.BILLING_BILL_SEARCH, params);
    return rs.data;
  } catch (error: any) {
    return error;
  }
}

async function createBillForPeriod(params: CreateBillForPeriodReq): Promise<ApiResponse<BillRes>> {
  try {
    const rs = await appServices.post(ApiConstants.BILLING_BILL_CREATE_FOR_PERIOD, params);
    return rs.data;
  } catch (error: any) {
    return error;
  }
}

async function getBillDetail(params: BillDetailReq): Promise<ApiResponse<BillDetailRes>> {
  try {
    const rs = await appServices.post(ApiConstants.BILLING_BILL_DETAIL, params);
    return rs.data;
  } catch (error: any) {
    return error;
  }
}

async function confirmBill(params: ConfirmBillReq): Promise<ApiResponse<ConfirmBillRes>> {
  try {
    const rs = await appServices.post(ApiConstants.BILLING_BILL_CONFIRM, params);
    return rs.data;
  } catch (error: any) {
    return error;
  }
}

async function exportBillNotice(params: ExportBillNoticeReq): Promise<ExportBillNoticeRes> {
  try {
    const rs = await appServices.post(ApiConstants.BILLING_BILL_EXPORT_NOTICE, params, {
      responseType: 'blob'
    });
    return {
      data: rs.data,
      fileName: getFileNameFromDisposition(rs.headers['content-disposition'])
    };
  } catch (error: any) {
    return error;
  }
}

const billServices = {
  searchBills,
  createBillForPeriod,
  getBillDetail,
  confirmBill,
  exportBillNotice
};

export default billServices;
