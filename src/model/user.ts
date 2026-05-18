import { PaginationReq, ResultBase } from 'model/common';
import { Department, Unit } from './master-data';
export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phone: string;
  bio: string;
  image: string;
  status: string;
  roles: string[];
  unit: Unit;
  department: Department;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}
export interface GetListUserReq extends PaginationReq {
  username?: string;
  fullName?: string;
  unitId?: string;
  departmentId?: string;
  status?: string;
  roleId?: string;
  email?: string;
}

export interface GetListUserRes extends ResultBase<User[]> {}

export interface DownloadListUserRes extends ResultBase<string> {}

export interface AddUserReq {
  username: string;
  email: string;
  password: string;
  role: string;
}

export interface AddUserRes extends ResultBase {}

export interface UploadUserReq extends FormData {}

export interface UserUploadError {
  departmentError?: string;
  statusError?: string;
  unitError?: string;
  roleError?: string;
  usernameError?: string;
  emailError?: string;
}

export interface UserUpload extends User, UserUploadError {
  rowNumber: number;
  statusUpload: string;
  statusCode: string;
  role: string;
  roleId: string;
  unitId: string;
  unitName: string;
  departmentId: string;
  departmentName: string;
}

export interface UploadUserRes extends ResultBase<UserUpload[]> {}

export type AddListUserReq = AddUserReq[];

export interface AddListUserRes extends ResultBase {}

export interface EditUserReq {
  userId: string;
  status: string;
  // roleId: string;
}

export interface EditUserRes extends ResultBase {}

export interface UserSearchReq {
  usernameContains: string;
  emailContains: string;
  fullNameContains: string;
  status: string;
  enabled: boolean;
  roleCode: string;
}
export interface UserSearchItem {
  id: string;
  username: string;
  email: string;
  fullName: string;
  status: string;
  createdAt: string;
  enabled: boolean;
  roles: string[];
}

export interface UserSearchList {
  items: UserSearchItem[];
  total: number;
  page: number;
  size: number;
}
export interface UserSearchRes extends ResultBase<UserSearchList> {}
export enum STATUS {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  LOCKED = 'LOCKED',
}
export interface DeleteUserReq {
  userId: string;
}
export interface AssignUserRoleReq {
  userId: string;
  roleCodes: string[];
}
