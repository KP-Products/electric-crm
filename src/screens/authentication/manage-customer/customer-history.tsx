'use client';

import { K_SIZE_1, K_SIZE_20, NULL_VALUE } from '@constant';
import { Alert, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import ButtonBase from 'components/button';
import { TextBase } from 'components/text';
import { SystemLog } from 'model/system-log';
import { useEffect, useMemo, useState } from 'react';
import systemLogServices from 'services/system-log-services';
import { hasApiError } from 'utils/api-response';
import { displayDateTimeFromServer } from 'utils/date';
import {
  formatCustomerHistoryValue,
  getCustomerHistoryChanges,
  getCustomerHistoryFieldLabel
} from './history-utils';

const ACTION_LABELS: Record<string, string> = {
  CREATE: 'Thêm mới',
  INSERT: 'Thêm mới',
  UPDATE: 'Cập nhật',
  DELETE: 'Xóa'
};

const HistoryChanges = ({ log }: { log: SystemLog }) => {
  const changes = getCustomerHistoryChanges(log.oldData, log.newData);
  if (!changes.length) {
    return log.changedFields ? (
      <div className="whitespace-pre-wrap break-words">
        {formatCustomerHistoryValue(log.changedFields)}
      </div>
    ) : (
      <span>Không có thông tin thay đổi</span>
    );
  }
  return (
    <div className="grid gap-12">
      {changes.map((change) => (
        <div key={change.field} className="min-w-0">
          <div className="mb-4 font-semibold">{getCustomerHistoryFieldLabel(change.field)}</div>
          <div className="grid grid-cols-2 gap-12 mobile:grid-cols-1">
            <div className="whitespace-pre-wrap break-words">
              <span className="text-color-600">Trước: </span>
              {formatCustomerHistoryValue(change.before, change.field)}
            </div>
            <div className="whitespace-pre-wrap break-words">
              <span className="text-color-600">Sau: </span>
              {formatCustomerHistoryValue(change.after, change.field)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default function CustomerHistory({ customerCode }: { customerCode: string }) {
  const [page, setPage] = useState(K_SIZE_1);
  const [revision, setRevision] = useState(0);
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setFailed(false);
    const load = async () => {
      const response = await systemLogServices.getHistory({
        changeId: customerCode,
        entityName: 'customers',
        page: page - K_SIZE_1,
        size: K_SIZE_20
      });
      if (!active) return;
      setLoading(false);
      if (hasApiError(response) || !Array.isArray(response.data?.items)) {
        setLogs([]);
        setTotal(0);
        setFailed(true);
        return;
      }
      // API trả mới nhất trước; giữ thứ tự từ server giữa các trang.
      setLogs(response.data.items);
      setTotal(response.data.total);
    };
    void load();
    return () => {
      active = false;
    };
  }, [customerCode, page, revision]);

  const columns = useMemo<ColumnsType<SystemLog>>(
    () => [
      {
        title: 'STT',
        key: 'index',
        width: 60,
        render: (_, __, index) => (page - K_SIZE_1) * K_SIZE_20 + index + K_SIZE_1
      },
      {
        title: 'Thời gian thay đổi',
        dataIndex: 'changedAt',
        width: 170,
        render: (value?: string) => (value ? displayDateTimeFromServer(value) : NULL_VALUE)
      },
      {
        title: 'Người thay đổi',
        dataIndex: 'changedBy',
        width: 150,
        render: (value?: string) => value || NULL_VALUE
      },
      {
        title: 'Thao tác',
        dataIndex: 'action',
        width: 110,
        render: (value?: string) => ACTION_LABELS[value?.toUpperCase() || ''] || value || NULL_VALUE
      },
      {
        title: 'Nội dung thay đổi',
        key: 'changes',
        width: 520,
        render: (_, log) => <HistoryChanges log={log} />
      }
    ],
    [page]
  );

  return (
    <section className="mt-16 rounded-radius-l border border-color-300 bg-color-50 p-16">
      <TextBase classNames="sub-title3 mb-16 !text-primary-700" text="Lịch sử thay đổi" />
      {failed ? (
        <Alert
          type="error"
          showIcon
          message="Không tải được lịch sử thay đổi khách hàng"
          action={
            <ButtonBase
              type="ghost"
              size={32}
              customContent="Thử lại"
              onClick={() => setRevision((value) => value + 1)}
            />
          }
        />
      ) : (
        <Table<SystemLog>
          rowKey="id"
          size="small"
          loading={loading}
          columns={columns}
          dataSource={logs}
          scroll={{ x: 1010 }}
          locale={{ emptyText: 'Chưa có lịch sử thay đổi' }}
          pagination={{
            current: page,
            pageSize: K_SIZE_20,
            total,
            showSizeChanger: false,
            hideOnSinglePage: true,
            onChange: setPage
          }}
        />
      )}
    </section>
  );
}
