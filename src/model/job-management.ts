import { ResultBase } from 'model/common';

export interface JobManagementState {
  loading: boolean;
  jobList: JobList[];
  executionLogs: JobHistory[];
  jobDetail: JobList;
}

export interface JobList {
  id?: string;
  priority?: number | string;
  jobName?: string;
  description?: string;
  groupCodeFee?: string;
  jobType?: string;
  startTime?: string;
  endTime?: string;
  scheduleType?: string;
  cronExpression?: string;
  status?: string;
  action?: string;
  createdAt?: string;
  collectDate?: string;
}

export interface JobListBody {
  jobName?: string;
  jobType?: string;
  status?: string;
  isToday?: boolean;
  fromDate?: string;
  toDate?: string;
}

export interface JobHistory {
  id: string;
  job: JobList;
  startTime: string;
  endTime: string;
  status: string;
  executedNum: number;
  executedMessage: string;
  executedBy: string;
  createdAt: string;
}

export interface JobListResponse extends ResultBase<JobList[]> {}
export interface JobHistoryResponse extends ResultBase<JobHistory[]> {}
export interface CreateJobResponse extends ResultBase<JobList> {}
export interface UpdateJobResponse extends ResultBase<JobList> {}
export interface JobDetailResponse extends ResultBase<JobList> {}
export interface RerunJobResponse extends ResultBase<string> {}
export interface DownloadJobListResponse extends ResultBase<string> {}
export interface DownloadExecutionLogResponse extends ResultBase<string> {}
