import type { Branch } from 'model/branch';
import type { AddUserReq, EditUserReq, UserSearchItem } from 'model/user';
import type { UserFilterForm } from 'screens/authentication/manage-user/components/UserFilterDrawer';

export interface UserPayloadFormValues {
  username: string;
  password?: string;
  email: string;
  roleId?: string;
  status: string;
  branchId: string;
}

export interface UserBranchValue {
  branchId?: string;
  branchName?: string;
  branchCode?: string;
}

export const filterUser = (userList: UserSearchItem[], filterApplied: Partial<UserFilterForm>) => {
  if (!userList) return [];
  return userList.filter((user) => {
    const matchUsername =
      !filterApplied.username ||
      user.username?.toLowerCase().includes(filterApplied.username.toLowerCase());
    const matchFullName =
      !filterApplied.fullName ||
      user.fullName?.toLowerCase().includes(filterApplied.fullName.toLowerCase());
    const matchEmail =
      !filterApplied.email || user.email?.toLowerCase().includes(filterApplied.email.toLowerCase());
    const matchStatus = !filterApplied.status || user.status === filterApplied.status;
    const matchRole = !filterApplied.roleId;
    return matchUsername && matchFullName && matchEmail && matchStatus && matchRole;
  });
};

export const buildBranchOptions = (branchList: Branch[] = [], selectedUser?: UserBranchValue) => {
  const options = branchList
    .filter((branch) => branch?.id)
    .map((branch) => ({ value: branch.id, label: branch.name || branch.code || branch.id }));

  if (selectedUser?.branchId && !options.some((option) => option.value === selectedUser.branchId)) {
    options.unshift({
      value: selectedUser.branchId,
      label: selectedUser.branchName || selectedUser.branchCode || selectedUser.branchId
    });
  }

  return options;
};

export const buildCreateUserBody = (data: UserPayloadFormValues): AddUserReq => ({
  username: data.username,
  password: data.password || '',
  email: data.email,
  role: data.roleId || '',
  branchId: data.branchId || undefined
});

export const buildEditUserBody = (userId: string, data: UserPayloadFormValues): EditUserReq => ({
  userId,
  status: data.status,
  branchId: data.branchId || undefined
});
