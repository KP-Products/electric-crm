'use client';

import {
  K_SIZE_0,
  K_SIZE_1,
  K_SIZE_108,
  K_SIZE_130,
  K_SIZE_160,
  K_SIZE_16,
  K_SIZE_18,
  K_SIZE_220,
  K_SIZE_8,
  NULL_VALUE,
  REQUIRED_MARK
} from '@constant';
import { Checkbox, Divider, Drawer, Flex, Input, Spin } from 'antd';
import ButtonBase from 'components/button';
import { AppDatePickerControl } from 'components/date-picker';
import IconHover from 'components/icon-vec-local/icon-hover';
import { AppSelect, AppSelectControl } from 'components/select';
import Status, { KIND_STATUS, TYPE_STATUS } from 'components/status';
import AppTable from 'components/table';
import AppPagination from 'components/table/pagination';
import { TextBase } from 'components/text';
import { AppTextFieldControl } from 'components/text-field';
import { ROUTES } from 'config/routes';
import PageWithBreadcrumb from 'layout/AppLayout/PageWithBreadcumb';
import { Meter } from 'model/meter';
import { MeterVerification } from 'model/meter-verification';
import { useEffect, useMemo } from 'react';
import { displayDateFromServer } from 'utils/date';
import { useResponsive } from 'utils/responsive';
import useMeterVerification from './useMeterVerification';
import { DATE_API_FORMAT, RESULT_STATUS_OPTIONS } from './utils';

const requiredMark = <span className="text-error-600">{REQUIRED_MARK}</span>;

const renderText = (text?: string | number) =>
  text !== undefined && text !== null && text !== '' ? String(text) : NULL_VALUE;

const renderDate = (date?: string) => (date ? displayDateFromServer(date) : NULL_VALUE);

const renderTruncatedText = (text?: string, className = 'max-w-[220px]') => (
  <div title={text} className={`${className} truncate`}>
    {text || NULL_VALUE}
  </div>
);

const getAlertType = (meter: Meter) => {
  if (meter.verification?.overdue) return TYPE_STATUS.ERROR;
  if (meter.verification?.dueSoon) return TYPE_STATUS.PENDING;
  const days = meter.verification?.daysUntilNextVerification;
  if (days !== undefined && days < K_SIZE_0) return TYPE_STATUS.ERROR;
  return TYPE_STATUS.PENDING;
};

const getAlertLabel = (meter: Meter) => {
  const days = meter.verification?.daysUntilNextVerification;
  if (meter.verification?.overdue || (days !== undefined && days < K_SIZE_0)) return 'Quá hạn';
  if (days !== undefined) return `Còn ${days} ngày`;
  return 'Sắp hết hạn';
};

type VerificationAlertInfo = Pick<
  MeterVerification,
  'daysUntilNextVerification' | 'dueSoon' | 'overdue' | 'nextVerificationDate'
>;

const getHistoryAlertType = (verification: VerificationAlertInfo) => {
  if (verification.overdue) return TYPE_STATUS.ERROR;
  if (verification.dueSoon) return TYPE_STATUS.PENDING;
  const days = verification.daysUntilNextVerification;
  if (days !== undefined && days < K_SIZE_0) return TYPE_STATUS.ERROR;
  return TYPE_STATUS.SUCCESS;
};

const getHistoryAlertLabel = (verification: VerificationAlertInfo) => {
  const days = verification.daysUntilNextVerification;
  if (verification.overdue || (days !== undefined && days < K_SIZE_0)) return 'Quá hạn';
  if (days !== undefined) return `Còn ${days} ngày`;
  return verification.nextVerificationDate ? 'Bình thường' : NULL_VALUE;
};

