import { createAction, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SLICE_NAME } from 'stores/types';
import { ErrorBase } from 'model/common';
import { DEFAULT_PAGE_SIZE, K_SIZE_1 } from '@constant';
import {
  FilterMyTask,
  HistoryTaskData,
  HistoryTaskReq,
  PendingTask,
  PendingTaskListRes,
  RejectTaskReq,
  TaskDetailReq
} from 'model/pending-task';
import {
  APPROVE_TASK,
  DELETE_TASK,
  HISTORY_TASK,
  MY_REQUEST_LIST,
  REJECT_TASK,
  TASK_APPROVE_LIST,
  TASK_DETAIL
} from '@redux-action-type/pending-task-type';

export interface PendingTaskState {
  myRequests?: PendingTask[];
  myRequestLoading: boolean;
  approvalList?: PendingTask[];
  approvalListLoading: boolean;
  filter: FilterMyTask;
  optionFeature?: { value: string; label: string }[];
}

export const initialPending: PendingTaskState = {
  myRequestLoading: false,
  approvalListLoading: false,
  filter: {
    page: K_SIZE_1,
    size: DEFAULT_PAGE_SIZE
  }
};

const pendingTaskSlice = createSlice({
  name: SLICE_NAME.PENDING_TASK,
  initialState: initialPending,
  reducers: {
    reset: () => initialPending,
    setMyRequests: (state, { payload }: PayloadAction<PendingTask[] | undefined>) => {
      state.myRequests = payload;
    },
    setMyRequestLoading: (state, { payload }: PayloadAction<boolean>) => {
      state.myRequestLoading = payload;
    },
    setApprovalList: (state, { payload }: PayloadAction<PendingTask[] | undefined>) => {
      state.approvalList = payload;
    },
    setApprovalListLoading: (state, { payload }: PayloadAction<boolean>) => {
      state.approvalListLoading = payload;
    },
    setFilter: (state, { payload }: PayloadAction<FilterMyTask>) => {
      state.filter = payload;
    },
    setFieldFilter: (
      state,
      { payload }: PayloadAction<{ key: keyof FilterMyTask; value: string | number }>
    ) => {
      const { key, value } = payload;
      state.filter = {
        ...state.filter,
        [key]: value
      };
    },
    setOptionFeature: (
      state,
      { payload }: PayloadAction<{ value: string; label: string }[] | undefined>
    ) => {
      state.optionFeature = payload;
    }
  }
});

const getMyRequests = createAction(
  MY_REQUEST_LIST,
  (
    body: FilterMyTask,
    onSuccess?: (data: PendingTaskListRes) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

const getApprovalList = createAction(
  TASK_APPROVE_LIST,
  (
    body: FilterMyTask,
    onSuccess?: (data: PendingTaskListRes) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

const getApprovalDetail = createAction(
  TASK_DETAIL,
  (
    body: TaskDetailReq,
    onSuccess?: (data: PendingTask) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

const approveTask = createAction(
  APPROVE_TASK,
  (
    body: string,
    onSuccess?: (success: boolean) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

const rejectTask = createAction(
  REJECT_TASK,
  (
    body: RejectTaskReq,
    onSuccess?: (success: boolean) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

const deleteTask = createAction(
  DELETE_TASK,
  (
    body: string,
    onSuccess?: (success: boolean) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

const historyTask = createAction(
  HISTORY_TASK,
  (
    body: HistoryTaskReq,
    onSuccess?: (data: HistoryTaskData[]) => void,
    onFailed?: (error?: ErrorBase) => void
  ) => ({
    payload: { body, onSuccess, onFailed }
  })
);

export const pendingTaskActions = {
  ...pendingTaskSlice.actions,
  getMyRequests,
  getApprovalList,
  getApprovalDetail,
  approveTask,
  rejectTask,
  deleteTask,
  historyTask
};

export const pendingTaskReducer = pendingTaskSlice.reducer;
