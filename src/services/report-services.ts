import appServices from '@app-services';
import { ApiResponse } from 'model/common';
import { ExportReportRequest, ReportCatalog, ReportFileResponse } from 'model/report';
import { ApiConstants } from './networking/app-apis';

const getFileName = (contentDisposition?: string, fallback = 'bao-cao.xlsx') =>
  contentDisposition?.match(/filename\*=UTF-8''([^;]+)/i)?.[1] ||
  contentDisposition?.match(/filename="?([^";]+)"?/i)?.[1] ||
  fallback;

async function getCatalog(): Promise<ApiResponse<ReportCatalog> & { data?: ReportCatalog }> {
  try {
    const response = await appServices.get(ApiConstants.REPORT_CATALOG);
    return response.data as ApiResponse<ReportCatalog> & { data?: ReportCatalog };
  } catch (error: any) {
    return error;
  }
}

async function exportReport(request: ExportReportRequest): Promise<ReportFileResponse> {
  try {
    const response = await appServices.post(ApiConstants.REPORT_EXPORT, request, {
      responseType: 'blob'
    });
    return {
      data: response.data,
      fileName: decodeURIComponent(getFileName(response.headers['content-disposition']))
    };
  } catch (error: any) {
    return error;
  }
}

const reportServices = { getCatalog, exportReport };

export default reportServices;
