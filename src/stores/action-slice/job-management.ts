import {
  CREATE_JOB,
  DOWNLOAD_EXECUTION_LOG,
  DOWNLOAD_JOB_LIST,
  GET_DETAIL_JOB,
  GET_LIST_EXECUTION_LOG,
  GET_LIST_JOB,
  RERUN_JOB,
  UPDATE_JOB
} from '@redux-action-type/job-management';
import { createAction, createSlice } from '@reduxjs/toolkit';
import { ErrorBase } from 'model/common';
import {
  CreateJobResponse,
  DownloadExecutionLogResponse,
  DownloadJobListResponse,
  JobDetailResponse,
  JobHistoryResponse,
  JobList,
  JobListBody,
  JobListResponse,
  JobManagementState,
  RerunJobResponse,
  UpdateJobResponse
} from 'model/job-management';
import { SLICE_NAME } from 'stores/types';

export const initialJobManagement: JobManagementState = {
  loading: false,
  jobList: [],
  executionLogs: [],
  jobDetail: {}
};

export const jobManagementSlice = createSlice({
  name: SLICE_NAME.JOB_MANAGEMENT,
  initialState: initialJobManagement,
  reducers: {
    reset: () => initialJobManagement,
    onChangeState: (state, { payload }: { payload: Partial<JobManagementState> }) => {
      return { ...state, ...payload };
    }
  }
});

const getListJob = createAction(
  GET_LIST_JOB,
  (
    body?: JobListBody,
    onSuccess?: (response: JobListResponse) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

const getListExcutionLog = createAction(
  GET_LIST_EXECUTION_LOG,
  (
    body?: JobListBody,
    onSuccess?: (response: JobHistoryResponse) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

const createJob = createAction(
  CREATE_JOB,
  (
    body: JobList,
    onSuccess?: (response: CreateJobResponse) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

const updateJob = createAction(
  UPDATE_JOB,
  (
    body: JobList,
    onSuccess?: (response: UpdateJobResponse) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

const getDetailJob = createAction(
  GET_DETAIL_JOB,
  (
    id: string | number,
    onSuccess?: (response: JobDetailResponse) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({
    payload: { id, onSuccess, onFailed }
  })
);

const rerunJob = createAction(
  RERUN_JOB,
  (
    id: string | number,
    onSuccess?: (response: RerunJobResponse) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({
    payload: { id, onSuccess, onFailed }
  })
);

const downloadJobList = createAction(
  DOWNLOAD_JOB_LIST,
  (
    body?: JobListBody,
    onSuccess?: (response: DownloadJobListResponse) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

const downloadExecutionLog = createAction(
  DOWNLOAD_EXECUTION_LOG,
  (
    body?: JobListBody,
    onSuccess?: (response: DownloadExecutionLogResponse) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

export const jobManagementActions = {
  ...jobManagementSlice.actions,
  getListJob,
  getListExcutionLog,
  createJob,
  updateJob,
  getDetailJob,
  rerunJob,
  downloadJobList,
  downloadExecutionLog
};
