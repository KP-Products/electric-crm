import { PaginationReq, PaginationRes, ResultBase } from './common';

export interface ServiceLocation {
  id: string;
  contractId: string;
  customerId?: string;
  address: string;
  ward: string;
  voltageLevel: string;
  usagePurpose: string;
  meterId?: string;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface ServiceLocationSearchReq extends PaginationReq {
  contractId?: string;
  customerId?: string;
  voltageLevel?: string;
  usagePurpose?: string;
  keyword?: string;
}

export interface CreateServiceLocationReq {
  contractId: string;
  address: string;
  ward: string;
  voltageLevel: string;
  usagePurpose: string;
  meterId?: string;
}

export interface UpdateServiceLocationReq {
  id: string;
  address?: string;
  ward?: string;
  voltageLevel?: string;
  usagePurpose?: string;
  meterId?: string;
  unassignMeter?: boolean;
}

export interface GetServiceLocationReq {
  id: string;
}

export interface DeleteServiceLocationReq {
  id: string;
}

export interface ServiceLocationRes extends ResultBase<ServiceLocation> {}

export interface ServiceLocationListRes extends ResultBase<ServiceLocation[]> {}

export interface ServiceLocationSearchRes extends ResultBase<PaginationRes<ServiceLocation>> {}
