export interface PaginationReq {
  page: number;
  size: number;
}

export interface PaginationRes<T> {
  items: T[];
  page: number;
  size: number;
  total: number;
  totalPages: number;
}

export interface ErrorBase {
  businessErrorCode?: string;
  businessErrorMessage?: string;
  detailMessage?: string;
  message?: string;
  systemErrorCode?: string;
  systemErrorMessage?: string;
}

export interface ResultBase<T = unknown> {
  codeStatus?: string;
  code?: string;
  message?: string;
  timestamp?: string;
  data?: T;
}

export type ApiResponse<T = unknown> = ErrorBase & ResultBase & T;

export enum TYPE_STATUS {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE'
}
