'use client';

import {
  CheckCircleOutlined,
  DownloadOutlined,
  UploadOutlined,
  WarningOutlined
} from '@ant-design/icons';
import { K_SIZE_0, K_SIZE_8, NULL_VALUE } from '@constant';
import { Divider, Flex, Spin, Upload } from 'antd';
import ButtonBase from 'components/button';
import Status, { KIND_STATUS, TYPE_STATUS } from 'components/status';
import AppTable from 'components/table';
import AppPagination from 'components/table/pagination';
import { TextBase } from 'components/text';
import { ROUTES } from 'config/routes';
import PageWithBreadcrumb from 'layout/AppLayout/PageWithBreadcumb';
import { RemoteMeterReadingPeriod } from 'model/remote-meter-reading';
import moment from 'moment';
import { useMemo } from 'react';
import useRemoteMeterReading from './useRemoteMeterReading';

const formatNumber = (value?: number) => {
  if (value === undefined || value === null || !Number.isFinite(value)) return NULL_VALUE;
  return new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 3 }).format(value);
};

const formatDate = (value?: string) => {
  if (!value) return NULL_VALUE;
  const date = moment(value);
  return date.isValid() ? date.format('DD/MM/YYYY') : value;
};

const getStatusMeta = (status?: string) => {
  const normalizedStatus = status?.toUpperCase();

  if (
    ['SUCCESS', 'RECORDED', 'CONFIRMED', 'DA_GHI', 'THANH_CONG'].includes(normalizedStatus || '')
  ) {
    return {
      label: 'Thành công',
      type: TYPE_STATUS.SUCCESS
    };
  }

  if (['FAILED', 'ERROR', 'MAT_KET_NOI', 'LOI_DU_LIEU'].includes(normalizedStatus || '')) {
    return {
      label: 'Mất kết nối',
      type: TYPE_STATUS.ERROR
    };
  }

  return {
    label: status || 'Chờ xử lý',
    type: TYPE_STATUS.PENDING
  };
};

