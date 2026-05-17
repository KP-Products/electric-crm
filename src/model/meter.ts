import { PaginationReq, PaginationRes, ResultBase } from './common';

export interface Meter {
  meterId: string;
  meterCode: string;
  customerId: string;
  installationDate: string;
  voltageLevel: string;
  multiplier: number;
  voltageType: string;
  initialReading: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface GetListMeterReq extends PaginationReq {
  filter?: string;
}

export interface GetListMeterRes extends ResultBase<PaginationRes<Meter>> {}
export interface AddMeterReq {
  meterCode: string;
  customerId: string;
  installationDate: string;
  voltageLevel: string;
  multiplier: number;
  voltageType: string;
  initialReading: number;
  status: string;
}

export interface AddMeterRes extends ResultBase {}
export interface DeleteMeterReq {
  meterId: string;
}
export interface DeleteMeterRes extends ResultBase {}
