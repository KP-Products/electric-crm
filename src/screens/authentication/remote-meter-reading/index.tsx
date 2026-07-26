'use client';

import {
  CalendarOutlined,
  CheckCircleOutlined,
  CloseOutlined,
  DownloadOutlined,
  EyeOutlined,
  FileExcelOutlined,
  FilterOutlined,
  InfoCircleOutlined,
  SearchOutlined,
  UploadOutlined,
  WarningOutlined
} from '@ant-design/icons';
import { K_SIZE_0, K_SIZE_1, K_SIZE_8, NULL_VALUE, REQUIRED_MARK } from '@constant';
import { Divider, Flex, Input, Modal, Spin, Upload } from 'antd';
import ButtonBase from 'components/button';
import { AppDatePicker } from 'components/date-picker';
import { AppSelect } from 'components/select';
import Status, { KIND_STATUS, TYPE_STATUS } from 'components/status';
import AppTable from 'components/table';
import AppPagination from 'components/table/pagination';
import { TextBase } from 'components/text';
import { ROUTES } from 'config/routes';
import PageWithBreadcrumb from 'layout/AppLayout/PageWithBreadcumb';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';
import { FORMAT_DATE_API, FORMAT_DATE_PARAMS } from 'utils/date';
import {
  RemoteImportValidationStatus,
  RemoteReadingPreviewRow,
  RemoteReadingTouDetail
} from './useRemoteMeterReading';
import useRemoteMeterReading from './useRemoteMeterReading';

dayjs.extend(customParseFormat);

const requiredMark = <span className="text-error-600">{REQUIRED_MARK}</span>;

const SAVE_MODE_OPTIONS = [
  { value: 'OFFICIAL', label: 'Lưu chính thức' },
  { value: 'DRAFT', label: 'Lưu nháp' }
];

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
  return new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 3 }).format(value);
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

