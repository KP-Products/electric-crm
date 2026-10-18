import { PaginationReq, PaginationRes, ResultBase } from './common';

export interface Meter {
  id?: string;
  meterId: string;
  meterCode: string;
  meterType?: string;
  customerId?: number;
  locationId?: string;
  /** Khách hàng BE join sẵn qua hợp đồng mua bán điện (nằm trong khối `meter` của response) */
  customerCode?: string;
  customerName?: string;
  address?: string;
  contractNumber?: string;
  purchaseDate?: string;
  installationDate?: string;
  inspectionDate?: string;
  inspectionExpiryDate?: string;
  voltageLevel?: string;
  multiplier?: number;
  voltageType?: string;
  parentId?: string;
  initialReading?: number;
  initialReadingCd?: number;
  initialReadingTd?: number;
  status: string;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
  verification?: MeterVerificationSummary;
}

export interface MeterVerificationSummary {
  latestVerificationDate?: string;
  resultStatus?: string;
  certificateNo?: string;
  nextVerificationDate?: string;
  daysUntilNextVerification?: number;
  dueSoon?: boolean;
  overdue?: boolean;
}

export interface MeterWithVerification {
  meter: Meter;
  verification?: MeterVerificationSummary;
}

export type MeterSearchItem = Meter | MeterWithVerification;

export const normalizeMeterSearchItem = (item?: MeterSearchItem): Meter | undefined => {
  if (!item) return undefined;
  if ('meter' in item) {
    return {
      ...item.meter,
      verification: item.verification,
      inspectionDate: item.verification?.latestVerificationDate || item.meter.inspectionDate,
      inspectionExpiryDate:
        item.verification?.nextVerificationDate || item.meter.inspectionExpiryDate
    };
  }
  return item;
};

export interface GetListMeterReq extends PaginationReq {
  filter?: string;
  meterCodeContains?: string;
  customerId?: number;
  parentId?: string;
  voltageType?: string;
  voltageLevel?: string;
  status?: string;
  meterType?: string;
  installationDateFrom?: string;
  installationDateTo?: string;
  purchaseDateFrom?: string;
  purchaseDateTo?: string;
}

export interface GetListMeterRes extends ResultBase<PaginationRes<MeterSearchItem>> {}

export interface GetMeterDetailReq {
  meterId: string;
}

export interface GetMeterDetailRes extends ResultBase<MeterSearchItem> {}

export interface AddMeterReq {
  multiplierEffectiveFrom?: string;
  meterCode: string;
  customerId?: number;
  purchaseDate?: string;
  installationDate?: string;
  voltageLevel?: string;
  multiplier?: number;
  voltageType?: string;
  parentId?: string;
  initialReading?: number;
  initialReadingCd?: number;
  initialReadingTd?: number;
  status: string;
  meterType?: string;
}

export interface EditMeterReq extends AddMeterReq {
  meterId: string;
}

export interface AddMeterRes extends ResultBase {}
export interface DeleteMeterReq {
  meterId: string;
}
export interface DeleteMeterRes extends ResultBase {}

export interface MeterMultiplierHistory {
  id: number;
  meterId: string;
  multiplier: number;
  effectiveFrom: string;
  effectiveTo?: string | null;
  updatedBy?: string;
  updatedAt?: string;
  note?: string;
}
export interface MeterMultiplierHistoryRes extends ResultBase<MeterMultiplierHistory[]> {}
