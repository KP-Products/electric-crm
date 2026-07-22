import appServices from '@app-services';
import { ApiResponse } from 'model/common';
import {
  CreateIncomingDocumentReq,
  DeleteIncomingDocumentRes,
  IncomingDocumentIdReq,
  IncomingDocumentRes,
  SearchIncomingDocumentRes,
  SearchIncomingDocumentsReq,
  UpdateIncomingDocumentReq,
  UploadIncomingDocumentAttachmentReq
} from 'model/incoming-document';
import { ApiConstants } from './networking/app-apis';

export interface IncomingDocumentAttachmentFile {
  blob: Blob;
  contentType?: string;
}

async function searchIncomingDocuments(
  params: SearchIncomingDocumentsReq
): Promise<ApiResponse<SearchIncomingDocumentRes>> {
  try {
    const rs = await appServices.post(ApiConstants.INCOMING_DOCUMENT_SEARCH, params);
    return rs.data;
  } catch (error: any) {
    return error;
  }
}

async function createIncomingDocument(
  params: CreateIncomingDocumentReq
): Promise<ApiResponse<IncomingDocumentRes>> {
  try {
    const rs = await appServices.post(ApiConstants.INCOMING_DOCUMENT_CREATE, params);
    return rs.data;
  } catch (error: any) {
    return error;
  }
}

async function updateIncomingDocument(
  params: UpdateIncomingDocumentReq
): Promise<ApiResponse<IncomingDocumentRes>> {
  try {
    const rs = await appServices.post(ApiConstants.INCOMING_DOCUMENT_UPDATE, params);
    return rs.data;
  } catch (error: any) {
    return error;
  }
}

async function getIncomingDocumentDetail(
  params: IncomingDocumentIdReq
): Promise<ApiResponse<IncomingDocumentRes>> {
  try {
    const rs = await appServices.post(ApiConstants.INCOMING_DOCUMENT_DETAIL, params);
    return rs.data;
  } catch (error: any) {
    return error;
  }
}

async function deleteIncomingDocument(
  params: IncomingDocumentIdReq
): Promise<ApiResponse<DeleteIncomingDocumentRes>> {
  try {
    const rs = await appServices.post(ApiConstants.INCOMING_DOCUMENT_DELETE, params);
    return rs.data;
  } catch (error: any) {
    return error;
  }
}

async function uploadIncomingDocumentAttachment(
  params: UploadIncomingDocumentAttachmentReq
): Promise<ApiResponse<IncomingDocumentRes>> {
  try {
    const formData = new FormData();
    formData.append('file', params.file);
    const rs = await appServices.post(
      `${ApiConstants.INCOMING_DOCUMENT_ATTACHMENT}/${params.id}/attachment/upload`,
      formData
    );
    return rs.data;
  } catch (error: any) {
    return error;
  }
}

async function deleteIncomingDocumentAttachment(
  params: IncomingDocumentIdReq
): Promise<ApiResponse<IncomingDocumentRes>> {
  try {
    const rs = await appServices.post(
      `${ApiConstants.INCOMING_DOCUMENT_ATTACHMENT}/${params.id}/attachment/delete`
    );
    return rs.data;
  } catch (error: any) {
    return error;
  }
}

async function viewIncomingDocumentAttachment(
  id: number
): Promise<IncomingDocumentAttachmentFile | unknown> {
  try {
    const rs = await appServices.get(
      `${ApiConstants.INCOMING_DOCUMENT_ATTACHMENT}/${id}/attachment/view`,
      { responseType: 'blob' }
    );
    return {
      blob: rs.data,
      contentType: rs.headers['content-type']
    };
  } catch (error: any) {
    return error;
  }
}

async function downloadIncomingDocumentAttachment(
  id: number
): Promise<IncomingDocumentAttachmentFile | unknown> {
  try {
    const rs = await appServices.get(
      `${ApiConstants.INCOMING_DOCUMENT_ATTACHMENT}/${id}/attachment/download`,
      { responseType: 'blob' }
    );
    return {
      blob: rs.data,
      contentType: rs.headers['content-type']
    };
  } catch (error: any) {
    return error;
  }
}

const incomingDocumentServices = {
  searchIncomingDocuments,
  createIncomingDocument,
  updateIncomingDocument,
  getIncomingDocumentDetail,
  deleteIncomingDocument,
  uploadIncomingDocumentAttachment,
  deleteIncomingDocumentAttachment,
  viewIncomingDocumentAttachment,
  downloadIncomingDocumentAttachment
};

export default incomingDocumentServices;
