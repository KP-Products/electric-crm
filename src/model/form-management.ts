import { PaginationRes, ResultBase } from 'model/common';

export interface FormManagementState {
  loading: boolean;
  formManagementList: FormManagementList[];
  totalElements: number;
  sourceTable: string[];
}

export interface FormManagementList {
  templateId?: string;
  templateCode?: string;
  templateName?: string;
  sourceTable?: string;
  title?: string;
  content?: string;
}

export interface FormManagementListBody {
  page?: number;
  size?: number;
  filter?: string;
}

export interface FormManagementDetail {
  templateId?: string;
  templateCode?: string;
  templateName?: string;
  sourceTable?: string;
  title?: string;
  content?: string;
}

export interface FormManagementDetailBody {
  templateId?: string;
  templateCode?: string;
  templateName?: string;
  sourceTable?: string;
  title?: string;
  content?: string;
}

export interface FormManagementListResponse extends ResultBase<PaginationRes<FormManagementList>> {}
export interface FormManagementDetailResponse extends ResultBase<FormManagementDetail> {}
export interface CreateFormManagementResponse extends ResultBase<FormManagementDetail> {}
export interface UpdateFormManagementResponse extends ResultBase<FormManagementDetail> {}
export interface SourceTableResponse extends ResultBase<string[]> {}
