import { PaginationReq, PaginationRes, ResultBase } from './common';

export interface Customer {
  id: string;
  customerCode?: string;
  fullName?: string;
  taxNo?: string;
  phone?: string;
  email?: string;
  contactName?: string;
  contactIdNo?: string;
  contactIssueDate?: string;
  address?: string;
  operationUnitId?: string;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface CustomerSearchReq extends PaginationReq {
  customerCodeContains?: string;
  fullNameContains?: string;
  taxNoContains?: string;
  phoneContains?: string;
  emailContains?: string;
  contactNameContains?: string;
  addressContains?: string;
}

export interface CreateCustomerReq {
  customerCode: string;
  fullName?: string;
  taxNo?: string;
  phone?: string;
  email?: string;
  contactName?: string;
  contactIdNo?: string;
  contactIssueDate?: string;
  address?: string;
  operationUnitId?: string;
}

export interface UpdateCustomerReq extends Partial<CreateCustomerReq> {
  id: string;
}

export interface CustomerIdReq {
  id: string;
}

export interface OperationUnitInfo {
  id?: string;
  unitCode?: string;
  unitName?: string;
}

export interface SignedContractInfo {
  id?: string;
  contractNumber?: string;
  signedDate?: string;
  effectiveDate?: string;
  expiryDate?: string;
  status?: string;
}

export interface CustomerDetail {
  customer?: Customer;
  operationUnit?: OperationUnitInfo;
  contracts?: SignedContractInfo[];
}

export interface CustomerRes extends ResultBase<Customer> {}

export interface CustomerListRes extends ResultBase<Customer[]> {}

export interface CustomerSearchRes extends ResultBase<PaginationRes<Customer>> {}

export interface CustomerDetailRes extends ResultBase<CustomerDetail> {}

export interface DeleteCustomerRes extends ResultBase<void> {}

export type CustomerGroup = Customer;
export type CreateCustomerGroupReq = CreateCustomerReq;
export type UpdateCustomerGroupReq = UpdateCustomerReq;
