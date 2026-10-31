'use client';

import {
  CalendarOutlined,
  CheckCircleOutlined,
  DeleteOutlined,
  FileTextOutlined,
  ReloadOutlined,
  SearchOutlined,
  UploadOutlined
} from '@ant-design/icons';
import { K_SIZE_0, K_SIZE_8, NULL_VALUE, REQUIRED_MARK } from '@constant';
import { Divider, Flex, Image, Input, Upload } from 'antd';
import ButtonBase from 'components/button';
import { AppDatePicker } from 'components/date-picker';
import { AppSelect } from 'components/select';
import CustomDropSearchMore from 'components/select/CustomDropSearchMore';
import Status, { KIND_STATUS, TYPE_STATUS } from 'components/status';
import { TextBase } from 'components/text';
import { AppTextField } from 'components/text-field';
import { ROUTES } from 'config/routes';
import PageWithBreadcrumb from 'layout/AppLayout/PageWithBreadcumb';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { useCallback, useMemo, type ReactNode } from 'react';
import { API_DATE_INPUT_FORMATS, FORMAT_DATE_API, FORMAT_DATE_PARAMS } from 'utils/date';
import {
  formatDecimalInputWithCommas,
  formatNumberValueWithCommas,
  parseFormattedNumber
} from 'utils/number-input';
import {
  ManualReadingMeter,
  ManualReadingRegister,
  ManualReadingStatus
} from './useManualMeterReading';
import useManualMeterReading from './useManualMeterReading';
import { getReadingStatusMeta } from '../reading-data-approval/utils';

dayjs.extend(customParseFormat);

const requiredMark = <span className="text-error-600">{REQUIRED_MARK}</span>;

const formatNumber = (value?: number) => {
  if (value === undefined || value === null || !Number.isFinite(value)) return NULL_VALUE;
  return formatNumberValueWithCommas(value);
};

const parseNumber = (value?: string | number) => {
  return parseFormattedNumber(value);
};

const getRegisterUsage = (register: ManualReadingRegister) => {
  const newIndex = parseNumber(register.newIndex);
  if (newIndex === undefined) return undefined;
  return newIndex - register.oldIndex;
};

const InfoBox = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="rounded-radius-m border border-color-300 bg-color-50 px-12 py-[10px]">
    <TextBase classNames="caption1 !text-color-700" text={label} />
    <div className="mt-4 min-h-20 text-14 font-semibold text-color-900">{value || NULL_VALUE}</div>
  </div>
);

const MeterStatus = ({ status }: { status: ManualReadingStatus }) => {
  const meta =
    status === 'NOT_ENTERED'
      ? { label: 'Chưa nhập', type: TYPE_STATUS.DISABLED }
      : getReadingStatusMeta(status);
  return (
    <Status
      type={meta.type}
      kind={KIND_STATUS.SECONDARY}
      content={meta.label}
      contentStyle="whitespace-nowrap"
    />
  );
};

const MeterListItem = ({
  meter,
  selected,
  onSelect
}: {
  meter: ManualReadingMeter;
  selected: boolean;
  onSelect: () => void;
}) => (
  <button
    type="button"
    onClick={onSelect}
    className={`w-full rounded-radius-m border bg-color-50 p-12 text-left transition-colors ${
      selected ? 'border-primary-500 bg-primary-50' : 'border-color-300 hover:border-primary-500'
    }`}
  >
    <Flex align="start" gap={K_SIZE_8}>
      <div className="mt-[2px] flex size-24 shrink-0 items-center justify-center rounded-radius-m bg-link-50 text-link-600">
        <FileTextOutlined />
      </div>
      <div className="min-w-0 flex-1">
        <Flex align="center" justify="space-between" gap={K_SIZE_8}>
          <TextBase
            classNames="sub-title4 truncate !text-primary-700"
            text={`${meter.meterCode} | ${meter.serialNo}`}
          />
          <MeterStatus status={meter.status} />
        </Flex>
        <TextBase classNames="caption1 truncate !text-color-700" text={meter.address} />
        <TextBase
          classNames="caption1 !text-color-800"
          text={`Hệ số nhân: ${formatNumber(meter.multiplier)}`}
        />
      </div>
    </Flex>
  </button>
);

