import { User } from 'model/user';
import { UserFilterForm } from 'screens/authentication/manage-user/components/UserFilterDrawer';

export const filterUser = (userList: User[], filterApplied: Partial<UserFilterForm>) => {
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
    const matchUnit = !filterApplied.unitId || user.unit?.id === filterApplied.unitId;
    const matchDepartment =
      !filterApplied.departmentId || user.department?.id === filterApplied.departmentId;
    const matchStatus = !filterApplied.status || user.status === filterApplied.status;
    const matchRole = !filterApplied.roleId || user.roleGroup?.roleId === filterApplied.roleId;
    return (
      matchUsername &&
      matchFullName &&
      matchEmail &&
      matchUnit &&
      matchDepartment &&
      matchStatus &&
      matchRole
    );
  });
};
