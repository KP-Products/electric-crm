'use client';

import {
  CheckCircleOutlined,
  CloseOutlined,
  DownloadOutlined,
  EyeOutlined,
  FileExcelOutlined,
  InfoCircleOutlined,
  SearchOutlined,
  UploadOutlined,
  WarningOutlined
} from '@ant-design/icons';
import { K_SIZE_0, K_SIZE_1, K_SIZE_8, NULL_VALUE } from '@constant';
import { Divider, Flex, Input, Modal, Spin, Upload } from 'antd';
import ButtonBase from 'components/button';
import { AppSelect } from 'components/select';
import Status, { KIND_STATUS, TYPE_STATUS } from 'components/status';
import AppTable from 'components/table';
import AppPagination from 'components/table/pagination';
import { TextBase } from 'components/text';
import { ROUTES } from 'config/routes';
import PageWithBreadcrumb from 'layout/AppLayout/PageWithBreadcumb';
import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';
import { formatNumberValueWithCommas } from 'utils/number-input';
import {
  RemoteImportValidationStatus,
  RemoteReadingPreviewRow,
  RemoteReadingTouDetail
} from './useRemoteMeterReading';
import useRemoteMeterReading from './useRemoteMeterReading';

const PAGE_SIZE_OPTIONS = [
  { value: 5, label: '5 / trang' },
  { value: 10, label: '10 / trang' },
  { value: 20, label: '20 / trang' }
];

const STATUS_META: Record<
  RemoteImportValidationStatus,
  { label: string; type: TYPE_STATUS; icon: ReactNode }
> = {
  VALID: {
    label: 'Hợp lệ',
    type: TYPE_STATUS.SUCCESS,
    icon: <CheckCircleOutlined />
  },
  WARNING: {
    label: 'Cảnh báo',
    type: TYPE_STATUS.PENDING,
    icon: <WarningOutlined />
  },
  ERROR: {
    label: 'Lỗi',
    type: TYPE_STATUS.ERROR,
    icon: <WarningOutlined />
  }
};

const formatNumber = (value?: number) => {
  if (value === undefined || value === null || !Number.isFinite(value)) return NULL_VALUE;
  return formatNumberValueWithCommas(value);
};

const WorkflowCard = ({
  children,
  description,
  step,
  title
}: {
  children: ReactNode;
  description: string;
  step: string;
  title: string;
}) => (
  <div className="min-h-[132px] rounded-radius-l border border-color-300 bg-color-50 p-16">
    <TextBase classNames="sub-title3 !text-primary-700" text={`${step}. ${title}`} />
    <TextBase classNames="caption1 mt-4 !text-color-700" text={description} />
    <div className="mt-16">{children}</div>
  </div>
);

const StepDivider = () => (
  <div className="flex items-center justify-center text-32 font-light text-color-600 tablet:hidden">
    &gt;
  </div>
);

const MessageList = ({ messages }: { messages: string[] }) => {
  if (!messages.length) return null;

  return (
    <div className="mt-12 rounded-radius-m border border-pending-200 bg-pending-50 px-12 py-8 text-13 text-pending-700">
      {messages.slice(K_SIZE_0, 3).map((message) => (
        <div key={message} className="flex gap-8">
          <InfoCircleOutlined className="mt-[2px] shrink-0" />
          <span>{message}</span>
        </div>
      ))}
    </div>
  );
};

