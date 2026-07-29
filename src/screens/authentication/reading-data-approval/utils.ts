import { TYPE_STATUS } from 'components/status';
import { ReadingPeriodStatus } from 'model/manual-meter-reading';

export const READING_APPROVAL_STATUS_OPTIONS = [
  { value: '', label: 'Tất cả' },
  { value: 'SAVED', label: 'Chờ phê duyệt' },
  { value: 'CONFIRMED', label: 'Đã phê duyệt' },
  { value: 'REJECTED', label: 'Từ chối' }
];

export const getReadingStatusMeta = (status?: string) => {
  const normalized = status?.toUpperCase() as ReadingPeriodStatus | undefined;
  if (normalized === 'SAVED') return { label: 'Chờ phê duyệt', type: TYPE_STATUS.PENDING };
  if (normalized === 'CONFIRMED') return { label: 'Đã phê duyệt', type: TYPE_STATUS.SUCCESS };
  if (normalized === 'REJECTED') return { label: 'Từ chối', type: TYPE_STATUS.ERROR };
  if (normalized === 'DRAFT') return { label: 'Nháp', type: TYPE_STATUS.DISABLED };
  return { label: status || '--', type: TYPE_STATUS.DEFAULT };
};

export const getAbnormalMeta = (abnormal?: boolean, deltaPercent?: number) => {
  if (!abnormal) return { label: 'Bình thường', type: TYPE_STATUS.SUCCESS };

  return {
    label: deltaPercent !== undefined && deltaPercent < 0 ? 'Sản lượng âm' : 'Bất thường',
    type: TYPE_STATUS.ERROR
  };
};
