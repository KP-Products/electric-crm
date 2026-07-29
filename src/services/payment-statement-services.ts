import appServices from '@app-services';
import { ApiResponse } from 'model/common';
import {
  CreatePaymentStatementReq,
  PaymentStatementFileRes,
  PaymentStatementIdReq,
  PaymentStatementRes,
  SearchPaymentStatementsReq,
  SearchPaymentStatementsRes,
  UpdatePaymentStatementReq,
  UploadPaymentStatementReq,
  UploadPaymentStatementRes
} from 'model/payment-statement';
import { ApiConstants } from './networking/app-apis';

const getFileName = (contentDisposition?: string, fallback = 'danh-sach-thanh-toan.xlsx') =>
  contentDisposition?.match(/filename\*=UTF-8''([^;]+)/i)?.[1] ||
  contentDisposition?.match(/filename="?([^";]+)"?/i)?.[1] ||
  fallback;

async function call<T>(request: () => Promise<{ data: T }>): Promise<T> {
  try {
    return (await request()).data;
  } catch (error: any) {
    return error;
  }
}

async function search(
  params: SearchPaymentStatementsReq
): Promise<ApiResponse<SearchPaymentStatementsRes>> {
  return call(() => appServices.post(ApiConstants.BILLING_PAYMENT_SEARCH, params));
}

async function create(
  params: CreatePaymentStatementReq
): Promise<ApiResponse<PaymentStatementRes>> {
  return call(() => appServices.post(ApiConstants.BILLING_PAYMENT_CREATE, params));
}

async function update(
  params: UpdatePaymentStatementReq
): Promise<ApiResponse<PaymentStatementRes>> {
  return call(() => appServices.post(ApiConstants.BILLING_PAYMENT_UPDATE, params));
}

async function detail(params: PaymentStatementIdReq): Promise<ApiResponse<PaymentStatementRes>> {
  return call(() => appServices.post(ApiConstants.BILLING_PAYMENT_DETAIL, params));
}

async function remove(params: PaymentStatementIdReq): Promise<ApiResponse> {
  return call(() => appServices.post(ApiConstants.BILLING_PAYMENT_DELETE, params));
}

async function upload(
  params: UploadPaymentStatementReq
): Promise<ApiResponse<UploadPaymentStatementRes>> {
  const formData = new FormData();
  formData.append('file', params.file);
  return call(() => appServices.post(ApiConstants.BILLING_PAYMENT_UPLOAD, formData));
}

async function download(
  url: string,
  params?: SearchPaymentStatementsReq
): Promise<PaymentStatementFileRes> {
  try {
    const rs = params
      ? await appServices.post(url, params, { responseType: 'blob' })
      : await appServices.get(url, { responseType: 'blob' });
    return {
      data: rs.data,
      fileName: decodeURIComponent(getFileName(rs.headers['content-disposition']))
    };
  } catch (error: any) {
    return error;
  }
}

const paymentStatementServices = {
  search,
  create,
  update,
  detail,
  remove,
  upload,
  downloadTemplate: () => download(ApiConstants.BILLING_PAYMENT_TEMPLATE, undefined),
  export: (params: SearchPaymentStatementsReq) =>
    download(ApiConstants.BILLING_PAYMENT_EXPORT, params)
};

export default paymentStatementServices;
