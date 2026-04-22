import { PaginationReq, PaginationRes, ResultBase } from 'model/common';

export interface Role {
  roleId: string;
  name: string;
  code: string;
  status: string;
  description: string;
  roleName: string;
  roleType: string;
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
  permissions: Permission[];
}

export interface GetListRoleReq extends PaginationReq {
  filter?: string;
}

export interface GetListRoleRes extends ResultBase<PaginationRes<Role>> {}

export interface DownloadListRoleRes extends ResultBase<string> {}

export interface GetRoleDetailReq {
  roleId: string;
}

export interface GetRoleDetailRes extends ResultBase<Role> {}

export interface Permission {
  permissionId: string;
  action: string;
  description: string;
  actionGroup: string;
  actionGroupName: string;
  actionSubGroup: string;
  actionSubGroupName: string;
  updatedBy: string;
  updatedAt: string;
}

export interface GetListPermissionRes extends ResultBase<Permission[]> {}

export interface AddRoleReq {
  code: string;
  name: string;
  status: string;
  description: string;
  permissionIds: string[];
}

export interface AddRoleRes extends ResultBase<Role> {}

export interface EditRoleReq extends AddRoleReq {
  roleId: string;
}

export interface EditRoleRes extends ResultBase<Role> {}

export interface DeleteRoleReq {
  roleId: string;
}

export interface DeleteRoleRes extends ResultBase {}
