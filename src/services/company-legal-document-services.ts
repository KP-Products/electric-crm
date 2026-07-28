import appServices from '@app-services';
import { ApiResponse } from 'model/common';
import {
  CompanyLegalDocumentIdReq,
  CompanyLegalDocumentRes,
  CreateCompanyLegalDocumentReq,
  DeleteCompanyLegalDocumentRes,
  SearchCompanyLegalDocumentReq,
  SearchCompanyLegalDocumentRes,
  UpdateCompanyLegalDocumentReq,
  UploadCompanyLegalDocumentAttachmentReq
} from 'model/company-legal-document';
import { ApiConstants } from './networking/app-apis';

export interface CompanyLegalDocumentAttachmentFile {
  blob: Blob;
  contentType?: string;
}

async function searchCompanyLegalDocuments(
  params: SearchCompanyLegalDocumentReq
): Promise<ApiResponse<SearchCompanyLegalDocumentRes>> {
  try {
    const rs = await appServices.post(ApiConstants.COMPANY_LEGAL_DOCUMENT_SEARCH, params);
    return rs.data;
  } catch (error: any) {
    return error;
  }
}

async function createCompanyLegalDocument(
  params: CreateCompanyLegalDocumentReq
): Promise<ApiResponse<CompanyLegalDocumentRes>> {
  try {
    const rs = await appServices.post(ApiConstants.COMPANY_LEGAL_DOCUMENT_CREATE, params);
    return rs.data;
  } catch (error: any) {
    return error;
  }
}

async function updateCompanyLegalDocument(
  params: UpdateCompanyLegalDocumentReq
): Promise<ApiResponse<CompanyLegalDocumentRes>> {
  try {
    const rs = await appServices.post(ApiConstants.COMPANY_LEGAL_DOCUMENT_UPDATE, params);
    return rs.data;
  } catch (error: any) {
    return error;
  }
}

async function getCompanyLegalDocumentDetail(
  params: CompanyLegalDocumentIdReq
): Promise<ApiResponse<CompanyLegalDocumentRes>> {
  try {
    const rs = await appServices.post(ApiConstants.COMPANY_LEGAL_DOCUMENT_DETAIL, params);
    return rs.data;
  } catch (error: any) {
    return error;
  }
}

async function deleteCompanyLegalDocument(
  params: CompanyLegalDocumentIdReq
): Promise<ApiResponse<DeleteCompanyLegalDocumentRes>> {
  try {
    const rs = await appServices.post(ApiConstants.COMPANY_LEGAL_DOCUMENT_DELETE, params);
    return rs.data;
  } catch (error: any) {
    return error;
  }
}

async function uploadCompanyLegalDocumentAttachment(
  params: UploadCompanyLegalDocumentAttachmentReq
): Promise<ApiResponse<CompanyLegalDocumentRes>> {
  try {
    const formData = new FormData();
    formData.append('id', String(params.id));
    formData.append('file', params.file);
    const rs = await appServices.post(
      `${ApiConstants.COMPANY_LEGAL_DOCUMENT_ATTACHMENT}/${params.id}/attachment/upload`,
      formData
    );
    return rs.data;
  } catch (error: any) {
    return error;
  }
}

async function deleteCompanyLegalDocumentAttachment(
  params: CompanyLegalDocumentIdReq
): Promise<ApiResponse<CompanyLegalDocumentRes>> {
  try {
    const rs = await appServices.post(
      `${ApiConstants.COMPANY_LEGAL_DOCUMENT_ATTACHMENT}/${params.id}/attachment/delete`
    );
    return rs.data;
  } catch (error: any) {
    return error;
  }
}

async function viewCompanyLegalDocumentAttachment(
  id: number
): Promise<CompanyLegalDocumentAttachmentFile | unknown> {
  try {
    const rs = await appServices.get(
      `${ApiConstants.COMPANY_LEGAL_DOCUMENT_ATTACHMENT}/${id}/attachment/view`,
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

async function downloadCompanyLegalDocumentAttachment(
  id: number
): Promise<CompanyLegalDocumentAttachmentFile | unknown> {
  try {
    const rs = await appServices.get(
      `${ApiConstants.COMPANY_LEGAL_DOCUMENT_ATTACHMENT}/${id}/attachment/download`,
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

const companyLegalDocumentServices = {
  searchCompanyLegalDocuments,
  createCompanyLegalDocument,
  updateCompanyLegalDocument,
  getCompanyLegalDocumentDetail,
  deleteCompanyLegalDocument,
  uploadCompanyLegalDocumentAttachment,
  deleteCompanyLegalDocumentAttachment,
  viewCompanyLegalDocumentAttachment,
  downloadCompanyLegalDocumentAttachment
};

export default companyLegalDocumentServices;
