'use client';

import { K_SIZE_24, K_SIZE_8 } from '@constant';
import { Drawer, Flex } from 'antd';
import ButtonBase from 'components/button';
import { IconSvgLocal } from 'components/icon-vec-local';
import { AppSelectControl, type AppSelectOption } from 'components/select';
import { AppTextFieldControl } from 'components/text-field';
import { ForwardedRef, forwardRef, useCallback, useImperativeHandle, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAppTranslation } from 'utils/i18n';
import { useResponsive } from 'utils/responsive';

export interface ServiceLocationFilterDrawerRef {
  open: (data: ServiceLocationFilterForm) => void;
  close: () => void;
}

export interface ServiceLocationFilterForm {
  keyword: string;
  contractId: string;
  customerId: string;
  voltageLevel: string;
  usagePurpose: string;
}

interface ServiceLocationFilterDrawerProps {
  defaultValues: ServiceLocationFilterForm;
  voltageLevelOptions: AppSelectOption[];
  usagePurposeOptions: AppSelectOption[];
  onApplyFilter: (data: ServiceLocationFilterForm) => void;
  onResetFilter: () => void;
}

const ServiceLocationFilterDrawer = forwardRef(
  (
    {
      defaultValues,
      voltageLevelOptions,
      usagePurposeOptions,
      onApplyFilter,
      onResetFilter
    }: ServiceLocationFilterDrawerProps,
    ref: ForwardedRef<ServiceLocationFilterDrawerRef>
  ) => {
    const { t } = useAppTranslation();
    const { isMobile, isTablet } = useResponsive();
    const { control, handleSubmit, reset } = useForm<ServiceLocationFilterForm>({
      mode: 'onTouched',
      defaultValues
    });
    const [isOpen, setIsOpen] = useState<boolean>(false);

    const open = useCallback(
      (data: ServiceLocationFilterForm) => {
        reset(data);
        setIsOpen(true);
      },
      [reset]
    );
    const close = useCallback(() => setIsOpen(false), []);

    useImperativeHandle(ref, () => ({ open, close }), [open, close]);

    const onApply = useCallback(
      (data: ServiceLocationFilterForm) => {
        onApplyFilter(data);
        close();
      },
      [close, onApplyFilter]
    );

    const onReset = useCallback(() => {
      reset(defaultValues);
      onResetFilter();
      close();
    }, [close, defaultValues, onResetFilter, reset]);

    return (
      <Drawer
        open={isOpen}
        title={
          <Flex justify="space-between">
            <div>Bộ lọc địa điểm</div>
            <IconSvgLocal
              name="IC_CLOSE_OUTLINE"
              classNames="cursor-pointer text-color-700 hover:text-color-800"
              height={K_SIZE_24}
              onClick={close}
            />
          </Flex>
        }
        destroyOnClose
        placement="right"
        closable={false}
        onClose={close}
        width={isTablet || isMobile ? '80vw' : '40vw'}
        footer={
          <Flex justify="end">
            <Flex justify="end" gap={K_SIZE_8}>
              <ButtonBase
                type="secondary"
                classNames="app-common-btn"
                customContent={t('common:clear_filter')}
                onClick={onReset}
              />
              <ButtonBase
                type="primary"
                customContent={t('common:apply')}
                classNames="app-common-btn"
                onClick={handleSubmit(onApply)}
              />
            </Flex>
          </Flex>
        }
      >
        <Flex vertical gap={K_SIZE_8}>
          <AppTextFieldControl
            name="keyword"
            label="Từ khóa"
            placeholder="Nhập địa chỉ, phường/xã"
            control={control}
          />
          <AppTextFieldControl
            name="contractId"
            label="Mã hợp đồng"
            placeholder="Nhập mã hợp đồng"
            control={control}
          />
          <AppTextFieldControl
            name="customerId"
            label="Mã khách hàng"
            placeholder="Nhập mã khách hàng"
            control={control}
          />
          <AppSelectControl
            name="voltageLevel"
            label="Cấp điện áp"
            placeholder="Chọn cấp điện áp"
            options={voltageLevelOptions}
            control={control}
          />
          <AppSelectControl
            name="usagePurpose"
            label="Mục đích sử dụng"
            placeholder="Chọn mục đích sử dụng"
            options={usagePurposeOptions}
            control={control}
          />
        </Flex>
      </Drawer>
    );
  }
);

ServiceLocationFilterDrawer.displayName = 'ServiceLocationFilterDrawer';

export default ServiceLocationFilterDrawer;
