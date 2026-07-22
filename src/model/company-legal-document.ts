import { PaginationReq, PaginationRes, ResultBase } from './common';

export interface CompanyLegalDocument {
  id: number;
  documentNumber?: string;
  documentName: string;
  documentType: string;
  documentDate?: string;
  effectiveDate?: string;
  expiryDate?: string;
  summary?: string;
  draftedBy?: number;
  approvedBy?: number;
  attachmentFilePath?: string;
  status?: string;
  note?: string;
  createdBy?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface SearchCompanyLegalDocumentReq extends PaginationReq {
  documentNumber?: string;
  documentName?: string;
  documentType?: string;
  status?: string;
}

export interface CreateCompanyLegalDocumentReq {
  documentNumber?: string;
  documentName: string;
  documentType: string;
  documentDate?: string;
  effectiveDate?: string;
  expiryDate?: string;
  summary?: string;
  draftedBy?: number;
  approvedBy?: number;
  status?: string;
  note?: string;
}

export interface UpdateCompanyLegalDocumentReq extends Partial<CreateCompanyLegalDocumentReq> {
  id: number;
}

export interface CompanyLegalDocumentIdReq {
  id: number;
}

export interface UploadCompanyLegalDocumentAttachmentReq extends CompanyLegalDocumentIdReq {
  file: File;
}

export interface CompanyLegalDocumentRes extends ResultBase<CompanyLegalDocument> {}

export interface SearchCompanyLegalDocumentRes
  extends ResultBase<PaginationRes<CompanyLegalDocument>> {}

export interface DeleteCompanyLegalDocumentRes extends ResultBase<void> {}
