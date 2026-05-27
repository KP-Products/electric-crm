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

export interface ContractFilterDrawerRef {
  open: (data: ContractFilterForm) => void;
  close: () => void;
}

export interface ContractFilterForm {
  contractNumber: string;
  customerId: string;
  customerType: string;
  status: string;
}

interface ContractFilterDrawerProps {
  defaultValues: ContractFilterForm;
  customerTypeOptions: AppSelectOption[];
  statusOptions: AppSelectOption[];
  onApplyFilter: (data: ContractFilterForm) => void;
  onResetFilter: () => void;
}

const ContractFilterDrawer = forwardRef(
  (
    {
      defaultValues,
      customerTypeOptions,
      statusOptions,
      onApplyFilter,
      onResetFilter
    }: ContractFilterDrawerProps,
    ref: ForwardedRef<ContractFilterDrawerRef>
  ) => {
    const { t } = useAppTranslation();
    const { isMobile, isTablet } = useResponsive();
    const { control, handleSubmit, reset } = useForm<ContractFilterForm>({
      mode: 'onTouched',
      defaultValues
    });
    const [isOpen, setIsOpen] = useState<boolean>(false);

    const open = useCallback(
      (data: ContractFilterForm) => {
        reset(data);
        setIsOpen(true);
      },
      [reset]
    );
    const close = useCallback(() => setIsOpen(false), []);

    useImperativeHandle(ref, () => ({ open, close }), [open, close]);

    const onApply = useCallback(
      (data: ContractFilterForm) => {
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
            <div>Bộ lọc hợp đồng</div>
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
            name="contractNumber"
            label="Số hợp đồng"
            placeholder="Nhập số hợp đồng"
            control={control}
          />
          <AppTextFieldControl
            name="customerId"
            label="Mã khách hàng"
            placeholder="Nhập mã khách hàng"
            control={control}
          />
          <AppSelectControl
            name="customerType"
            label="Loại khách hàng"
            placeholder="Chọn loại khách hàng"
            options={customerTypeOptions}
            control={control}
          />
          <AppSelectControl
            name="status"
            label="Trạng thái"
            placeholder="Chọn trạng thái"
            options={statusOptions}
            control={control}
          />
        </Flex>
      </Drawer>
    );
  }
);

ContractFilterDrawer.displayName = 'ContractFilterDrawer';

export default ContractFilterDrawer;
