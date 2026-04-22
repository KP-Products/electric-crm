import appServices from '@app-services';
import { ApiResponse } from 'model/common';
import {
  CreateJobResponse,
  DownloadExecutionLogResponse,
  DownloadJobListResponse,
  JobDetailResponse,
  JobHistoryResponse,
  JobList,
  JobListBody,
  JobListResponse,
  RerunJobResponse,
  UpdateJobResponse
} from 'model/job-management';
import { ApiConstants } from './networking/app-apis';

async function getListJob(body?: JobListBody): Promise<ApiResponse<JobListResponse>> {
  try {
    const { data } = await appServices.post(ApiConstants.JOBS_LIST, body);
    return data;
  } catch (error: any) {
    return error;
  }
}

async function getDetailJob(id: string | number): Promise<ApiResponse<JobDetailResponse>> {
  try {
    const { data } = await appServices.post(ApiConstants.JOBS_DETAIL, { id });
    return data;
  } catch (error: any) {
    return error;
  }
}

async function createJob(body: JobList): Promise<ApiResponse<CreateJobResponse>> {
  try {
    const { data } = await appServices.post(ApiConstants.JOBS, body);
    return data;
  } catch (error: any) {
    return error;
  }
}

async function updateJob(body: JobList): Promise<ApiResponse<UpdateJobResponse>> {
  try {
    const { data } = await appServices.post(ApiConstants.JOBS_UPDATE, body);
    return data;
  } catch (error: any) {
    return error;
  }
}

async function getListExcutionLog(body?: JobListBody): Promise<ApiResponse<JobHistoryResponse>> {
  try {
    const { data } = await appServices.post(ApiConstants.EXECUTION_LOGS, body);
    return data;
  } catch (error: any) {
    return error;
  }
}

async function rerunJob(id: string | number): Promise<ApiResponse<RerunJobResponse>> {
  try {
    const { data } = await appServices.post(ApiConstants.RERUN_JOBS, { id });
    return data;
  } catch (error: any) {
    return error;
  }
}

async function downloadJobList(body?: JobListBody): Promise<ApiResponse<DownloadJobListResponse>> {
  try {
    const { data } = await appServices.post(ApiConstants.DOWNLOAD_JOB_LIST, body);
    return data;
  } catch (error: any) {
    return error;
  }
}

async function downloadExecutionLog(
  body?: JobListBody
): Promise<ApiResponse<DownloadExecutionLogResponse>> {
  try {
    const { data } = await appServices.post(ApiConstants.DOWNLOAD_EXECUTION_LOG, body);
    return data;
  } catch (error: any) {
    return error;
  }
}

const jobManagementServices = {
  getListJob,
  getDetailJob,
  createJob,
  updateJob,
  getListExcutionLog,
  rerunJob,
  downloadJobList,
  downloadExecutionLog
};

export default jobManagementServices;
