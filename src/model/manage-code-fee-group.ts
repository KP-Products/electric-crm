import { ResultBase } from 'model/common';

export interface GroupCodeFeeState {
  loading: boolean;
  groupCodeFeeList: GroupCodeFeeList[];
}

export interface GroupCodeFeeList {
  id?: string;
  code?: string;
  groupName?: string;
  priority?: number | string;
  frequency?: string;
  collectDate?: string;
  feeCode?: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;

  collectType?: string;
  dataTable?: string;
  dataField?: string;
}

export interface GroupCodeFeeListBody {
  keyword?: string;
}

export interface GroupCodeFeeListResponse extends ResultBase<GroupCodeFeeList[]> {}
export interface GroupCodeFeeDetailResponse extends ResultBase<GroupCodeFeeList> {}
export interface CreateGroupCodeFeeResponse extends ResultBase<GroupCodeFeeList> {}
export interface UpdateGroupCodeFeeResponse extends ResultBase<GroupCodeFeeList> {}
export interface DeleteGroupCodeFeeResponse extends ResultBase<GroupCodeFeeList> {}
export interface DownloadGroupCodeFeeResponse extends ResultBase<string> {}