const TouDetailModal = ({
  onClose,
  row
}: {
  onClose: () => void;
  row?: RemoteReadingPreviewRow;
}) => (
  <Modal
    title={`Chi tiết TOU ${row?.meterNumber || ''}`}
    open={Boolean(row)}
    footer={null}
    onCancel={onClose}
    width={720}
  >
    <div className="overflow-x-auto rounded-radius-m border border-color-300">
      <table className="w-full min-w-[560px] border-collapse bg-color-50 text-14">
        <thead>
          <tr className="border-b border-color-300 bg-color-100 text-left text-13 font-semibold text-color-800">
            <th className="w-[80px] px-12 py-[10px]">Dòng</th>
            <th className="w-[120px] px-12 py-[10px]">TOU</th>
            <th className="w-[140px] px-12 py-[10px] text-right">Chỉ số cũ</th>
            <th className="w-[140px] px-12 py-[10px] text-right">Chỉ số mới</th>
            <th className="w-[140px] px-12 py-[10px] text-right">Sản lượng thô</th>
            <th className="w-[170px] px-12 py-[10px] text-right">Sản lượng hiệu chỉnh</th>
          </tr>
        </thead>
        <tbody>
          {row?.touDetails.length ? (
            row.touDetails.map((detail: RemoteReadingTouDetail) => (
              <tr key={detail.id} className="border-b border-color-200">
                <td className="px-12 py-8">{detail.lineNumber}</td>
                <td className="px-12 py-8 font-semibold text-color-900">{detail.tou}</td>
                <td className="px-12 py-8 text-right">{formatNumber(detail.oldIndex)}</td>
                <td className="px-12 py-8 text-right">{formatNumber(detail.newIndex)}</td>
                <td className="px-12 py-8 text-right">
                  {formatNumber(detail.energyRaw ?? detail.usage)}
                </td>
                <td className="px-12 py-8 text-right">{formatNumber(detail.energyAdjusted)}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6} className="px-12 py-16 text-center text-color-700">
                Không có chi tiết TOU.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
    {row?.messages.length ? (
      <div className="mt-12 rounded-radius-m border border-pending-200 bg-pending-50 px-12 py-8 text-13 text-pending-700">
        {row.messages.map((message) => (
          <div key={message}>{message}</div>
        ))}
      </div>
    ) : null}
  </Modal>
);

const RemoteMeterReadingScreen = () => {
  const {
    activeTab,
    tabItems,
    keyword,
    selectedFile,
    displayFileName,
    selectedFileSize,
    paginatedRows,
    filteredRows,
    stats,
    workbookMessages,
    checkingData,
    importing,
    downloadingTemplate,
    importResult,
    checkedAt,
    pagination,
    currentPage,
    pageSize,
    canImportData,
    onSelectFile,
    onRemoveFile,
    onCheckData,
    onImportData,
    onDownloadTemplate,
    onChangeTab,
    onChangeKeyword,
    onChangePageSize
  } = useRemoteMeterReading();
  const [touRow, setTouRow] = useState<RemoteReadingPreviewRow>();

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
        title: 'STT',
        dataIndex: 'lineNumber',
        key: 'lineNumber',
        align: 'center',
        width: 70,
        render: (_: number, __: RemoteReadingPreviewRow, index: number) =>
          (currentPage - K_SIZE_1) * pageSize + index + K_SIZE_1
      },
      {
        title: 'Số công tơ',
        dataIndex: 'meterNumber',
        key: 'meterNumber',
        width: 180,
        render: (text: string) => (
          <TextBase classNames="sub-title4 !text-color-900" text={text || NULL_VALUE} />
        )
      },
      {
        title: 'Mã khách hàng',
        dataIndex: 'customerId',
        key: 'customerId',
        width: 160,
        render: (text: string) => text || NULL_VALUE
      },
      {
        title: 'Mã kỳ',
        dataIndex: 'periodCode',
        key: 'periodCode',
        width: 130,
        render: (text: string) => text || NULL_VALUE
      },
      {
        title: 'Ngày ghi',
        dataIndex: 'readingDate',
        key: 'readingDate',
        width: 130,
        render: (text: string) => text || NULL_VALUE
      },
      {
        title: 'Tên khách hàng',
        dataIndex: 'customerName',
        key: 'customerName',
        width: 220,
        render: (text: string) => (
          <TextBase classNames="sub-title4 truncate !text-color-900" text={text || NULL_VALUE} />
        )
      },
      {
        title: 'Hệ số nhân',
        dataIndex: 'multiplier',
        key: 'multiplier',
        align: 'right',
        width: 120,
        render: (value: number) => formatNumber(value)
      },
      {
        title: 'Tổng chỉ số cuối',
        dataIndex: 'activeEnergyIndex',
        key: 'activeEnergyIndex',
        align: 'right',
        width: 170,
        render: (value: number) => formatNumber(value)
      },
      {
        title: 'Sản lượng thô',
        dataIndex: 'activeEnergyUsage',
        key: 'activeEnergyUsage',
        align: 'right',
        width: 180,
        render: (value: number) => formatNumber(value)
      },
      {
        title: 'Sản lượng hiệu chỉnh',
        dataIndex: 'energyAdjustedUsage',
        key: 'energyAdjustedUsage',
        align: 'right',
        width: 180,
        render: (value: number) => formatNumber(value)
      },
      {
        title: 'Trạng thái',
        dataIndex: 'status',
        key: 'status',
        width: 130,
        render: (status: RemoteImportValidationStatus) => {
          const meta = STATUS_META[status];
          return (
            <Status
              type={meta.type}
              kind={KIND_STATUS.SECONDARY}
              content={meta.label}
              contentStyle="whitespace-nowrap"
            />
          );
        }
      },
      {
        title: 'Thao tác',
        key: 'action',
        fixed: 'right',
        width: 180,
        render: (_: unknown, record: RemoteReadingPreviewRow) => (
          <ButtonBase
            type="ghost"
            size={32}
            classNames="w-full justify-center"
            onClick={() => setTouRow(record)}
            customContent={
              <div className="flex items-center justify-center gap-8">
                <EyeOutlined />
                <TextBase>Xem TOU</TextBase>
              </div>
            }
          />
        )
      }
    ],
    [currentPage, pageSize]
  );

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
              text="Nhập chỉ số công tơ đo xa từ file Excel theo kỳ ghi chỉ số"
            />
          </div>
        </Flex>

        <Divider className="my-16" />

        <div className="grid grid-cols-[minmax(240px,1fr)_36px_minmax(420px,1.9fr)_36px_minmax(240px,1fr)] gap-12 tablet:grid-cols-1">
          <WorkflowCard
            step="1"
            title="Tải file Excel"
            description="Tải file theo đúng mẫu để đảm bảo dữ liệu hợp lệ"
          >
            <ButtonBase
              type="primary"
              disabled={downloadingTemplate || importing}
              onClick={onDownloadTemplate}
              customContent={
                <div className="flex items-center gap-8">
                  <DownloadOutlined />
                  <span>{downloadingTemplate ? 'Đang tải...' : 'Tải mẫu Excel'}</span>
                </div>
              }
            />
          </WorkflowCard>

          <StepDivider />

          <WorkflowCard
            step="2"
            title="Chọn file Excel"
            description="Chọn file theo mẫu của hệ thống để kiểm tra và nhập dữ liệu"
          >
            <div>
              <TextBase classNames="caption1 mb-4 !text-color-700" text="File Excel" />
              <Upload
                maxCount={K_SIZE_1}
                showUploadList={false}
                accept=".xlsx"
                disabled={importing}
                beforeUpload={(file) => {
                  onSelectFile(file);
                  return Upload.LIST_IGNORE;
                }}
              >
                <button
                  type="button"
                  className="flex h-44 w-full items-center gap-8 rounded-radius-m border border-color-300 bg-color-50 px-12 text-left hover:border-primary-500 disabled:cursor-not-allowed disabled:bg-color-200"
                  disabled={importing}
                >
                  <FileExcelOutlined className="text-success-700" />
                  <span className="min-w-0 flex-1 truncate text-14 font-semibold text-color-900">
                    {displayFileName}
                  </span>
                  {selectedFile ? (
                    <span
                      role="button"
                      tabIndex={0}
                      className="text-color-600 hover:text-error-600"
                      onClick={(event) => {
                        event.stopPropagation();
                        onRemoveFile();
                      }}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          event.stopPropagation();
                          onRemoveFile();
                        }
                      }}
                    >
                      <CloseOutlined />
                    </span>
                  ) : null}
                </button>
              </Upload>
              {selectedFileSize ? (
                <TextBase classNames="caption1 mt-4 !text-color-700" text={selectedFileSize} />
              ) : null}
            </div>
          </WorkflowCard>

          <StepDivider />

          <WorkflowCard
            step="3"
            title="Kiểm tra & Nhập dữ liệu"
            description="Kiểm tra dữ liệu trước khi nhập vào hệ thống"
          >
            <ButtonBase
              type="primary"
              disabled={checkingData || importing}
              onClick={onCheckData}
              customContent={
                <div className="flex items-center gap-8">
                  <SearchOutlined />
                  <span>{checkingData ? 'Đang kiểm tra...' : 'Kiểm tra dữ liệu'}</span>
                </div>
              }
            />
          </WorkflowCard>
        </div>

        <div className="mt-12 rounded-radius-l border border-color-300 bg-color-50 p-12">
          <Flex
            justify="space-between"
            align="start"
            gap={K_SIZE_8}
            className="mobile:flex-col mobile:items-start"
          >
            <div>
              <TextBase
                classNames="sub-title3 !text-primary-700"
                text={`Dữ liệu chi tiết từ file (${stats.total} dòng)`}
              />
              <TextBase
                classNames="caption1 mt-4 !text-color-700"
                text={checkedAt ? `Kiểm tra lúc ${checkedAt}` : 'Chưa kiểm tra dữ liệu file'}
              />
            </div>
            <ButtonBase
              type="primary"
              disabled={!canImportData}
              onClick={onImportData}
              classNames="min-w-[246px] justify-center mobile:w-full"
              customContent={
                <div className="flex items-center justify-center gap-8">
                  <UploadOutlined />
                  <span>{importing ? 'Đang nhập...' : 'Nhập dữ liệu vào hệ thống'}</span>
                </div>
              }
            />
          </Flex>

          {importResult ? (
            <div
              className={`mt-12 rounded-radius-m border px-12 py-8 text-13 ${
                importResult.success
                  ? 'border-success-200 bg-success-50 text-success-700'
                  : 'border-error-200 bg-error-50 text-error-600'
              }`}
            >
              <div className="flex items-center gap-8 font-semibold">
                {importResult.success ? <CheckCircleOutlined /> : <WarningOutlined />}
                <span>
                  {importResult.success
                    ? `Đã nhập ${importResult.rowCount || stats.total} dòng chỉ số`
                    : `Import lỗi ${importResult.errors?.length || K_SIZE_0} dòng`}
                </span>
              </div>
              {importResult.errors?.length ? (
                <ul className="mt-[6px] list-disc pl-[18px]">
                  {importResult.errors.slice(K_SIZE_0, 5).map((error) => (
                    <li key={error}>{error}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : null}

          <div className="mt-12 flex items-center justify-between gap-12 mobile:flex-col mobile:items-stretch">
            <Input
              value={keyword}
              placeholder="Tìm kiếm theo số công tơ, mã khách hàng, tên khách hàng, mã kỳ..."
              prefix={<SearchOutlined className="text-color-600" />}
              onChange={(event) => onChangeKeyword(event.target.value)}
              className="h-40 max-w-[520px] rounded-radius-m border-color-300 mobile:max-w-full"
            />
          </div>

          <div className="mt-12 flex flex-wrap gap-20 border-b border-color-300">
            {tabItems.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => onChangeTab(tab.key)}
                className={`border-b px-4 pb-8 text-14 font-semibold ${
                  activeTab === tab.key
                    ? 'border-primary-600 text-primary-700'
                    : 'border-color-50 text-color-700 hover:text-primary-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <MessageList messages={workbookMessages} />

          <Spin spinning={checkingData}>
            <div className="mt-16 overflow-hidden rounded-radius-m border border-color-300">
              <AppTable
                rootClassName="w-full"
                className="[&_.ant-pagination]:hidden"
                scroll={{ x: 'max-content', y: '52vh' }}
                dataSource={paginatedRows}
                columns={columns}
                rowKey="id"
                pagination={false}
                rowSelection={{ preserveSelectedRowKeys: true }}
              />
            </div>
            <div className="grid grid-cols-[minmax(0,1fr)_150px] items-start gap-12 mobile:grid-cols-1">
              <AppPagination
                currentPage={currentPage}
                total={filteredRows.length}
                pagination={pagination}
                className="mt-12"
              />
              <AppSelect
                name="pageSize"
                options={PAGE_SIZE_OPTIONS}
                value={pageSize}
                onSelectOption={({ key }) => onChangePageSize(Number(key))}
                wrapperClassName="mt-12"
              />
            </div>
          </Spin>
        </div>
      </section>

      <TouDetailModal row={touRow} onClose={() => setTouRow(undefined)} />
    </PageWithBreadcrumb>
  );
};

export default RemoteMeterReadingScreen;
