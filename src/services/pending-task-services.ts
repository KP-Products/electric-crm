import { ApiResponse, PaginationRes, ResultBase } from 'model/common';
import appServices from '@app-services';
import { ApiConstants } from 'services/networking/app-apis';
import {
  FilterMyTask,
  HistoryTaskData,
  HistoryTaskReq,
  PendingTask,
  RejectTaskReq,
  TaskDetailReq
} from 'model/pending-task';

async function getMyRequest(
  param: FilterMyTask
): Promise<ApiResponse<ResultBase<PaginationRes<PendingTask>>>> {
  try {
    const rs = await appServices.post(ApiConstants.MY_REQUEST_LIST, param);
    const data = rs.data;
    return data;
  } catch (error: any) {
    return error;
  }
}

async function getTaskPendings(
  param: FilterMyTask
): Promise<ApiResponse<ResultBase<PaginationRes<PendingTask>>>> {
  try {
    const rs = await appServices.post(ApiConstants.TASK_APPROVE_LIST, param);
    const data = rs.data;
    return data;
  } catch (error: any) {
    return error;
  }
}

async function getTaskDetail(param: TaskDetailReq): Promise<ApiResponse<ResultBase<PendingTask>>> {
  try {
    const rs = await appServices.post(ApiConstants.TASK_DETAIL, param);
    const data = rs.data;
    return data;
  } catch (error: any) {
    return error;
  }
}

async function approveTask(id: string): Promise<
  ApiResponse<
    ResultBase<{
      success: boolean;
    }>
  >
> {
  try {
    const rs = await appServices.post(ApiConstants.APPROVE_TASK, { requestId: id });
    const data = rs.data;
    return data;
  } catch (error: any) {
    return error;
  }
}

async function rejectTask(param: RejectTaskReq): Promise<
  ApiResponse<
    ResultBase<{
      success: boolean;
    }>
  >
> {
  try {
    const rs = await appServices.post(ApiConstants.REJECT_TASK, param);
    const data = rs.data;
    return data;
  } catch (error: any) {
    return error;
  }
}

async function deleteTask(id: string): Promise<
  ApiResponse<
    ResultBase<{
      success: boolean;
    }>
  >
> {
  try {
    const rs = await appServices.post(ApiConstants.DELETE_TASK, { requestId: id });
    const data = rs.data;
    return data;
  } catch (error: any) {
    return error;
  }
}

async function historyTask(
  param: HistoryTaskReq
): Promise<ApiResponse<ResultBase<HistoryTaskData[]>>> {
  try {
    const rs = await appServices.post(ApiConstants.HISTORY_TASK, param);
    const data = rs.data;
    return data;
  } catch (error: any) {
    return error;
  }
}

const pendingTaskServices = {
  getMyRequest,
  getTaskPendings,
  getTaskDetail,
  approveTask,
  rejectTask,
  deleteTask,
  historyTask
};

export default pendingTaskServices;
