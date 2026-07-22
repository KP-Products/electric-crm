import { createDeepEqualSelector } from '@redux-common';
import { initialEmployee } from '@redux-slice/employee';
import { RootState } from '@store/all-reducers';

const selectDomain = (state: RootState) => state?.employee || initialEmployee;

export const selectEmployeeList = createDeepEqualSelector(
  selectDomain,
  (employee) => employee.employeeList
);

export const selectEmployeeTotal = createDeepEqualSelector(
  selectDomain,
  (employee) => employee.total
);

export const selectEmployeeLoadingList = createDeepEqualSelector(
  selectDomain,
  (employee) => employee.loadingList
);

export const selectEmployeeLoadingDetail = createDeepEqualSelector(
  selectDomain,
  (employee) => employee.loadingDetail
);

export const selectSelectedEmployee = createDeepEqualSelector(
  selectDomain,
  (employee) => employee.selectedEmployee
);
