import { PaginationReq, PaginationRes, ResultBase } from './common';

export interface RemoteMeterReadingPeriod {
  id: number;
  meterNumber?: string;
  customerId?: number;
  customerCode?: string;
  customerName?: string;
  periodCode?: string;
  periodFrom?: string;
  periodTo?: string;
  readingDate?: string;
  status?: string;
  billed?: boolean;
  typeInput?: string;
  fileId?: number;
  oldIndex?: number;
  newIndex?: number;
  energyRaw?: number;
  energyAdjusted?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface SearchRemoteMeterReadingsReq extends PaginationReq {
  meterNumber?: string;
  customerId?: number;
  periodCode?: string;
  status?: string;
  typeInput?: string;
  from?: string;
  to?: string;
}

export interface SearchRemoteMeterReadingsRes
  extends ResultBase<PaginationRes<RemoteMeterReadingPeriod>> {}

export interface ImportRemoteMeterReadingReq {
  file: File;
}

export interface RemoteMeterReadingImportResult {
  success?: boolean;
  periodId?: number;
  rowCount?: number;
  errors?: string[];
  historyId?: number;
}

export interface ImportRemoteMeterReadingRes extends ResultBase<RemoteMeterReadingImportResult> {}

export interface DownloadRemoteMeterReadingTemplateRes {
  data?: Blob;
  fileName?: string;
  businessErrorMessage?: string;
  systemErrorMessage?: string;
  detailMessage?: string;
  message?: string;
}
