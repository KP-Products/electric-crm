import { PaginationReq, PaginationRes, ResultBase } from './common';

export interface SystemParameter {
  id: string;
  paramKey: string;
  paramValue?: string;
  description?: string;
  /** Kiểu dữ liệu lưu ở DB — màn hình không quản lý, chỉ giữ để gửi lại khi cập nhật. */
  paraType?: string;
  createdAt?: string;
  createdBy?: string;
  createdByName?: string;
  updatedAt?: string;
  updatedBy?: string;
  updatedByName?: string;
}

export interface SearchSystemParameterReq extends PaginationReq {
  paramKey?: string;
  paramValue?: string;
}

export interface CreateSystemParameterReq {
  paramKey: string;
  paramValue?: string;
  description?: string;
  paraType?: string;
}

export interface UpdateSystemParameterReq extends CreateSystemParameterReq {
  id: string;
}

export interface SystemParameterIdReq {
  id: string;
}

export interface SystemParameterRes extends ResultBase<SystemParameter> {}

export interface SearchSystemParameterRes extends ResultBase<PaginationRes<SystemParameter>> {}

export interface DeleteSystemParameterRes extends ResultBase<void> {}
