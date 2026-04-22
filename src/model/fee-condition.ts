import { PaginationReq, PaginationRes, ResultBase } from 'model/common';

export interface CreateFeeConditionParam {
  code?: string;
  name?: string;
  mappingNoteMsg?: string;
  description?: string;
  dataType?: string;
  dataSource?: string;
  dataField?: string;
  status?: string;
  note?: string;
  tableValue?: string;
  keyword?: string;
}

export interface SearchFeeConditionParam extends PaginationReq, CreateFeeConditionParam {}

export interface FeeCondition {
  id: string;
  code: string;
  name: string;
  mappingNoteMsg: string;
  description: string;
  dataType: any;
  dataSource: string;
  dataField: string;
  status: string;
  note: string;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
  tableValue: string;
}

export interface GetListFeeConditionRes extends ResultBase<PaginationRes<FeeCondition>> {}

export interface SearchFeeConditionRes extends ResultBase<PaginationRes<FeeCondition>> {}

export interface CreateFeeConditionRes extends ResultBase<unknown> {}

export interface UpdateFeeConditionRes extends ResultBase<string> {}

export interface DeleteFeeConditionRes extends ResultBase<string> {}

export interface DownloadFeeConditionRes extends ResultBase<string> {}
export interface FeeConditionDataField extends ResultBase<{ dataField: string[] }> {}

export enum DATA_TYPE_FEE_COND {
  DATE = 'DATE',
  TIME = 'TIME',
  STRING = 'STRING',
  NUMBER = 'NUMBER'
}

export enum STATUS_FEE_COND {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'IN_ACTIVE'
}

export enum DATA_SOURCE_FEE_COND {
  API = 'API',
  ETL = 'ETL'
}
export enum TBL_SOURCE_FEE_COND {
  CUSTOMER = 'CUSTOMER',
  ACCOUNT = 'ACCOUNT',
  CARD = 'CARD'
}
