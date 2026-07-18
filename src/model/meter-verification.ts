import { PaginationReq, PaginationRes, ResultBase } from './common';

export interface MeterVerification {
  id: number;
  meterId: string;
  deviceType?: string;
  verificationDate?: string;
  resultStatus?: string;
  certificateNo?: string;
  notes?: string;
  nextVerificationDate?: string;
  daysUntilNextVerification?: number;
  dueSoon?: boolean;
  overdue?: boolean;
  filePath?: string;
  fileName?: string;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface MeterVerificationSearchReq extends PaginationReq {
  meterId?: string;
  resultStatus?: string;
  certificateNoContains?: string;
  verificationDateFrom?: string;
  verificationDateTo?: string;
  nextDateFrom?: string;
  nextDateTo?: string;
  dueSoonOnly?: boolean;
}

export interface CreateMeterVerificationReq {
  meterId: string;
  deviceType?: string;
  verificationDate: string;
  resultStatus: string;
  certificateNo?: string;
  notes?: string;
  nextVerificationDate?: string;
  file?: File;
}

export interface UpdateMeterVerificationReq {
  id: number;
  verificationDate?: string;
  resultStatus?: string;
  certificateNo?: string;
  notes?: string;
  nextVerificationDate?: string;
  file?: File;
}

export interface GetMeterVerificationReq {
  id: number;
}

export interface DeleteMeterVerificationReq {
  id: number;
}

export interface MeterVerificationFileRes {
  data?: Blob;
  fileName?: string;
  businessErrorMessage?: string;
  systemErrorMessage?: string;
  detailMessage?: string;
  message?: string;
}

export interface MeterVerificationConfig {
  equipmentType: string;
  label: string;
  cycleMonths: number;
  warningDays: number;
  effectiveDate: string;
}

export interface SearchMeterVerificationRes extends ResultBase<PaginationRes<MeterVerification>> {}

export interface ListMeterVerificationRes extends ResultBase<MeterVerification[]> {}
export interface MeterVerificationRes extends ResultBase<MeterVerification> {}
export interface DeleteMeterVerificationRes extends ResultBase {}
