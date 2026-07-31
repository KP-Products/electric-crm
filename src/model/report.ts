export type ReportCode = 'SALES' | 'PURCHASE' | 'PURCHASE_SALES' | 'CUSTOMER_CONSUMPTION';
export type ReportPeriodMode = 'THANG_NAY' | 'THANG_TRUOC' | 'QUY_NAY' | 'NAM_NAY' | 'TUY_CHON';

export interface ReportOption {
  code: string;
  name: string;
  isDefault?: boolean;
}

export interface ReportType {
  code: ReportCode;
  name: string;
  filters: Array<'customerCode' | 'feederCode'>;
}

export interface ReportCatalog {
  reportTypes: ReportType[];
  periodModes: ReportOption[];
}

export interface ExportReportRequest {
  reportType: ReportCode;
  periodMode: ReportPeriodMode;
  fromDate?: string;
  toDate?: string;
  customerCode?: string;
  feederCode?: string;
}

export interface ReportFileResponse {
  data?: Blob;
  fileName?: string;
}
