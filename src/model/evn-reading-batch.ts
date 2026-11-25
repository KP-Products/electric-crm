import { PaginationReq, PaginationRes, ResultBase } from './common';
import { MeterSearchForReadingRow } from './manual-meter-reading';

/** Trạng thái lô theo BE (BatchStatus): Chưa nhập / Đã nhập / Nhập lỗi / Chờ chốt / Đã chốt. */
export type EvnReadingBatchStatus = 'CHUA_NHAP' | 'DA_NHAP' | 'NHAP_LOI' | 'CHO_CHOT' | 'DA_CHOT';

/** Dòng danh sách lô (BatchListRowDto) — chi tiết lô (BatchDetailDto) có thêm các trường tổng. */
export interface EvnReadingBatch {
  id: number;
  masterMeterId?: string;
  feederCode?: string;
  feederName?: string;
  address?: string;
  /** Trả về từ create/update/confirm (BatchDto). */
  meterCode?: string;
  periodCode?: string;
  periodNo?: number;
  periodFrom?: string;
  periodTo?: string;
  readingDate?: string;
  status?: EvnReadingBatchStatus | string;
  statusLabel?: string;
  totalMeterCount?: number;
  enteredMeterCount?: number;
  enteredBy?: string;
  enteredAt?: string;
  confirmedBy?: string;
  confirmedAt?: string;
  rejectionReason?: string;
  note?: string;
  totalActive?: number;
  totalReactive?: number;
  totalEnergyAdjusted?: number;
  meters?: EvnBatchMeterRow[];
}

export interface EvnBatchTouReading {
  tou: string;
  oldIndex?: number;
  newIndex?: number;
}

export interface EvnBatchMeterRow {
  periodId?: number;
  meterNumber: string;
  customerCode?: string;
  customerName?: string;
  address?: string;
  multiplier?: number;
  activeIndex?: number;
  reactiveIndex?: number;
  totalEnergyAdjusted?: number;
  abnormal?: boolean;
  photoCount?: number;
  readings?: EvnBatchTouReading[];
}

export interface SearchEvnReadingBatchesReq extends PaginationReq {
  /** Mã lộ, tìm gần đúng. */
  feederCode?: string;
  masterMeterId?: string;
  periodCode?: string;
  status?: EvnReadingBatchStatus;
  from?: string;
  to?: string;
}

export interface SearchEvnReadingBatchesRes extends ResultBase<PaginationRes<EvnReadingBatch>> {}

export interface CreateEvnReadingBatchReq {
  masterMeterId: string;
  readingDate: string;
  note?: string;
  periodCode?: string;
  periodNo?: number;
  periodFrom?: string;
  periodTo?: string;
}

export interface UpdateEvnReadingBatchReq {
  id: number;
  readingDate?: string;
  note?: string;
  periodCode?: string;
  periodNo?: number;
  periodFrom?: string;
  periodTo?: string;
}

export interface EvnReadingBatchIdReq {
  id: number;
}

export interface SaveEvnBatchReadingsReq {
  id: number;
  meters: {
    meterNumber: string;
    activeIndex?: number;
    reactiveIndex?: number;
    readings: EvnBatchTouReading[];
  }[];
  note?: string;
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
