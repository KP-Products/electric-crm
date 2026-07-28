import appServices from '@app-services';
import { ApiResponse } from 'model/common';
import {
  DownloadRemoteMeterReadingTemplateRes,
  ImportRemoteMeterReadingReq,
  ImportRemoteMeterReadingRes,
  SearchRemoteMeterReadingsReq,
  SearchRemoteMeterReadingsRes
} from 'model/remote-meter-reading';
import { ApiConstants } from './networking/app-apis';

const getFileNameFromDisposition = (contentDisposition?: string) => {
  if (!contentDisposition) return undefined;

  const utf8FileName = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i)?.[1];
  if (utf8FileName) return decodeURIComponent(utf8FileName);

  return contentDisposition.match(/filename="?([^";]+)"?/i)?.[1];
};

async function searchRemoteReadingPeriods(
  params: SearchRemoteMeterReadingsReq
): Promise<ApiResponse<SearchRemoteMeterReadingsRes>> {
  try {
    const rs = await appServices.post(ApiConstants.BILLING_READING_PERIOD_SEARCH, params);
    return rs.data;
  } catch (error: any) {
    return error;
  }
}

async function importRemoteMeterReadings(
  params: ImportRemoteMeterReadingReq
): Promise<ApiResponse<ImportRemoteMeterReadingRes>> {
  try {
    const formData = new FormData();
    formData.append('file', params.file);

    const rs = await appServices.post(ApiConstants.BILLING_REMOTE_READING_IMPORT_UPLOAD, formData);
    return rs.data;
  } catch (error: any) {
    return error;
  }
}

async function downloadRemoteMeterReadingTemplate(): Promise<DownloadRemoteMeterReadingTemplateRes> {
  try {
    const rs = await appServices.get(ApiConstants.BILLING_REMOTE_READING_IMPORT_TEMPLATE, {
      responseType: 'blob'
    });

    return {
      data: rs.data,
      fileName:
        getFileNameFromDisposition(rs.headers['content-disposition']) ||
        'mau-nhap-chi-so-do-xa.xlsx'
    };
  } catch (error: any) {
    return error;
  }
}

const remoteMeterReadingServices = {
  searchRemoteReadingPeriods,
  importRemoteMeterReadings,
  downloadRemoteMeterReadingTemplate
};

export default remoteMeterReadingServices;
