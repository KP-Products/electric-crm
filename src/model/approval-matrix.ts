import { ResultBase } from 'model/common';
import { Permission } from 'model/role';

export interface GetListApprovalFunctionRes extends ResultBase<Permission[]> {}

export interface GetApprovalMatrixDetailReq {
  actionId: string;
}

export interface MatrixUser {
  id?: string;
  createdAt?: string;
  approverId: string;
}

export interface ApprovalLevel {
  id?: string;
  actionId?: string;
  createdAt?: string;
  approvalLevel: string;
  matrixUsers: MatrixUser[];
}

export interface ApprovalMatrix {
  actionId: string;
  levels: ApprovalLevel[];
}

export interface GetApprovalMatrixDetailRes extends ResultBase<ApprovalMatrix[]> {}

export interface EditApprovalMatrixReq extends ApprovalMatrix {}

export interface EditApprovalMatrixRes extends ResultBase {}
