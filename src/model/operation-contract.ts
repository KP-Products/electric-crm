import { PaginationReq, PaginationRes, ResultBase } from './common';

export interface OperationContract {
  operationUnitId?: string;
  contractId: string;
  contractNumber?: string;
  contractName?: string;
  customerId?: number;
  contractValue?: number;
  discountPercent?: number;
  customerCode?: string;
  customerName?: string;
  valueAfterDiscount?: number;
  contractType?: string;
  signedDate?: string;
  effectiveDate?: string;
  expiryDate?: string;
  status?: string;
  note?: string;
  createdBy?: string;
  createdByUsername?: string;
  createdAt?: string;
  updatedBy?: string;
  updatedByUsername?: string;
  updatedAt?: string;
}

export interface SearchOperationContractsReq extends PaginationReq {
  // Retained for the existing operation-unit detail consumer.
  operationUnitId?: string;
  contractNumber?: string;
  contractName?: string;
  customerId?: number;
  contractType?: string;
  status?: string;
}

export interface OperationContractIdReq {
  id: string;
}

export interface CreateOperationContractReq {
  contractNumber: string;
  contractName: string;
  customerId: number;
  contractValue: number;
  discountPercent?: number;
  contractType: string;
  signedDate: string;
  effectiveDate: string;
  expiryDate?: string;
  status?: string;
  note?: string;
}

export interface UpdateOperationContractReq {
  id: string;
  contractValue?: number;
  discountPercent?: number;
  contractName?: string;
  customerId?: number;
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
