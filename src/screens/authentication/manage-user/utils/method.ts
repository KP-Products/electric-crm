import { UserSearchItem } from 'model/user';
import { UserFilterForm } from 'screens/authentication/manage-user/components/UserFilterDrawer';

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
