'use client';

import { CameraOutlined, CheckCircleOutlined, SearchOutlined } from '@ant-design/icons';
import { NULL_VALUE } from '@constant';
import { Select, Upload } from 'antd';
import ButtonBase from 'components/button';
import { AppTextField } from 'components/text-field';
import Status, { KIND_STATUS, TYPE_STATUS } from 'components/status';
import { TextBase } from 'components/text';
import AppPagination from 'components/table/pagination';
import PageWithBreadcrumb from 'layout/AppLayout/PageWithBreadcumb';
import { ManualMeterReadingRow } from 'model/manual-meter-reading';
import { useMemo } from 'react';
import useManualMeterReading, { getManualReadingMetrics } from './useManualMeterReading';

const STATUS_OPTIONS = [
  { label: 'Chưa ghi', value: 'UNRECORDED' },
  { label: 'Đã ghi', value: 'RECORDED' },
  { label: 'Bất thường', value: 'ABNORMAL' }
];

const formatNumber = (value?: number) => {
  if (value === undefined || value === null || !Number.isFinite(value)) return NULL_VALUE;
  return new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 3 }).format(value);
};

const getCardAccentClass = (row: ManualMeterReadingRow) => {
  const metrics = getManualReadingMetrics(row);
  if (metrics.abnormal) return 'border-t-error-500';
  if (metrics.recorded) return 'border-t-link-500';
  return 'border-t-primary-600';
};

const getCardStatus = (row: ManualMeterReadingRow) => {
  const metrics = getManualReadingMetrics(row);
  if (metrics.abnormal) {
    return {
      type: TYPE_STATUS.ERROR,
      label: 'Bất thường'
    };
  }
  if (metrics.recorded) {
    return {
      type: TYPE_STATUS.SUCCESS,
      label: 'Đã ghi'
    };
  }
  return {
    type: TYPE_STATUS.PENDING,
    label: 'Chưa ghi'
  };
};

const ReadingCard = ({
  row,
  onChangeReading,
  onChangeNote,
  onSelectPhoto
}: {
  row: ManualMeterReadingRow;
  onChangeReading: (id: number, value: string) => void;
  onChangeNote: (id: number, value: string) => void;
  onSelectPhoto: (id: number, file: File) => void;
}) => {
  const metrics = getManualReadingMetrics(row);
  const status = getCardStatus(row);

  return (
    <div
      className={`flex min-h-[250px] flex-col rounded-[6px] border border-t-[4px] border-color-300 bg-color-50 p-16 shadow-[0_4px_12px_rgba(27,29,41,0.05)] ${getCardAccentClass(
        row
      )}`}
    >
      <div className="mb-12 flex items-start justify-between gap-8">
        <div className="min-w-0">
          <TextBase
            classNames="body4 !text-color-600"
            text={`CT-${row.id || '-'} | KH: ${row.customerCode || row.customerId || '-'}`}
          />
          <TextBase
            classNames="sub-title3 truncate !text-color-900"
            text={row.customerName || `Khách hàng ${row.customerId || ''}`}
          />
          <TextBase
            classNames="body4 truncate !text-color-700"
            text={row.customerAddress || row.areaName || NULL_VALUE}
          />
        </div>
        <Status type={status.type} kind={KIND_STATUS.SECONDARY} content={status.label} />
      </div>

      <div className="grid grid-cols-2 gap-12">
        <AppTextField
          name={`oldIndex-${row.id}`}
          label="CS cũ kỳ trước"
          value={formatNumber(metrics.oldIndex)}
          disabled
          size="middle"
        />
        <AppTextField
          name={`newIndex-${row.id}`}
          label="CS kỳ này *"
          value={row.draftNewIndex}
          onChange={(event) => onChangeReading(row.id, event.target.value)}
          size="middle"
        />
        <AppTextField
          name={`energy-${row.id}`}
          label="Sản lượng (kWh)"
          value={formatNumber(metrics.energy)}
          disabled
          size="middle"
        />
        <AppTextField
          name={`multiplier-${row.id}`}
          label="Hệ số nhân"
          value={formatNumber(metrics.multiplier)}
          disabled
          size="middle"
        />
      </div>

      <AppTextField
        name={`note-${row.id}`}
        value={row.draftNote}
        onChange={(event) => onChangeNote(row.id, event.target.value)}
        placeholder="Ghi chú"
        wrapperClassName="mt-12"
        size="middle"
      />

      <div className="mt-auto flex items-center justify-between gap-8 pt-12">
        <Upload
          showUploadList={false}
          beforeUpload={(file) => {
            onSelectPhoto(row.id, file);
            return Upload.LIST_IGNORE;
          }}
        >
          <button className="inline-flex h-28 items-center gap-4 rounded-[4px] border border-color-400 bg-color-50 px-8 text-12 font-semibold text-color-800">
            <CameraOutlined />
            Ảnh công tơ
          </button>
        </Upload>
        <TextBase
          classNames={`body4 ${
            row.draftPhotoName ? '!text-success-700' : '!text-color-600'
          } truncate text-right`}
          text={row.draftPhotoName ? 'Đã có ảnh' : 'Chưa có ảnh'}
        />
      </div>

      {metrics.abnormal && (
        <div className="mt-8 rounded-[4px] border border-error-200 bg-error-50 px-8 py-4 text-12 font-semibold text-error-600">
          Chỉ số giảm - cần kiểm tra lại
        </div>
      )}
    </div>
  );
};

