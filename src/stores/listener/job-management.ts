import { takeLatestListeners } from '@listener';
import { jobManagementActions } from '@redux-slice/job-management';
import jobManagementServices from 'services/job-management-services';
import { isSuccess } from 'services/networking/app-helper';

takeLatestListeners({
  actionCreator: jobManagementActions.getListJob,
  effect: async ({ payload }, listenerApi) => {
    listenerApi.dispatch(jobManagementActions.onChangeState({ loading: true }));

    const res = await jobManagementServices.getListJob(payload?.body);

    listenerApi.dispatch(
      jobManagementActions.onChangeState({
        jobList: res?.data ?? []
      })
    );

    if (isSuccess(res)) {
      payload?.onSuccess?.(res);
    } else {
      payload?.onFailed?.(res);
    }

    listenerApi.dispatch(jobManagementActions.onChangeState({ loading: false }));
  }
});

takeLatestListeners({
  actionCreator: jobManagementActions.getListExcutionLog,
  effect: async ({ payload }, listenerApi) => {
    listenerApi.dispatch(jobManagementActions.onChangeState({ loading: true }));

    const res = await jobManagementServices.getListExcutionLog(payload?.body);

    listenerApi.dispatch(
      jobManagementActions.onChangeState({
        executionLogs: res?.data ?? []
      })
    );

    if (isSuccess(res)) {
      payload?.onSuccess?.(res);
    } else {
      payload?.onFailed?.(res);
    }

    listenerApi.dispatch(jobManagementActions.onChangeState({ loading: false }));
  }
});

takeLatestListeners({
  actionCreator: jobManagementActions.createJob,
  effect: async ({ payload }, listenerApi) => {
    listenerApi.dispatch(jobManagementActions.onChangeState({ loading: true }));

    const res = await jobManagementServices.createJob(payload?.body);

    if (isSuccess(res)) {
      payload?.onSuccess?.(res);
    } else {
      payload?.onFailed?.(res);
    }

    listenerApi.dispatch(jobManagementActions.onChangeState({ loading: false }));
  }
});

takeLatestListeners({
  actionCreator: jobManagementActions.updateJob,
  effect: async ({ payload }, listenerApi) => {
    listenerApi.dispatch(jobManagementActions.onChangeState({ loading: true }));

    const res = await jobManagementServices.updateJob(payload?.body);

    if (isSuccess(res)) {
      payload?.onSuccess?.(res);
    } else {
      payload?.onFailed?.(res);
    }

    listenerApi.dispatch(jobManagementActions.onChangeState({ loading: false }));
  }
});

takeLatestListeners({
  actionCreator: jobManagementActions.getDetailJob,
  effect: async ({ payload }, listenerApi) => {
    listenerApi.dispatch(jobManagementActions.onChangeState({ loading: true }));

    const res = await jobManagementServices.getDetailJob(payload?.id);

    listenerApi.dispatch(
      jobManagementActions.onChangeState({
        jobDetail: res?.data ?? {}
      })
    );

    if (isSuccess(res)) {
      payload?.onSuccess?.(res);
    } else {
      payload?.onFailed?.(res);
    }

    listenerApi.dispatch(jobManagementActions.onChangeState({ loading: false }));
  }
});

takeLatestListeners({
  actionCreator: jobManagementActions.rerunJob,
  effect: async ({ payload }, listenerApi) => {
    listenerApi.dispatch(jobManagementActions.onChangeState({ loading: true }));

    const res = await jobManagementServices.rerunJob(payload?.id);

    if (isSuccess(res)) {
      payload?.onSuccess?.(res);
    } else {
      payload?.onFailed?.(res);
    }

    listenerApi.dispatch(jobManagementActions.onChangeState({ loading: false }));
  }
});

takeLatestListeners({
  actionCreator: jobManagementActions.downloadJobList,
  effect: async ({ payload }, listenerApi) => {
    listenerApi.dispatch(jobManagementActions.onChangeState({ loading: true }));

    const res = await jobManagementServices.downloadJobList(payload?.body);

    if (isSuccess(res)) {
      payload?.onSuccess?.(res);
    } else {
      payload?.onFailed?.(res);
    }

    listenerApi.dispatch(jobManagementActions.onChangeState({ loading: false }));
  }
});

takeLatestListeners({
  actionCreator: jobManagementActions.downloadExecutionLog,
  effect: async ({ payload }, listenerApi) => {
    listenerApi.dispatch(jobManagementActions.onChangeState({ loading: true }));

    const res = await jobManagementServices.downloadExecutionLog(payload?.body);

    if (isSuccess(res)) {
      payload?.onSuccess?.(res);
    } else {
      payload?.onFailed?.(res);
    }

    listenerApi.dispatch(jobManagementActions.onChangeState({ loading: false }));
  }
});
