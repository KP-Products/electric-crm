import { PaginationReq, PaginationRes, ResultBase } from './common';
import { UserSearchItem } from './user';

export enum BRANCH_STATUS {
  ACTIVE = 'ACTIVE',
  TRIAL = 'TRIAL',
  STOPPED = 'STOPPED'
}

export interface Branch {
  id: string;
  code: string;
  name: string;
  address: string;
  managerId?: string;
  managerName?: string;
  status: BRANCH_STATUS | string;
  employeeCount?: number;
  createdAt?: string;
}

export interface BranchUser extends UserSearchItem {
  branchId?: string;
  branchCode?: string;
  branchName?: string;
}

export interface BranchSearchReq extends PaginationReq {
  code?: string;
  name?: string;
  status?: string;
}

export interface BranchUsersReq extends PaginationReq {
  branchId?: string;
  includeUnassigned?: boolean;
  usernameContains?: string;
  status?: string;
}

export interface CreateBranchReq {
  code?: string;
  name: string;
  address: string;
  managerId?: string;
  status?: string;
}

export interface UpdateBranchReq {
  id: string;
  name?: string;
  address?: string;
  managerId?: string;
  status?: string;
}

export interface GetBranchReq {
  id: string;
}

export interface DeleteBranchReq {
  id: string;
}

export interface BranchRes extends ResultBase<Branch> {}

export interface BranchListRes extends ResultBase<Branch[]> {}

export interface BranchSearchRes extends ResultBase<PaginationRes<Branch>> {}

export interface BranchUsersRes extends ResultBase<PaginationRes<BranchUser>> {}
