import appServices from '@app-services';
import { ApiResponse } from 'model/common';
import {
  CreateEvnReadingBatchReq,
  DeleteEvnReadingBatchRes,
  EvnReadingBatchIdReq,
  EvnReadingBatchRes,
  ExportEvnReadingBatchRecordRes,
  FeederMetersReq,
  FeederMetersRes,
  SearchEvnReadingBatchesReq,
  SearchEvnReadingBatchesRes,
  UpdateEvnReadingBatchReq
} from 'model/evn-reading-batch';
import { ApiConstants } from './networking/app-apis';

const getFileNameFromDisposition = (contentDisposition?: string) => {
  if (!contentDisposition) return undefined;
  const utf8FileName = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i)?.[1];
  if (utf8FileName) return decodeURIComponent(utf8FileName);
  return contentDisposition.match(/filename="?([^";]+)"?/i)?.[1];
};

const call = async <T>(request: () => Promise<{ data: T }>): Promise<ApiResponse<T>> => {
  try {
    return (await request()).data as ApiResponse<T>;
  } catch (error: any) {
    return error;
  }
};

const evnReadingBatchServices = {
  search: (params: SearchEvnReadingBatchesReq) =>
    call<SearchEvnReadingBatchesRes>(() =>
      appServices.post(ApiConstants.BILLING_READING_BATCH_SEARCH, params)
    ),
  create: (params: CreateEvnReadingBatchReq) =>
    call<EvnReadingBatchRes>(() =>
      appServices.post(ApiConstants.BILLING_READING_BATCH_CREATE, params)
    ),
  detail: (params: EvnReadingBatchIdReq) =>
    call<EvnReadingBatchRes>(() =>
      appServices.post(ApiConstants.BILLING_READING_BATCH_DETAIL, params)
    ),
  update: (params: UpdateEvnReadingBatchReq) =>
    call<EvnReadingBatchRes>(() =>
      appServices.post(ApiConstants.BILLING_READING_BATCH_UPDATE, params)
    ),
  delete: (params: EvnReadingBatchIdReq) =>
    call<DeleteEvnReadingBatchRes>(() =>
      appServices.post(ApiConstants.BILLING_READING_BATCH_DELETE, params)
    ),
  confirm: (params: EvnReadingBatchIdReq) =>
    call<EvnReadingBatchRes>(() =>
      appServices.post(ApiConstants.BILLING_READING_BATCH_CONFIRM, params)
    ),
  metersByFeeder: (params: FeederMetersReq) =>
    call<FeederMetersRes>(() =>
      appServices.post(ApiConstants.BILLING_READING_BATCH_METERS_BY_FEEDER, params)
    ),
  exportRecord: async (params: EvnReadingBatchIdReq): Promise<ExportEvnReadingBatchRecordRes> => {
    try {
      const response = await appServices.post(
        ApiConstants.BILLING_READING_BATCH_EXPORT_RECORD,
        params,
        {
          responseType: 'blob'
        }
      );
      return {
        data: response.data,
        fileName:
          getFileNameFromDisposition(response.headers['content-disposition']) ||
          `bien-ban-chot-so-evn-${params.id}.pdf`
      };
    } catch (error: any) {
      return error;
    }
  }
};

export default evnReadingBatchServices;
