import { FeeCodeRoot } from 'model/fee-code';
import { PaginationReq } from 'model/common';

export interface ProductRoot {
  id: string;
  code: string;
  name: string;
  level: number;
  parentCode: string;
  fromDate?: string;
  toDate?: string;
  root: FeeCodeRoot;
  path?: string[];
}

export interface Product {
  id: string;
  code: string;
  listCodeFee?: FeeCodeRoot[] | null;
  level?: number;
  name?: string;
  status?: string;
  parentCode?: string | null;
  fromDate?: string;
  toDate?: string;
  createdBy?: string;
  createdAt?: string;
  updatedBy?: string | null;
  updatedAt?: string;
  approvedAt?: string;
  approvedBy?: string;
  totalCount?: number;
  description?: string;
  rootCode?: string;
  listChild?: Product[];
  parentName?: string;
  // hanlde FE
  more?: boolean;
  bbRequestId?: string;
}

export interface ProductFilter extends PaginationReq {
  name?: string;
  level?: number;
  fromDate?: string;
  toDate?: string;
  search?: string;
}

export interface ProductDownload extends Omit<ProductFilter, 'page' | 'size'> {}

export interface UpdateProduct extends CreateProduct {
  code?: string;
  bbRequestId?: string;
}
export interface CreateProduct {
  name?: string;
  parentCode?: string;
  fromDate?: string;
  toDate?: string;
  description?: string;
}

export interface ChangeFeeProductItemReq {
  productCode: string; // productCode mới
  feeCode: string;
}
export interface ChangeFeeProductReq {
  feeMappingRequests: ChangeFeeProductItemReq[];
}

export const PRODUCT_LEVEL = 'PRODUCT_LEVEL';
export const PRODUCT_ACTION = {
  ADD_NEW: 'ADD_NEW',
  ADD_FEE: 'ADD_FEE',
  CHANGE_FEE: 'CHANGE_FEE',
  EDIT: 'EDIT',
  VIEW: 'VIEW'
};
