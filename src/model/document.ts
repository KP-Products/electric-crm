import { PaginationReq, ResultBase } from './common';

export enum DOCUMENT_OWNER_TYPE {
  CUSTOMER = 'CUSTOMER',
  CONTRACT = 'CONTRACT',
  OPERATION_CONTRACT = 'OPERATION_CONTRACT'
}

export enum DOCUMENT_TYPE {
  CMND_CCCD = 'CMND_CCCD',
  DKKD = 'DKKD',
  HD = 'HD',
  SO_DO_DIEN = 'SO_DO_DIEN',
  KHAC = 'KHAC'
}

export enum DOCUMENT_STATUS {
  HOP_LE = 'HOP_LE',
  CAN_BO_SUNG = 'CAN_BO_SUNG',
  HET_HAN = 'HET_HAN'
}

export interface DocumentItem {
  id: string;
  ownerType: DOCUMENT_OWNER_TYPE | string;
  ownerId: string;
  docType: DOCUMENT_TYPE | string;
  originalFileName: string;
  format: string;
  sizeKb: number;
  status: DOCUMENT_STATUS | string;
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
  ownerType?: DOCUMENT_OWNER_TYPE | string;
  ownerId?: string;
  docType?: DOCUMENT_TYPE | string;
  status?: DOCUMENT_STATUS | string;
  keyword?: string;
}

export interface SearchDocumentResult {
  items: DocumentItem[];
  total: number;
  page: number;
  size: number;
}

export interface SearchDocumentRes extends ResultBase<SearchDocumentResult> {}

export interface ListDocumentReq {
  ownerType: DOCUMENT_OWNER_TYPE | string;
  ownerId: string;
}

export interface ListDocumentRes extends ResultBase<DocumentItem[]> {}

export interface ListDocumentsByUnitReq {
  operationUnitId: string;
}

export interface UnitContractDocuments {
  contractId?: string;
  contractNumber?: string;
  contractName?: string;
  documents?: DocumentItem[];
}

export interface ListDocumentsByUnitRes extends ResultBase<UnitContractDocuments[]> {}

export interface UploadDocumentReq {
  ownerType: DOCUMENT_OWNER_TYPE | string;
  ownerId: string;
  docType: DOCUMENT_TYPE | string;
  status?: DOCUMENT_STATUS | string;
  note?: string;
  file: File;
}

export interface UpdateDocumentReq {
  id: string;
  status?: DOCUMENT_STATUS | string;
  note?: string;
}

export interface DeleteDocumentReq {
  id: string;
}

export interface GetDocumentReq {
  id: string;
}

export interface DocumentRes extends ResultBase<DocumentItem> {}

export interface DocumentDetailRes extends ResultBase<DocumentItem> {}

export interface DeleteDocumentRes extends ResultBase<void> {}

export interface DocumentFileRes {
  blob: Blob;
  contentType?: string;
  fileName?: string;
}
