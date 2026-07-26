import {
  DEFAULT_PAGE_SIZE,
  K_SIZE_0,
  K_SIZE_1,
  K_SIZE_120,
  K_SIZE_160,
  K_SIZE_180,
  K_SIZE_200,
  K_SIZE_8,
  NULL_VALUE
} from '@constant';
import { GET_LIST_APPROVAL_FUNCTION } from '@redux-action-type/approval-matrix';
import {
  APPROVE_TASK,
  DELETE_TASK,
  MY_REQUEST_LIST,
  REJECT_TASK,
  TASK_APPROVE_LIST
} from '@redux-action-type/pending-task-type';
import { dispatch } from '@redux-common';
import { selectPendingTaskOptionFeature } from '@redux-selector/pending-task-selector';
// import { feeCodeActions } from '@redux-slice/fee-code-slice';
import { pendingTaskActions } from '@redux-slice/pending-task-slice';
// import { productActions } from '@redux-slice/product-slice';
import { Flex, InputRef } from 'antd';
import TagFilter from 'components/tag-filter';
import { TextBase } from 'components/text';
import { showToast } from 'components/toast';
import { TYPE_TOAST } from 'components/toast/type';
import _ from 'lodash';
import { GetListApprovalFunctionRes } from 'model/approval-matrix';
import { ErrorBase } from 'model/common';
import { FEE_CODE_STATUS, FEE_CODE_STATUS_OPTION } from 'model/fee-code';
import {
  ACTION_TYPES,
  FilterMyTask,
  PendingTask,
  PendingTaskListRes,
  RejectTaskReq
} from 'model/pending-task';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
// import FeeCodeStatus from 'screens/authentication/products-and-code-fee/components/FeeCodeStatus';
import { appCodes } from 'utils/constant/appCodes';
import { displayDateFromServer, displayDateTimeFromServer, normalizeDateToApi } from 'utils/date';
import { DebugUtils } from 'utils/debug-utils';
import { I18nKeys, useAppTranslation } from 'utils/i18n';
import { PERMISSION_APPROVE_ACTION } from 'utils/permission.util';
import { showDialog } from 'components/dialog';
import { AppTextField } from 'components/text-field';
import { TYPE_ACTION, TYPE_MESSAGE } from 'components/dialog/type';

