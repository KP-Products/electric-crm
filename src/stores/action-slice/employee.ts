import {
  ADD_EMPLOYEE_SALARY_HISTORY,
  CREATE_EMPLOYEE,
  DELETE_EMPLOYEE,
  DELETE_EMPLOYEE_AVATAR,
  DELETE_EMPLOYEE_CONTRACT_FILE,
  DELETE_EMPLOYEE_SALARY_HISTORY,
  GET_EMPLOYEE_DETAIL,
  SEARCH_EMPLOYEES,
  UPDATE_EMPLOYEE,
  UPLOAD_EMPLOYEE_AVATAR,
  UPLOAD_EMPLOYEE_CONTRACT_FILE
} from '@redux-action-type/employee';
import { createAction, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ErrorBase } from 'model/common';
import {
  AddSalaryHistoryReq,
  CreateEmployeeReq,
  DeleteEmployeeRes,
  Employee,
  EmployeeIdReq,
  EmployeeRes,
  EmployeeWithHistory,
  EmployeeWithHistoryRes,
  SalaryHistoryIdReq,
  SearchEmployeesReq,
  SearchEmployeesRes,
  UpdateEmployeeReq,
  UploadEmployeeFileReq
} from 'model/employee';
import { SLICE_NAME } from 'stores/types';

export interface EmployeeState {
  employeeList: Employee[];
  selectedEmployee?: EmployeeWithHistory;
  total: number;
  loadingList: boolean;
  loadingDetail: boolean;
}

export const initialEmployee: EmployeeState = {
  employeeList: [],
  selectedEmployee: undefined,
  total: 0,
  loadingList: false,
  loadingDetail: false
};

const employeeSlice = createSlice({
  name: SLICE_NAME.EMPLOYEE,
  initialState: initialEmployee,
  reducers: {
    reset: () => initialEmployee,
    setLoadingList: (state, { payload }: PayloadAction<boolean>) => {
      state.loadingList = payload;
    },
    setLoadingDetail: (state, { payload }: PayloadAction<boolean>) => {
      state.loadingDetail = payload;
    },
    setEmployeeList: (state, { payload }: PayloadAction<Employee[]>) => {
      state.employeeList = payload;
    },
    setSelectedEmployee: (state, { payload }: PayloadAction<EmployeeWithHistory | undefined>) => {
      state.selectedEmployee = payload;
    },
    setTotal: (state, { payload }: PayloadAction<number>) => {
      state.total = payload;
    }
  }
});

const searchEmployees = createAction(
  SEARCH_EMPLOYEES,
  (
    body: SearchEmployeesReq,
    onSuccess?: (data: SearchEmployeesRes) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

const createEmployee = createAction(
  CREATE_EMPLOYEE,
  (
    body: CreateEmployeeReq,
    onSuccess?: (data: EmployeeWithHistoryRes) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

const updateEmployee = createAction(
  UPDATE_EMPLOYEE,
  (
    body: UpdateEmployeeReq,
    onSuccess?: (data: EmployeeWithHistoryRes) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

const getEmployeeDetail = createAction(
  GET_EMPLOYEE_DETAIL,
  (
    body: EmployeeIdReq,
    onSuccess?: (data: EmployeeWithHistoryRes) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

const deleteEmployee = createAction(
  DELETE_EMPLOYEE,
  (
    body: EmployeeIdReq,
    onSuccess?: (data: DeleteEmployeeRes) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

const uploadEmployeeAvatar = createAction(
  UPLOAD_EMPLOYEE_AVATAR,
  (
    body: UploadEmployeeFileReq,
    onSuccess?: (data: EmployeeRes) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

const deleteEmployeeAvatar = createAction(
  DELETE_EMPLOYEE_AVATAR,
  (
    body: EmployeeIdReq,
    onSuccess?: (data: EmployeeRes) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

const uploadEmployeeContractFile = createAction(
  UPLOAD_EMPLOYEE_CONTRACT_FILE,
  (
    body: UploadEmployeeFileReq,
    onSuccess?: (data: EmployeeRes) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

const deleteEmployeeContractFile = createAction(
  DELETE_EMPLOYEE_CONTRACT_FILE,
  (
    body: EmployeeIdReq,
    onSuccess?: (data: EmployeeRes) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

const addSalaryHistory = createAction(
  ADD_EMPLOYEE_SALARY_HISTORY,
  (
    body: AddSalaryHistoryReq,
    onSuccess?: (data: EmployeeWithHistoryRes) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

const deleteSalaryHistory = createAction(
  DELETE_EMPLOYEE_SALARY_HISTORY,
  (
    body: SalaryHistoryIdReq,
    onSuccess?: (data: DeleteEmployeeRes) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

export const employeeActions = {
  ...employeeSlice.actions,
  searchEmployees,
  createEmployee,
  updateEmployee,
  getEmployeeDetail,
  deleteEmployee,
  uploadEmployeeAvatar,
  deleteEmployeeAvatar,
  uploadEmployeeContractFile,
  deleteEmployeeContractFile,
  addSalaryHistory,
  deleteSalaryHistory
};

export const employeeReducer = employeeSlice.reducer;
