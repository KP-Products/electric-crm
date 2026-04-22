import i18next from 'i18next';
import { PaginationReq } from 'model/common';
import { Product } from 'model/product';

export interface FeeCodeRoot {
  id?: string;
  name?: string;
  code?: string;
}

export interface FeeCode extends FeeCodeRoot, FeeCodeFieldDetail {
  createdBy?: string | null;
  createdAt?: string;
  updatedBy?: string | null;
  updatedAt?: string | null;
  deleted?: boolean;
  feeFormulaId?: string | null;
  status?: string;
  productServiceCatalog?: Product;
  approvedAt?: string;
  approvedBy?: string;
  feeCode?: string;
  productCode?: string;

  requestId?: string;
  isMyTask?: boolean;
  operationType?: string;
}

export interface FeeCodeFieldDetail {
  id?: string;
  transactionCode?: string;
  currency?: string;
  vatAmount?: string;
  isIncludeVAT?: boolean;
  customerType?: string;
  feeOperatorType?: string;
  postingCode?: string;
  note?: string;

  collectTargetType?: string;
  declareByCustomerSegment?: boolean;
  frequency?: string;
  collectionDay?: string;
  minMaxCurrency?: string;

  feeCodeConditionInformations?: FeeConditionInformation[];
  feeCodeRuleInformations?: FeeCodeRuleInformation[];
}

export interface CreateFeeCode extends FeeCodeFieldDetail {
  name: string;
  status: string;
  feeCode: string;
  productCode?: string;
  // for update
  bbRequestId?: string;
}
export interface CreateFeeCodeRes {
  feeCode?: string;
  name?: string;
  status?: string;
}

export interface UpdateStatusFeeCode {
  id: string;
  status: string;
}

export interface FeeConditionInformation {
  type: string;
  feeConditionCode: string;
  feeConditionId: string;
  operator: string;
  value: string;
  name?: string;
  description?: string;
  dataType?: string;
  status?: string;
  id?: string;
}

export interface FeeCodeRuleInformation {
  customerSegmentType?: string;
  cif?: string;
  formulaExpressionText?: string;
  minimumAmount?: string;
  maximumAmount?: string;
}

export interface FeeCodeByCifRequest {
  cif: string;
}

export interface FeeFormulaSearch extends PaginationReq {
  keyword?: string;
}
export interface FeeFormulaCreate {
  code: string;
  name: string;
  note: string;
  formulaExpression: string[];
  status?: string;
}
export interface FeeFormulaUpdate extends FeeFormulaCreate {
  id: string;
}

export interface FeeFormula {
  id?: string;
  code?: string;
  name?: string;
  status?: string;
  formulaExpression?: string[];
  note?: string;
  createdAt?: string;
  createdBy?: string;
  updateAt?: string;
  updateBy?: string;
}

export interface MasterDataCusType {
  id: string;
  name?: string;
  description?: string;
  status?: string;
  code?: string;
}

export interface MasterDataCusSegment extends MasterDataCusType {
  formula?: string;
  min?: string;
  max?: string;
}

export enum FEE_CODE_STATUS {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  AWAIT_ASSIGN = 'AWAIT_ASSIGN',
  DELETED = 'DELETED',
  AWAIT_APPROVE = 'AWAIT_APPROVE',
  REJECTED = 'REJECTED',
  APPROVE = 'APPROVE'
}

export const FEE_CODE_STATUS_OPTION = [
  { value: FEE_CODE_STATUS.ACTIVE, label: i18next.t('common:status_active') },
  { value: FEE_CODE_STATUS.INACTIVE, label: i18next.t('common:status_inactive2') },
  { value: FEE_CODE_STATUS.AWAIT_ASSIGN, label: i18next.t('common:status_await_assign') },
  { value: FEE_CODE_STATUS.DELETED, label: i18next.t('common:cancel') },
  {
    value: FEE_CODE_STATUS.AWAIT_APPROVE,
    label: i18next.t('common:status_await_approve')
  },
  {
    value: FEE_CODE_STATUS.REJECTED,
    label: i18next.t('common:status_reject_approve')
  },
  {
    value: FEE_CODE_STATUS.APPROVE,
    label: i18next.t('common:status_approved')
  }
];

export const CUSTOMER_TYPE = {
  KHCN: 'KHCN',
  CBNV: 'CBNV',
  KHTC: 'KHTC',
  DNSN: 'DNSN'
};

export const FEE_CONDITION_TYPE = {
  CUSTOMER: 'CUSTOMER',
  TRANSACTION: 'TRANSACTION',
  CARD: 'CARD',
  ACCOUNT: 'ACCOUNT'
};

export enum ACTION_FEE_CODE {
  SEE = 'see',
  CREATE = 'create',
  EDIT = 'edit',
  VIEW = 'view'
}
