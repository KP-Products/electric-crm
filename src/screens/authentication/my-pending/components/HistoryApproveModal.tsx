'use client';

/* eslint-disable tailwindcss/no-custom-classname */
import { ACTION_TYPE_LABELS, K_SIZE_24, K_SIZE_80 } from '@constant';
import { HISTORY_TASK } from '@redux-action-type/pending-task-type';
import { dispatch } from '@redux-common';
import { promotionActions } from '@redux-slice/promotion';
import { Flex, Modal, Spin } from 'antd';
import { IconSvgLocal } from 'components/icon-vec-local';
import AppTable from 'components/table';
import { TextBase } from 'components/text';
import { showToast } from 'components/toast';
import { TYPE_TOAST } from 'components/toast/type';
import { ErrorBase } from 'model/common';
import { HistoryTaskData, HistoryTaskReq } from 'model/pending-task';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useHistoryColumnsConfig } from 'screens/authentication/my-pending/hooks/useHistoryColumns';
import FeeCodeStatus from 'screens/authentication/products-and-code-fee/components/FeeCodeStatus';
import { displayDateFromServer, displayDateTimeFromServer } from 'utils/date';
import { DebugUtils } from 'utils/debug-utils';
import { useAppTranslation } from 'utils/i18n';
import { ROUTES } from 'config/routes';

interface Props {
  open: boolean;
  setOpen: (value: boolean) => void;
  promotionCode?: string;
  actionId: string;
  onClose?: () => void;
  isApprove?: boolean;
}
const HistoryApproveModal = ({
  open,
  setOpen,
  onClose,
  promotionCode,
  actionId,
  isApprove
}: Props) => {
  const { t } = useAppTranslation();
  const router = useRouter();
  const reduxDispatch = useDispatch();
  const columnsConfig = useHistoryColumnsConfig(isApprove ? 'approve' : 'action');
  const [loadingP, setLoadingP] = useState(false);
  const [dataHistory, setDataHistory] = useState<HistoryTaskData[]>();

  const columns = useMemo(
    () =>
      columnsConfig.map((col: any) => {
        if (col.needsRender === 'dateTime') {
          return {
            ...col,
            render: (text: string) => <span>{displayDateTimeFromServer(text)}</span>
          };
        }
        if (col.needsRender === 'dateOnly') {
          return {
            ...col,
            render: (text: string, record: any) => {
              const dateDisplay = displayDateFromServer(text);
              if (record?.isShowHyperlink && record?.hyperLinkData?.id) {
                return (
                  <TextBase
                    text={dateDisplay}
                    classNames={
                      'sub-title4 !text-secondary-500 cursor-pointer hover:!text-secondary-700'
                    }
                    onClick={() => {
                      reduxDispatch(promotionActions.setHistoryData(record.hyperLinkData));
                      setOpen(false);
                      router.push(
                        `${ROUTES.MANAGE_PROMOTION_DETAIL}?id=${promotionCode}&updatedAt=${encodeURIComponent(record.hyperLinkData.updatedAt)}`
                      );
                    }}
                  />
                );
              }
              return <span>{dateDisplay}</span>;
            }
          };
        }
        if (col.needsRender === 'feeCodeStatus') {
          return {
            ...col,
            render: (text: string) => <FeeCodeStatus status={text} />
          };
        }
        if (col.needsRender === 'actionType') {
          return {
            ...col,
            render: (text: string) => {
              const i18nKey = ACTION_TYPE_LABELS[text];
              return <span>{i18nKey ? t(i18nKey as any) : text}</span>;
            }
          };
        }
        return col;
      }),
    [columnsConfig, t, setOpen, promotionCode, reduxDispatch, router]
  );

  const fecthHistory = () => {
    setLoadingP(true);
    const body: HistoryTaskReq = {
      module: actionId,
      objectCode: promotionCode || ''
    };

    dispatch({
      // HISTORY_TASK: lịch sử phê duyệt
      type: HISTORY_TASK,
      payload: {
        body,
        onSuccess: (data: HistoryTaskData[]) => {
          setLoadingP(false);
          setDataHistory(data);
        },
        onFailed: (error?: ErrorBase) => {
          DebugUtils.logS(['HISTORY_TASK error', error]);
          showToast({
            type: TYPE_TOAST.ERROR,
            content: t('common:msg_failed', {
              action: `${t('common:get_list')} ${t(isApprove ? 'common:approve_history' : 'fee_schedule:action_history').toLowerCase()}`
            })
          });
          setLoadingP(false);
        }
      }
    });
  };

  useEffect(() => {
    if (open && promotionCode && actionId) {
      fecthHistory();
    } else if (!open) {
      setDataHistory(undefined);
    }
  }, [open, promotionCode, actionId]);
  return (
    <Modal
      rootClassName={'drawer-dialog'}
      open={open}
      closeIcon={false}
      destroyOnClose
      style={{ top: K_SIZE_80 }}
      afterClose={onClose}
      className={'z-50'}
      width={'75vw'}
      footer={null}
    >
      <Flex className={'mb-12'} justify={'space-between'}>
        <TextBase
          t18n={t(isApprove ? 'common:approve_history' : 'fee_schedule:action_history')}
          preset={'title4'}
        />
        <IconSvgLocal
          name={'IC_CLOSE_OUTLINE'}
          classNames={'text-color-700 cursor-pointer hover:text-color-800'}
          height={K_SIZE_24}
          onClick={() => {
            setOpen(false);
          }}
        />
      </Flex>
      <Spin spinning={loadingP && dataHistory && !!dataHistory?.length}>
        <div className={'overflow-hidden rounded-radius-l border border-color-400'}>
          <AppTable
            loading={loadingP}
            rootClassName={'w-full'}
            className={'[&_.ant-pagination]:hidden'}
            scroll={{ x: 'max-content', y: '68vh' }}
            dataSource={dataHistory}
            rowClassName={(record) =>
              record?.listCodeFee && !record?.more ? 'ant-row-not-border' : ''
            }
            columns={columns}
            rowKey={'id'}
          />
        </div>
      </Spin>
    </Modal>
  );
};

export default HistoryApproveModal;
