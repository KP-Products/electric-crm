import { PaginationReq, PaginationRes, ResultBase } from './common';

export interface OperationPrice {
  id: number;
  priceCode?: string;
  priceName?: string;
  contractNumber?: string;
  customerCode?: string;
  customerName?: string;
  unitPrice?: number;
  discountType?: string;
  discountValue?: number;
  effectiveFrom?: string;
  effectiveTo?: string;
  description?: string;
  status?: number | string;
  createdBy?: string;
  createdAt?: string;
  updatedBy?: string;
  updatedAt?: string;
}

export interface SearchOperationPricesReq extends PaginationReq {
  priceCode?: string;
  priceName?: string;
  status?: number;
  effectiveFrom?: string;
  effectiveTo?: string;
}

export interface OperationPriceIdReq {
  id: number;
}

export interface CreateOperationPriceReq {
  priceName: string;
  contractNumber: string;
  unitPrice: number;
  discountType?: string;
  discountValue?: number;
  effectiveFrom: string;
  effectiveTo?: string;
  description?: string;
}

export interface UpdateOperationPriceReq {
  id: number;
  priceName?: string;
  unitPrice?: number;
  discountType?: string | null;
  discountValue?: number | null;
  effectiveFrom?: string;
  effectiveTo?: string | null;
  description?: string | null;
  status?: number;
}

export interface ContractLookupReq {
  contractNumber: string;
}

export interface ContractLookup {
  contractNumber?: string;
  customerCode?: string;
  customerName?: string;
}

export interface SearchOperationPricesRes extends ResultBase<PaginationRes<OperationPrice>> {}

export interface OperationPriceRes extends ResultBase<OperationPrice> {}

export interface DeleteOperationPriceRes extends ResultBase<void> {}

export interface ContractLookupRes extends ResultBase<ContractLookup> {}
