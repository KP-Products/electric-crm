import appServices from '@app-services';
import { ApiResponse, ResultBase } from 'model/common';
import {
  FilterMyTask,
  PendingTaskListRes,
  RejectTaskReq,
} from 'model/pending-task';
import { ApiConstants } from 'services/networking/app-apis';

async function getMyRequest(
  param: FilterMyTask
): Promise<ApiResponse<ResultBase<PendingTaskListRes>>> {
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
): Promise<ApiResponse<ResultBase<PendingTaskListRes>>> {
  try {
    const rs = await appServices.post(ApiConstants.TASK_APPROVE_LIST, param);
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


const pendingTaskServices = {
  getMyRequest,
  getTaskPendings,
  approveTask,
  rejectTask,
  deleteTask,
};

export default pendingTaskServices;
