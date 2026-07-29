import { PaginationReq, PaginationRes, ResultBase } from './common';
import { MeterSearchForReadingRow } from './manual-meter-reading';

export type EvnReadingBatchStatus = 'DRAFT' | 'SUBMITTED' | 'CONFIRMED' | 'REJECTED';

export interface EvnReadingBatch {
  id: number;
  meterCode?: string;
  masterMeterId?: string;
  readingDate?: string;
  status?: EvnReadingBatchStatus | string;
  totalMeterCount?: number;
  enteredMeterCount?: number;
  submittedBy?: string;
  submittedAt?: string;
  confirmedBy?: string;
  confirmedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  note?: string;
}

export interface SearchEvnReadingBatchesReq extends PaginationReq {
  meterCode?: string;
  masterMeterId?: string;
  status?: EvnReadingBatchStatus;
  from?: string;
  to?: string;
}

export interface SearchEvnReadingBatchesRes extends ResultBase<PaginationRes<EvnReadingBatch>> {}

export interface CreateEvnReadingBatchReq {
  masterMeterId: string;
  readingDate: string;
  note?: string;
}

export interface UpdateEvnReadingBatchReq {
  id: number;
  readingDate?: string;
  note?: string;
}

export interface EvnReadingBatchIdReq {
  id: number;
}

export interface RejectEvnReadingBatchReq extends EvnReadingBatchIdReq {
  reason?: string;
}

export interface FeederMetersReq {
  masterMeterId: string;
}

export interface EvnReadingBatchRes extends ResultBase<EvnReadingBatch> {}
export interface FeederMetersRes extends ResultBase<MeterSearchForReadingRow[]> {}
export interface DeleteEvnReadingBatchRes extends ResultBase {}

export interface ExportEvnReadingBatchRecordRes {
  data?: Blob;
  fileName?: string;
  businessErrorMessage?: string;
  systemErrorMessage?: string;
  detailMessage?: string;
  message?: string;
}
