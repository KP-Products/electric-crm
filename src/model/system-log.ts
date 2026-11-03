import { PaginationReq, PaginationRes, ResultBase } from './common';

export type LogJsonValue =
  | string
  | number
  | boolean
  | null
  | LogJsonValue[]
  | { [key: string]: LogJsonValue };

export interface SystemLog {
  id: number;
  changeId?: string;
  entityName?: string;
  action?: string;
  oldData?: LogJsonValue;
  newData?: LogJsonValue;
  changedFields?: LogJsonValue;
  changedBy?: string;
  changedAt?: string;
}

export interface SystemLogHistoryReq extends PaginationReq {
  /** Với entityName = customers, dùng customerCode, không dùng ID số của khách hàng. */
  changeId: string;
  entityName: string;
}

export interface SystemLogHistoryRes extends ResultBase<PaginationRes<SystemLog>> {}
