import appServices from '@app-services';
import { ApiResponse } from 'model/common';
import {
  DeleteDocumentReq,
  DocumentDetailRes,
  DocumentFileRes,
  DocumentRes,
  GetDocumentReq,
  ListDocumentReq,
  ListDocumentRes,
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

async function listDocuments(params: ListDocumentReq): Promise<ApiResponse<ListDocumentRes>> {
  try {
    const rs = await appServices.post(ApiConstants.DOCUMENT_LIST, params);
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

const getFileNameFromContentDisposition = (contentDisposition?: string) => {
  if (!contentDisposition) return undefined;

  const utf8FileName = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i)?.[1];
  if (utf8FileName) {
    try {
      return decodeURIComponent(utf8FileName);
    } catch {
      return utf8FileName;
    }
  }

  return contentDisposition.match(/filename="?([^"]+)"?/i)?.[1];
};

async function viewDocumentFile(id: string): Promise<DocumentFileRes | unknown> {
  try {
    const rs = await appServices.get(`${ApiConstants.DOCUMENT_BASE}/${id}/view`, {
      responseType: 'blob'
    });
    return {
      blob: rs.data,
      contentType: rs.headers['content-type'],
      fileName: getFileNameFromContentDisposition(rs.headers['content-disposition'])
    };
  } catch (error: any) {
    return error;
  }
}

async function downloadDocumentFile(id: string): Promise<DocumentFileRes | unknown> {
  try {
    const rs = await appServices.get(`${ApiConstants.DOCUMENT_BASE}/${id}/download`, {
      responseType: 'blob'
    });
    return {
      blob: rs.data,
      contentType: rs.headers['content-type'],
      fileName: getFileNameFromContentDisposition(rs.headers['content-disposition'])
    };
  } catch (error: any) {
    return error;
  }
}

const documentServices = {
  searchDocument,
  listDocuments,
  uploadDocument,
  updateDocument,
  deleteDocument,
  getDocumentDetail,
  viewDocumentFile,
  downloadDocumentFile
};

export default documentServices;
