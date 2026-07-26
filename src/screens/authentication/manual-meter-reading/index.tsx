'use client';

import {
  CalendarOutlined,
  CheckCircleOutlined,
  DeleteOutlined,
  FileTextOutlined,
  HomeOutlined,
  InfoCircleOutlined,
  ReloadOutlined,
  SaveOutlined,
  SearchOutlined,
  UploadOutlined
} from '@ant-design/icons';
import { K_SIZE_0, K_SIZE_1, K_SIZE_8, NULL_VALUE, REQUIRED_MARK } from '@constant';
import { Divider, Flex, Image, Input, Upload } from 'antd';
import ButtonBase from 'components/button';
import { AppDatePicker } from 'components/date-picker';
import { AppSelect } from 'components/select';
import Status, { KIND_STATUS, TYPE_STATUS } from 'components/status';
import { TextBase } from 'components/text';
import { AppTextField } from 'components/text-field';
import { ROUTES } from 'config/routes';
import PageWithBreadcrumb from 'layout/AppLayout/PageWithBreadcumb';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { useMemo } from 'react';
import { API_DATE_INPUT_FORMATS, FORMAT_DATE_API, FORMAT_DATE_PARAMS } from 'utils/date';
import {
  ManualReadingMeter,
  ManualReadingRegister,
  ManualReadingStatus,
  getStatusMeta
} from './useManualMeterReading';
import useManualMeterReading from './useManualMeterReading';

dayjs.extend(customParseFormat);

const requiredMark = <span className="text-error-600">{REQUIRED_MARK}</span>;

const formatNumber = (value?: number) => {
  if (value === undefined || value === null || !Number.isFinite(value)) return NULL_VALUE;
  return new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 3 }).format(value);
};

const parseNumber = (value?: string | number) => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : undefined;
  const parsed = Number(
    String(value ?? '')
      .replace(/\s/g, '')
      .replace(/\./g, '')
      .replace(',', '.')
  );
  return Number.isFinite(parsed) ? parsed : undefined;
};

const getRegisterUsage = (register: ManualReadingRegister) => {
  const newIndex = parseNumber(register.newIndex);
  if (newIndex === undefined) return undefined;
  return newIndex - register.oldIndex;
};

const getStatusType = (status: ManualReadingStatus) => {
  if (status === 'SAVED') return TYPE_STATUS.PENDING;
  if (status === 'DRAFT') return TYPE_STATUS.SUCCESS;
  return TYPE_STATUS.DISABLED;
};

const SummaryTile = ({
  icon,
  label,
  value,
  valueClassName
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueClassName?: string;
}) => (
  <div className="flex min-h-[72px] items-center gap-12 rounded-radius-m border border-color-300 bg-color-50 px-16 py-12">
    <div className="flex size-28 shrink-0 items-center justify-center rounded-[50%] bg-link-50 text-link-600">
      {icon}
    </div>
    <div className="min-w-0">
      <TextBase classNames="caption1 truncate !text-color-700" text={label} />
      <TextBase
        classNames={`sub-title3 truncate !text-color-900 ${valueClassName || ''}`}
        text={value}
      />
    </div>
  </div>
);

const InfoBox = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="rounded-radius-m border border-color-300 bg-color-50 px-12 py-[10px]">
    <TextBase classNames="caption1 !text-color-700" text={label} />
    <div className="mt-4 min-h-20 text-14 font-semibold text-color-900">{value || NULL_VALUE}</div>
  </div>
);

