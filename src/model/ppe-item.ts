import { PaginationReq, PaginationRes, ResultBase } from './common';

export interface PpeItem {
  id: number;
  itemCode?: string;
  itemName?: string;
  category?: string;
  unit?: string;
  quantity?: number;
  importDate?: string;
  exportDate?: string;
  employeeId?: number;
  status?: string;
  note?: string;
  createBy?: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SearchPpeItemsReq extends PaginationReq {
  itemCode?: string;
  itemName?: string;
  category?: string;
  status?: string;
  employeeId?: number;
}

export interface CreatePpeItemReq {
  itemCode: string;
  itemName: string;
  category?: string;
  unit?: string;
  quantity?: number;
  importDate?: string;
  exportDate?: string;
  employeeId?: number;
  status?: string;
  note?: string;
}

export interface UpdatePpeItemReq extends Omit<Partial<CreatePpeItemReq>, 'itemCode'> {
  id: number;
}

export interface PpeItemIdReq {
  id: number;
}

export interface SearchPpeItemsRes extends ResultBase<PaginationRes<PpeItem>> {}

export interface PpeItemRes extends ResultBase<PpeItem> {}

export interface DeletePpeItemRes extends ResultBase<void> {}