export default function useMyPendingHook(props?: { isPendingTask?: boolean }) {
  const { isPendingTask } = props || {};
  const { t } = useAppTranslation();
  const reasonRef = useRef<InputRef>(null);

  const defaultFilterCode: FilterMyTask = useMemo(
    () => ({
      actionId: '',
      actionName: '',
      createAt: '',
      createdBy: '',
      operationType: '',
      requestId: '',
      status: [],

      page: K_SIZE_1,
      size: DEFAULT_PAGE_SIZE
    }),
    []
  );

  const ACTION_KEYS = {
    APPROVE: 'APPROVE',
    REJECT: 'REJECT',
    EDIT: 'EDIT',
    DELETE: 'DELETE'
  };

  const optionFeature = useSelector(selectPendingTaskOptionFeature);
  const fecthPermissionApprove = useCallback(() => {
    dispatch({
      type: GET_LIST_APPROVAL_FUNCTION,
      payload: {
        onSuccess: (res: GetListApprovalFunctionRes) => {
          const options = res.data?.map((per) => ({
            value: per.action,
            label: per.actionSubGroupName
          }));
          dispatch(pendingTaskActions.setOptionFeature(options));
        },
        onFailed: (_error?: ErrorBase) => {}
      }
    });
  }, []);

  const optionAction = [
    {
      value: ACTION_TYPES.CREATE,
      label: t('common:add_new')
    },
    {
      value: ACTION_TYPES.UPDATE,
      label: t('common:edit')
    },
    {
      value: ACTION_TYPES.DELETE,
      label: t('common:delete')
    },
    {
      value: ACTION_TYPES.CONVERT_FEE_CODE,
      label: t('product:change_fee')
    }
  ];

  const [filter, setFilter] = useState<FilterMyTask>(defaultFilterCode);
  const [filterApplied, setFilterApplied] = useState<FilterMyTask>(defaultFilterCode);
  const [total, setTotal] = useState<number>(K_SIZE_0);
  const [dataFilter, setDataFilter] = useState<PendingTask[]>([]);

  const setFieldFilter = useCallback(
    (key: keyof FilterMyTask | string, value: string | number | string[]) => {
      setFilter((pre) => ({ ...pre, [key]: value }));
    },
    []
  );

  const setFieldFilterApplied = useCallback(
    (key: keyof FilterMyTask | string, value: string | number | string[]) => {
      setFieldFilter(key, value);
      setFilterApplied((pre) => ({ ...pre, [key]: value }));
    },
    [setFieldFilter]
  );

  const onApplyFilter = useCallback(() => {
    setFilterApplied({
      ...filter,
      page: K_SIZE_1
    });
  }, [filter]);

  const onResetFilter = useCallback(
    (key?: keyof FilterMyTask) => {
      if (!key) {
        setFilter(defaultFilterCode);
        setFilterApplied(defaultFilterCode);
        return;
      }

      const valueReset: string | number | string[] =
        key === 'status' ? [] : key === 'page' ? K_SIZE_1 : key === 'size' ? DEFAULT_PAGE_SIZE : '';

      setFilter((pre) => ({ ...pre, [key]: valueReset, page: K_SIZE_1 }));
      setFilterApplied((pre) => ({ ...pre, [key]: valueReset, page: K_SIZE_1 }));
    },
    [defaultFilterCode]
  );

  const pagination = useMemo(
    () => ({
      current: filterApplied.page,
      total: total,
      pageSize: DEFAULT_PAGE_SIZE,
      onChange: (page: number) => {
        setFieldFilterApplied('page', page);
      },
      showSizeChanger: false
    }),
    [filterApplied.page, setFieldFilterApplied, total]
  );

  // const permissionList = useSelector(selectPermissionList);
  const fetchTasks = useCallback(() => {
    const body: FilterMyTask = {
      actionId: filterApplied.actionId || undefined,
      actionName: filterApplied.actionName || undefined,
      createAt: normalizeDateToApi(filterApplied.createAt) || undefined,
      createdBy: filterApplied.createdBy || undefined,
      operationType: filterApplied.operationType || undefined,
      requestId: filterApplied.requestId || undefined,
      status:
        filterApplied?.status && filterApplied?.status?.length > K_SIZE_0
          ? filterApplied.status
          : undefined,
      page: filterApplied.page - K_SIZE_1,
      size: filterApplied.size
    };
    dispatch({
      type: isPendingTask ? TASK_APPROVE_LIST : MY_REQUEST_LIST,
      payload: {
        body: body,
        onSuccess: (res: PendingTaskListRes) => {
          DebugUtils.logS([
            `${isPendingTask ? 'TASK_APPROVE_LIST' : 'MY_REQUEST_LIST'} data:`,
            res
          ]);

          setDataFilter(_.uniqBy(res?.content || res?.items || [], 'requestId'));
          setTotal(res?.totalElements || res?.total || K_SIZE_0);
        },
        onFailed: (error?: ErrorBase) => {
          DebugUtils.logS([
            `${isPendingTask ? 'TASK_APPROVE_LIST' : 'MY_REQUEST_LIST'}  error:`,
            error
          ]);
          showToast({
            type: TYPE_TOAST.ERROR,
            content: t('common:msg_failed', { action: t('common:get_list') })
          });
        }
      }
    });
  }, [filterApplied, isPendingTask, t]);

  const onApprove = ({
    id,
    action,
    onDone
  }: {
    id: string;
    action?: string;
    onDone?: () => void;
  }) => {
    dispatch({
      type: APPROVE_TASK,
      payload: {
        body: id,
        onSuccess: (res: boolean) => {
          DebugUtils.logS(['APPROVE_TASK data', res]);
          switch (action) {
            case PERMISSION_APPROVE_ACTION.PARAMETER_PRODUCT_APPROVE_ACTION:
            case PERMISSION_APPROVE_ACTION.PARAMETER_PRODUCT_CONVERT_APPROVE_ACTION:
              // dispatch(productActions.setProducts(undefined));
              break;
            case PERMISSION_APPROVE_ACTION.PARAMETER_FEE_CODE_APPROVE_ACTION:
              // dispatch(productActions.setProducts(undefined));
              // dispatch(feeCodeActions.setFeeCodes(undefined));
              break;
          }
          fetchTasks();
          onDone?.();
          showToast({
            type: TYPE_TOAST.SUCCESS,
            content: t('common:msg_done', { action: t('common:approve') })
          });
        },
        onFailed: (error: ErrorBase) => {
          DebugUtils.logS(['APPROVE_TASK error', error]);
          let msg = t('common:msg_failed', { action: t('common:approve') });
          switch (error.systemErrorCode) {
            case appCodes.APPROVE.NOT_AUTHORIZED:
              msg = t('approve:not_aithorized', { action: t('common:approve').toLowerCase() });
          }
          showToast({
            type: TYPE_TOAST.ERROR,
            content: msg
          });
        }
      }
    });
  };

  const onReject = (req: RejectTaskReq, onDone?: () => void) => {
    dispatch({
      type: REJECT_TASK,
      payload: {
        body: req,
        onSuccess: (res: boolean) => {
          DebugUtils.logS(['APPROVE_TASK data', res]);
          fetchTasks();
          onDone?.();
          showToast({
            type: TYPE_TOAST.SUCCESS,
            content: t('common:msg_done', { action: t('common:reject') })
          });
        },
        onFailed: (error: ErrorBase) => {
          DebugUtils.logS(['APPROVE_TASK error', error]);
          let msg = t('common:msg_failed', { action: t('common:reject') });
          switch (error.systemErrorCode) {
            case appCodes.APPROVE.NOT_AUTHORIZED:
              msg = t('approve:not_aithorized', { action: t('common:approve').toLowerCase() });
          }
          showToast({
            type: TYPE_TOAST.ERROR,
            content: msg
          });
        }
      }
    });
  };

  const onDelete = (id: string, onDone?: () => void) => {
    dispatch({
      type: DELETE_TASK,
      payload: {
        body: id,
        onSuccess: (res: boolean) => {
          DebugUtils.logS(['DELETE_TASK data', res]);
          fetchTasks();
          onDone?.();
          showToast({
            type: TYPE_TOAST.SUCCESS,
            content: t('common:delete_confirm')
          });
        },
        onFailed: (error: ErrorBase) => {
          DebugUtils.logS(['DELETE_TASK error', error]);
          showToast({
            type: TYPE_TOAST.ERROR,
            content: t('common:msg_failed', { action: t('common:delete') })
          });
        }
      }
    });
  };

  const showDialogConfirm = (action: string, data: PendingTask, onDone?: () => void) => {
    if (action === ACTION_KEYS.REJECT) {
      showDialog({
        title: t('approve:reject_confirm'),
        content: (
          <div>
            <TextBase
              t18n={'approve:reject_confirm_msg'}
              t18nOptions={{ value: '' }}
              classNames={'mb-4'}
            />
            <AppTextField
              ref={reasonRef}
              placeholder={`${t('common:reason')} ${t('common:reject').toLowerCase()} ...`}
            />
          </div>
        ),
        type: TYPE_MESSAGE.ALERT,
        destroyOnClose: true,
        actions: [
          {
            title: t('common:agree'),
            type: TYPE_ACTION.PRIMARY,
            onPress: () => {
              const reason = reasonRef?.current?.input?.value || '';
              onReject({ requestId: data.requestId || '', reason }, onDone);
            }
          },
          {
            title: t('common:cancel'),
            type: TYPE_ACTION.SECONDARY
          }
        ]
      });
      return;
    }
    let title = '';
    let content = '';
    let onPress = undefined;
    switch (action) {
      case ACTION_KEYS.APPROVE:
        title = t('approve:approve_confirm');
        content = t('approve:approve_confirm_msg', { value: '' });
        onPress = () => {
          onApprove({ id: data.requestId || '', action: data.actionId, onDone: onDone });
        };
        break;
      case ACTION_KEYS.DELETE:
        title = t('common:delete_confirm');
        content = t('common:delete_confirm_msg', {
          value: t('common:request').toLowerCase()
        });
        onPress = () => {
          onDelete(data.requestId || '', onDone);
        };
        break;
    }
    showDialog({
      title: title,
      content: content,
      type: TYPE_MESSAGE.ALERT,
      actions: [
        {
          title: t('common:agree'),
          type: TYPE_ACTION.PRIMARY,
          onPress: onPress
        },
        {
          title: t('common:cancel'),
          type: TYPE_ACTION.SECONDARY
        }
      ]
    });
  };

  const renderAction = (text: string) => {
    let msg = NULL_VALUE;
    switch (text?.toUpperCase()) {
      case ACTION_TYPES.CREATE:
        msg = t('common:add_new');
        break;
      case ACTION_TYPES.UPDATE:
        msg = t('common:edit');
        break;
      case ACTION_TYPES.CONVERT_FEE_CODE:
        msg = t('product:change_fee');
        break;
    }
    return <span>{msg}</span>;
  };

  const renderFilterTags = () => {
    return (
      <Flex gap={K_SIZE_8} className={'mb-8 w-full'}>
        {Object.entries(filterApplied).map((f) => {
          const keyF = f[K_SIZE_0] as keyof FilterMyTask;
          let valF = f[K_SIZE_1];
          if (['page', 'size'].includes(keyF || '') || !valF) {
            return null;
          }
          let lb = '';
          switch (keyF) {
            case 'actionId':
              lb = t('approve:feature');
              valF = optionFeature?.find((o) => o.value === valF)?.label || NULL_VALUE;
              break;
            case 'operationType':
              lb = t('common:status_active');
              valF = optionAction.find((o) => o.value === valF)?.label || NULL_VALUE;
              break;
            case 'requestId':
              lb = t('approve:feature_id');
              break;
            case 'createdBy':
              lb = t('common:created_by');
              break;

            case 'createAt':
              lb = t('common:created_at');
              valF = displayDateFromServer(valF);
              break;
            case 'status':
              lb = t('approve:status_approve');
              valF = [...valF]
                .map((sta) => {
                  const txt = FEE_CODE_STATUS_OPTION.find((s) => s.value === sta)?.label;
                  return txt ? t(txt as I18nKeys) : NULL_VALUE;
                })
                .join(', ');
              break;
          }

          const content = `${lb}: ${valF}`;
          return valF ? (
            <TagFilter
              content={content}
              contentTooltip={content}
              onClose={() => {
                onResetFilter(keyF);
              }}
            />
          ) : null;
        })}
      </Flex>
    );
  };

  const statusOptions = FEE_CODE_STATUS_OPTION.filter((s) =>
    [FEE_CODE_STATUS.REJECTED, FEE_CODE_STATUS.APPROVED, FEE_CODE_STATUS.AWAIT_APPROVE].includes(
      s.value
    )
  );

  const columns = [
    {
      title: t('approve:feature_id'),
      dataIndex: 'requestId',
      key: 'requestId',
      width: K_SIZE_200,
      render: (text: string) => {
        return <TextBase text={text} classNames={'sub-title4 !text-color-900'} />;
      }
      // sorter: true,
    },
    {
      title: t('approve:feature_code'),
      dataIndex: 'actionSubGroup',
      key: 'actionSubGroup',
      width: K_SIZE_200,
      render: (text: string) => <>{text || NULL_VALUE}</>
      // sorter: true,
    },
    {
      title: t('approve:feature_name'),
      dataIndex: 'actionName',
      key: 'actionName',
      width: K_SIZE_200,
      render: (text: string) => <>{text || NULL_VALUE}</>
      // sorter: true,
    },
    {
      title: t('common:status_active'),
      dataIndex: 'operationType',
      key: 'operationType',
      width: K_SIZE_160,
      render: (text: string) => renderAction(text)
      // sorter: true,
    },
    {
      title: t('common:status'),
      dataIndex: 'status',
      width: K_SIZE_120,
      render: () => {
        return <>status</>;
      }
    },
    {
      title: t('common:note'),
      width: K_SIZE_160,
      dataIndex: 'note',
      render: (text: string) => <>{text || NULL_VALUE}</>
    },
    {
      title: t('common:created_at'),
      dataIndex: 'createAt',
      width: K_SIZE_180,
      render: (text: string) => <span>{displayDateTimeFromServer(text)}</span>
    },
    {
      title: t('common:created_by'),
      dataIndex: 'createdBy',
      width: K_SIZE_160,
      render: (text: string) => <>{text || NULL_VALUE}</>
    }
  ];

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    if (!optionFeature) fecthPermissionApprove();
  }, [fecthPermissionApprove, optionFeature]);

  return {
    t,
    filter,
    setFilter,
    setFieldFilter,
    filterApplied,
    setFilterApplied,
    setFieldFilterApplied,
    total,
    setTotal,
    dataFilter,
    setDataFilter,
    pagination,
    defaultFilterCode,
    optionFeature,
    optionAction,
    onApprove,
    onReject,
    onDelete,
    ACTION_KEYS,
    renderAction,
    columns,
    statusOptions,
    onApplyFilter,
    onResetFilter,
    renderFilterTags,
    showDialogConfirm
  };
}
