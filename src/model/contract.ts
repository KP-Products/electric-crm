import { PaginationReq, PaginationRes, ResultBase } from './common';

export interface ContractMeterLine {
  meterId: string;
  feederId: string;
  installationDate: string;
}

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
  meters?: ContractMeter[];
  meterChangeEvents?: ContractMeterChangeEvent[] | null;
  contractNumber: string;
  customerId?: number;
  customerCode?: string;
  customerName?: string;
  meterId?: string;
  voltageLevelId?: string;
  customerType?: string;
  capacityKva?: number;
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
  meters: ContractMeterLine[];
  contractNumber: string;
  customerId: number;
  signedDate: string;
  effectiveDate: string;
  expiryDate?: string;
  status?: string;
  note?: string;
}

export interface UpdateContractReq extends Omit<CreateContractReq, 'meters'> {
  meters?: ContractMeterLine[];
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

export interface ContractSearchRes extends ResultBase<PaginationRes<Contract>> {}

export interface ContractDeleteRes extends ResultBase<void> {}

export interface AvailableMeterListRes extends ResultBase<AvailableMeter[]> {}
