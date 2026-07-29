import { ErrorBase, ResultBase } from './common';

export interface PaymentStatementRow {
  payId: number;
  periodCode?: string;
  invoiceNo?: string;
  customerCode?: string;
  customerName?: string;
  paymentAmount?: number;
  transactionDate?: string;
  accountingDate?: string;
  sourceAccount?: string;
  destinationAccount?: string;
  transactionNo?: string;
  description?: string;
  fileId?: number;
  createdAt?: string;
  createdBy?: string;
  createdByName?: string;
}

export interface SearchPaymentStatementsReq {
  periodCode?: string;
  customerCode?: string;
  invoiceNo?: string;
  paymentDateFrom?: string;
  paymentDateTo?: string;
  page: number;
  size: number;
}

export interface SearchPaymentStatementsData {
  items: PaymentStatementRow[];
  total: number;
  page: number;
  size: number;
}

export interface SearchPaymentStatementsRes extends ResultBase<SearchPaymentStatementsData> {}

export interface CreatePaymentStatementReq {
  customerCode: string;
  invoiceNo?: string;
  periodCode?: string;
  paymentAmount: number;
  transactionDate: string;
  accountingDate?: string;
  sourceAccount?: string;
  destinationAccount?: string;
  transactionNo: string;
  description?: string;
}

export interface UpdatePaymentStatementReq
  extends Omit<Partial<CreatePaymentStatementReq>, 'customerCode'> {
  payId: number;
}

export interface PaymentStatementIdReq {
  payId: number;
}

export interface PaymentStatementRes extends ResultBase<PaymentStatementRow> {}

export interface PaymentStatementFileRes extends ErrorBase {
  data?: Blob;
  fileName?: string;
}

export interface PaymentUploadPreviewRow {
  rowNumber?: number;
  periodCode?: string;
  invoiceNo?: string;
  customerCode?: string;
  customerName?: string;
  paymentAmount?: number;
  transactionDate?: string;
  accountingDate?: string;
  sourceAccount?: string;
  destinationAccount?: string;
  transactionNo?: string;
  description?: string;
  errors?: string[];
}

export interface PaymentUploadResult {
  success?: boolean;
  total?: number;
  valid?: number;
  invalid?: number;
  rowCount?: number;
  rows?: PaymentUploadPreviewRow[];
  errors?: string[];
  fileError?: string;
}

export interface UploadPaymentStatementReq {
  file: File;
}
export interface UploadPaymentStatementRes extends ResultBase<PaymentUploadResult> {}