export interface ManualMeterReadingScreenProps {
  scope?: 'customer' | 'feeder';
  feederId?: string;
}

const ManualMeterReadingScreen = ({
  scope = 'customer',
  feederId
}: ManualMeterReadingScreenProps) => {
  const isFeederScope = scope === 'feeder';
  const {
    filterDraft,
    filterApplied,
    filteredMeters,
    selectedMeter,
    selectedMeterId,
    selectedMeterMetrics,
    periodInfo,
    searchByOptions,
    searchLookupField,
    searchLookupOptions,
    searchLookupSearch,
    searchLookupLoading,
    selectedFeederCode,
    selectedFeederName,
    periodOptions,
    maxPhotoCount,
    hasUnsyncedFilter,
    loadingMeters,
    loadingDetail,
    savingConfirm,
    onSearchLookupOptions,
    onOpenSearchLookupDropdown,
    onChangeFilter,
    onApplyFilter,
    onResetFilter,
    onSelectMeterWithUnsavedCheck,
    onChangeRegister,
    onChangeReactiveIndex,
    onChangeNote,
    onSelectPhoto,
    onRemovePendingPhoto,
    onRemoveUploadedPhoto,
    onClearSelectedMeter,
    onSave
  } = useManualMeterReading({ scope, feederId });

  const isSelectedMeterConfirmed = selectedMeter?.status === 'CONFIRMED';
  const isSelectedMeterWaitingConfirmed = selectedMeter?.status === 'SAVED';

  const breadcrumbList = useMemo(
    () => [
      { title: 'Chỉ số - Hoá đơn' },
      {
        title: isFeederScope ? 'Nhập chỉ số theo lộ' : 'Nhập chỉ số thủ công',
        key: isFeederScope ? ROUTES.EVN_READING_BATCH : ROUTES.MANUAL_METER_READING
      }
    ],
    [isFeederScope]
  );

  const hasUnsyncedPeriodInfo =
    filterDraft.periodCode !== filterApplied.periodCode ||
    filterDraft.readingDate !== filterApplied.readingDate;

  const renderSearchLookupDropdown = useCallback(
    (menuInstance: ReactNode) => (
      <CustomDropSearchMore
        menuInstance={menuInstance}
        searchValue={searchLookupSearch}
        onChangeSearch={onSearchLookupOptions}
        onMore={() => {}}
        totalList={searchLookupOptions.length}
        total={searchLookupOptions.length}
        loading={searchLookupLoading}
      />
    ),
    [onSearchLookupOptions, searchLookupLoading, searchLookupOptions.length, searchLookupSearch]
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
            <TextBase
              classNames="title4"
              text={isFeederScope ? 'Nhập chỉ số thủ công theo lộ' : 'Nhập Chỉ Số Thủ Công'}
            />
            <TextBase
              classNames="body3 !text-color-700"
              text={
                isFeederScope
                  ? 'Nhập chỉ số các công tơ thuộc lộ theo kỳ ghi chỉ số'
                  : 'Nhập chỉ số công tơ của khách hàng theo kỳ'
              }
            />
          </div>
          <Flex justify="end" gap={K_SIZE_8} className="mobile:w-full mobile:flex-col">
            <ButtonBase
              type="ghost"
              customContent={
                <div className="flex items-center gap-8">
                  <CheckCircleOutlined />
                  <span>{savingConfirm ? 'Đang lưu...' : 'Lưu nháp'}</span>
                </div>
              }
              disabled={
                savingConfirm ||
                loadingMeters ||
                loadingDetail ||
                hasUnsyncedFilter ||
                isSelectedMeterConfirmed ||
                isSelectedMeterWaitingConfirmed
              }
              onClick={() => onSave('DRAFT')}
              classNames="mobile:w-full mobile:justify-center"
            />
            <ButtonBase
              type="primary"
              customContent={
                <div className="flex items-center gap-8">
                  <CheckCircleOutlined />
                  <span>{savingConfirm ? 'Đang lưu...' : 'Xác nhận và Lưu'}</span>
                </div>
              }
              disabled={
                savingConfirm ||
                loadingMeters ||
                loadingDetail ||
                hasUnsyncedFilter ||
                isSelectedMeterConfirmed
              }
              onClick={() => onSave('SAVED')}
              classNames="mobile:w-full mobile:justify-center"
            />
          </Flex>
        </Flex>

        <Divider className="my-16" />

        <div className="mb-12 rounded-radius-l border border-color-300 bg-color-50 p-12">
          <TextBase
            classNames="sub-title4 mb-12 !text-primary-700"
            text={
              isFeederScope
                ? '1. Tìm kiếm lộ & kỳ ghi chỉ số'
                : '1. Tìm kiếm khách hàng & kỳ ghi chỉ số'
            }
          />
          <div
            className={`grid items-end gap-12 ${
              isFeederScope ? 'grid-cols-3' : 'grid-cols-5'
            } desktop:grid-cols-3 tablet:grid-cols-2 mobile:grid-cols-1`}
          >
            {!isFeederScope && (
              <AppTextField
                name="keyword"
                label="Khách hàng"
                placeholder={KEYWORD_PLACEHOLDER[filterDraft.searchBy] || 'Nhập từ khoá tìm kiếm'}
                value={filterDraft.keyword}
                prefix={<SearchOutlined className="text-color-600" />}
                onChange={(event) => onChangeFilter('keyword', event.target.value)}
                onPressEnter={onApplyFilter}
              />
            )}
            {!isFeederScope && (
              <AppSelect
                name="searchBy"
                label="Tìm theo"
                placeholder="Chọn tiêu chí"
                options={searchByOptions}
                value={filterDraft.searchBy}
                onSelectOption={({ key }) => onChangeFilter('searchBy', String(key))}
              />
            )}
            <AppSelect
              name="customerCode"
              label={searchLookupField.label}
              placeholder={searchLookupField.placeholder}
              value={filterDraft.customerCode}
              options={searchLookupOptions}
              dropdownRender={renderSearchLookupDropdown}
              onOpenChange={onOpenSearchLookupDropdown}
              onSelectOption={({ key }) => onChangeFilter('customerCode', String(key))}
              suffix={<SearchOutlined className="text-color-600" />}
            />
            <AppSelect
              name="periodCode"
              label="Kỳ ghi chỉ số"
              labelSuffix={requiredMark}
              placeholder="Chọn kỳ"
              options={periodOptions}
              value={filterDraft.periodCode}
              onSelectOption={({ key }) => onChangeFilter('periodCode', String(key))}
            />
            <AppDatePicker
              name="readingDate"
              label="Ngày ghi chỉ số"
              labelSuffix={requiredMark}
              wrapperClassName="w-full"
              value={
                filterDraft.readingDate
                  ? dayjs(filterDraft.readingDate, API_DATE_INPUT_FORMATS)
                  : undefined
              }
              format={FORMAT_DATE_PARAMS}
              onChange={(date) => {
                onChangeFilter('readingDate', date ? date.format(FORMAT_DATE_API) : '');
              }}
            />
            <Flex justify="end" gap={K_SIZE_8} className="col-span-full mobile:w-full">
              <ButtonBase
                type="primary"
                leftIcon="IC_SEARCH_OUTLINE2"
                customContent={loadingMeters ? 'Đang tìm...' : 'Tìm kiếm'}
                onClick={onApplyFilter}
                disabled={loadingMeters}
                classNames="min-w-[112px] mobile:flex-1 mobile:justify-center"
              />
              <ButtonBase
                type="ghost"
                customContent="Xoá bộ lọc"
                onClick={onResetFilter}
                classNames="min-w-[104px] mobile:flex-1 mobile:justify-center"
              />
            </Flex>
          </div>
          {!hasUnsyncedPeriodInfo && (
            <div className="mt-12 flex min-h-32 items-center gap-8 rounded-radius-m border border-link-200 bg-link-50 px-12 py-8 text-13 text-link-700">
              <CalendarOutlined />
              <span>
                Kỳ ghi chỉ số: <b>{periodInfo.label}</b> | Ngày ghi:{' '}
                <b>{periodInfo.readingDate || NULL_VALUE}</b>
              </span>
            </div>
          )}
          {hasUnsyncedFilter && (
            <div className="mt-8 rounded-radius-m border border-pending-200 bg-pending-50 px-12 py-8 text-13 font-semibold text-pending-700">
              Bộ lọc đã thay đổi. Vui lòng tìm kiếm lại trước khi lưu chỉ số.
            </div>
          )}
        </div>

        <div className="grid grid-cols-[320px_minmax(0,1fr)] gap-12 tablet:grid-cols-1">
          <aside className="flex min-h-[520px] flex-col rounded-radius-l border border-color-300 bg-color-50 p-12 tablet:min-h-0">
            <TextBase
              classNames="sub-title4 !text-primary-700"
              text={
                isFeederScope
                  ? '2. Danh sách công tơ theo lộ'
                  : '2. Danh sách công tơ của khách hàng'
              }
            />
            <TextBase
              classNames="caption1 mt-4 !text-color-700"
              text={`Tổng số công tơ: ${filteredMeters.length}`}
            />
            <div className="mt-12 flex max-h-[480px] flex-col gap-8 overflow-auto pr-4">
              {loadingMeters ? (
                <div className="rounded-radius-m border border-color-300 p-12 text-14 text-color-700">
                  Đang tải danh sách công tơ...
                </div>
              ) : filteredMeters.length === K_SIZE_0 ? (
                <div className="rounded-radius-m border border-color-300 p-12 text-14 text-color-700">
                  Không tìm thấy công tơ phù hợp.
                </div>
              ) : (
                filteredMeters.map((meter) => (
                  <MeterListItem
                    key={meter.id}
                    meter={meter}
                    selected={meter.id === selectedMeterId}
                    onSelect={() => onSelectMeterWithUnsavedCheck(meter.id)}
                  />
                ))
              )}
            </div>
            <ButtonBase
              type="ghost"
              customContent={
                <div className="flex items-center justify-center gap-8">
                  <ReloadOutlined />
                  <span>Tải lại danh sách</span>
                </div>
              }
              onClick={onApplyFilter}
              disabled={loadingMeters}
              classNames="mt-auto w-fit justify-center px-16"
            />
          </aside>

          <div className="min-h-[520px] rounded-radius-l border border-color-300 bg-color-50 p-12 tablet:min-h-0">
            {loadingDetail ? (
              <div className="flex min-h-[460px] items-center justify-center rounded-radius-m border border-dashed border-color-300 text-14 text-color-700">
                Đang tải kỳ ghi chỉ số...
              </div>
            ) : selectedMeter ? (
              <>
                <Flex
                  justify="space-between"
                  align="center"
                  gap={K_SIZE_8}
                  className="mobile:flex-col mobile:items-start"
                >
                  <TextBase
                    classNames="sub-title3 !text-color-900"
                    text={
                      isFeederScope
                        ? 'Thông tin lộ'
                        : `${selectedMeter.meterCode} | ${selectedMeter.serialNo}`
                    }
                  />
                  <MeterStatus status={selectedMeter.status} />
                </Flex>

                <div className="mt-12 grid grid-cols-4 gap-12 desktop:grid-cols-2 mobile:grid-cols-1">
                  <InfoBox
                    label={isFeederScope ? 'Mã lộ' : 'Mã khách hàng'}
                    value={
                      <span className="text-primary-700">
                        {isFeederScope ? selectedFeederCode : selectedMeter.customerCode}
                      </span>
                    }
                  />
                  <InfoBox
                    label={isFeederScope ? 'Tên lộ' : 'Tên khách hàng'}
                    value={
                      <span className="text-primary-700">
                        {isFeederScope ? selectedFeederName : selectedMeter.customerName}
                      </span>
                    }
                  />
                  <InfoBox label="Địa chỉ" value={selectedMeter.address} />
                  <InfoBox label="Hệ số nhân" value={formatNumber(selectedMeter.multiplier)} />
                </div>

                <div className="mt-16">
                  <TextBase
                    classNames="sub-title4 mb-8 !text-color-900"
                    text="Nhập chỉ số theo công tơ"
                  />
                  <div className="overflow-x-auto rounded-radius-m border border-color-300">
                    <table className="w-full min-w-[820px] border-collapse bg-color-50 text-14">
                      <thead>
                        <tr className="border-b border-color-300 bg-color-100 text-left text-13 font-semibold text-color-800">
                          <th className="w-[170px] px-12 py-[10px]">TOU</th>
                          <th className="w-[130px] px-12 py-[10px] text-right">Chỉ số cũ</th>
                          <th className="w-[150px] px-12 py-[10px] text-right">
                            Chỉ số mới <span className="text-error-600">*</span>
                          </th>
                          <th className="w-[150px] px-12 py-[10px] text-right">
                            Sản lượng thô (kWh)
                          </th>
                          <th className="w-[120px] px-12 py-[10px] text-right">Hệ số nhân</th>
                          <th className="w-[160px] px-12 py-[10px] text-right">
                            Sản lượng quy đổi (kWh)
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedMeter.registers.map((register) => {
                          const rawKwh = getRegisterUsage(register);
                          const adjustedKwh =
                            rawKwh === undefined ? undefined : rawKwh * register.multiplier;
                          const invalid = rawKwh !== undefined && rawKwh < K_SIZE_0;

                          return (
                            <tr key={register.id} className="border-b border-color-200">
                              <td className="px-12 py-8 font-semibold text-color-900">
                                {register.label}
                              </td>
                              <td className="px-12 py-8">
                                <Input
                                  className="text-right"
                                  value={formatNumber(register.oldIndex)}
                                  disabled
                                />
                              </td>
                              <td className="px-12 py-8">
                                <Input
                                  className="text-right"
                                  status={invalid ? 'error' : undefined}
                                  value={formatDecimalInputWithCommas(register.newIndex)}
                                  inputMode="decimal"
                                  placeholder="Nhập chỉ số"
                                  disabled={isSelectedMeterConfirmed}
                                  onChange={(event) =>
                                    onChangeRegister(
                                      selectedMeter.id,
                                      register.id,
                                      formatDecimalInputWithCommas(event.target.value)
                                    )
                                  }
                                />
                              </td>
                              <td className="px-12 py-8">
                                <Input
                                  className="text-right"
                                  value={rawKwh === undefined ? '' : formatNumber(rawKwh)}
                                  disabled
                                />
                              </td>
                              <td className="px-12 py-8">
                                <Input
                                  className="text-right"
                                  value={formatNumber(register.multiplier)}
                                  disabled
                                />
                              </td>
                              <td className="px-12 py-8">
                                <Input
                                  className="text-right"
                                  value={adjustedKwh === undefined ? '' : formatNumber(adjustedKwh)}
                                  disabled
                                />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {selectedMeterMetrics.hasInvalidReading && (
                  <div className="mt-8 rounded-radius-m border border-error-200 bg-error-50 px-12 py-8 text-13 font-semibold text-error-600">
                    Chỉ số mới không được nhỏ hơn chỉ số cũ. Vui lòng kiểm tra lại trước khi lưu.
                  </div>
                )}

                <div className="mt-12 grid grid-cols-[minmax(180px,1fr)_minmax(180px,1fr)_minmax(180px,1fr)_minmax(220px,1.2fr)] gap-12 desktop:grid-cols-2 mobile:grid-cols-1">
                  <div className="rounded-radius-m border border-color-300 bg-color-50 p-12">
                    <TextBase
                      classNames="caption1 !text-color-700"
                      text="Tổng sản lượng quy đổi (kWh)"
                    />
                    <TextBase
                      classNames="title4 mt-8 !text-primary-700"
                      text={`${formatNumber(selectedMeterMetrics.totalAdjustedKwh)} kWh`}
                    />
                    <TextBase
                      classNames="caption1 mt-4 !text-color-700"
                      text={selectedMeter.registers
                        .map((register) => formatNumber(getRegisterUsage(register) || K_SIZE_0))
                        .join(' + ')}
                    />
                  </div>
                  <div className="rounded-radius-m border border-color-300 bg-color-50 p-12">
                    <TextBase classNames="caption1 !text-color-700">
                      Chỉ số hữu công (kWh) {requiredMark}
                    </TextBase>
                    <Input
                      className="mt-8"
                      value={formatNumber(selectedMeterMetrics.effectiveIndex)}
                      readOnly
                    />
                    {selectedMeterMetrics.canSave ? (
                      <div className="mt-8 flex items-start gap-4 text-12 font-semibold leading-16 text-success-700">
                        <CheckCircleOutlined className="mt-[1px] text-12" />
                        <span>
                          Hợp lệ: Tổng TOU x Hệ số nhân ={' '}
                          {formatNumber(selectedMeterMetrics.totalAdjustedKwh)} kWh (
                          {formatNumber(selectedMeterMetrics.effectiveIndex)} -{' '}
                          {formatNumber(selectedMeterMetrics.oldEffectiveIndex)} ={' '}
                          {formatNumber(selectedMeterMetrics.totalRawKwh)})
                        </span>
                      </div>
                    ) : (
                      <div className="mt-8 text-12 font-semibold leading-16 text-color-700">
                        Nhập đủ chỉ số TOU để tính chỉ số hữu công.
                      </div>
                    )}
                  </div>
                  <div className="rounded-radius-m border border-color-300 bg-color-50 p-12">
                    <TextBase classNames="caption1 !text-color-700" text="Chỉ số vô công (kVArh)" />
                    <Input
                      className="mt-8"
                      value={formatDecimalInputWithCommas(selectedMeter.reactiveIndex)}
                      inputMode="decimal"
                      placeholder="Nhập chỉ số"
                      disabled={isSelectedMeterConfirmed}
                      onChange={(event) =>
                        onChangeReactiveIndex(
                          selectedMeter.id,
                          formatDecimalInputWithCommas(event.target.value)
                        )
                      }
                    />
                    <TextBase classNames="caption1 mt-12 !text-color-700" text="Ghi chú (nếu có)" />
                    <Input
                      className="mt-8"
                      value={selectedMeter.note}
                      placeholder="Nhập ghi chú..."
                      disabled={isSelectedMeterConfirmed}
                      onChange={(event) => onChangeNote(selectedMeter.id, event.target.value)}
                    />
                  </div>
                  <div className="rounded-radius-m border border-color-300 bg-color-50 p-12">
                    <TextBase
                      classNames="caption1 !text-color-700"
                      text={`Ảnh chụp từ công tơ để đối chiếu (${selectedMeter.uploadedPhotos.length + selectedMeter.pendingPhotos.length}/${maxPhotoCount})`}
                    />
                    <div className="mt-8 flex min-h-[146px] flex-col items-center justify-center rounded-radius-m border border-dashed border-color-300 bg-color-100 p-8 text-center">
                      {selectedMeter.uploadedPhotos.length + selectedMeter.pendingPhotos.length ? (
                        <div className="mx-auto mb-8 flex max-w-full flex-wrap items-center justify-center gap-8">
                          {selectedMeter.uploadedPhotos.map((photo) => (
                            <div
                              key={`uploaded-${photo.id}`}
                              className="relative size-[54px] overflow-hidden rounded-radius-m border border-color-300 bg-color-50"
                            >
                              {photo.previewUrl ? (
                                <Image
                                  src={photo.previewUrl}
                                  alt={photo.fileName || 'Ảnh công tơ'}
                                  preview
                                  rootClassName="w-full"
                                  className="!h-[54px] !w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-full items-center justify-center px-4 text-center text-10 text-color-700">
                                  {photo.fileName || 'Ảnh'}
                                </div>
                              )}
                              <button
                                type="button"
                                className="absolute right-0 top-0 flex size-16 items-center justify-center rounded-[50%] bg-color-50 text-11 font-bold text-color-800 hover:text-error-600"
                                disabled={isSelectedMeterConfirmed}
                                onClick={() => onRemoveUploadedPhoto(selectedMeter.id, photo.id)}
                              >
                                ×
                              </button>
                            </div>
                          ))}
                          {selectedMeter.pendingPhotos.map((photo) => (
                            <div
                              key={`pending-${photo.uid}`}
                              className="relative size-[54px] overflow-hidden rounded-radius-m border border-pending-300 bg-pending-50"
                            >
                              <Image
                                src={photo.previewUrl}
                                alt={photo.name}
                                preview
                                rootClassName="w-full"
                                className="!h-[54px] !w-full object-cover"
                              />
                              <button
                                type="button"
                                className="absolute right-0 top-0 flex size-16 items-center justify-center rounded-[50%] bg-color-50 text-11 font-bold text-color-800 hover:text-error-600"
                                disabled={isSelectedMeterConfirmed}
                                onClick={() => onRemovePendingPhoto(selectedMeter.id, photo.uid)}
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex h-[72px] w-full items-center justify-center rounded-radius-m bg-color-50 text-13 text-color-700">
                          Kéo thả ảnh vào đây hoặc bấm chọn
                        </div>
                      )}
                      <Upload
                        multiple
                        maxCount={maxPhotoCount}
                        showUploadList={false}
                        accept="image/jpeg,image/png"
                        disabled={
                          isSelectedMeterConfirmed ||
                          selectedMeter.uploadedPhotos.length +
                            selectedMeter.pendingPhotos.length >=
                            maxPhotoCount
                        }
                        beforeUpload={(file) => {
                          onSelectPhoto(selectedMeter.id, file);
                          return Upload.LIST_IGNORE;
                        }}
                      >
                        <ButtonBase
                          type="ghost"
                          size={32}
                          customContent={
                            <div className="flex items-center justify-center gap-4 text-13 leading-16">
                              <UploadOutlined className="text-14" />
                              <span className="text-13">Chọn ảnh</span>
                            </div>
                          }
                          classNames="mt-8 min-w-[104px] justify-center px-12"
                          disabled={
                            isSelectedMeterConfirmed ||
                            selectedMeter.uploadedPhotos.length +
                              selectedMeter.pendingPhotos.length >=
                              maxPhotoCount
                          }
                        />
                      </Upload>
                      <TextBase
                        classNames="caption1 mt-8 !text-color-700"
                        text={`Hỗ trợ: JPG, PNG | Tối đa ${maxPhotoCount} ảnh`}
                      />
                    </div>
                  </div>
                </div>

                <Flex justify="end" gap={K_SIZE_8} className="mt-12 mobile:w-full mobile:flex-col">
                  <ButtonBase
                    type="ghost"
                    customContent={
                      <div className="flex items-center gap-8">
                        <DeleteOutlined />
                        <span>Xóa chỉ số</span>
                      </div>
                    }
                    onClick={onClearSelectedMeter}
                    disabled={savingConfirm || isSelectedMeterConfirmed}
                    classNames="min-w-[120px] mobile:flex-1 mobile:justify-center"
                  />
                </Flex>
              </>
            ) : (
              <div className="flex min-h-[460px] items-center justify-center rounded-radius-m border border-dashed border-color-300 text-14 text-color-700">
                {isFeederScope
                  ? 'Chọn hoặc tìm kiếm lộ để nhập chỉ số công tơ.'
                  : 'Chọn hoặc tìm kiếm khách hàng để nhập chỉ số công tơ.'}
              </div>
            )}
          </div>
        </div>
      </section>
    </PageWithBreadcrumb>
  );
};

// Ô từ khoá tìm theo đúng tiêu chí ở ô "Tìm theo" bên cạnh.
const KEYWORD_PLACEHOLDER: Record<string, string> = {
  CUSTOMER_CODE: 'Nhập mã khách hàng',
  CUSTOMER_NAME: 'Nhập tên khách hàng',
  METER_CODE: 'Nhập mã công tơ'
};
export default ManualMeterReadingScreen;
