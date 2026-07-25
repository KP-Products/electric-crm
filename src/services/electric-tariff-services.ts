import appServices from '@app-services';
import { ApiResponse } from 'model/common';
import {
  CreateTariffReq,
  CreateTariffRes,
  DeleteTariffRes,
  GetTariffDetailReq,
  GetTariffDetailRes,
  SearchTariffsReq,
  SearchTariffsRes,
  TariffDocumentRes,
  UploadTariffDocumentReq,
  UpdateTariffReq,
  UpdateTariffRes
} from 'model/electric-tariff';
import { BlobFileResponse, getFileNameFromDisposition } from 'utils/blob-response';
import { ApiConstants } from './networking/app-apis';

async function searchTariffs(params: SearchTariffsReq): Promise<ApiResponse<SearchTariffsRes>> {
  try {
    const rs = await appServices.post(ApiConstants.BILLING_TARIFF_LIST, params);
    return rs.data;
  } catch (error: any) {
    return error;
  }
}

async function getTariffDetail(
  params: GetTariffDetailReq
): Promise<ApiResponse<GetTariffDetailRes>> {
  try {
    const rs = await appServices.post(ApiConstants.BILLING_TARIFF_DETAIL, params);
    return rs.data;
  } catch (error: any) {
    return error;
  }
}

async function createTariff(params: CreateTariffReq): Promise<ApiResponse<CreateTariffRes>> {
  try {
    const rs = await appServices.post(ApiConstants.BILLING_TARIFF_CREATE, params);
    return rs.data;
  } catch (error: any) {
    return error;
  }
}

async function updateTariff(params: UpdateTariffReq): Promise<ApiResponse<UpdateTariffRes>> {
  try {
    const rs = await appServices.post(ApiConstants.BILLING_TARIFF_UPDATE, params);
    return rs.data;
  } catch (error: any) {
    return error;
  }
}

async function deleteTariff(params: GetTariffDetailReq): Promise<ApiResponse<DeleteTariffRes>> {
  try {
    const rs = await appServices.post(ApiConstants.BILLING_TARIFF_DELETE, params);
    return rs.data;
  } catch (error: any) {
    return error;
  }
}

async function uploadTariffDocument(
  params: UploadTariffDocumentReq
): Promise<ApiResponse<TariffDocumentRes>> {
  try {
    const formData = new FormData();
    formData.append('file', params.file);
    const rs = await appServices.post(
      `${ApiConstants.BILLING_TARIFF_BASE}/${params.id}/document`,
      formData
    );
    return rs.data;
  } catch (error: any) {
    return error;
  }
}

async function deleteTariffDocument(
  params: GetTariffDetailReq
): Promise<ApiResponse<TariffDocumentRes>> {
  try {
    const rs = await appServices.post(
      `${ApiConstants.BILLING_TARIFF_BASE}/${params.id}/document/delete`
    );
    return rs.data;
  } catch (error: any) {
    return error;
  }
}

async function viewTariffDocument(id: number): Promise<BlobFileResponse | unknown> {
  try {
    const rs = await appServices.get(`${ApiConstants.BILLING_TARIFF_BASE}/${id}/document/view`, {
      responseType: 'blob'
    });
    return {
      blob: rs.data,
      contentType: rs.headers['content-type'],
      fileName: getFileNameFromDisposition(rs.headers['content-disposition'])
    };
  } catch (error: any) {
    return error;
  }
}

async function downloadTariffDocument(id: number): Promise<BlobFileResponse | unknown> {
  try {
    const rs = await appServices.get(
      `${ApiConstants.BILLING_TARIFF_BASE}/${id}/document/download`,
      {
        responseType: 'blob'
      }
    );
    return {
      blob: rs.data,
      contentType: rs.headers['content-type'],
      fileName: getFileNameFromDisposition(rs.headers['content-disposition'])
    };
  } catch (error: any) {
    return error;
  }
}

const electricTariffServices = {
  searchTariffs,
  getTariffDetail,
  createTariff,
  updateTariff,
  deleteTariff,
  uploadTariffDocument,
  deleteTariffDocument,
  viewTariffDocument,
  downloadTariffDocument
};

export default electricTariffServices;
