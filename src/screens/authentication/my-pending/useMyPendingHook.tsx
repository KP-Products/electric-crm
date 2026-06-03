import {
  DEFAULT_PAGE_SIZE,
  FEATURES,
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
  TASK_APPROVE_LIST,
  TASK_DETAIL
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
import { ErrorBase, PaginationRes } from 'model/common';
import { FEE_CODE_STATUS, FEE_CODE_STATUS_OPTION, FeeCode } from 'model/fee-code';
import {
  ACTION_TYPES,
  FilterMyTask,
  PendingTask,
  PendingTaskDetail,
  RejectTaskReq,
  TaskDetailReq
} from 'model/pending-task';
import { useRouter } from 'next/navigation';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import CreateEditProductPending from 'screens/authentication/my-pending/components/CreateEditProductPending';
// import FeeCodeStatus from 'screens/authentication/products-and-code-fee/components/FeeCodeStatus';
import { appCodes } from 'utils/constant/appCodes';
import { displayDateFromServer, displayDateTimeFromServer } from 'utils/date';
import { DebugUtils } from 'utils/debug-utils';
import { I18nKeys, useAppTranslation } from 'utils/i18n';
import { PERMISSION_APPROVE_ACTION } from 'utils/permission.util';
import { showDialog } from 'components/dialog';
import { AppTextField } from 'components/text-field';
import { TYPE_ACTION, TYPE_MESSAGE } from 'components/dialog/type';

export default function useMyPendingHook(props?: { isPendingTask?: boolean }) {
  const { isPendingTask } = props || {};
  const { t } = useAppTranslation();
  const router = useRouter();
  const reasonRef = useRef<InputRef>(null);

  const defaultFilterCode: FilterMyTask = {
    actionId: '',
    actionName: '',
    createAt: '',
    createdBy: '',
    operationType: '',
    requestId: '',
    status: [],

    page: K_SIZE_1,
    size: DEFAULT_PAGE_SIZE
  };

  const ACTION_KEYS = {
    APPROVE: 'APPROVE',
    REJECT: 'REJECT',
    EDIT: 'EDIT',
    DELETE: 'DELETE'
  };

  const optionFeature = useSelector(selectPendingTaskOptionFeature);
  const fecthPermissionApprove = () => {
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
        onFailed: (error?: ErrorBase) => {}
      }
    });
  };

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

  const LIST_DRAWER = [
    PERMISSION_APPROVE_ACTION.PARAMETER_PRODUCT_APPROVE_ACTION,
    PERMISSION_APPROVE_ACTION.PARAMETER_PRODUCT_CONVERT_APPROVE_ACTION,
    PERMISSION_APPROVE_ACTION.PARAMETER_FORMULA_FEE_APPROVE_ACTION
  ];

  const [openFilter, setOpenFilter] = useState<boolean>(false);
  const [filter, setFilter] = useState<FilterMyTask>(defaultFilterCode);
  const [filterApplied, setFilterApplied] = useState<FilterMyTask>(defaultFilterCode);
  const [total, setTotal] = useState<number>(K_SIZE_0);
  const [dataFilter, setDataFilter] = useState<PendingTask[]>([]);
  const [selectedItem, setSelectedItem] = useState<PendingTaskDetail>();
  const [isView, setIsView] = useState<boolean>(false);

  const setFieldFilter = (key: keyof FilterMyTask | string, value: string | number | string[]) => {
    setFilter((pre) => ({ ...pre, [key]: value }));
  };

  const setFieldFilterApplied = (
    key: keyof FilterMyTask | string,
    value: string | number | string[]
  ) => {
    setFieldFilter(key, value);
    setFilterApplied((pre) => ({ ...pre, [key]: value }));
  };

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
    [filterApplied.page, total]
  );

  // const permissionList = useSelector(selectPermissionList);
  const fetchTasks = () => {
    const body: FilterMyTask = {
      actionId: filterApplied.actionId || undefined,
      actionName: filterApplied.actionName || undefined,
      createAt: filterApplied.createAt || undefined,
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
        onSuccess: (res: PaginationRes<PendingTask>) => {
          DebugUtils.logS([
            `${isPendingTask ? 'TASK_APPROVE_LIST' : 'MY_REQUEST_LIST'} data:`,
            res
          ]);

          setDataFilter(_.uniqBy(res?.content || [], 'requestId'));
          setTotal(res?.totalElements || K_SIZE_0);
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
  };

  const getDetailTask = (record: PendingTask, isEdit?: boolean) => {
    const body: TaskDetailReq = {
      transactionId: record?.transactionId || record.requestId || '',
      taskType: record?.actionId || '',
      operationType: record.operationType || ''
    };

    const onSuccess = (res: any) => {
      DebugUtils.logS(['TASK_DETAIL data:', res]);
      const item: PendingTaskDetail = { ...record, dataDetail: res };
      if (LIST_DRAWER.includes(record.actionId || '')) {
        setIsView(!isEdit);
        setSelectedItem(item);
        return;
      }
      navigatePage(item, isEdit);
    };

    if (record.requestId === selectedItem?.requestId && selectedItem?.dataDetail) {
      onSuccess(selectedItem?.dataDetail);
      return;
    }
    dispatch({
      type: TASK_DETAIL,
      payload: {
        body: body,
        onSuccess,
        onFailed: (error?: ErrorBase) => {
          DebugUtils.logS(['TASK_DETAIL error:', error]);
          showToast({
            type: TYPE_TOAST.ERROR,
            content: t('common:msg_failed', {
              action: `${t('common:get')} ${t('fee_schedule:detail_info').toLowerCase()}`
            })
          });
        }
      }
    });
  };

  const onCloseEdit = () => {
    setIsView(false);
    setSelectedItem(undefined);
  };

  // case: render drawer và xử lý edit
  const checkActionEdit = (actionType?: string) => {
    return [ACTION_TYPES.CREATE, ACTION_TYPES.UPDATE, ACTION_TYPES.CONVERT_FEE_CODE].includes(
      actionType || ''
    );
  };
  const renderInfoTask = () => {
    if (selectedItem) {
      switch (selectedItem.actionId) {
        case PERMISSION_APPROVE_ACTION.PARAMETER_PRODUCT_APPROVE_ACTION:
        // case PERMISSION_APPROVE_ACTION.PARAMETER_PRODUCT_CONVERT_APPROVE_ACTION:
        //   return (
        //     <CreateEditProductPending
        //       infoTask={selectedItem}
        //       isView={isView}
        //       onClose={onCloseEdit}
        //       onDone={() => {
        //         onCloseEdit();
        //         fetchTasks();
        //       }}
        //       canEdit={
        //         isPendingTask
        //           ? false
        //           : selectedItem.status === FEE_CODE_STATUS.REJECTED &&
        //             checkActionEdit(selectedItem.operationType)
        //       }
        //       onDelete={
        //         !isPendingTask &&
        //         [FEE_CODE_STATUS.REJECTED, FEE_CODE_STATUS.AWAIT_APPROVE].includes(
        //           (selectedItem.status || '') as FEE_CODE_STATUS
        //         )
        //           ? (onDone?: () => void) => {
        //               if (selectedItem.requestId)
        //                 showDialogConfirm(ACTION_KEYS.DELETE, selectedItem, onDone);
        //             }
        //           : undefined
        //       }
        //       onApprove={
        //         isPendingTask && selectedItem.status === FEE_CODE_STATUS.AWAIT_APPROVE
        //           ? (onDone?: () => void) => {
        //               showDialogConfirm(ACTION_KEYS.APPROVE, selectedItem, onDone);
        //             }
        //           : undefined
        //       }
        //       onReject={
        //         isPendingTask && selectedItem.status === FEE_CODE_STATUS.AWAIT_APPROVE
        //           ? (onDone?: () => void) => {
        //               showDialogConfirm(ACTION_KEYS.REJECT, selectedItem, onDone);
        //             }
        //           : undefined
        //       }
        //     />
        //   );
        case PERMISSION_APPROVE_ACTION.PARAMETER_FORMULA_FEE_APPROVE_ACTION:
          return <div></div>;
        default:
          return null;
      }
    }
    return <div />;
  };

  // case: chuyển màn mới
  const navigatePage = (record: PendingTaskDetail, isEdit?: boolean) => {
    switch (record.actionId) {
      case PERMISSION_APPROVE_ACTION.PARAMETER_FEE_CODE_APPROVE_ACTION:
        const feeCode: FeeCode = {
          ...record.dataDetail,
          statusApprove: record.status,
          requestId: record.requestId,
          isMyTask: !isPendingTask,
          operationType: record.operationType
        };
        // dispatch(feeCodeActions.setFeeCodeDetail(feeCode));
        if (isEdit) {
          // router.push(`${ROUTES.CODE_FEE_DETAIL}?action=${ACTION_FEE_CODE.EDIT}`);
          return;
        }
        // router.push(`${ROUTES.CODE_FEE_DETAIL}`);

        break;
      case FEATURES.PARAMETER_FEE_SCHEDULE_APPROVE_ACTION:
        if (isEdit) {
          // router.push(
          //   `${ROUTES.FEE_SCHEDULE_DETAIL}?id=${record?.dataDetail?.feeScheduleId}&action=edit&sourcePage=approval`
          // );
          return;
        }
        if (record.operationType === ACTION_TYPES.CONVERT_FEE_CODE) {
          // router.push(
          //   `${ROUTES.CHANGE_FEE_SCHEDULE}?requestId=${record?.requestId}&action=see&sourcePage=approval`
          // );
          return;
        }
        // router.push(
        //   `${ROUTES.FEE_SCHEDULE_DETAIL}?id=${record?.dataDetail?.feeScheduleId}&action=see&sourcePage=approval`
        // );
        break;
      case FEATURES.PARAMETER_PROMOTION_APPROVE_ACTION:
        if (isEdit) {
          // router.push(`${ROUTES.MY_PENDING_PROMOTION_EDIT}?id=${record?.dataDetail?.id}`);
        } else {
          // router.push(
          //   `${isPendingTask ? ROUTES.PENDING_PROMOTION_DETAIL : ROUTES.MY_PENDING_PROMOTION_DETAIL}?id=${record?.dataDetail?.id}`
          // );
        }
        break;
      default:
    }
  };

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

  const showDialogConfirm = (action: string, data: PendingTaskDetail, onDone?: () => void) => {
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
          let valueReset: string | string[] = '';
          let actionClose = () => {};
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
              valueReset = [];
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
                actionClose();
                setFieldFilter(keyF, valueReset);
                setFieldFilterApplied(keyF, valueReset);
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
      render: (text: string, record: PendingTaskDetail) => {
        return (
          <TextBase
            text={text}
            classNames={'sub-title4 !text-secondary-500 cursor-pointer hover:!text-secondary-700'}
            onClick={() => {
              getDetailTask(record);
            }}
          />
        );
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
      render: (text: string) => {
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
  }, [filterApplied]);

  useEffect(() => {
    if (!optionFeature) fecthPermissionApprove();
  }, [optionFeature]);

  return {
    t,
    router,
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
    openFilter,
    setOpenFilter,
    pagination,
    defaultFilterCode,
    optionFeature,
    optionAction,
    selectedItem,
    setSelectedItem,
    isView,
    setIsView,
    onCloseEdit,
    renderInfoTask,
    navigatePage,
    LIST_DRAWER,
    getDetailTask,
    onApprove,
    onReject,
    onDelete,
    ACTION_KEYS,
    renderAction,
    columns,
    statusOptions,
    renderFilterTags,
    checkActionEdit,
    showDialogConfirm
  };
}
