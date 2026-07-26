import { PaginationReq, PaginationRes, ResultBase } from './common';

export interface PpeItemHistory {
  id: number;
  ppeItemId?: number;
  itemCode?: string;
  itemName?: string;
  employeeId?: number;
  employeeName?: string;
  exportDate?: string;
  quantity?: number;
  note?: string;
  type?: string;
  exportEmployeeId?: number;
  exportEmployeeName?: string;
}

export interface SearchPpeItemHistoryReq extends PaginationReq {
  ppeItemId?: number;
  employeeId?: number;
  exportDate?: string;
  type?: string;
  exportEmployeeId?: number;
}

export interface CreatePpeItemHistoryReq {
  ppeItemId: number;
  employeeId: number;
  exportEmployeeId: number;
  exportDate?: string;
  quantity?: number;
  note?: string;
  type?: string;
}

export interface UpdatePpeItemHistoryReq extends Partial<CreatePpeItemHistoryReq> {
  id: number;
}

export interface PpeItemHistoryIdReq {
  id: number;
}

export interface SearchPpeItemHistoryRes extends ResultBase<PaginationRes<PpeItemHistory>> {}

export interface PpeItemHistoryRes extends ResultBase<PpeItemHistory> {}

export interface DeletePpeItemHistoryRes extends ResultBase<void> {}
