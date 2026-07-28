'use client';

import { K_SIZE_1, K_SIZE_16, K_SIZE_24, K_SIZE_8, REQUIRED_MARK } from '@constant';
import { Divider, Flex, Spin } from 'antd';
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
import type { ChangeEvent } from 'react';
import { sanitizeIntegerInput } from 'utils/number-input';
import useManageMeterForm, { ManageMeterFormProps } from '../hooks/useManageMeterForm';
import { METER_STATUS_OPTIONS, METER_TYPE_OPTIONS, VOLTAGE_LEVEL_OPTIONS } from '../utils/constant';

const requiredMark = <span className="text-error-600">{REQUIRED_MARK}</span>;

const ManageMeterForm = (props: ManageMeterFormProps) => {
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
    setValue,
    formState: { isDirty, isValid }
  } = userForm;

  const handleNumberFieldChange =
    (fieldName: 'multiplier' | 'initialReading') => (event: ChangeEvent<HTMLInputElement>) => {
      setValue(fieldName, sanitizeIntegerInput(event.target.value), {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true
      });
    };

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

        <div className="grid grid-cols-2 gap-16 mobile:grid-cols-1">
          <AppTextFieldControl
            name="meterCode"
            label="Mã công tơ"
            labelSuffix={requiredMark}
            placeholder="Nhập mã công tơ"
            isView={isView}
            control={control}
            disabled={!isAddMode}
          />
          <AppSelectControl
            name="meterType"
            label="Loại công tơ"
            labelSuffix={requiredMark}
            placeholder="Chọn loại công tơ"
            options={METER_TYPE_OPTIONS}
            isView={isView}
            control={control}
          />
          <AppSelectControl
            name="parentId"
            label="Công tơ cha/Lộ tổng"
            labelSuffix={showParentMeterField ? requiredMark : undefined}
            placeholder={showParentMeterField ? 'Chọn công tơ cha/Lộ tổng' : '-'}
            options={parentMeterOptions}
            dropdownRender={parentMeterDropdownRender}
            onOpenChange={onOpenParentMeterDropdown}
            suffix={<IconSvgLocal name="ICON_SEARCH" height={20} width={20} />}
            disabled={!showParentMeterField}
            isView={isView}
            control={control}
          />
          <AppSelectControl
            name="voltageLevel"
            label="Cấp điện áp"
            labelSuffix={requiredMark}
            placeholder="Chọn cấp điện áp"
            isView={isView}
            options={VOLTAGE_LEVEL_OPTIONS}
            control={control}
          />
          <AppTextFieldControl
            name="multiplier"
            label="Hệ số nhân"
            labelSuffix={requiredMark}
            placeholder="Nhập hệ số nhân"
            isView={isView}
            inputMode="numeric"
            formatNumberWithCommas
            onChange={handleNumberFieldChange('multiplier')}
            control={control}
          />
          <AppTextFieldControl
            name="initialReading"
            label="Chỉ số đầu"
            labelSuffix={requiredMark}
            placeholder="Nhập chỉ số đầu"
            isView={isView}
            inputMode="numeric"
            formatNumberWithCommas
            onChange={handleNumberFieldChange('initialReading')}
            control={control}
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
          <AppDatePickerControl
            control={control}
            name="installationDate"
            label="Ngày lắp đặt"
            labelSuffix={requiredMark}
            placeholder="Chọn ngày lắp đặt"
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
            control={control}
          />
        </div>

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
                disabled={!isValid || Boolean(!isAddMode && !isDirty) || loading}
                onClick={handleSubmit(onSubmit)}
              />
            </div>
          </div>
        )}
      </div>
    </PageWithBreadcrumb>
  );
};

export default ManageMeterForm;
