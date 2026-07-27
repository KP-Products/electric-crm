import appServices from '@app-services';
import { ApiResponse } from 'model/common';
import {
  AttachmentIdReq,
  ConfirmReadingsReq,
  ConfirmReadingsRes,
  CreateReadingPeriodReq,
  CreateReadingPeriodRes,
  DeleteReadingPeriodReq,
  DeleteReadingPeriodRes,
  ExportReadingRecordReq,
  ExportReadingRecordRes,
  GetReadingPeriodReq,
  GetReadingPeriodRes,
  MeterSearchForReadingReq,
  MeterSearchForReadingRes,
  PeriodIdReq,
  ReadingPhotoFileRes,
  ReadingPhotoListRes,
  ReadingPhotoRes,
  RejectReadingReq,
  RejectReadingRes,
  ReviewReadingsReq,
  ReviewReadingsRes,
  SearchReadingPeriodsReq,
  SearchReadingPeriodsRes,
  UploadReadingPhotoReq,
  UpdateReadingPeriodReq,
  UpdateReadingPeriodRes
} from 'model/manual-meter-reading';
import { ApiConstants } from './networking/app-apis';

const getFileNameFromDisposition = (contentDisposition?: string) => {
  if (!contentDisposition) return undefined;

  const utf8FileName = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i)?.[1];
  if (utf8FileName) return decodeURIComponent(utf8FileName);

  return contentDisposition.match(/filename="?([^";]+)"?/i)?.[1];
};

async function searchMetersForReading(
  params: MeterSearchForReadingReq
): Promise<ApiResponse<MeterSearchForReadingRes>> {
  try {
    const rs = await appServices.post(ApiConstants.BILLING_READING_METER_SEARCH, params);
    return rs.data;
  } catch (error: any) {
    return error;
  }
}

async function searchReadingPeriods(
  params: SearchReadingPeriodsReq
): Promise<ApiResponse<SearchReadingPeriodsRes>> {
  try {
    const rs = await appServices.post(ApiConstants.BILLING_READING_PERIOD_SEARCH, params);
    return rs.data;
  } catch (error: any) {
    return error;
  }
}

async function getReadingPeriod(
  params: GetReadingPeriodReq
): Promise<ApiResponse<GetReadingPeriodRes>> {
  try {
    const rs = await appServices.post(ApiConstants.BILLING_READING_PERIOD_GET, params);
    return rs.data;
  } catch (error: any) {
    return error;
  }
}

async function createReadingPeriod(
  params: CreateReadingPeriodReq
): Promise<ApiResponse<CreateReadingPeriodRes>> {
  try {
    const rs = await appServices.post(ApiConstants.BILLING_READING_PERIOD_CREATE, params);
    return rs.data;
  } catch (error: any) {
    return error;
  }
}

async function updateReadingPeriod(
  params: UpdateReadingPeriodReq
): Promise<ApiResponse<UpdateReadingPeriodRes>> {
  try {
    const rs = await appServices.post(ApiConstants.BILLING_READING_PERIOD_UPDATE, params);
    return rs.data;
  } catch (error: any) {
    return error;
  }
}

async function deleteReadingPeriod(
  params: DeleteReadingPeriodReq
): Promise<ApiResponse<DeleteReadingPeriodRes>> {
  try {
    const rs = await appServices.post(ApiConstants.BILLING_READING_PERIOD_DELETE, params);
    return rs.data;
  } catch (error: any) {
    return error;
  }
}

async function reviewReadings(params: ReviewReadingsReq): Promise<ApiResponse<ReviewReadingsRes>> {
  try {
    const rs = await appServices.post(ApiConstants.BILLING_READING_PERIOD_REVIEW, params);
    return rs.data;
  } catch (error: any) {
    return error;
  }
}

async function confirmReadings(
  params: ConfirmReadingsReq
): Promise<ApiResponse<ConfirmReadingsRes>> {
  try {
    const rs = await appServices.post(ApiConstants.BILLING_READING_PERIOD_CONFIRM, params);
    return rs.data;
  } catch (error: any) {
    return error;
  }
}

async function rejectReading(params: RejectReadingReq): Promise<ApiResponse<RejectReadingRes>> {
  try {
    const rs = await appServices.post(ApiConstants.BILLING_READING_PERIOD_REJECT, params);
    return rs.data;
  } catch (error: any) {
    return error;
  }
}

async function uploadReadingPhoto(
  params: UploadReadingPhotoReq
): Promise<ApiResponse<ReadingPhotoRes>> {
  try {
    const formData = new FormData();
    formData.append('file', params.file);

    const rs = await appServices.post(ApiConstants.BILLING_READING_PHOTO_UPLOAD, formData, {
      params: { periodId: params.periodId }
    });
    return rs.data;
  } catch (error: any) {
    return error;
  }
}

async function listReadingPhotos(params: PeriodIdReq): Promise<ApiResponse<ReadingPhotoListRes>> {
  try {
    const rs = await appServices.post(ApiConstants.BILLING_READING_PHOTO_LIST, params);
    return rs.data;
  } catch (error: any) {
    return error;
  }
}

async function deleteReadingPhoto(params: AttachmentIdReq): Promise<ApiResponse> {
  try {
    const rs = await appServices.post(ApiConstants.BILLING_READING_PHOTO_DELETE, params);
    return rs.data;
  } catch (error: any) {
    return error;
  }
}

async function viewReadingPhoto(id: number): Promise<ReadingPhotoFileRes> {
  try {
    const rs = await appServices.get(ApiConstants.BILLING_READING_PHOTO_VIEW, {
      params: { id },
      responseType: 'blob'
    });

    return {
      data: rs.data,
      fileName: getFileNameFromDisposition(rs.headers['content-disposition'])
    };
  } catch (error: any) {
    return error;
  }
}

async function exportReadingRecord(
  params: ExportReadingRecordReq
): Promise<ExportReadingRecordRes> {
  try {
    const rs = await appServices.post(ApiConstants.BILLING_READING_PERIOD_EXPORT_RECORD, params, {
      responseType: 'blob'
    });

    return {
      data: rs.data,
      fileName:
        getFileNameFromDisposition(rs.headers['content-disposition']) ||
        `bien-ban-ghi-chi-so-${params.periodId}.pdf`
    };
  } catch (error: any) {
    return error;
  }
}

const manualMeterReadingServices = {
  searchMetersForReading,
  searchReadingPeriods,
  getReadingPeriod,
  createReadingPeriod,
  updateReadingPeriod,
  deleteReadingPeriod,
  reviewReadings,
  confirmReadings,
  rejectReading,
  uploadReadingPhoto,
  listReadingPhotos,
  deleteReadingPhoto,
  viewReadingPhoto,
  exportReadingRecord
};

export default manualMeterReadingServices;
