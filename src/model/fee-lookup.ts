import { ResultBase } from 'model/common';

export interface FeeLookupState {
  loading: boolean;
  feeCollectionHistory: FeeLookupList[];
  feeCollectionEstimate: FeeLookupList[];
}

export interface FeeLookupList {
  id?: string;
  transRefcif?: string;
  feeAccNo?: string;
  feeCode?: string;
  productName?: string;
  feeScheduleName?: string;
  productCode?: string;
  feeOperatorType?: string;
  baseAmount?: number;
  vat?: number;
  feeAmountOriginal?: number;
  collectionDate?: string;
  branchName?: string;
  branchCode?: string;
  accNo?: string;
  cardNo?: string;
  cardToken?: string;
  feeAmountVnd?: number;
  valueTrans?: number;
  status?: string;
  feeScheduleCode?: string;
}

export interface FeeLookupBody {
  cif?: string;
  feeScheduleId?: string;
  productCode?: string;
  feeCode?: string;
  fromDate?: string;
  toDate?: string;
}

export interface DownloadLookupBody {
  feeCodeIds?: string[];
  estimateIds?: string[];
  historyIds?: string[];
}

export interface FeeLookupListResponse extends ResultBase<FeeLookupList[]> {}
export interface DownloadLookupResponse
  extends ResultBase<{
    base64Data: string;
  }> {}
