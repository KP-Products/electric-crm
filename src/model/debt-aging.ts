import { ErrorBase, ResultBase } from './common';

export type DebtPayStatus = 'UNPAID' | 'PARTIAL' | 'PAID';

export interface DebtAgingRequest {
  periodFrom: string;
  periodTo: string;
  customerCode?: string;
}

export interface DebtAgingSummary {
  totalCount?: number;
  totalDebt?: number;
  notYetDueCount?: number;
  notYetDueAmount?: number;
  overdueCount?: number;
  overdueAmount?: number;
  over90Count?: number;
  over90Amount?: number;
  totalExpectedPenalty?: number;
}

export interface DebtAgingRow {
  periodCode?: string;
  invoiceNo?: string;
  customerCode?: string;
  customerName?: string;
  noticeDate?: string;
  dueDate?: string;
  paymentDate?: string | null;
  payStatus?: DebtPayStatus;
  overdueDays?: number;
  ageDays?: number;
  debtAmount?: number;
  expectedPenalty?: number;
}

export interface DebtAgingData {
  summary?: DebtAgingSummary;
  rows?: DebtAgingRow[];
}

export interface DebtAgingRes extends ResultBase<DebtAgingData> {}

export interface DebtAgingFileRes extends ErrorBase {
  data?: Blob;
  fileName?: string;
}
