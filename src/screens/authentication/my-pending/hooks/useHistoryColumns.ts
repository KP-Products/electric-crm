import { K_SIZE_120, K_SIZE_160, K_SIZE_180, K_SIZE_260 } from '@constant';
import { useMemo } from 'react';
import { useAppTranslation } from 'utils/i18n';

export type HistoryColumnType = 'approve' | 'action';

export const useHistoryColumnsConfig = (type: HistoryColumnType = 'approve') => {
  const { t } = useAppTranslation();

  const approveColumnsConfig = useMemo(
    () => [
      {
        title: t('approval_matrix:level_order', { order: '' }),
        dataIndex: 'approvalLevel',
        key: 'approvalLevel',
        width: K_SIZE_120
      },
      {
        title: t('approve:approve_rejecter'),
        dataIndex: 'approverName',
        width: K_SIZE_260
      },
      {
        title: t('manage_user:unit'),
        dataIndex: 'block',
        width: K_SIZE_260
      },
      {
        title: t('manage_user:department'),
        dataIndex: 'department',
        width: K_SIZE_260
      },
      {
        title: t('approve:status_approve'),
        dataIndex: 'approvalStatus',
        width: K_SIZE_160,
        needsRender: 'feeCodeStatus'
      },
      {
        title: t('common:reason'),
        dataIndex: 'reason',
        width: K_SIZE_260
      },
      {
        title: t('common:date'),
        dataIndex: 'createdAt',
        width: K_SIZE_180,
        needsRender: 'dateTime'
      }
    ],
    [t]
  );

  const actionColumnsConfig = useMemo(
    () => [
      {
        title: t('common:update_date'),
        dataIndex: 'updatedAt',
        key: 'updatedAt',
        width: K_SIZE_180,
        needsRender: 'dateOnly'
      },
      {
        title: t('common:impact'),
        dataIndex: 'action',
        width: K_SIZE_260,
        needsRender: 'actionType'
      },
      {
        title: t('common:update_by'),
        dataIndex: 'updatedBy',
        width: K_SIZE_260
      },
      {
        title: t('common:approve_by'),
        dataIndex: 'approvedBy',
        width: K_SIZE_260
      }
    ],
    [t]
  );

  return type === 'approve' ? approveColumnsConfig : actionColumnsConfig;
};