const ManualMeterReadingScreen = () => {
  const {
    filteredRows,
    filter,
    loading,
    savingDraft,
    savingConfirm,
    periodLabel,
    pagination,
    areaOptions,
    onChangeFilter,
    onChangeReading,
    onChangeNote,
    onSelectPhoto,
    onSaveDraft,
    onConfirmAndSave
  } = useManualMeterReading();

  const breadcrumbList = useMemo(() => [{ title: 'Chỉ số' }, { title: 'Nhập thủ công' }], []);

  return (
    <PageWithBreadcrumb breadcrumbList={breadcrumbList}>
      <div className="mx-auto max-w-[1180px]">
        <div className="mb-12 flex items-start justify-between gap-16 tablet:flex-col">
          <div>
            <TextBase classNames="title4" text="Nhập Chỉ Số Thủ Công" />
            <TextBase classNames="body3 !text-color-700" text="Ghi nhận chỉ số công tơ định kỳ" />
          </div>
          <div className="flex gap-8 mobile:w-full mobile:flex-col">
            <ButtonBase
              type="ghost"
              leftIcon="ICON_CHECK"
              customContent={savingDraft ? 'Đang lưu...' : 'Lưu nháp'}
              disabled={savingDraft || savingConfirm}
              onClick={onSaveDraft}
              classNames="mobile:w-full mobile:justify-center"
            />
            <ButtonBase
              type="primary"
              leftIcon="ICON_CHECK"
              customContent={savingConfirm ? 'Đang lưu...' : 'Xác nhận & Lưu'}
              disabled={savingDraft || savingConfirm}
              onClick={onConfirmAndSave}
              classNames="mobile:w-full mobile:justify-center"
            />
          </div>
        </div>

        <div className="mb-12 flex min-h-36 items-center gap-8 rounded-[6px] border border-link-200 bg-link-50 px-12 py-8 text-13 text-link-700">
          <CheckCircleOutlined className="text-link-600" />
          <span>
            Kỳ ghi chỉ số: <b>{periodLabel}</b>
          </span>
        </div>

        <div className="mb-16 grid grid-cols-[1fr_150px_150px] gap-12 tablet:grid-cols-1">
          <AppTextField
            name="keyword"
            value={filter.keyword}
            onChange={(event) => onChangeFilter('keyword', event.target.value)}
            prefix={<SearchOutlined className="text-color-600" />}
            placeholder="Tìm theo mã KH, tên, số công tơ..."
            size="middle"
          />
          <Select
            allowClear
            value={filter.area || undefined}
            onChange={(value) => onChangeFilter('area', value || '')}
            options={areaOptions}
            placeholder="Tất cả KV"
            className="h-40"
          />
          <Select
            allowClear
            value={filter.status || undefined}
            onChange={(value) => onChangeFilter('status', value || '')}
            options={STATUS_OPTIONS}
            placeholder="Chưa ghi"
            className="h-40"
          />
        </div>

        <div className="min-h-[460px]">
          {loading ? (
            <div className="rounded-[6px] border border-color-300 bg-color-50 p-24 text-center text-14 text-color-700">
              Đang tải dữ liệu...
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-16 desktop:grid-cols-2 tablet:grid-cols-1">
              {filteredRows.map((row) => (
                <ReadingCard
                  key={row.id}
                  row={row}
                  onChangeReading={onChangeReading}
                  onChangeNote={onChangeNote}
                  onSelectPhoto={onSelectPhoto}
                />
              ))}
            </div>
          )}
        </div>

        <div className="mt-16">
          <AppPagination
            currentPage={pagination.current}
            total={pagination.total}
            pagination={pagination}
          />
        </div>
      </div>
    </PageWithBreadcrumb>
  );
};

export default ManualMeterReadingScreen;
