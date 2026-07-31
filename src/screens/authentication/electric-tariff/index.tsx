'use client';

import { CalculatorOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import {
  CURRENCY_VND,
  K_SIZE_0,
  K_SIZE_1,
  K_SIZE_120,
  K_SIZE_130,
  K_SIZE_160,
  K_SIZE_18,
  K_SIZE_200,
  K_SIZE_220,
  K_SIZE_24,
  K_SIZE_8,
  NULL_VALUE,
  REQUIRED_MARK
} from '@constant';
import { Divider, Drawer, Flex, Spin, Upload } from 'antd';
import type { UploadFile } from 'antd/es/upload/interface';
import ButtonBase from 'components/button';
import { AppDatePickerControl } from 'components/date-picker';
import IconHover from 'components/icon-vec-local/icon-hover';
import { AppSelect } from 'components/select';
import { AppSelectControl } from 'components/select';
import Status, { KIND_STATUS, TYPE_STATUS } from 'components/status';
import AppTable from 'components/table';
import AppPagination from 'components/table/pagination';
import { TextBase } from 'components/text';
import { AppTextField, AppTextFieldControl } from 'components/text-field';
import { ROUTES } from 'config/routes';
import PageWithBreadcrumb from 'layout/AppLayout/PageWithBreadcumb';
import { ElectricTariff } from 'model/electric-tariff';
import moment from 'moment';
import { useMemo } from 'react';
import { API_DATE_INPUT_FORMATS, FORMAT_DATE_API, displayDateTimeFromServer } from 'utils/date';
import { formatCurrency as formatCurrencyBase } from 'utils/math';
import { useResponsive } from 'utils/responsive';
import { formatUploadFileSize, MAX_UPLOAD_FILE_SIZE_TEXT } from 'utils/upload';
import useElectricTariff, {
  ElectricTariffFilter,
  getPriceWithVat,
  TariffTouPriceRow,
  TARIFF_PRICE_TYPE,
  TARIFF_STATUS
} from './useElectricTariff';

const DATE_API_FORMAT = FORMAT_DATE_API;
const DATE_DISPLAY_FORMAT = 'DD/MM/YYYY';

const PRICE_TYPE_OPTIONS = [
  { value: TARIFF_PRICE_TYPE.SELL, label: 'Bán ra' },
  { value: TARIFF_PRICE_TYPE.BUY, label: 'Mua vào' }
];

const VOLTAGE_LEVEL_OPTIONS = [
  { value: 'HA_AP', label: 'Hạ áp' },
  { value: 'TRUNG_AP', label: 'Trung áp' },
  { value: 'CAO_AP', label: 'Cao áp' }
];

const STATUS_OPTIONS = [
  { value: TARIFF_STATUS.ACTIVE, label: 'Hiệu lực' },
  { value: TARIFF_STATUS.INACTIVE, label: 'Ngưng áp dụng' }
];

const PRICE_TYPE_LABEL_MAP: Record<string, string> = {
  [TARIFF_PRICE_TYPE.SELL]: 'Bán ra',
  [TARIFF_PRICE_TYPE.BUY]: 'Mua vào',
  SELL: 'Bán ra',
  BUY: 'Mua vào',
  'Bán ra': 'Bán ra',
  'Mua vào': 'Mua vào'
};

const VOLTAGE_LEVEL_LABEL_MAP: Record<string, string> = {
  HA_AP: 'Hạ áp',
  TRUNG_AP: 'Trung áp',
  CAO_AP: 'Cao áp',
  V_0_4_KV: 'Hạ áp',
  V_6_KV: 'Trung áp',
  V_22_KV: 'Trung áp',
  V_35_KV: 'Trung áp',
  V_110_KV: 'Cao áp',
  '0.4kV': 'Hạ áp',
  '6kV': 'Trung áp',
  '22kV': 'Trung áp',
  '35kV': 'Trung áp',
  '110kV': 'Cao áp',
  'Hạ áp': 'Hạ áp',
  'Trung áp': 'Trung áp',
  'Cao áp': 'Cao áp'
};

const TOU_LABEL_MAP: Record<string, string> = {
  BT: 'Bình thường',
  TD: 'Thấp điểm',
  CD: 'Cao điểm'
};

const FILTER_LABEL_MAP: Record<keyof ElectricTariffFilter, string> = {
  tariffCode: 'Mã giá',
  tariffName: 'Tên giá',
  priceType: 'Loại đơn giá',
  voltageLevel: 'Cấp điện áp',
  status: 'Trạng thái'
};

const getStatusMeta = (status?: string) => {
  if (status === TARIFF_STATUS.ACTIVE || status === 'HIEU_LUC') {
    return { label: 'Hiệu lực', type: TYPE_STATUS.SUCCESS };
  }

  if (status === TARIFF_STATUS.INACTIVE || status === 'NGUNG_AP_DUNG') {
    return { label: 'Ngưng áp dụng', type: TYPE_STATUS.DISABLED };
  }

  return { label: status || NULL_VALUE, type: TYPE_STATUS.PENDING };
};

const displayElectricTariffDate = (date?: string) => {
  if (!date) return NULL_VALUE;
  const parsedDate = moment(date, [...API_DATE_INPUT_FORMATS, moment.ISO_8601], true);
  return parsedDate.isValid() ? parsedDate.format(DATE_DISPLAY_FORMAT) : NULL_VALUE;
};

const formatCurrency = (value?: number) => {
  if (value === undefined || value === null || !Number.isFinite(value)) return NULL_VALUE;
  return formatCurrencyBase(Math.round(value), ',', CURRENCY_VND) || NULL_VALUE;
};

const formatFilterValue = (key: keyof ElectricTariffFilter, value: string) => {
  if (key === 'priceType') return PRICE_TYPE_LABEL_MAP[value] || value;
  if (key === 'voltageLevel') return VOLTAGE_LEVEL_LABEL_MAP[value] || value;
  if (key === 'status') return getStatusMeta(value).label;
  return value;
};

const ElectricTariffScreen = () => {
  const { isMobile, isTablet } = useResponsive();
  const {
    tariffList,
    total,
    currentPage,
    pagination,
    filterDraft,
    filterApplied,
    listLoading,
    detailLoading,
    openCreate,
    openDetail,
    selectedDetail,
    touPrices,
    selectedTariffDocumentFile,
    tariffDocumentFileName,
    tariffForm,
    onChangeFilter,
    onApplyFilter,
    onResetFilter,
    onOpenCreate,
    onCloseCreate,
    handleCreateTariff,
    onOpenDetail,
    onCloseDetail,
    onChangeTouPrice,
    handleSaveTouPrices,
    onSelectTariffDocumentFile,
    onRemoveSelectedTariffDocumentFile,
    handleUploadTariffDocument,
    onViewTariffDocument,
    onDownloadTariffDocument,
    onDeleteTariffDocument,
    onDelete
  } = useElectricTariff();

  const {
    control: tariffControl,
    handleSubmit: handleTariffFormSubmit,
    formState: { isValid: isTariffValid }
  } = tariffForm;

  const activeFilters = useMemo(
    () =>
      (Object.entries(filterApplied) as [keyof ElectricTariffFilter, string][]).filter(
        ([, value]) => Boolean(value)
      ),
    [filterApplied]
  );

  const tariffDocumentUploadFileList = useMemo<UploadFile[]>(
    () =>
      selectedTariffDocumentFile
        ? [
            {
              uid: 'selected-tariff-document',
              name: selectedTariffDocumentFile.name,
              status: 'done',
              size: selectedTariffDocumentFile.size
            }
          ]
        : [],
    [selectedTariffDocumentFile]
  );

  const hasTariffDocument = Boolean(
    selectedDetail?.tariff?.fileName || selectedDetail?.tariff?.filePath
  );

  const columns = useMemo<any[]>(
    () => [
      {
        title: 'Mã giá',
        dataIndex: 'tariffCode',
        key: 'tariffCode',
        width: K_SIZE_160,
        render: (text: string, record: ElectricTariff) => (
          <TextBase
            classNames="sub-title4 cursor-pointer !text-secondary-500 hover:!text-secondary-700"
            text={text || NULL_VALUE}
            onClick={() => onOpenDetail(record)}
          />
        )
      },
      {
        title: 'Tên giá',
        dataIndex: 'tariffName',
        key: 'tariffName',
        width: K_SIZE_220,
        render: (text: string) => (
          <div title={text} className="max-w-[260px] truncate">
            {text || NULL_VALUE}
          </div>
        )
      },
      {
        title: 'Loại đơn giá',
        dataIndex: 'priceType',
        key: 'priceType',
        width: K_SIZE_160,
        render: (text: string) => PRICE_TYPE_LABEL_MAP[text] || text || NULL_VALUE
      },
      {
        title: 'Cấp điện áp',
        dataIndex: 'voltageLevel',
        key: 'voltageLevel',
        width: K_SIZE_130,
        render: (text: string) => VOLTAGE_LEVEL_LABEL_MAP[text] || text || NULL_VALUE
      },
      {
        title: 'Hiệu lực từ',
        dataIndex: 'effectiveFrom',
        key: 'effectiveFrom',
        width: K_SIZE_130,
        render: (text: string) => displayElectricTariffDate(text)
      },
      {
        title: 'Hiệu lực đến',
        dataIndex: 'effectiveTo',
        key: 'effectiveTo',
        width: K_SIZE_130,
        render: (text: string) => displayElectricTariffDate(text)
      },
      {
        title: 'Trạng thái',
        dataIndex: 'status',
        key: 'status',
        width: K_SIZE_130,
        render: (status: string) => {
          const meta = getStatusMeta(status);
          return <Status type={meta.type} kind={KIND_STATUS.SECONDARY} content={meta.label} />;
        }
      },
      {
        title: 'Ngày tạo',
        dataIndex: 'createdAt',
        key: 'createdAt',
        width: K_SIZE_200,
        render: (text: string) => displayDateTimeFromServer(text)
      },
      {
        title: 'Thao tác',
        fixed: 'right',
        align: 'center',
        width: K_SIZE_120,
        render: (_: unknown, record: ElectricTariff) => (
          <div className="flex justify-center gap-8">
            <IconHover
              rootClassName="text-color-800"
              title="Xem chi tiết"
              icon="ICON_EYE_OPEN"
              iconHeight={K_SIZE_18}
              onClick={() => onOpenDetail(record)}
            />
            <IconHover
              rootClassName="text-error-500 hover:text-error-500"
              title="Xoá"
              icon="IC_TRASH_OUTLINE"
              iconHeight={K_SIZE_18}
              onClick={() => onDelete(record)}
            />
          </div>
        )
      }
    ],
    [onDelete, onOpenDetail]
  );

  const touColumns = useMemo<any[]>(
    () => [
      {
        title: 'Bậc/TOU',
        dataIndex: 'tou',
        key: 'tou',
        width: K_SIZE_160,
        render: (text: string, record: TariffTouPriceRow) =>
          record.touName || TOU_LABEL_MAP[text] || text || NULL_VALUE
      },
      {
        title: 'Đơn giá',
        dataIndex: 'draftUnitPrice',
        key: 'unitPrice',
        align: 'right',
        width: K_SIZE_160,
        render: (_: string, record: TariffTouPriceRow) => (
          <AppTextField
            name={`touPrice-${record.tou}`}
            value={record.draftUnitPrice}
            placeholder="Nhập đơn giá"
            size="middle"
            classNameMore="text-right"
            formatNumberWithCommas
            onChange={(event) => onChangeTouPrice(record.tou, event.target.value)}
          />
        )
      },
      {
        title: 'VAT 10%',
        dataIndex: 'unitPrice',
        key: 'vat',
        align: 'right',
        width: K_SIZE_130,
        render: (value: number) =>
          formatCurrency(
            typeof value === 'number' && Number.isFinite(value) ? value * 0.1 : undefined
          )
      },
      {
        title: 'Đơn giá sau VAT',
        dataIndex: 'unitPrice',
        key: 'priceWithVat',
        align: 'right',
        width: K_SIZE_160,
        render: (value: number) => formatCurrency(getPriceWithVat(value))
      }
    ],
    [onChangeTouPrice]
  );

  const breadcrumbList = [
    {
      title: 'Chỉ số - Hoá đơn'
    },
    {
      title: 'Danh mục giá điện',
      key: ROUTES.ELECTRIC_TARIFF
    }
  ];

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
            <TextBase classNames="title4" text="Danh Mục Giá Điện" />
            <TextBase
              classNames="body3 !text-color-700"
              text="Quản lý biểu giá theo loại đơn giá, cấp điện áp và thời kỳ hiệu lực"
            />
          </div>
          <ButtonBase
            type="primary"
            customContent={
              <div className="flex items-center gap-8">
                <PlusOutlined />
                <span>Thêm biểu giá</span>
              </div>
            }
            onClick={onOpenCreate}
            classNames="mobile:w-full mobile:justify-center"
          />
        </Flex>

        <Divider className="my-16" />

        <div className="mb-12 grid grid-cols-5 gap-8 desktop:grid-cols-3 tablet:grid-cols-2 mobile:grid-cols-1">
          <AppTextField
            name="tariffCode"
            value={filterDraft.tariffCode}
            onChange={(event) => onChangeFilter('tariffCode', event.target.value)}
            placeholder="Mã giá"
            size="middle"
          />
          <AppTextField
            name="tariffName"
            value={filterDraft.tariffName}
            onChange={(event) => onChangeFilter('tariffName', event.target.value)}
            placeholder="Tên giá"
            size="middle"
          />
          <AppSelect
            name="priceType"
            value={filterDraft.priceType}
            options={PRICE_TYPE_OPTIONS}
            placeholder="Loại đơn giá"
            size="middle"
            onSelectOption={({ key }) => onChangeFilter('priceType', String(key))}
          />
          <AppSelect
            name="voltageLevel"
            value={filterDraft.voltageLevel}
            options={VOLTAGE_LEVEL_OPTIONS}
            placeholder="Cấp điện áp"
            size="middle"
            onSelectOption={({ key }) => onChangeFilter('voltageLevel', String(key))}
          />
          <AppSelect
            name="status"
            value={filterDraft.status}
            options={STATUS_OPTIONS}
            placeholder="Trạng thái"
            size="middle"
            onSelectOption={({ key }) => onChangeFilter('status', String(key))}
          />
          <div className="col-span-full flex justify-end gap-8">
            <ButtonBase
              type="ghost"
              size={43}
              onClick={onResetFilter}
              customContent="Xoá bộ lọc"
              classNames="justify-center [&>span]:!font-normal"
            />
            <ButtonBase
              type="primary"
              size={43}
              onClick={onApplyFilter}
              customContent={
                <div className="flex items-center justify-center gap-8">
                  <SearchOutlined />
                  <span>Tìm kiếm</span>
                </div>
              }
              classNames="justify-center [&>span]:!font-normal"
            />
          </div>
        </div>

        {activeFilters.length > K_SIZE_0 && (
          <div className="mb-8 flex flex-wrap gap-8 text-12 text-color-700">
            {activeFilters.map(([key, value]) => (
              <span key={key} className="rounded-[4px] bg-color-200 px-8 py-4">
                {FILTER_LABEL_MAP[key]}: {formatFilterValue(key, value)}
              </span>
            ))}
          </div>
        )}

        <Spin spinning={listLoading && tariffList.length > K_SIZE_0}>
          <div className="overflow-hidden rounded-radius-l border border-color-400 duration-500">
            <AppTable
              loading={listLoading}
              rootClassName="w-full"
              className="[&_.ant-pagination]:hidden"
              scroll={{ x: 'max-content', y: '70vh' }}
              dataSource={tariffList}
              columns={columns}
              rowKey="id"
              pagination={pagination}
            />
          </div>
          <AppPagination currentPage={currentPage} total={total} pagination={pagination} />
        </Spin>

        <form id="electric-tariff-form" onSubmit={handleTariffFormSubmit(handleCreateTariff)}>
          <Drawer
            open={openCreate}
            title="Thêm biểu giá điện"
            destroyOnClose
            placement="right"
            onClose={onCloseCreate}
            width={isTablet || isMobile ? '82vw' : '42vw'}
            footer={
              <Flex justify="end" gap={K_SIZE_8}>
                <ButtonBase type="ghost" customContent="Đóng" onClick={onCloseCreate} />
                <ButtonBase
                  type="primary"
                  form="electric-tariff-form"
                  htmlType="submit"
                  disabled={!isTariffValid || detailLoading}
                  customContent="Lưu"
                />
              </Flex>
            }
          >
            <div className="grid gap-12">
              <AppTextFieldControl
                name="tariffCode"
                control={tariffControl}
                label="Mã giá"
                labelSuffix={REQUIRED_MARK}
                labelSuffixClassName="text-error-600"
                placeholder="VD: BR-BT-2026"
              />
              <AppTextFieldControl
                name="tariffName"
                control={tariffControl}
                label="Tên giá"
                labelSuffix={REQUIRED_MARK}
                labelSuffixClassName="text-error-600"
                placeholder="VD: Giá bán ra bậc thang"
              />
              <AppSelectControl
                name="priceType"
                control={tariffControl}
                label="Loại đơn giá"
                labelSuffix={<span className="text-error-600">{REQUIRED_MARK}</span>}
                options={PRICE_TYPE_OPTIONS}
              />
              <AppSelectControl
                name="voltageLevel"
                control={tariffControl}
                label="Cấp điện áp"
                labelSuffix={<span className="text-error-600">{REQUIRED_MARK}</span>}
                options={VOLTAGE_LEVEL_OPTIONS}
              />
              <div className="grid grid-cols-2 gap-12 mobile:grid-cols-1">
                <AppDatePickerControl
                  name="effectiveFrom"
                  control={tariffControl}
                  backendFormat={DATE_API_FORMAT}
                  label="Hiệu lực từ"
                  labelSuffix={<span className="text-error-600">{REQUIRED_MARK}</span>}
                  wrapperClassName="w-full"
                  datePickerClassName="w-full"
                />
                <AppDatePickerControl
                  name="effectiveTo"
                  control={tariffControl}
                  backendFormat={DATE_API_FORMAT}
                  label="Hiệu lực đến"
                  allowClear
                  wrapperClassName="w-full"
                  datePickerClassName="w-full"
                />
              </div>
            </div>
          </Drawer>
        </form>

        <Drawer
          open={openDetail}
          title="Chi tiết biểu giá điện"
          destroyOnClose
          placement="right"
          onClose={onCloseDetail}
          width={isTablet || isMobile ? '90vw' : '62vw'}
          footer={
            <Flex justify="end" gap={K_SIZE_8}>
              <ButtonBase type="ghost" customContent="Đóng" onClick={onCloseDetail} />
              <ButtonBase
                type="primary"
                disabled={detailLoading}
                customContent="Lưu bậc giá"
                onClick={handleSaveTouPrices}
              />
            </Flex>
          }
        >
          <Spin spinning={detailLoading}>
            <div className="mb-16 grid grid-cols-2 gap-12 mobile:grid-cols-1">
              <AppTextField
                name="detailTariffCode"
                label="Mã giá"
                value={selectedDetail?.tariff?.tariffCode || ''}
                isView
              />
              <AppTextField
                name="detailTariffName"
                label="Tên giá"
                value={selectedDetail?.tariff?.tariffName || ''}
                isView
              />
              <AppTextField
                name="detailPriceType"
                label="Loại đơn giá"
                value={
                  PRICE_TYPE_LABEL_MAP[selectedDetail?.tariff?.priceType || ''] ||
                  selectedDetail?.tariff?.priceType ||
                  ''
                }
                isView
              />
              <AppTextField
                name="detailVoltageLevel"
                label="Cấp điện áp"
                value={
                  VOLTAGE_LEVEL_LABEL_MAP[selectedDetail?.tariff?.voltageLevel || ''] ||
                  selectedDetail?.tariff?.voltageLevel ||
                  ''
                }
                isView
              />
            </div>

            <div className="mb-8 flex items-center gap-8 text-14 font-semibold text-color-900">
              <CalculatorOutlined />
              <span>Danh sách giá theo bậc/khung giờ</span>
            </div>
            <div className="overflow-hidden rounded-radius-l border border-color-400">
              <AppTable
                rootClassName="w-full"
                scroll={{ x: 'max-content' }}
                dataSource={touPrices}
                columns={touColumns}
                rowKey="tou"
                pagination={false}
              />
            </div>

            <div className="mt-20">
              <div className="mb-8 flex items-center gap-8 text-14 font-semibold text-color-900">
                <CalculatorOutlined />
                <span>Văn bản áp giá</span>
              </div>

              <Upload.Dragger
                className="block w-full overflow-hidden [&_.ant-upload-btn]:!p-0 [&_.ant-upload-drag-container]:!align-middle"
                height={120}
                maxCount={K_SIZE_1}
                fileList={tariffDocumentUploadFileList}
                showUploadList={false}
                beforeUpload={(file) =>
                  onSelectTariffDocumentFile(file) ? false : Upload.LIST_IGNORE
                }
                onRemove={onRemoveSelectedTariffDocumentFile}
              >
                <div className="flex min-h-[96px] w-full flex-col items-center justify-center gap-8 p-12 text-center">
                  <ButtonBase
                    type="secondary"
                    size={32}
                    leftIcon="IC_UPLOAD_OUTLINE"
                    customContent="Chọn văn bản"
                    heightIcon={K_SIZE_24}
                    widthIcon={K_SIZE_24}
                  />
                  <TextBase
                    text={`Tối đa ${MAX_UPLOAD_FILE_SIZE_TEXT}/file`}
                    classNames="caption1 !text-color-700"
                  />
                </div>
              </Upload.Dragger>

              <div className="mt-12">
                {selectedTariffDocumentFile ? (
                  <div className="flex flex-wrap items-center gap-12 rounded-radius-l border border-color-400 bg-color-50 px-12 py-[10px] text-color-800">
                    <div className="min-w-0 flex-1">
                      <TextBase text="File đã chọn" classNames="caption1 !text-color-700" />
                      <div
                        className="mt-4 truncate text-14 font-medium"
                        title={selectedTariffDocumentFile.name}
                      >
                        {selectedTariffDocumentFile.name}
                      </div>
                      <TextBase
                        text={`Dung lượng: ${formatUploadFileSize(
                          selectedTariffDocumentFile.size
                        )}`}
                        classNames="caption1 !text-color-700"
                      />
                    </div>
                    <Flex gap={K_SIZE_8} className="shrink-0 mobile:w-full mobile:justify-end">
                      <ButtonBase
                        type="ghost"
                        size={32}
                        customContent="Gỡ"
                        onClick={onRemoveSelectedTariffDocumentFile}
                      />
                      <ButtonBase
                        type="primary"
                        size={32}
                        disabled={detailLoading}
                        customContent="Tải lên"
                        onClick={handleUploadTariffDocument}
                      />
                    </Flex>
                  </div>
                ) : hasTariffDocument ? (
                  <div className="flex flex-wrap items-center gap-12 rounded-radius-l border border-color-400 bg-color-50 px-12 py-[10px] text-color-800">
                    <div className="min-w-0 flex-1">
                      <TextBase text="Văn bản hiện tại" classNames="caption1 !text-color-700" />
                      <div
                        className="mt-4 truncate text-14 font-medium"
                        title={tariffDocumentFileName}
                      >
                        {tariffDocumentFileName}
                      </div>
                    </div>
                    <Flex gap={K_SIZE_8} className="shrink-0 mobile:w-full mobile:justify-end">
                      <IconHover
                        rootClassName="text-color-800"
                        title="Xem"
                        icon="ICON_EYE_OPEN"
                        iconHeight={K_SIZE_18}
                        onClick={onViewTariffDocument}
                      />
                      <IconHover
                        rootClassName="text-color-800"
                        title="Tải xuống"
                        icon="IC_DOWNLOAD_OUTLINE"
                        iconHeight={K_SIZE_18}
                        onClick={onDownloadTariffDocument}
                      />
                      <IconHover
                        rootClassName="text-error-500 hover:text-error-500"
                        title="Gỡ"
                        icon="IC_TRASH_OUTLINE"
                        iconHeight={K_SIZE_18}
                        onClick={onDeleteTariffDocument}
                      />
                    </Flex>
                  </div>
                ) : (
                  <div className="rounded-radius-l border border-dashed border-color-400 px-12 py-16 text-center text-12 text-color-700">
                    Chưa có văn bản áp giá
                  </div>
                )}
              </div>
            </div>
          </Spin>
        </Drawer>
      </section>
    </PageWithBreadcrumb>
  );
};

export default ElectricTariffScreen;
