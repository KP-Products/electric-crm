import { PaginationReq, PaginationRes, ResultBase } from './common';

export interface MeterReadingPeriod {
  id: number;
  meterNumber: string;
  customerId: number;
  periodCode: string;
  periodFrom: string;
  periodTo: string;
  readingDate: string;
  billed: boolean;
  status: string;
  createdAt?: string;
  updatedAt?: string;
  photoStoredFileName?: string;
  photoOriginalFileName?: string;
  photoFormat?: string;
  photoSizeKb?: number;
  customerName?: string;
  customerCode?: string;
  customerAddress?: string;
  areaName?: string;
  oldIndex?: number;
  newIndex?: number;
  multiplier?: number;
  energyRaw?: number;
  energyAdjusted?: number;
  note?: string;
}

export interface ManualMeterReadingRow extends MeterReadingPeriod {
  draftNewIndex: string;
  draftNote: string;
  draftPhotoName?: string;
}

export interface SearchReadingPeriodsReq extends PaginationReq {
  meterNumber?: string;
  customerId?: number;
  periodCode?: string;
  status?: string;
  from?: string;
  to?: string;
}

export interface SearchReadingPeriodsRes extends ResultBase<PaginationRes<MeterReadingPeriod>> {}

export interface GetReadingPeriodReq {
  id: number;
}

export interface GetReadingPeriodRes extends ResultBase<MeterReadingPeriod> {}

export interface CreateReadingPeriodReq {
  meterNumber: string;
  customerId: number;
  periodCode: string;
  periodFrom: string;
  periodTo: string;
  readingDate: string;
  saveMode?: 'DRAFT' | 'CONFIRM';
}

export interface ReadingPeriodResponse {
  period: MeterReadingPeriod;
  consumptionKwh?: number;
  deltaPercent?: number;
  abnormal?: boolean;
  previousPeriod?: MeterReadingPeriod;
}

export interface CreateReadingPeriodRes extends ResultBase<ReadingPeriodResponse> {}

export interface UpdateReadingPeriodReq {
  id: number;
  periodCode?: string;
  periodFrom?: string;
  periodTo?: string;
  readingDate?: string;
}

export interface UpdateReadingPeriodRes extends ResultBase<MeterReadingPeriod> {}

export interface DeleteReadingPeriodReq {
  id: number;
}

export interface DeleteReadingPeriodRes extends ResultBase {}
