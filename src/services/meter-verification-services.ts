import { ApiResponse } from 'model/common';
import {
  CreateMeterVerificationReq,
  DeleteMeterVerificationReq,
  DeleteMeterVerificationRes,
  GetMeterVerificationReq,
  ListMeterVerificationRes,
  MeterVerificationFileRes,
  MeterVerificationRes,
  MeterVerificationSearchReq,
  SearchMeterVerificationRes,
  UpdateMeterVerificationReq
} from 'model/meter-verification';
import appServices from '@app-services';
import { ApiConstants } from './networking/app-apis';

const buildVerificationFormData = (file?: File) => {
  const formData = new FormData();
  if (file) formData.append('file', file);
  return formData;
};

const getFileNameFromDisposition = (contentDisposition?: string) => {
  if (!contentDisposition) return undefined;

  const utf8FileName = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i)?.[1];
  if (utf8FileName) return decodeURIComponent(utf8FileName);

  return contentDisposition.match(/filename="?([^";]+)"?/i)?.[1];
};

const buildResultFileEndpoint = (id: number, action: 'view' | 'download') =>
  `${ApiConstants.METER_VERIFICATION_FILE_VIEW}/${id}/result-file/${action}`;

async function searchMeterVerifications(
  params: MeterVerificationSearchReq
): Promise<ApiResponse<SearchMeterVerificationRes>> {
  try {
    const rs = await appServices.post(ApiConstants.METER_VERIFICATION_SEARCH, params);
    return rs.data;
  } catch (error: any) {
    return error;
  }
}

async function listMeterVerifications(): Promise<ApiResponse<ListMeterVerificationRes>> {
  try {
    const rs = await appServices.post(ApiConstants.METER_VERIFICATION_LIST);
    return rs.data;
  } catch (error: any) {
    return error;
  }
}

async function getMeterVerification(
  params: GetMeterVerificationReq
): Promise<ApiResponse<MeterVerificationRes>> {
  try {
    const rs = await appServices.post(ApiConstants.METER_VERIFICATION_DETAIL, params);
    return rs.data;
  } catch (error: any) {
    return error;
  }
}

async function createMeterVerification(
  params: CreateMeterVerificationReq
): Promise<ApiResponse<MeterVerificationRes>> {
  try {
    const { file, ...queryParams } = params;
    const rs = await appServices.post(
      ApiConstants.METER_VERIFICATION_CREATE,
      buildVerificationFormData(file),
      {
        params: queryParams,
        headers: { 'Content-Type': 'multipart/form-data' }
      }
    );
    return rs.data;
  } catch (error: any) {
    return error;
  }
}

async function updateMeterVerification(
  params: UpdateMeterVerificationReq
): Promise<ApiResponse<MeterVerificationRes>> {
  try {
    const { file, ...queryParams } = params;
    const rs = await appServices.post(
      ApiConstants.METER_VERIFICATION_UPDATE,
      buildVerificationFormData(file),
      {
        params: queryParams,
        headers: { 'Content-Type': 'multipart/form-data' }
      }
    );
    return rs.data;
  } catch (error: any) {
    return error;
  }
}

async function deleteMeterVerification(
  params: DeleteMeterVerificationReq
): Promise<ApiResponse<DeleteMeterVerificationRes>> {
  try {
    const rs = await appServices.post(ApiConstants.METER_VERIFICATION_DELETE, params);
    return rs.data;
  } catch (error: any) {
    return error;
  }
}

async function viewMeterVerificationFile(id: number): Promise<MeterVerificationFileRes> {
  try {
    const rs = await appServices.get(buildResultFileEndpoint(id, 'view'), {
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

async function downloadMeterVerificationFile(id: number): Promise<MeterVerificationFileRes> {
  try {
    const rs = await appServices.get(buildResultFileEndpoint(id, 'download'), {
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

const meterVerificationServices = {
  searchMeterVerifications,
  listMeterVerifications,
  getMeterVerification,
  createMeterVerification,
  updateMeterVerification,
  deleteMeterVerification,
  viewMeterVerificationFile,
  downloadMeterVerificationFile
};

export default meterVerificationServices;
