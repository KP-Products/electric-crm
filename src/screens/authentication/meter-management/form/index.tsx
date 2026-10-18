'use client';

import { K_SIZE_1, K_SIZE_16, K_SIZE_24, K_SIZE_8, REQUIRED_MARK } from '@constant';
import { Divider, Flex, Spin, Table, Button } from 'antd';
import clsx from 'clsx';
import ButtonBase from 'components/button';
import { AppDatePickerControl } from 'components/date-picker';
import { IconSvgLocal } from 'components/icon-vec-local';
import { AppSelectControl } from 'components/select';
import { TextBase } from 'components/text';
import { AppTextFieldControl } from 'components/text-field';
import { ROUTES } from 'config/routes';
import PageWithBreadcrumb from 'layout/AppLayout/PageWithBreadcumb';
import Link from 'next/link';
import { displayDateFromServer } from 'utils/date';
import { useSearchParams } from 'next/navigation';
import { MeterMultiplierHistory } from 'model/meter';
import useManageMeterForm, { ManageMeterFormProps } from '../hooks/useManageMeterForm';
import { METER_STATUS_OPTIONS, METER_TYPE_OPTIONS, VOLTAGE_LEVEL_OPTIONS } from '../utils/constant';

const requiredMark = <span className="text-error-600">{REQUIRED_MARK}</span>;

