import { PaginationReq, PaginationRes, ResultBase } from './common';

export interface OperationContract {
  contractId: string;
  contractNumber?: string;
  contractName?: string;
  operationUnitId?: string;
  contractType?: string;
  signedDate?: string;
  effectiveDate?: string;
  expiryDate?: string;
  status?: string;
  note?: string;
  createdBy?: string;
  createdAt?: string;
  updatedBy?: string;
  updatedAt?: string;
}

export interface SearchOperationContractsReq extends PaginationReq {
  contractNumber?: string;
  contractName?: string;
  operationUnitId?: string;
  contractType?: string;
  status?: string;
}

export interface OperationContractIdReq {
  id: string;
}

export interface CreateOperationContractReq {
  contractNumber: string;
  contractName: string;
  operationUnitId: string;
  contractType: string;
  signedDate: string;
  effectiveDate: string;
  expiryDate?: string;
  status?: string;
  note?: string;
}

export interface UpdateOperationContractReq {
  id: string;
  contractName?: string;
  operationUnitId?: string;
  contractType?: string;
  signedDate?: string;
  effectiveDate?: string;
  expiryDate?: string;
  status?: string;
  note?: string;
}

export interface OperationContractRes extends ResultBase<OperationContract> {}

export interface SearchOperationContractsRes extends ResultBase<PaginationRes<OperationContract>> {}

export interface DeleteOperationContractRes extends ResultBase<void> {}
