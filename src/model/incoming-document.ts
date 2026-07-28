import { PaginationReq, PaginationRes, ResultBase } from './common';

export interface IncomingDocument {
  id: number;
  incomingNumber?: string;
  incomingDate?: string;
  documentNumber?: string;
  documentDate?: string;
  issuingAgency?: string;
  documentType?: string;
  summary?: string;
  filePath?: string;
  urgencyLevel?: string;
  confidentialityLevel?: string;
  pageCount?: number;
  dueDate?: string;
  createdBy?: string | number;
  approvedBy?: number;
  approvalDate?: string;
  approvalNote?: string;
  note?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SearchIncomingDocumentsReq extends PaginationReq {
  incomingNumber?: string;
  issuingAgency?: string;
  documentType?: string;
  urgencyLevel?: string;
  confidentialityLevel?: string;
}

export interface CreateIncomingDocumentReq {
  incomingNumber: string;
  incomingDate?: string;
  documentNumber?: string;
  documentDate: string;
  issuingAgency: string;
  documentType?: string;
  summary: string;
  urgencyLevel?: string;
  confidentialityLevel?: string;
  pageCount?: number;
  dueDate?: string;
  createdBy?: string | number;
  approvedBy?: number;
  approvalDate?: string;
  approvalNote?: string;
  note?: string;
}

export interface UpdateIncomingDocumentReq extends Partial<CreateIncomingDocumentReq> {
  id: number;
}

export interface IncomingDocumentIdReq {
  id: number;
}

export interface UploadIncomingDocumentAttachmentReq extends IncomingDocumentIdReq {
  file: File;
}

export interface IncomingDocumentRes extends ResultBase<IncomingDocument> {}

export interface SearchIncomingDocumentRes extends ResultBase<PaginationRes<IncomingDocument>> {}

export interface DeleteIncomingDocumentRes extends ResultBase<void> {}