const StatPill = ({
  label,
  value,
  tone
}: {
  label: string;
  value: number;
  tone?: 'success' | 'warning' | 'error';
}) => {
  const toneClassName =
    tone === 'success'
      ? 'border-success-200 bg-success-50 text-success-700'
      : tone === 'warning'
        ? 'border-pending-200 bg-pending-50 text-pending-700'
        : tone === 'error'
          ? 'border-error-200 bg-error-50 text-error-600'
          : 'border-link-200 bg-link-50 text-link-700';

  return (
    <div
      className={`flex min-h-36 items-center justify-between gap-8 rounded-radius-m border px-12 py-8 text-13 font-semibold ${toneClassName}`}
    >
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
};

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
            <th className="w-[140px] px-12 py-[10px] text-right">old_index</th>
            <th className="w-[140px] px-12 py-[10px] text-right">new_index</th>
            <th className="w-[140px] px-12 py-[10px] text-right">Sản lượng</th>
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
                <td className="px-12 py-8 text-right">{formatNumber(detail.usage)}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} className="px-12 py-16 text-center text-color-700">
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
    periodStart,
    periodEnd,
    periodInfo,
    readingDate,
    saveMode,
    note,
    checkingData,
    importing,
    downloadingTemplate,
    importResult,
    checkedAt,
    pagination,
    currentPage,
    pageSize,
    onSelectFile,
    onRemoveFile,
    onCheckData,
    onImportData,
    onDownloadTemplate,
    onChangeTab,
    onChangeKeyword,
    onChangePageSize,
    onChangePeriodStart,
    onChangePeriodEnd,
    onChangeReadingDate,
    onChangeSaveMode,
    onChangeNote
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
        title: 'Số công tơ (meter_number)',
        dataIndex: 'meterNumber',
        key: 'meterNumber',
        width: 180,
        render: (text: string) => (
          <TextBase classNames="sub-title4 !text-color-900" text={text || NULL_VALUE} />
        )
      },
      {
        title: 'Mã khách hàng (customer_id)',
        dataIndex: 'customerId',
        key: 'customerId',
        width: 160,
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
        title: 'Chỉ số hữu công (kWh)',
        dataIndex: 'activeEnergyIndex',
        key: 'activeEnergyIndex',
        align: 'right',
        width: 170,
        render: (value: number) => formatNumber(value)
      },
      {
        title: 'Sản lượng hữu công (kWh)',
        dataIndex: 'activeEnergyUsage',
        key: 'activeEnergyUsage',
        align: 'right',
        width: 180,
        render: (value: number) => formatNumber(value)
      },
      {
        title: 'Chỉ số vô công (kVArh)',
        dataIndex: 'reactiveEnergyIndex',
        key: 'reactiveEnergyIndex',
        align: 'right',
        width: 170,
        render: (value: number) => formatNumber(value)
      },
      {
        title: 'Sản lượng vô công (kVArh)',
        dataIndex: 'reactiveEnergyUsage',
        key: 'reactiveEnergyUsage',
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
        width: 132,
        render: (_: unknown, record: RemoteReadingPreviewRow) => (
          <ButtonBase
            type="ghost"
            size={32}
            classNames="w-full justify-center"
            onClick={() => setTouRow(record)}
            customContent={
              <div className="flex items-center justify-center gap-8">
                <EyeOutlined />
                <span>Xem TOU</span>
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
            title="Chọn file & Kỳ ghi chỉ số"
            description="Chọn file Excel và kỳ ghi chỉ số cần nhập"
          >
            <div className="grid grid-cols-[minmax(220px,1fr)_minmax(120px,0.36fr)_minmax(120px,0.36fr)] items-end gap-12 mobile:grid-cols-1">
              <div>
                <TextBase classNames="caption1 mb-4 !text-color-700" text="File Excel" />
                <Upload
                  maxCount={K_SIZE_1}
                  showUploadList={false}
                  accept=".xlsx,.xls"
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
              <AppDatePicker
                name="periodStart"
                label="Kỳ ghi chỉ số"
                labelSuffix={requiredMark}
                picker="month"
                format="MM/YYYY"
                wrapperClassName="w-full"
                datePickerClassName="w-full"
                value={dayjs(periodStart, 'MM/YYYY')}
                onChange={(date) => onChangePeriodStart(date ? date.format('MM/YYYY') : '')}
              />
              <AppDatePicker
                name="periodEnd"
                label=" "
                picker="month"
                format="MM/YYYY"
                wrapperClassName="w-full"
                datePickerClassName="w-full"
                value={dayjs(periodEnd, 'MM/YYYY')}
                onChange={(date) => onChangePeriodEnd(date ? date.format('MM/YYYY') : '')}
              />
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

        <div className="mt-12 grid grid-cols-[minmax(0,1fr)_280px] gap-12 desktop:grid-cols-1">
          <div className="rounded-radius-l border border-color-300 bg-color-50 p-12">
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
                  text={
                    checkedAt
                      ? `Kiểm tra lúc ${checkedAt}`
                      : 'Dữ liệu mẫu đang hiển thị theo file Excel tham chiếu'
                  }
                />
              </div>
              <div className="grid grid-cols-4 gap-8 mobile:w-full mobile:grid-cols-2">
                <StatPill label="Tổng" value={stats.total} />
                <StatPill label="Hợp lệ" value={stats.valid} tone="success" />
                <StatPill label="Cảnh báo" value={stats.warning} tone="warning" />
                <StatPill label="Lỗi" value={stats.error} tone="error" />
              </div>
            </Flex>

            <div className="mt-12 flex items-center justify-between gap-12 mobile:flex-col mobile:items-stretch">
              <Input
                value={keyword}
                placeholder="Tìm kiếm theo số công tơ, mã khách hàng, tên khách hàng..."
                prefix={<SearchOutlined className="text-color-600" />}
                onChange={(event) => onChangeKeyword(event.target.value)}
                className="h-40 max-w-[520px] rounded-radius-m border-color-300 mobile:max-w-full"
              />
              <ButtonBase
                type="ghost"
                size={40}
                classNames="min-w-[96px] justify-center"
                customContent={
                  <div className="flex items-center gap-8">
                    <FilterOutlined />
                    <span>Bộ lọc</span>
                  </div>
                }
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

          <aside className="rounded-radius-l border border-color-300 bg-color-50 p-16">
            <TextBase classNames="sub-title3 !text-primary-700" text="Cấu hình nhập dữ liệu" />
            <div className="mt-16 flex flex-col gap-12">
              <div>
                <TextBase classNames="caption1 !text-color-700" text="Kỳ ghi chỉ số" />
                <TextBase classNames="sub-title4 mt-4 !text-color-900" text={periodInfo.label} />
              </div>
              <AppDatePicker
                name="readingDate"
                label="Ngày ghi chỉ số"
                labelSuffix={requiredMark}
                wrapperClassName="w-full"
                datePickerClassName="w-full"
                value={dayjs(readingDate, FORMAT_DATE_API)}
                format={FORMAT_DATE_PARAMS}
                onChange={(date) => onChangeReadingDate(date ? date.format(FORMAT_DATE_API) : '')}
              />
              <AppSelect
                name="saveMode"
                label="Chế độ lưu"
                options={SAVE_MODE_OPTIONS}
                value={saveMode}
                onSelectOption={({ key }) =>
                  onChangeSaveMode(key === 'DRAFT' ? 'DRAFT' : 'OFFICIAL')
                }
              />
              <div>
                <TextBase classNames="caption1 mb-4 !text-color-700" text="Ghi chú" />
                <Input.TextArea
                  value={note}
                  rows={4}
                  maxLength={500}
                  placeholder="Nhập ghi chú (nếu có)..."
                  onChange={(event) => onChangeNote(event.target.value)}
                  className="rounded-radius-m border-color-300"
                />
              </div>
              <ButtonBase
                type="primary"
                disabled={!selectedFile || importing || checkingData || stats.error > K_SIZE_0}
                onClick={onImportData}
                classNames="w-full justify-center"
                customContent={
                  <div className="flex items-center justify-center gap-8">
                    <UploadOutlined />
                    <span>{importing ? 'Đang nhập...' : 'Nhập dữ liệu vào hệ thống'}</span>
                  </div>
                }
              />
              {importResult ? (
                <div
                  className={`rounded-radius-m border px-12 py-8 text-13 ${
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
            </div>
          </aside>
        </div>

        <div className="mt-12 grid grid-cols-[minmax(0,1.7fr)_minmax(240px,0.75fr)_minmax(220px,0.6fr)] gap-12 tablet:grid-cols-1">
          <div className="rounded-radius-l border border-pending-200 bg-pending-50 px-16 py-12 text-13 text-color-900">
            <TextBase classNames="sub-title4 mb-8 !text-pending-700" text="Lưu ý" />
            <div>Chỉ số hữu công được tính từ tổng new_index theo TOU CD, BT, TD.</div>
            <div>Chỉ số vô công không bắt buộc; nếu để trống hệ thống sẽ lưu giá trị null.</div>
            <div>Đảm bảo kỳ ghi chỉ số và ngày ghi chỉ số chính xác trước khi xác nhận.</div>
          </div>
          <div className="rounded-radius-l border border-link-100 bg-link-50 px-16 py-12">
            <TextBase classNames="sub-title4 !text-primary-700" text="Tải file Excel mẫu" />
            <TextBase
              classNames="caption1 mt-4 !text-color-700"
              text="Tải file mẫu để nhập dữ liệu theo đúng định dạng."
            />
            <ButtonBase
              type="ghost"
              size={36}
              onClick={onDownloadTemplate}
              classNames="mt-12 justify-center"
              customContent={
                <div className="flex items-center gap-8">
                  <DownloadOutlined />
                  <span>Tải file mẫu Excel</span>
                </div>
              }
            />
          </div>
          <div className="rounded-radius-l border border-color-300 bg-color-50 px-16 py-12">
            <TextBase classNames="sub-title4 !text-primary-700" text="Hướng dẫn" />
            <div className="mt-12 flex items-center gap-8 text-13 font-semibold text-color-700">
              <FileExcelOutlined />
              <span>Du_lieu_cong_to</span>
            </div>
            <div className="mt-8 flex items-center gap-8 text-13 font-semibold text-color-700">
              <CalendarOutlined />
              <span>Chi_tiet_TOU</span>
            </div>
          </div>
        </div>
      </section>

      <TouDetailModal row={touRow} onClose={() => setTouRow(undefined)} />
    </PageWithBreadcrumb>
  );
};

export default RemoteMeterReadingScreen;
