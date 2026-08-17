import { PaginationReq, PaginationRes, ResultBase } from './common';

export type BillStatus = 'CHO_DUYET' | 'CONFIRMED';
export type BillPayStatus = 'UNPAID' | 'PAID';
export type BillNoticeType = 'DIEN' | 'CSPK' | 'BOTH';

export interface Bill {
  id: number;
  periodId?: number;
  /** Mã khách hàng cũ lưu trên hóa đơn (bigint), không phải customers.customer_code */
  customerId?: number;
  /** Mã / tên / địa chỉ khách hàng BE join sẵn qua công tơ → hợp đồng mua bán điện */
  customerCode?: string;
  customerName?: string;
  address?: string;
  meterNumber?: string;
  periodCode?: string;
  totalKwh?: number;
  amountBeforeVat?: number;
  vatAmount?: number;
  totalAmount?: number;
  totalKwhReactive?: string;
  cosAnpha?: number;
  kNumber?: number;
  amountReactive?: number;
  vatAmountReactive?: number;
  totalAmountReactive?: number;
  invoiceNo?: string;
  noticeDate?: string;
  dueDate?: string;
  payStatus?: BillPayStatus | string;
  status?: BillStatus | string;
  createdAt?: string;
}

export interface BillDetailItem {
  id?: number;
  tou?: string;
  kwh?: number;
  unitPrice?: number;
  amount?: number;
  oldIndex?: number;
  newIndex?: number;
  multiplier?: number;
}

export interface BillDetail {
  bill?: Bill;
  details?: BillDetailItem[];
}

export interface SearchBillsReq extends PaginationReq {
  periodCode?: string;
  customerId?: number;
  meterNumber?: string;
  status?: BillStatus;
  payStatus?: BillPayStatus;
}

export interface SearchBillsRes extends ResultBase<PaginationRes<Bill>> {}

export interface CreateBillForPeriodReq {
  periodId: number;
  voltageLevel: string;
  vatRate?: number;
}

export interface BillResponse {
  bill?: Bill;
  details?: BillDetailItem[];
}

export interface BillRes extends ResultBase<BillResponse> {}

export interface BillDetailReq {
  billId?: number;
  periodId?: number;
}

export interface BillDetailRes extends ResultBase<BillDetail> {}

export interface ConfirmBillReq {
  billId: number;
}

export interface ConfirmBillResponse {
  bill?: Bill;
  mailSent?: boolean;
  mailNote?: string;
}

export interface ConfirmBillRes extends ResultBase<ConfirmBillResponse> {}

export interface ExportBillNoticeReq {
  billId: number;
  type?: BillNoticeType;
}

export interface ExportBillNoticeRes {
  data?: Blob;
  fileName?: string;
  businessErrorMessage?: string;
  systemErrorMessage?: string;
  detailMessage?: string;
  message?: string;
}