const MeterFormContent = (props: ManageMeterFormProps) => {
  const { isAddMode, isView } = props;

  const {
    t,
    action,
    onSubmit,
    userForm,
    parentMeterOptions,
    onOpenParentMeterDropdown,
    parentMeterDropdownRender,
    showParentMeterField,
    loading,
    history,
    historyFailed,
    reloadHistory,
    onBack,
    onEdit
  } = useManageMeterForm(props);
  const breadcrumbList = [
    {
      title: t('menu:system_administration'),
      key: ROUTES.METER_MANAGEMENT
    },
    {
      title: <Link href={ROUTES.METER_MANAGEMENT}>Quản lý công tơ</Link>,
      key: ROUTES.METER_MANAGEMENT
    },
    {
      title: action + ' công tơ',
      key: ROUTES.METER_MANAGEMENT
    }
  ];

  const {
    control,
    handleSubmit,
    formState: { isDirty, isValid }
  } = userForm;

  return (
    <PageWithBreadcrumb breadcrumbList={breadcrumbList}>
      <div className={clsx({ 'mb-[76px]': !isView })}>
        <Flex
          justify={'space-between'}
          align={'center'}
          gap={K_SIZE_8}
          className={'min-h-44 tablet:min-h-0 tablet:flex-col tablet:items-start'}
        >
          <div className={'flex items-center gap-8'}>
            <IconSvgLocal
              classNames="cursor-pointer"
              name="ICON_ARROW_LINE_LEFT"
              height={K_SIZE_24}
              width={K_SIZE_24}
              onClick={onBack}
            />
            <TextBase classNames="title4" text={action + ' công tơ'} />
          </div>
          {isView && (
            <Flex
              flex={K_SIZE_1}
              justify={'end'}
              gap={K_SIZE_16}
              className={'mobile:w-full mobile:flex-col'}
            >
              <ButtonBase
                type={'ghost'}
                customContent={t('common:edit')}
                leftIcon={'ICON_EDIT'}
                onClick={onEdit}
                classNames={'mobile:flex-1 mobile:justify-center'}
              />
            </Flex>
          )}
        </Flex>
        <Divider className={'my-16'} />

        <fieldset disabled={loading}>
          <div className="grid grid-cols-2 gap-16 mobile:grid-cols-1">
            <AppTextFieldControl
              name="meterCode"
              label="Mã công tơ"
              labelSuffix={requiredMark}
              placeholder="Nhập mã công tơ"
              isView={isView}
              control={control}
              disabled={!isAddMode || loading}
              maxLength={50}
            />
            <AppSelectControl
              name="meterType"
              label="Loại công tơ"
              labelSuffix={requiredMark}
              placeholder="Chọn loại công tơ"
              disabled={loading}
              options={METER_TYPE_OPTIONS}
              isView={isView}
              control={control}
            />
            <AppSelectControl
              name="parentId"
              label="Công tơ cha/Lộ tổng"
              placeholder={showParentMeterField ? 'Chọn công tơ cha/Lộ tổng' : '-'}
              options={parentMeterOptions}
              dropdownRender={parentMeterDropdownRender}
              onOpenChange={onOpenParentMeterDropdown}
              suffix={<IconSvgLocal name="ICON_SEARCH" height={20} width={20} />}
              disabled={!showParentMeterField || loading}
              isView={isView}
              control={control}
            />
            <AppSelectControl
              name="voltageLevel"
              label="Cấp điện áp"
              labelSuffix={requiredMark}
              placeholder="Chọn cấp điện áp"
              isView={isView}
              disabled={loading}
              options={VOLTAGE_LEVEL_OPTIONS}
              control={control}
            />
            <div className="grid content-start gap-16">
              <AppTextFieldControl
                name="multiplier"
                label="Hệ số nhân"
                labelSuffix={requiredMark}
                placeholder="Nhập hệ số nhân"
                isView={isView}
                control={control}
                type="number"
                allowDecimal
              />
              <AppDatePickerControl
                name="multiplierEffectiveFrom"
                control={control}
                label="Ngày bắt đầu"
                labelSuffix={requiredMark}
                placeholder="Chọn ngày bắt đầu"
                isView={isView}
                wrapperClassName="w-full"
                datePickerClassName="w-full"
              />
              <AppDatePickerControl
                control={control}
                name="purchaseDate"
                label="Ngày mua"
                labelSuffix={requiredMark}
                placeholder="Chọn ngày mua"
                isView={isView}
                wrapperClassName="w-full"
                datePickerClassName="w-full"
              />
              <AppSelectControl
                name="status"
                label="Trạng thái"
                labelSuffix={requiredMark}
                placeholder="Chọn trạng thái"
                isView={isView}
                options={METER_STATUS_OPTIONS}
                disabled={loading}
                control={control}
              />
            </div>
            <div className="grid content-start gap-16">
              <div>
                <div className="mb-8 text-14 font-medium">Chỉ số đầu {requiredMark}</div>
                <div className="overflow-hidden rounded-radius-m border border-color-300">
                  <div className="grid grid-cols-[1fr_2fr] bg-color-200 p-8 text-14 font-medium">
                    <span>Khung giờ</span>
                    <span>Chỉ số</span>
                  </div>
                  {(
                    [
                      { name: 'initialReading', label: 'Giờ bình thường' },
                      { name: 'initialReadingCd', label: 'Cao điểm' },
                      { name: 'initialReadingTd', label: 'Thấp điểm' }
                    ] as const
                  ).map((row) => (
                    <div
                      key={row.name}
                      className="grid grid-cols-[1fr_2fr] items-center gap-8 border-t border-color-300 p-8"
                    >
                      <span className="text-14">{row.label}</span>
                      <AppTextFieldControl
                        name={row.name}
                        aria-label={`Chỉ số đầu ${row.label}`}
                        placeholder="Nhập chỉ số đầu"
                        isView={isView}
                        type="number"
                        allowDecimal
                        control={control}
                      />
                    </div>
                  ))}
                </div>
              </div>
              <AppDatePickerControl
                control={control}
                name="installationDate"
                label="Ngày lắp đặt"
                placeholder="Chọn ngày lắp đặt"
                isView={isView}
                wrapperClassName="w-full"
                datePickerClassName="w-full"
              />
            </div>
          </div>
        </fieldset>
        {!isAddMode && (
          <section className="mt-16 rounded-radius-l border border-color-300 p-12">
            <TextBase classNames="sub-title3 mb-12" text="Lịch sử thay đổi hệ số nhân" />
            {historyFailed ? (
              <div className="text-error-600">
                Không tải được lịch sử hệ số nhân. <Button onClick={reloadHistory}>Thử lại</Button>
              </div>
            ) : (
              <Table<MeterMultiplierHistory>
                rowKey="id"
                size="small"
                loading={loading}
                pagination={false}
                dataSource={history}
                scroll={{ x: 900 }}
                locale={{
                  emptyText: 'Chưa có lịch sử hệ số nhân'
                }}
                columns={[
                  { title: 'STT', key: 'index', width: 60, render: (_, __, index) => index + 1 },
                  {
                    title: 'Hệ số nhân',
                    dataIndex: 'multiplier',
                    render: (value: number) => value.toLocaleString('vi-VN')
                  },
                  {
                    title: 'Ngày bắt đầu',
                    dataIndex: 'effectiveFrom',
                    render: (value: string) => (value ? displayDateFromServer(value) : '—')
                  },
                  {
                    title: 'Ngày kết thúc',
                    dataIndex: 'effectiveTo',
                    render: (value: string) => (value ? displayDateFromServer(value) : '—')
                  },
                  {
                    title: 'Người cập nhật',
                    dataIndex: 'updatedBy',
                    render: (value: string) => value || '—'
                  },
                  {
                    title: 'Thời gian cập nhật',
                    dataIndex: 'updatedAt',
                    render: (value: string) => value || '—'
                  },
                  { title: 'Ghi chú', dataIndex: 'note', render: (value: string) => value || '—' }
                ]}
              />
            )}
          </section>
        )}

        {!isView && (
          <div className="fixed bottom-0 left-[254px] right-0 z-[9] bg-color-50 tablet:left-0">
            <div className="flex justify-end gap-16 px-24 py-16">
              <ButtonBase
                classNames="app-common-btn flex items-center justify-center mobile:flex-1"
                type="ghost"
                customContent="Hủy"
                onClick={onBack}
              />
              <ButtonBase
                classNames="app-common-btn flex items-center justify-center mobile:flex-1"
                type="primary"
                customContent={
                  <div className="flex flex-row items-center justify-center">
                    <div>{isAddMode ? 'Lưu' : 'Lưu thay đổi'}</div>
                    {loading && (
                      <div className="ml-8">
                        <Spin size="small" />
                      </div>
                    )}
                  </div>
                }
                disabled={!isValid || Boolean(!isAddMode && !isDirty) || loading || historyFailed}
                onClick={handleSubmit(onSubmit)}
              />
            </div>
          </div>
        )}
      </div>
    </PageWithBreadcrumb>
  );
};

const ManageMeterForm = (props: ManageMeterFormProps) => {
  const id = useSearchParams().get('id');
  return <MeterFormContent key={`${props.isAddMode}-${id || 'new'}`} {...props} />;
};
export default ManageMeterForm;
