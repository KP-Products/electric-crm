import { PaginationReq, PaginationRes, ResultBase } from './common';

export interface Contract {
  id: string;
  contractId?: string;
  contractNumber: string;
  customerId: string;
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
  updatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ContractSearchReq extends PaginationReq {
  contractNumber?: string;
  customerId?: string;
  meterId?: string;
  status?: string;
  signedDate?: string;
  effectiveDate?: string;
  expiryDate?: string;
  createdBy?: string;
}

export interface CreateContractReq {
  contractNumber: string;
  customerId: string;
  meterId?: string;
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

export interface ContractRes extends ResultBase<Contract> {}

export interface ContractListRes extends ResultBase<Contract[]> {}

export interface ContractSearchRes extends ResultBase<PaginationRes<Contract>> {}

export interface ContractDeleteRes extends ResultBase<void> {}
