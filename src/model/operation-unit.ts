import { PaginationReq, PaginationRes, ResultBase } from './common';

export enum OPERATION_UNIT_STATUS {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE'
}

export interface OperationUnit {
  operationUnitId: string;
  unitCode?: string;
  unitName?: string;
  shortName?: string;
  taxNo?: string;
  phone?: string;
  email?: string;
  contactName?: string;
  contractIdNo?: string;
  contactIsueDate?: string;
  address?: string;
  createdBy?: string;
  createdAt?: string;
  updateBy?: string;
  updatedAt?: string;
  status?: string;
  signedDate?: string;
  effectiveDate?: string;
  expiryDate?: string;
}

export interface SearchOperationUnitsReq extends PaginationReq {
  unitCode?: string;
  unitName?: string;
  status?: string;
}

export interface CreateOperationUnitReq {
  unitCode: string;
  unitName: string;
  shortName?: string;
  taxNo?: string;
  phone?: string;
  email?: string;
  contactName?: string;
  contractIdNo?: string;
  contactIsueDate?: string;
  address?: string;
  status?: string;
}

export interface UpdateOperationUnitReq {
  id: string;
  unitName?: string;
  shortName?: string;
  taxNo?: string;
  phone?: string;
  email?: string;
  contactName?: string;
  contractIdNo?: string;
  contactIsueDate?: string;
  address?: string;
  status?: string;
}

export interface OperationUnitIdReq {
  id: string;
}

export interface OperationUnitRes extends ResultBase<OperationUnit> {}

export interface SearchOperationUnitsRes extends ResultBase<PaginationRes<OperationUnit>> {}

export interface DeleteOperationUnitRes extends ResultBase<void> {}
