import { createDeepEqualSelector } from '@redux-common';
import { initialRole } from '@redux-slice/role';
import { RootState } from '@store/all-reducers';

const selectDomain = (state: RootState) => state?.role || initialRole;

export const selectRoleLoadingList = createDeepEqualSelector(
  selectDomain,
  (role) => role.loadingList
);

export const selectRoleLoadingDetail = createDeepEqualSelector(
  selectDomain,
  (role) => role.loadingDetail
);

export const selectRoleList = createDeepEqualSelector(selectDomain, (role) => role.roleList);

export const selectRoleTotal = createDeepEqualSelector(selectDomain, (role) => role.total);

export const selectPermissionList = createDeepEqualSelector(
  selectDomain,
  (role) => role.permissionList
);
