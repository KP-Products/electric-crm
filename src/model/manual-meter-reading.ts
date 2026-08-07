import { PaginationReq, PaginationRes, ResultBase } from './common';

export type ReadingPeriodSaveMode = 'DRAFT' | 'SUBMIT';
export type ReadingPeriodStatus = 'DRAFT' | 'SAVED' | 'CONFIRMED' | 'REJECTED';

export interface MeterSearchForReadingReq extends PaginationReq {
  customerCode?: string;
  customerName?: string;
  meterCode?: string;
}

export interface MeterSearchForReadingRow {
  meterId: string;
  meterCode: string;
  voltageLevel?: string;
  multiplier?: number;
  meterType?: string;
  customerId?: number;
  customerCode?: string;
  customerName?: string;
  status?: string;
  inputStatus?: string;
}

export interface MeterSearchForReadingRes
  extends ResultBase<PaginationRes<MeterSearchForReadingRow>> {}

export interface ReadingItem {
  tou: string;
  oldIndex: number;
  newIndex: number;
  energyRaw?: number;
  energyAdjusted?: number;
}

export interface MeterReading extends ReadingItem {
  id?: number;
  periodId?: number;
  deltaIndex?: number;
  createdAt?: string;
  updatedAt?: string;
}

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
  activeEnergyIndex?: number;
  reactiveEnergyIndex?: number;
  typeInput?: string;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
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

export interface ReadingPeriodDetail {
  period?: MeterReadingPeriod;
  readings?: MeterReading[];
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
  typeInput?: string;
  from?: string;
  to?: string;
}

export interface SearchReadingPeriodsRes extends ResultBase<PaginationRes<MeterReadingPeriod>> {}

export interface GetReadingPeriodReq {
  id: number;
}

export interface GetReadingPeriodRes extends ResultBase<ReadingPeriodDetail> {}

export interface CreateReadingPeriodReq {
  meterNumber: string;
  customerId: number;
  periodCode: string;
  periodFrom: string;
  periodTo: string;
  readingDate: string;
  saveMode?: ReadingPeriodSaveMode;
  readings?: ReadingItem[];
  reactiveEnergyIndex?: number;
  note?: string;
}

export interface ReadingPeriodResponse {
  period: MeterReadingPeriod;
  consumptionKwh?: number;
  deltaPercent?: number;
  abnormal?: boolean;
  previousPeriod?: MeterReadingPeriod;
  readings?: MeterReading[];
}

export interface CreateReadingPeriodRes extends ResultBase<ReadingPeriodResponse> {}

export interface UpdateReadingPeriodReq {
  id: number;
  periodCode?: string;
  periodFrom?: string;
  periodTo?: string;
  readingDate?: string;
  readings?: ReadingItem[] | null;
  reactiveEnergyIndex?: number;
  note?: string;
}

export interface UpdateReadingPeriodRes extends ResultBase<ReadingPeriodDetail> {}

export interface DeleteReadingPeriodReq {
  id: number;
}

export interface DeleteReadingPeriodRes extends ResultBase {}

export interface PeriodIdReq {
  periodId: number;
}

export interface AttachmentIdReq {
  id: number;
}

export interface ReadingPhoto {
  id: number;
  periodId: number;
  fileName?: string;
  fileType?: string;
  fileSize?: number;
  createdBy?: string;
}

export interface UploadReadingPhotoReq extends PeriodIdReq {
  file: File;
}

export interface ReadingPhotoRes extends ResultBase<ReadingPhoto> {}

export interface ReadingPhotoListRes extends ResultBase<ReadingPhoto[]> {}

export interface ReadingPhotoFileRes {
  data?: Blob;
  fileName?: string;
  businessErrorMessage?: string;
  systemErrorMessage?: string;
  detailMessage?: string;
  message?: string;
}

export interface ExportReadingRecordReq extends PeriodIdReq {}

export interface ExportReadingRecordRes extends ReadingPhotoFileRes {}

export interface ConfirmReadingsReq {
  periodIds: number[];
}

export interface ConfirmReadingResult {
  periodId?: number;
  status?: string;
  mailSent?: boolean;
}

export interface ConfirmReadingsRes extends ResultBase<ConfirmReadingResult[]> {}

export interface RejectReadingReq extends PeriodIdReq {
  reason?: string;
}

export interface RejectReadingResult {
  periodId?: number;
  status?: string;
  reason?: string;
}

export interface RejectReadingRes extends ResultBase<RejectReadingResult> {}

export interface ReviewReadingsReq extends PaginationReq {
  periodCode?: string;
  customerId?: number;
  status?: ReadingPeriodStatus;
}

export interface ReadingReviewRow {
  periodId?: number;
  meterNumber?: string;
  customerId?: number;
  periodCode?: string;
  readingDate?: string;
  status?: string;
  currentKwh?: number;
  previousKwh?: number;
  deltaPercent?: number;
  abnormal?: boolean;
}

export interface ReviewReadingsRes extends ResultBase<PaginationRes<ReadingReviewRow>> {}
