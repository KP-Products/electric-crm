import appServices from '@app-services';
import { ApiResponse } from 'model/common';
import {
  DeleteDocumentReq,
  DocumentDetailRes,
  DocumentRes,
  GetDocumentReq,
  SearchDocumentReq,
  SearchDocumentRes,
  UpdateDocumentReq,
  UploadDocumentReq
} from 'model/document';
import { ApiConstants } from './networking/app-apis';

async function searchDocument(params: SearchDocumentReq): Promise<ApiResponse<SearchDocumentRes>> {
  try {
    const rs = await appServices.post(ApiConstants.DOCUMENT_SEARCH, params);
    return rs.data;
  } catch (error: any) {
    return error;
  }
}

async function uploadDocument(params: UploadDocumentReq): Promise<ApiResponse<DocumentRes>> {
  try {
    const formData = new FormData();
    formData.append('file', params.file);

    const rs = await appServices.post(ApiConstants.DOCUMENT_UPLOAD, formData, {
      params: {
        ownerType: params.ownerType,
        ownerId: params.ownerId,
        docType: params.docType,
        status: params.status || undefined,
        note: params.note || undefined
      }
    });
    return rs.data;
  } catch (error: any) {
    return error;
  }
}

async function updateDocument(params: UpdateDocumentReq): Promise<ApiResponse<DocumentRes>> {
  try {
    const rs = await appServices.post(ApiConstants.DOCUMENT_UPDATE, params);
    return rs.data;
  } catch (error: any) {
    return error;
  }
}

async function deleteDocument(params: DeleteDocumentReq): Promise<ApiResponse<DocumentRes>> {
  try {
    const rs = await appServices.post(ApiConstants.DOCUMENT_DELETE, params);
    return rs.data;
  } catch (error: any) {
    return error;
  }
}

async function getDocumentDetail(params: GetDocumentReq): Promise<ApiResponse<DocumentDetailRes>> {
  try {
    const rs = await appServices.post(ApiConstants.DOCUMENT_DETAIL, params);
    return rs.data;
  } catch (error: any) {
    return error;
  }
}

const documentServices = {
  searchDocument,
  uploadDocument,
  updateDocument,
  deleteDocument,
  getDocumentDetail
};

export default documentServices;