const RemoteMeterReadingScreen = () => {
  const {
    rows,
    total,
    loading,
    importing,
    downloadingTemplate,
    importResult,
    lastUpdatedAt,
    pagination,
    currentPage,
    onImportFile,
    onDownloadTemplate
  } = useRemoteMeterReading();

  const breadcrumbList = useMemo(
    () => [
      { title: 'Chỉ số - Hoá đơn' },
      { title: 'Nhập chỉ số đo xa', key: ROUTES.REMOTE_METER_READING }
    ],
    []
  );

  const columns = useMemo<any[]>(
    () => [
      {
        title: 'Mã CT',
        dataIndex: 'meterNumber',
        key: 'meterNumber',
        width: 140,
        render: (text: string) => (
          <TextBase classNames="sub-title4 !text-color-900" text={text || NULL_VALUE} />
        )
      },
      {
        title: 'Khách hàng',
        dataIndex: 'customerName',
        key: 'customerName',
        width: 220,
        render: (_: string, record: RemoteMeterReadingPeriod) => (
          <div className="min-w-0">
            <TextBase
              classNames="sub-title4 truncate !text-color-900"
              text={record.customerName || `Khách hàng ${record.customerId || NULL_VALUE}`}
            />
            <TextBase
              classNames="caption1 truncate !text-color-700"
              text={record.customerCode || String(record.customerId || NULL_VALUE)}
            />
          </div>
        )
      },
      {
        title: 'CS kỳ trước',
        dataIndex: 'oldIndex',
        key: 'oldIndex',
        align: 'right',
        width: 130,
        render: (value: number) => formatNumber(value)
      },
      {
        title: 'CS kỳ này',
        dataIndex: 'newIndex',
        key: 'newIndex',
        align: 'right',
        width: 130,
        render: (value: number) => formatNumber(value)
      },
      {
        title: 'Sản lượng',
        dataIndex: 'energyAdjusted',
        key: 'energyAdjusted',
        align: 'right',
        width: 130,
        render: (value: number, record: RemoteMeterReadingPeriod) =>
          formatNumber(value ?? record.energyRaw)
      },
      {
        title: 'Thời gian đọc',
        dataIndex: 'readingDate',
        key: 'readingDate',
        width: 150,
        render: (value: string) => formatDate(value)
      },
      {
        title: 'TT',
        dataIndex: 'status',
        key: 'status',
        width: 130,
        render: (status: string) => {
          const meta = getStatusMeta(status);
          return <Status type={meta.type} kind={KIND_STATUS.SECONDARY} content={meta.label} />;
        }
      }
    ],
    []
  );

  const importedCount = importResult?.rowCount || K_SIZE_0;
  const errorCount = importResult?.errors?.length || K_SIZE_0;

  return (
    <PageWithBreadcrumb breadcrumbList={breadcrumbList}>
      <section>
        <Flex
          justify="space-between"
          align="center"
          gap={K_SIZE_8}
          className="mobile:flex-col mobile:items-start"
        >
          <div>
            <TextBase classNames="title4" text="Nhập Chỉ Số Đo Xa" />
            <TextBase
              classNames="body3 !text-color-700"
              text="Import dữ liệu chỉ số đo xa từ file Excel"
            />
          </div>
          <Flex justify="end" gap={K_SIZE_8} className="mobile:mt-8 mobile:w-full mobile:flex-col">
            <ButtonBase
              type="ghost"
              disabled={downloadingTemplate || importing}
              onClick={onDownloadTemplate}
              customContent={
                <div className="flex items-center gap-8">
                  <DownloadOutlined />
                  <span>{downloadingTemplate ? 'Đang tải...' : 'Tải mẫu'}</span>
                </div>
              }
              classNames="mobile:w-full mobile:justify-center"
            />
            <Upload
              maxCount={1}
              showUploadList={false}
              disabled={importing}
              beforeUpload={(file) => {
                onImportFile(file);
                return Upload.LIST_IGNORE;
              }}
            >
              <ButtonBase
                type="primary"
                disabled={importing}
                customContent={
                  <div className="flex items-center gap-8">
                    <UploadOutlined />
                    <span>{importing ? 'Đang nhập...' : 'Nhập file Excel'}</span>
                  </div>
                }
                classNames="mobile:w-full mobile:justify-center"
              />
            </Upload>
          </Flex>
        </Flex>

        <Divider className="my-16" />

        <div className="mb-12 flex min-h-36 items-center gap-8 rounded-[6px] border border-link-200 bg-link-50 px-12 py-8 text-13 text-link-700">
          <CheckCircleOutlined className="text-link-600" />
          <span>
            Hệ thống kết nối AMI | <b>{total}</b> công tơ đo xa | Cập nhật dữ liệu:{' '}
            <b>{lastUpdatedAt || 'Chưa có dữ liệu'}</b>
          </span>
        </div>

        {importResult && (
          <div
            className={`mb-16 rounded-[6px] border px-12 py-8 text-13 ${
              importResult.success
                ? 'border-success-200 bg-success-50 text-success-700'
                : 'border-error-200 bg-error-50 text-error-600'
            }`}
          >
            <div className="flex items-center gap-8 font-semibold">
              {importResult.success ? <CheckCircleOutlined /> : <WarningOutlined />}
              <span>
                {importResult.success
                  ? `Đã import ${importedCount} dòng chỉ số`
                  : `Import lỗi ${errorCount} dòng`}
              </span>
            </div>
            {Boolean(importResult.errors?.length) && (
              <ul className="mt-[6px] list-disc pl-[18px]">
                {importResult.errors
                  ?.slice(K_SIZE_0, 5)
                  .map((error) => <li key={error}>{error}</li>)}
              </ul>
            )}
          </div>
        )}

        <Spin spinning={loading && rows.length > K_SIZE_0}>
          <div className="overflow-hidden rounded-radius-l border border-color-400 duration-500">
            <AppTable
              loading={loading}
              rootClassName="w-full"
              className="[&_.ant-pagination]:hidden"
              scroll={{ x: 'max-content', y: '65vh' }}
              dataSource={rows}
              columns={columns}
              rowKey="id"
              pagination={pagination}
            />
          </div>
          <AppPagination currentPage={currentPage} total={total} pagination={pagination} />
        </Spin>
      </section>
    </PageWithBreadcrumb>
  );
};

export default RemoteMeterReadingScreen;
