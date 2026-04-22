import { createDeepEqualSelector } from '@redux-common';
import { initialUser } from '@redux-slice/user';
import { RootState } from '@store/all-reducers';

const selectDomain = (state: RootState) => state?.user || initialUser;

export const selectUserLoadingList = createDeepEqualSelector(
  selectDomain,
  (user) => user.loadingList
);

export const selectUserLoadingDetail = createDeepEqualSelector(
  selectDomain,
  (user) => user.loadingDetail
);

export const selectUserList = createDeepEqualSelector(selectDomain, (user) => user.userList);

export const selectUnitList = createDeepEqualSelector(selectDomain, (user) => user.unitList);

export const selectDepartmentList = createDeepEqualSelector(
  selectDomain,
  (user) => user.departmentList
);