const MeterStatus = ({ status }: { status: ManualReadingStatus }) => {
  const meta = getStatusMeta(status);
  return (
    <Status
      type={getStatusType(status)}
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
        <TextBase classNames="caption1 !text-color-800" text={`Hệ số nhân: ${meter.multiplier}`} />
      </div>
    </Flex>
  </button>
);

const ManualMeterReadingScreen = () => {
  const {
    filterDraft,
    filteredMeters,
    selectedMeter,
    selectedMeterId,
    selectedMeterMetrics,
    summary,
    periodInfo,
    searchByOptions,
    periodOptions,
    savingDraft,
    savingConfirm,
    onChangeFilter,
    onApplyFilter,
    onResetFilter,
    onSelectMeter,
    onChangeRegister,
    onChangeReactiveIndex,
    onChangeReactiveUnitPrice,
    onChangeNote,
    onSelectPhoto,
    onRemovePhoto,
    onClearSelectedMeter,
    onSaveSelectedMeter,
    onSaveDraft,
    onConfirmAndSave
  } = useManualMeterReading();

  const breadcrumbList = useMemo(
    () => [
      { title: 'Chỉ số - Hoá đơn' },
      { title: 'Nhập chỉ số thủ công', key: ROUTES.MANUAL_METER_READING }
    ],
    []
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
            <TextBase classNames="title4" text="Nhập Chỉ Số Thủ Công" />
            <TextBase
              classNames="body3 !text-color-700"
              text="Nhập chỉ số công tơ của khách hàng theo kỳ"
            />
          </div>
          <Flex justify="end" gap={K_SIZE_8} className="mobile:w-full mobile:flex-col">
            <ButtonBase
              type="ghost"
              customContent={
                <div className="flex items-center gap-8">
                  <SaveOutlined />
                  <span>{savingDraft ? 'Đang lưu...' : 'Lưu nháp'}</span>
                </div>
              }
              disabled={savingDraft || savingConfirm}
              onClick={onSaveDraft}
              classNames="mobile:w-full mobile:justify-center"
            />
            <ButtonBase
              type="primary"
              customContent={
                <div className="flex items-center gap-8">
                  <CheckCircleOutlined />
                  <span>{savingConfirm ? 'Đang lưu...' : 'Xác nhận & Lưu'}</span>
                </div>
              }
              disabled={savingDraft || savingConfirm}
              onClick={onConfirmAndSave}
              classNames="mobile:w-full mobile:justify-center"
            />
          </Flex>
        </Flex>

        <Divider className="my-16" />

        <div className="mb-12 rounded-radius-l border border-color-300 bg-color-50 p-12">
          <TextBase
            classNames="sub-title4 mb-12 !text-primary-700"
            text="1. Tìm kiếm khách hàng & kỳ ghi chỉ số"
          />
          <div className="grid grid-cols-[minmax(220px,1.4fr)_minmax(150px,0.8fr)_minmax(150px,0.8fr)_minmax(150px,0.8fr)_minmax(150px,0.8fr)_auto] items-end gap-12 tablet:grid-cols-2 mobile:grid-cols-1">
            <AppTextField
              name="keyword"
              label="Khách hàng"
              placeholder="Tìm theo mã KH, tên, số điện thoại..."
              value={filterDraft.keyword}
              prefix={<SearchOutlined className="text-color-600" />}
              onChange={(event) => onChangeFilter('keyword', event.target.value)}
              onPressEnter={onApplyFilter}
            />
            <AppSelect
              name="searchBy"
              label="Tìm theo"
              placeholder="Chọn tiêu chí"
              options={searchByOptions}
              value={filterDraft.searchBy}
              onSelectOption={({ key }) => onChangeFilter('searchBy', String(key))}
            />
            <AppTextField
              name="customerCode"
              label="Mã khách hàng"
              placeholder="Nhập mã khách hàng"
              value={filterDraft.customerCode}
              onChange={(event) => onChangeFilter('customerCode', event.target.value)}
              onPressEnter={onApplyFilter}
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
            <Flex gap={K_SIZE_8} className="tablet:col-span-2 mobile:col-span-1 mobile:w-full">
              <ButtonBase
                type="primary"
                leftIcon="IC_SEARCH_OUTLINE2"
                customContent="Tìm kiếm"
                onClick={onApplyFilter}
                classNames="min-w-[112px] mobile:flex-1 mobile:justify-center"
              />
              <ButtonBase
                type="ghost"
                customContent={
                  <div className="flex items-center gap-8">
                    <ReloadOutlined />
                    <span>Xóa lọc</span>
                  </div>
                }
                onClick={onResetFilter}
                classNames="min-w-[104px] mobile:flex-1 mobile:justify-center"
              />
            </Flex>
          </div>
          <div className="mt-12 flex min-h-32 items-center gap-8 rounded-radius-m border border-link-200 bg-link-50 px-12 py-8 text-13 text-link-700">
            <CalendarOutlined />
            <span>
              Kỳ ghi chỉ số: <b>{periodInfo.label}</b> | Ngày ghi:{' '}
              <b>{periodInfo.readingDate || NULL_VALUE}</b>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-[320px_minmax(0,1fr)] gap-12 tablet:grid-cols-1">
          <aside className="rounded-radius-l border border-color-300 bg-color-50 p-12">
            <TextBase
              classNames="sub-title4 !text-primary-700"
              text="2. Danh sách công tơ của khách hàng"
            />
            <TextBase
              classNames="caption1 mt-4 !text-color-700"
              text={`Tổng số công tơ: ${filteredMeters.length}`}
            />
            <div className="mt-12 flex max-h-[480px] flex-col gap-8 overflow-auto pr-4">
              {filteredMeters.length === K_SIZE_0 ? (
                <div className="rounded-radius-m border border-color-300 p-12 text-14 text-color-700">
                  Không tìm thấy công tơ phù hợp.
                </div>
              ) : (
                filteredMeters.map((meter) => (
                  <MeterListItem
                    key={meter.id}
                    meter={meter}
                    selected={meter.id === selectedMeterId}
                    onSelect={() => onSelectMeter(meter.id)}
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
              classNames="mt-12 w-full justify-center"
            />
          </aside>

          <div className="rounded-radius-l border border-color-300 bg-color-50 p-12">
            {selectedMeter ? (
              <>
                <Flex
                  justify="space-between"
                  align="center"
                  gap={K_SIZE_8}
                  className="mobile:flex-col mobile:items-start"
                >
                  <TextBase
                    classNames="sub-title3 !text-color-900"
                    text={`${selectedMeter.meterCode} | ${selectedMeter.serialNo}`}
                  />
                  <MeterStatus status={selectedMeter.status} />
                </Flex>

                <div className="mt-12 grid grid-cols-4 gap-12 desktop:grid-cols-2 mobile:grid-cols-1">
                  <InfoBox
                    label="Mã khách hàng"
                    value={<span className="text-primary-700">{selectedMeter.customerCode}</span>}
                  />
                  <InfoBox
                    label="Tên khách hàng"
                    value={<span className="text-primary-700">{selectedMeter.customerName}</span>}
                  />
                  <InfoBox label="Địa chỉ" value={selectedMeter.address} />
                  <InfoBox label="Hệ số nhân" value={selectedMeter.multiplier} />
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
                          <th className="w-[130px] px-12 py-[10px]">Chỉ số cũ</th>
                          <th className="w-[150px] px-12 py-[10px]">
                            Chỉ số mới <span className="text-error-600">*</span>
                          </th>
                          <th className="w-[150px] px-12 py-[10px]">Sản lượng thô (kWh)</th>
                          <th className="w-[120px] px-12 py-[10px]">Hệ số nhân</th>
                          <th className="w-[160px] px-12 py-[10px]">Sản lượng quy đổi (kWh)</th>
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
                                <Input value={formatNumber(register.oldIndex)} disabled />
                              </td>
                              <td className="px-12 py-8">
                                <Input
                                  status={invalid ? 'error' : undefined}
                                  value={register.newIndex}
                                  inputMode="decimal"
                                  placeholder="Nhập chỉ số"
                                  onChange={(event) =>
                                    onChangeRegister(
                                      selectedMeter.id,
                                      register.id,
                                      event.target.value
                                    )
                                  }
                                />
                              </td>
                              <td className="px-12 py-8">
                                <Input
                                  value={rawKwh === undefined ? '' : formatNumber(rawKwh)}
                                  disabled
                                />
                              </td>
                              <td className="px-12 py-8">
                                <Input value={formatNumber(register.multiplier)} disabled />
                              </td>
                              <td className="px-12 py-8">
                                <Input
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
                    <TextBase classNames="caption1 !text-color-700" text="Chỉ số hiệu dụng (kWh)" />
                    <Input
                      className="mt-8"
                      value={formatNumber(selectedMeterMetrics.effectiveIndex)}
                      disabled
                    />
                    <TextBase
                      classNames="caption1 mt-4 !text-success-700"
                      text={`+${formatNumber(selectedMeterMetrics.totalAdjustedKwh)} kWh so với kỳ trước`}
                    />
                  </div>
                  <div className="rounded-radius-m border border-color-300 bg-color-50 p-12">
                    <TextBase classNames="caption1 !text-color-700" text="Chỉ số vô công (kVArh)" />
                    <Input
                      className="mt-8"
                      value={selectedMeter.reactiveIndex}
                      inputMode="decimal"
                      placeholder="Nhập chỉ số"
                      onChange={(event) =>
                        onChangeReactiveIndex(selectedMeter.id, event.target.value)
                      }
                    />
                    <Input
                      className="mt-8"
                      value={selectedMeter.reactiveUnitPrice}
                      inputMode="decimal"
                      placeholder="Ghi chú giá trị"
                      onChange={(event) =>
                        onChangeReactiveUnitPrice(selectedMeter.id, event.target.value)
                      }
                    />
                  </div>
                  <div className="rounded-radius-m border border-color-300 bg-color-50 p-12">
                    <TextBase
                      classNames="caption1 !text-color-700"
                      text="Ảnh chụp từ công tơ để đối chiếu"
                    />
                    <div className="mt-8 min-h-[96px] rounded-radius-m border border-dashed border-color-300 bg-color-100 p-8">
                      {selectedMeter.photoPreviewUrl ? (
                        <Image
                          src={selectedMeter.photoPreviewUrl}
                          alt="Ảnh công tơ"
                          preview={false}
                          rootClassName="w-full"
                          className="!h-[72px] !w-full rounded-radius-m object-cover"
                        />
                      ) : (
                        <div className="flex h-[72px] items-center justify-center rounded-radius-m bg-color-50 text-13 text-color-700">
                          {selectedMeter.photoName || 'Kéo thả ảnh hoặc bấm chọn'}
                        </div>
                      )}
                      <Upload
                        maxCount={K_SIZE_1}
                        showUploadList={false}
                        accept="image/*"
                        beforeUpload={(file) => {
                          onSelectPhoto(selectedMeter.id, file);
                          return Upload.LIST_IGNORE;
                        }}
                      >
                        <ButtonBase
                          type="ghost"
                          customContent={
                            <div className="flex items-center justify-center gap-8">
                              <UploadOutlined />
                              <span>Chọn ảnh</span>
                            </div>
                          }
                          classNames="mt-8 w-full justify-center"
                        />
                      </Upload>
                    </div>
                    {selectedMeter.photoName && (
                      <button
                        type="button"
                        className="mt-[6px] text-12 font-semibold text-color-700 hover:text-error-600"
                        onClick={() => onRemovePhoto(selectedMeter.id)}
                      >
                        Xóa ảnh đã chọn
                      </button>
                    )}
                  </div>
                </div>

                <div className="mt-12 grid grid-cols-[minmax(220px,1fr)_auto] items-end gap-12 tablet:grid-cols-1">
                  <AppTextField
                    name="note"
                    label="Ghi chú"
                    placeholder="Nhập ghi chú"
                    value={selectedMeter.note}
                    onChange={(event) => onChangeNote(selectedMeter.id, event.target.value)}
                  />
                  <Flex justify="end" gap={K_SIZE_8} className="mobile:w-full">
                    <ButtonBase
                      type="ghost"
                      customContent={
                        <div className="flex items-center gap-8">
                          <DeleteOutlined />
                          <span>Xóa chỉ số</span>
                        </div>
                      }
                      onClick={onClearSelectedMeter}
                      classNames="min-w-[120px] mobile:flex-1 mobile:justify-center"
                    />
                    <ButtonBase
                      type="primary"
                      customContent={
                        <div className="flex items-center gap-8">
                          <SaveOutlined />
                          <span>Lưu cho công tơ</span>
                        </div>
                      }
                      onClick={onSaveSelectedMeter}
                      classNames="min-w-[150px] mobile:flex-1 mobile:justify-center"
                    />
                  </Flex>
                </div>
              </>
            ) : (
              <div className="flex min-h-[460px] items-center justify-center rounded-radius-m border border-dashed border-color-300 text-14 text-color-700">
                Chọn hoặc tìm kiếm khách hàng để nhập chỉ số công tơ.
              </div>
            )}
          </div>
        </div>

        <div className="mt-12 rounded-radius-l border border-color-300 bg-color-50 p-12">
          <TextBase classNames="sub-title4 mb-12 !text-primary-700" text="3. Tổng hợp nhập liệu" />
          <div className="grid grid-cols-[repeat(4,minmax(140px,1fr))_minmax(220px,1.4fr)] gap-12 tablet:grid-cols-2 mobile:grid-cols-1">
            <SummaryTile
              icon={<HomeOutlined />}
              label="Tổng số công tơ"
              value={String(summary.totalMeters)}
            />
            <SummaryTile
              icon={<CheckCircleOutlined />}
              label="Chưa nhập"
              value={String(summary.notEntered)}
              valueClassName="!text-success-700"
            />
            <SummaryTile
              icon={<FileTextOutlined />}
              label="Đã nhập"
              value={String(summary.saved)}
            />
            <SummaryTile
              icon={<InfoCircleOutlined />}
              label="Tổng sản lượng quy đổi"
              value={`${formatNumber(summary.totalAdjustedKwh)} kWh`}
              valueClassName="!text-pending-700"
            />
            <div className="rounded-radius-m border border-pending-200 bg-pending-50 px-16 py-12 text-13 text-pending-700">
              <div className="mb-4 font-semibold">Lưu ý</div>
              <div>Các trường có dấu * là bắt buộc.</div>
              <div>Vui lòng kiểm tra chỉ số trước khi xác nhận lưu.</div>
            </div>
          </div>
        </div>
      </section>
    </PageWithBreadcrumb>
  );
};

export default ManualMeterReadingScreen;