const MeterVerificationScreen = () => {
  const { isMobile, isTablet } = useResponsive();
  const {
    t,
    configs,
    meterOptions,
    alertMeters,
    overdueCount,
    dueSoonCount,
    verifications,
    filterDraft,
    total,
    currentPage,
    pagination,
    listLoading,
    detailLoading,
    fileLoading,
    exportLoading,
    openForm,
    selectedVerification,
    selectedMeter,
    form,
    selectedFile,
    onSelectFile,
    updateFilter,
    onApplyHistoryFilter,
    onResetHistoryFilter,
    updateConfig,
    onOpenCreate,
    onOpenUpdate,
    onDelete,
    onViewFile,
    onDownloadFile,
    onCloseForm,
    onSubmit,
    onExportAlerts,
    resetComputedNextDate,
    getMeterLabel,
    getEquipmentTypeLabel,
    getResultStatusLabel
  } = useMeterVerification();

  const {
    control,
    handleSubmit,
    watch,
    formState: { isValid, isDirty }
  } = form;
  const deviceType = watch('deviceType');
  const verificationDate = watch('verificationDate');

  const meterVerificationInfo = selectedVerification
    ? {
        verificationDate: selectedVerification.verificationDate,
        nextVerificationDate: selectedVerification.nextVerificationDate,
        daysUntilNextVerification: selectedVerification.daysUntilNextVerification,
        dueSoon: selectedVerification.dueSoon,
        overdue: selectedVerification.overdue
      }
    : {
        verificationDate: selectedMeter?.verification?.latestVerificationDate,
        nextVerificationDate: selectedMeter?.verification?.nextVerificationDate,
        daysUntilNextVerification: selectedMeter?.verification?.daysUntilNextVerification,
        dueSoon: selectedMeter?.verification?.dueSoon,
        overdue: selectedMeter?.verification?.overdue
      };

  useEffect(() => {
    if (!openForm || selectedVerification) return;
    resetComputedNextDate(deviceType, verificationDate);
  }, [deviceType, openForm, resetComputedNextDate, selectedVerification, verificationDate]);

  const historyColumns = useMemo<any[]>(
    () => [
      {
        title: 'Số công tơ',
        dataIndex: 'meterId',
        key: 'meterId',
        width: K_SIZE_220,
        render: (meterId: string) => renderTruncatedText(getMeterLabel(meterId), 'max-w-[260px]')
      },
      {
        title: 'Loại thiết bị',
        dataIndex: 'deviceType',
        key: 'deviceType',
        width: K_SIZE_160,
        render: getEquipmentTypeLabel
      },
      {
        title: 'Ngày kiểm định',
        dataIndex: 'verificationDate',
        key: 'verificationDate',
        width: K_SIZE_130,
        render: renderDate
      },
      {
        title: 'Thời hạn kiểm định',
        dataIndex: 'nextVerificationDate',
        key: 'nextVerificationDate',
        width: K_SIZE_160,
        render: renderDate
      },
      {
        title: 'Cảnh báo',
        dataIndex: 'daysUntilNextVerification',
        key: 'daysUntilNextVerification',
        width: K_SIZE_130,
        render: (_: number, record: MeterVerification) => (
          <Status
            type={getHistoryAlertType(record)}
            kind={KIND_STATUS.SECONDARY}
            content={getHistoryAlertLabel(record)}
          />
        )
      },
      {
        title: 'Kết quả',
        dataIndex: 'resultStatus',
        key: 'resultStatus',
        width: K_SIZE_130,
        render: (status: string) => (
          <Status
            type={
              status === 'FAILED' || status === 'FAIL' ? TYPE_STATUS.ERROR : TYPE_STATUS.SUCCESS
            }
            kind={KIND_STATUS.SECONDARY}
            content={getResultStatusLabel(status)}
          />
        )
      },
      {
        title: 'Số chứng nhận',
        dataIndex: 'certificateNo',
        key: 'certificateNo',
        width: K_SIZE_160,
        render: renderText
      },
      {
        title: 'Ghi chú',
        dataIndex: 'notes',
        key: 'notes',
        width: K_SIZE_220,
        render: (text: string) => renderTruncatedText(text)
      },
      {
        title: t('common:action'),
        fixed: 'right',
        width: K_SIZE_108,
        align: 'center',
        render: (_: unknown, record: MeterVerification) => (
          <div className="flex justify-center gap-8">
            <IconHover
              rootClassName="text-color-800"
              title={t('common:edit')}
              icon="ICON_EDIT"
              iconHeight={K_SIZE_18}
              onClick={() => onOpenUpdate(record)}
            />
            <IconHover
              rootClassName="text-error-600"
              title={t('common:delete')}
              icon="IC_TRASH_OUTLINE"
              iconHeight={K_SIZE_18}
              onClick={() => onDelete(record)}
            />
          </div>
        )
      }
    ],
    [getEquipmentTypeLabel, getMeterLabel, getResultStatusLabel, onDelete, onOpenUpdate, t]
  );

  const breadcrumbList = [
    {
      title: 'Thiết bị'
    },
    {
      title: 'Kiểm định công tơ',
      key: ROUTES.METER_VERIFICATION
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
            <TextBase classNames="title4" text="Kiểm định công tơ" />
            <TextBase
              classNames="body3 !text-color-700"
              text="Thiết lập chu kỳ, ghi nhận lịch sử kiểm định và theo dõi cảnh báo đến hạn"
            />
          </div>
          <Flex
            flex={K_SIZE_1}
            justify="end"
            gap={K_SIZE_16}
            className="mobile:w-full mobile:flex-col"
          >
            <ButtonBase
              type="ghost"
              leftIcon="IC_DOWNLOAD_OUTLINE"
              customContent={exportLoading ? 'Đang xuất...' : 'Xuất cảnh báo'}
              disabled={exportLoading || alertMeters.length === K_SIZE_0}
              classNames="mobile:flex-1 mobile:justify-center"
              onClick={onExportAlerts}
            />
            <ButtonBase
              type="primary"
              leftIcon="IC_ADD_OUTLINE2"
              customContent="Ghi nhận kiểm định"
              classNames="mobile:flex-1 mobile:justify-center"
              onClick={() => onOpenCreate()}
            />
          </Flex>
        </Flex>

        <Divider className="my-16" />

        <div className="grid grid-cols-[minmax(0,1fr)_minmax(320px,420px)] gap-16 tablet:grid-cols-1">
          <div className="rounded-radius-l border border-color-400 bg-color-50 p-16">
            <Flex justify="space-between" align="center" gap={K_SIZE_8} className="mb-12">
              <div>
                <TextBase classNames="sub-title3" text="Chu kỳ kiểm định theo loại" />
                <TextBase classNames="caption !text-color-700" text="Đơn vị chu kỳ: tháng" />
              </div>
            </Flex>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[620px] border-collapse">
                <thead>
                  <tr className="border-b border-color-300 bg-color-100 text-left text-12 font-semibold uppercase text-color-700">
                    <th className="px-12 py-[10px]">Loại thiết bị</th>
                    <th className="w-[150px] px-12 py-[10px]">Chu kỳ (tháng)</th>
                    <th className="w-[170px] px-12 py-[10px]">Cảnh báo trước (ngày)</th>
                    <th className="w-[160px] px-12 py-[10px]">Ngày hiệu lực</th>
                  </tr>
                </thead>
                <tbody>
                  {configs.map((config) => (
                    <tr key={config.equipmentType} className="border-b border-color-300">
                      <td className="px-12 py-[10px] text-14 font-medium text-color-900">
                        {config.label}
                      </td>
                      <td className="px-12 py-[10px]">
                        <Input
                          type="number"
                          min={K_SIZE_1}
                          value={config.cycleMonths}
                          onChange={(event) =>
                            updateConfig(config.equipmentType, 'cycleMonths', event.target.value)
                          }
                        />
                      </td>
                      <td className="px-12 py-[10px]">
                        <Input
                          type="number"
                          min={K_SIZE_0}
                          value={config.warningDays}
                          onChange={(event) =>
                            updateConfig(config.equipmentType, 'warningDays', event.target.value)
                          }
                        />
                      </td>
                      <td className="px-12 py-[10px]">
                        <Input
                          type="date"
                          value={config.effectiveDate}
                          onChange={(event) =>
                            updateConfig(config.equipmentType, 'effectiveDate', event.target.value)
                          }
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-radius-l border border-color-400 bg-color-50 p-16">
            <Flex justify="space-between" align="start" gap={K_SIZE_8} className="mb-12">
              <div>
                <TextBase classNames="sub-title3" text="Cảnh báo kiểm định" />
                <TextBase
                  classNames="caption !text-color-700"
                  text={`${dueSoonCount} sắp đến hạn, ${overdueCount} quá hạn`}
                />
              </div>
              <Status
                type={overdueCount > K_SIZE_0 ? TYPE_STATUS.ERROR : TYPE_STATUS.PENDING}
                kind={KIND_STATUS.SECONDARY}
                content={`${alertMeters.length} thiết bị`}
              />
            </Flex>
            <div className="flex max-h-[320px] flex-col gap-8 overflow-auto">
              {alertMeters.length === K_SIZE_0 && (
                <div className="rounded-radius-m border border-color-300 p-12 text-14 text-color-700">
                  Chưa có công tơ sắp hoặc quá hạn kiểm định.
                </div>
              )}
              {alertMeters.map((meter) => (
                <button
                  key={meter.meterId}
                  type="button"
                  className="w-full rounded-radius-m border border-color-300 p-12 text-left hover:border-primary-500"
                  onClick={() => onOpenCreate(meter)}
                >
                  <Flex justify="space-between" align="center" gap={K_SIZE_8}>
                    <div>
                      <TextBase classNames="sub-title4" text={meter.meterCode} />
                      <TextBase
                        classNames="caption !text-color-700"
                        text={`Hạn: ${renderDate(meter.verification?.nextVerificationDate)}`}
                      />
                    </div>
                    <Status
                      type={getAlertType(meter)}
                      kind={KIND_STATUS.SECONDARY}
                      content={getAlertLabel(meter)}
                    />
                  </Flex>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-16 rounded-radius-l border border-color-400 bg-color-50 p-16">
          <Flex justify="space-between" align="center" gap={K_SIZE_8} className="mb-12">
            <div>
              <TextBase classNames="sub-title3" text="Lịch sử kiểm định" />
              <TextBase
                classNames="caption !text-color-700"
                text={`Đã lưu ${total} lần kiểm định`}
              />
            </div>
          </Flex>
          <div className="mb-12 grid grid-cols-[minmax(180px,1fr)_minmax(160px,220px)_minmax(160px,220px)_auto] items-end gap-12 tablet:grid-cols-2 mobile:grid-cols-1">
            <AppSelect
              name="meterIdFilter"
              label="Công tơ"
              placeholder="Chọn công tơ"
              options={meterOptions}
              value={filterDraft.meterId}
              onSelectOption={({ key }) => updateFilter('meterId', String(key))}
            />
            <AppSelect
              name="resultStatusFilter"
              label="Kết quả"
              placeholder="Chọn kết quả"
              options={RESULT_STATUS_OPTIONS}
              value={filterDraft.resultStatus}
              onSelectOption={({ key }) => updateFilter('resultStatus', String(key))}
            />
            <div>
              <label className="mb-4 inline-flex flex-row items-center text-14 font-semibold leading-24 text-color-900">
                Số chứng nhận
              </label>
              <Input
                size="large"
                value={filterDraft.certificateNoContains}
                placeholder="Nhập số chứng nhận"
                onChange={(event) =>
                  updateFilter('certificateNoContains', event.target.value || '')
                }
              />
            </div>
            <Flex align="center" gap={K_SIZE_8} className="mobile:flex-col mobile:items-stretch">
              <Checkbox
                checked={filterDraft.dueSoonOnly}
                onChange={(event) => updateFilter('dueSoonOnly', event.target.checked)}
              >
                Sắp đến hạn
              </Checkbox>
              <ButtonBase type="primary" customContent="Tìm kiếm" onClick={onApplyHistoryFilter} />
              <ButtonBase type="ghost" customContent="Xoá lọc" onClick={onResetHistoryFilter} />
            </Flex>
          </div>
          <Spin spinning={listLoading && verifications.length > K_SIZE_0}>
            <div className="overflow-hidden rounded-radius-l border border-color-400">
              <AppTable
                loading={listLoading}
                rootClassName="w-full"
                className="[&_.ant-pagination]:hidden"
                scroll={{ x: 'max-content', y: '52vh' }}
                dataSource={verifications}
                columns={historyColumns}
                rowKey="id"
                pagination={pagination}
              />
            </div>
            <AppPagination currentPage={currentPage} total={total} pagination={pagination} />
          </Spin>
        </div>

        <form id="meter-verification-form" onSubmit={handleSubmit(onSubmit)}>
          <Drawer
            open={openForm}
            title={
              <Flex justify="space-between" align="center">
                <div>{selectedVerification ? 'Cập nhật kiểm định' : 'Ghi nhận kiểm định'}</div>
                <IconHover title="" icon="IC_CLOSE_OUTLINE" onClick={onCloseForm} />
              </Flex>
            }
            destroyOnClose
            placement="right"
            closable={false}
            onClose={onCloseForm}
            width={isTablet || isMobile ? '86vw' : '44vw'}
            footer={
              <Flex justify="end" gap={K_SIZE_8}>
                <ButtonBase
                  classNames="app-common-btn"
                  type="ghost"
                  customContent={t('common:close')}
                  onClick={onCloseForm}
                />
                <ButtonBase
                  classNames="app-common-btn"
                  type="primary"
                  form="meter-verification-form"
                  htmlType="submit"
                  disabled={
                    !isValid ||
                    Boolean(selectedVerification && !isDirty && !selectedFile) ||
                    detailLoading
                  }
                  customContent={
                    <div className="flex flex-row items-center justify-center">
                      <div>{t('common:confirm')}</div>
                      {detailLoading && (
                        <div className="ml-8">
                          <Spin size="small" />
                        </div>
                      )}
                    </div>
                  }
                />
              </Flex>
            }
          >
            <div className="grid gap-12">
              <AppSelectControl
                name="meterId"
                label="Số công tơ"
                labelSuffix={requiredMark}
                placeholder="Chọn công tơ"
                options={meterOptions}
                control={control}
                disabled={Boolean(selectedVerification)}
              />
              <AppSelectControl
                name="deviceType"
                label="Loại công tơ / thiết bị"
                labelSuffix={requiredMark}
                placeholder="Chọn loại thiết bị"
                options={configs.map((config) => ({
                  value: config.equipmentType,
                  label: config.label
                }))}
                control={control}
                disabled={Boolean(selectedVerification)}
              />
              <div className="grid grid-cols-2 gap-12 mobile:grid-cols-1">
                <AppDatePickerControl
                  control={control}
                  name="verificationDate"
                  label="Ngày kiểm định đầu tiên/gần nhất"
                  labelSuffix={requiredMark}
                  placeholder="Chọn ngày kiểm định"
                  backendFormat={DATE_API_FORMAT}
                  wrapperClassName="w-full"
                  datePickerClassName="w-full"
                />
                <AppDatePickerControl
                  control={control}
                  name="nextVerificationDate"
                  label="Thời hạn kiểm định"
                  placeholder="Tự động tính theo chu kỳ"
                  backendFormat={DATE_API_FORMAT}
                  wrapperClassName="w-full"
                  datePickerClassName="w-full"
                />
              </div>
              <div className="grid grid-cols-2 gap-12 mobile:grid-cols-1">
                <AppTextFieldControl
                  name="certificateNo"
                  label="Số chứng nhận"
                  placeholder="Nhập số chứng nhận"
                  control={control}
                />
                <AppSelectControl
                  name="resultStatus"
                  label="Kết quả"
                  labelSuffix={requiredMark}
                  placeholder="Chọn kết quả"
                  options={RESULT_STATUS_OPTIONS}
                  control={control}
                />
              </div>
              <AppTextFieldControl
                name="notes"
                label="Ghi chú"
                placeholder="Nhập ghi chú"
                control={control}
              />
              <div>
                <label className="mb-4 inline-flex text-14 font-semibold leading-24 text-color-900">
                  File kết quả kiểm định
                </label>
                <Input
                  type="file"
                  onChange={(event) => {
                    const isSelected = onSelectFile(event.target.files?.[0]);
                    if (!isSelected) event.target.value = '';
                  }}
                />
                {selectedFile && (
                  <TextBase
                    classNames="caption !text-color-700 mt-4"
                    text={`File đã chọn: ${selectedFile.name}`}
                  />
                )}
                {selectedVerification?.fileName && (
                  <Flex align="center" gap={K_SIZE_8} className="mt-8 flex-wrap">
                    <TextBase
                      classNames="caption !text-color-700"
                      text={`File hiện tại: ${selectedVerification.fileName}`}
                    />
                    <ButtonBase
                      size={32}
                      type="ghost"
                      customContent="Xem file"
                      disabled={fileLoading}
                      onClick={() => onViewFile(selectedVerification)}
                    />
                    <ButtonBase
                      size={32}
                      type="ghost"
                      customContent="Tải file"
                      disabled={fileLoading}
                      onClick={() => onDownloadFile(selectedVerification)}
                    />
                  </Flex>
                )}
              </div>
              {selectedMeter && (
                <div className="rounded-radius-m border border-color-300 bg-color-100 p-12">
                  <div className="grid grid-cols-2 gap-8 text-14 mobile:grid-cols-1">
                    <div>
                      <span className="text-color-700">Ngày lắp: </span>
                      {renderDate(selectedMeter.installationDate)}
                    </div>
                    <div>
                      <span className="text-color-700">
                        {selectedVerification ? 'Ngày kiểm định: ' : 'Ngày kiểm định gần nhất: '}
                      </span>
                      {renderDate(meterVerificationInfo.verificationDate)}
                    </div>
                    <div>
                      <span className="text-color-700">Thời hạn hiện tại: </span>
                      {renderDate(meterVerificationInfo.nextVerificationDate)}
                    </div>
                    <div className="flex flex-row items-center gap-4">
                      <span className="text-color-700">Số ngày còn lại: </span>
                      {meterVerificationInfo.nextVerificationDate ||
                      meterVerificationInfo.daysUntilNextVerification !== undefined ? (
                        <Status
                          type={getHistoryAlertType(meterVerificationInfo)}
                          kind={KIND_STATUS.SECONDARY}
                          content={getHistoryAlertLabel(meterVerificationInfo)}
                        />
                      ) : (
                        NULL_VALUE
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Drawer>
        </form>
      </section>
    </PageWithBreadcrumb>
  );
};

export default MeterVerificationScreen;
