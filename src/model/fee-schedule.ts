import { PaginationRes, ResultBase } from 'model/common';
import { FeeCodeRoot } from './fee-code';

export interface FeeScheduleState {
  loading: boolean;
  feeScheduleList: FeeScheduleList[];
  totalElements: number;
  feeScheduleDetail: FeeScheduleDetail;
  changedFeeCodes: string[];
}

export interface FeeScheduleList {
  feeScheduleId?: string;
  feeScheduleCode?: string;
  feeScheduleName?: string;
  documentName?: string;
  documentCode?: string;
  issueDate: string;
  effectiveDate: string;
  status?: string;
  createdBy: string;
  createdAt?: string;
  updatedBy: string;
  updatedAt?: string;
  dateType?: string;
  feeCodes?: string[];
  expiryDate?: string;
  linkEDoc?: string;
}

export interface FeeScheduleListBody {
  page?: number;
  size?: number;
  feeScheduleCode?: string;
  feeScheduleName?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  documentCode?: string;
  documentName?: string;
  customerType?: string;
  filter?: string;
  dateType?: string;
}

export interface FeeScheduleDetail {
  feeScheduleId?: string;
  feeScheduleCode?: string;
  feeScheduleName?: string;
  documentName?: string;
  documentCode?: string;
  issueDate?: string;
  effectiveDate?: string;
  status?: string;
  approvedAt?: string;
  approvedBy?: string;
  feeCodes?: string[];
  expiryDate?: string;
  linkEDoc?: string;
}

export interface FeeScheduleDetailBody {
  feeScheduleId?: string;
  feeScheduleCode?: string;
  feeScheduleName?: string;
  documentName?: string;
  documentCode?: string;
  issueDate?: string;
  effectiveDate?: string;
  status?: string;
  approvedAt?: string;
  approvedBy?: string;
  feeCodes?: string[];
  expiryDate?: string;
  linkEDoc?: string;
}

export interface ChangeFeeCode {
  sourceFeeScheduleId?: string;
  targetFeeScheduleId?: string;
  feeCodes?: string[];
  sourceFeeScheduleName?: string;
  sourceFeeScheduleCode?: string;
  sourceIssueDate?: string;
  sourceEffectiveDate?: string;
  sourceExpiryDate?: string;
  sourceDocumentCode?: string;
  sourceDocumentName?: string;
  sourceLinkEDoc?: string;
  targetFeeScheduleName?: string;
  targetFeeScheduleCode?: string;
  targetIssueDate?: string;
  targetEffectiveDate?: string;
  targetExpiryDate?: string;
  targetDocumentCode?: string;
  targetDocumentName?: string;
  targetLinkEDoc?: string;
}

export interface ChangeFeeCodeBody {
  sourceFeeScheduleId?: string;
  targetFeeScheduleId?: string;
  feeCodes?: string[];
}

export interface ChangeFeeCodeDetail {
  requestId: string;
  status: string;
  sourceFeeSchedule: SourceFeeSchedule;
  targetFeeSchedule: TargetFeeSchedule;
  feeCodes: string[];
}

export interface SourceFeeSchedule {
  feeScheduleId: string;
  feeScheduleCode: string;
  feeScheduleName: string;
  status: string;
}

export interface TargetFeeSchedule {
  feeScheduleId: string;
  feeScheduleCode: string;
  feeScheduleName: string;
  status: string;
}

export interface FeeScheduleListResponse extends ResultBase<PaginationRes<FeeScheduleList>> {}
export interface CreateFeeScheduleResponse extends ResultBase<FeeScheduleDetail> {}
export interface UpdateFeeScheduleResponse extends ResultBase<FeeScheduleDetail> {}
export interface FeeScheduleDetailResponse extends ResultBase<FeeScheduleDetail> {}
export interface DownloadListFeeScheduleResponse extends ResultBase<string> {}
export interface ChangeFeeCodeResponse extends ResultBase<ChangeFeeCode> {}
export interface ChangeFeeCodeDetailResponse extends ResultBase<ChangeFeeCodeDetail> {}
export interface DownloadFeeCodeByFeeScheduleResponse
  extends ResultBase<{
    base64Data: string;
  }> {}
export interface UploadFeeCodeResponse
  extends ResultBase<{
    data: FeeCodeRoot[];
    base64: string;
  }> {}
