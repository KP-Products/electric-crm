import { PaginationReq, PaginationRes, ResultBase } from './common';

export interface DocumentItem {
  id: string;
  ownerType: string;
  ownerId: string;
  docType: string;
  originalFileName: string;
  format: string;
  sizeKb: number;
  status: string;
  note?: string;
  uploadedAt: string;
  uploadedBy?: string;
  updatedAt?: string;
  updatedBy?: string;
  viewUrl?: string;
  downloadUrl?: string;
  fileUrl?: string;
  url?: string;
  link?: string;
  path?: string;
}

export interface SearchDocumentReq extends PaginationReq {
  ownerType?: string;
  ownerId?: string;
  docType?: string;
  status?: string;
  keyword?: string;
}

export interface SearchDocumentRes extends ResultBase<PaginationRes<DocumentItem>> {}

export interface ListDocumentReq {
  ownerType: string;
  ownerId: string;
}

export interface ListDocumentRes extends ResultBase<DocumentItem[]> {}

export interface UploadDocumentReq {
  ownerType: string;
  ownerId: string;
  docType: string;
  status?: string;
  note?: string;
  file: File;
}

export interface UpdateDocumentReq {
  id: string;
  status?: string;
  note?: string;
}

export interface DeleteDocumentReq {
  id: string;
}

export interface GetDocumentReq {
  id: string;
}

export interface DocumentLinkData {
  viewUrl?: string;
  downloadUrl?: string;
  fileUrl?: string;
  url?: string;
  link?: string;
  path?: string;
}

export type DocumentDetailData = string | (Partial<DocumentItem> & DocumentLinkData);

export interface DocumentRes extends ResultBase<DocumentItem> {}

export interface DocumentDetailRes extends ResultBase<DocumentDetailData> {
  viewUrl?: string;
  downloadUrl?: string;
  fileUrl?: string;
  url?: string;
  link?: string;
  path?: string;
}
