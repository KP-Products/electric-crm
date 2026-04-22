import { PaginationReq } from 'model/common';

export interface PendingTask {
  actionId?: string;
  actionName?: string;
  createAt?: string;
  createdBy?: string;
  operationType?: string;
  requestId?: string;
  status?: string;
  transactionId?: string;
  note?: string;
  actionSubGroup?: string;
  departmentCode?: string;
  departmentName?: string;
}

export interface PendingTaskDetail extends PendingTask {
  dataDetail?: any;
}

export interface FilterMyTask extends PaginationReq, Omit<PendingTask, 'transactionId' | 'status'> {
  status?: string[];
}

export interface TaskDetailReq {
  taskType: string;
  transactionId: string;
}

export interface HistoryTaskReq {
  mainCode: string;
  actionId: string;
}

export interface RejectTaskReq {
  requestId: string;
  reason: string;
}

export interface HistoryTaskData {
  approvalLevel: number;
  fullName: string;
  unitName: string;
  departmentName: string;
  status: string;
  comment: string;
  createdAt: string;
}
export const ACTION_TYPES = {
  CREATE: 'CREATE',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
  CONVERT_FEE_CODE: 'CONVERT_FEE_CODE'
};
