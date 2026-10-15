import { PaginationReq, PaginationRes, ResultBase } from './common';

/** 1 dòng "Danh sách công tơ" gửi lên khi lưu HĐ (ngày dd-MM-yyyy). */
export interface ContractMeterLine {
  meterId: string;
  feederId: string;
  installationDate: string;
}

/** Công tơ thuộc HĐ (BE trả trong ContractDto.meters). */
export interface ContractMeter {
  meterId: string;
  meterCode?: string;
  meterType?: string;
  voltageLevel?: string;
  multiplier?: number;
  initialReadingBt?: number;
  initialReadingCd?: number;
  initialReadingTd?: number;
  feederId?: string;
  feederCode?: string;
  installationDate?: string;
}

export interface ContractMeterChangeEvent {
  eventId: number;
  eventNo?: string;
  eventType?: string;
  eventDate?: string;
  oldDevice?: string;
  newDevice?: string;
  removeReading?: number;
  installReading?: number;
  status?: string;
  reason?: string;
}

/** Công tơ / lộ để chọn (POST /contracts/available-meters, /contracts/feeders). */
export interface AvailableMeter {
  meterId: string;
  meterCode?: string;
  voltageLevel?: string;
  multiplier?: number;
  meterType?: string;
  installationDate?: string;
  feederId?: string;
  customerId?: number;
}

export interface AvailableMetersReq {
  keyword?: string;
  contractId?: string;
  customerId?: number;
  feederId?: string;
}

export interface Contract {
  id: string;
  contractId?: string;
  contractNumber: string;
  customerId?: number;
  customerCode?: string;
  customerName?: string;
  meters?: ContractMeter[];
  meterChangeEvents?: ContractMeterChangeEvent[] | null;
  signedDate?: string;
  effectiveDate?: string;
  expiryDate?: string;
  status?: string;
  note?: string;
  createdBy?: string;
  createdByUsername?: string;
  updatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ContractSearchReq extends PaginationReq {
  contractNumber?: string;
  customerId?: number;
  meterId?: string;
  status?: string;
  signedDate?: string;
  effectiveDate?: string;
  expiryDate?: string;
  createdBy?: string;
}

export interface CreateContractReq {
  contractNumber: string;
  customerId: number;
  /** Bắt buộc khi tạo; khi sửa bỏ trống = giữ nguyên công tơ. */
  meters?: ContractMeterLine[];
  signedDate: string;
  effectiveDate: string;
  expiryDate?: string;
  status?: string;
  note?: string;
}

export interface UpdateContractReq extends CreateContractReq {
  id: string;
}

export interface GetContractReq {
  id: string;
}

export interface DeleteContractReq {
  id: string;
}

export interface ExportContractsPdfReq {
  contractIds: string[];
}

export interface ContractRes extends ResultBase<Contract> {}

export interface ContractListRes extends ResultBase<Contract[]> {}

export interface AvailableMeterListRes extends ResultBase<AvailableMeter[]> {}

export interface ContractSearchRes extends ResultBase<PaginationRes<Contract>> {}

export interface ContractDeleteRes extends ResultBase<void> {}
