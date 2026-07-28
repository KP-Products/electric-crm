import { PaginationReq, PaginationRes, ResultBase } from './common';

export enum EMPLOYEE_GENDER {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER'
}

export enum EMPLOYMENT_STATUS {
  ACTIVE = 'ACTIVE',
  PROBATION = 'PROBATION',
  RESIGNED = 'RESIGNED',
  SUSPENDED = 'SUSPENDED'
}

export enum EMPLOYMENT_TYPE {
  FULL_TIME = 'FULL_TIME',
  PART_TIME = 'PART_TIME',
  CONTRACT = 'CONTRACT',
  SEASONAL = 'SEASONAL'
}

export enum SALARY_CHANGE_TYPE {
  SALARY_INCREASE = 'SALARY_INCREASE',
  SALARY_DECREASE = 'SALARY_DECREASE',
  PROMOTION = 'PROMOTION',
  ADJUSTMENT = 'ADJUSTMENT'
}

export interface Employee {
  id: number;
  employeeCode?: string;
  fullName?: string;
  dateOfBirth?: string;
  gender?: string;
  phone?: string;
  email?: string;
  identityNumber?: string;
  identityIssueDate?: string;
  identityIssuePlace?: string;
  taxCode?: string;
  socialInsuranceNo?: string;
  permanentAddress?: string;
  currentAddress?: string;
  departmentCode?: string;
  departmentName?: string;
  positionCode?: string;
  positionName?: string;
  managerId?: number;
  hireDate?: string;
  officialDate?: string;
  resignationDate?: string;
  employmentStatus?: string;
  employmentType?: string;
  basicSalary?: number;
  qualifications?: string;
  bankName?: string;
  bankAccountNumber?: string;
  bankAccountName?: string;
  avatarUrl?: string;
  note?: string;
  contractFileName?: string;
  contractFilePath?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface EmployeeSalaryHistory {
  id: number;
  employeeId?: number;
  oldBasicSalary?: number;
  newBasicSalary?: number;
  effectiveDate?: string;
  endDate?: string;
  changeType?: string;
  decisionNumber?: string;
  decisionDate?: string;
  reason?: string;
  note?: string;
  approvedBy?: number;
  approvedByName?: string;
  approvedByUsername?: string;
  createdBy?: number;
  createdAt?: string;
}

export interface EmployeeWithHistory {
  employee?: Employee;
  salaryHistory?: EmployeeSalaryHistory[];
}

export interface SearchEmployeesReq extends PaginationReq {
  employeeCode?: string;
  fullName?: string;
  departmentCode?: string;
  positionCode?: string;
  employmentStatus?: string;
}

export interface CreateEmployeeReq {
  employeeCode: string;
  fullName: string;
  dateOfBirth?: string;
  gender?: string;
  phone?: string;
  email?: string;
  identityNumber?: string;
  identityIssueDate?: string;
  identityIssuePlace?: string;
  taxCode?: string;
  socialInsuranceNo?: string;
  permanentAddress?: string;
  currentAddress?: string;
  departmentCode?: string;
  departmentName?: string;
  positionCode?: string;
  positionName?: string;
  managerId?: number;
  hireDate?: string;
  officialDate?: string;
  resignationDate?: string;
  employmentStatus?: string;
  employmentType?: string;
  basicSalary?: number;
  qualifications?: string;
  bankName?: string;
  bankAccountNumber?: string;
  bankAccountName?: string;
  note?: string;
}

export interface UpdateEmployeeReq extends Omit<Partial<CreateEmployeeReq>, 'employeeCode'> {
  id: number;
}

export interface EmployeeIdReq {
  id: number;
}

export interface UploadEmployeeFileReq extends EmployeeIdReq {
  file: File;
}

export interface AddSalaryHistoryReq {
  employeeId: number;
  oldBasicSalary?: number;
  newBasicSalary: number;
  effectiveDate: string;
  endDate?: string;
  changeType?: string;
  decisionNumber?: string;
  decisionDate?: string;
  reason?: string;
  note?: string;
  approvedBy?: number;
  createdBy?: number;
}

export interface SalaryHistoryIdReq {
  id: number;
}

export interface EmployeeRes extends ResultBase<Employee> {}

export interface EmployeeWithHistoryRes extends ResultBase<EmployeeWithHistory> {}

export interface SearchEmployeesRes extends ResultBase<PaginationRes<Employee>> {}

export interface DeleteEmployeeRes extends ResultBase<void> {}
