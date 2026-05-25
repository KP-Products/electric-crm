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

export interface DocumentFilterDrawerRef {
  open: (data: DocumentFilterForm) => void;
  close: () => void;
}

export interface DocumentFilterForm {
  keyword: string;
  ownerType: string;
  ownerId: string;
  docType: string;
  status: string;
}

interface DocumentFilterDrawerProps {
  defaultValues: DocumentFilterForm;
  ownerTypeOptions: AppSelectOption[];
  documentTypeOptions: AppSelectOption[];
  documentStatusOptions: AppSelectOption[];
  onApplyFilter: (data: DocumentFilterForm) => void;
  onResetFilter: () => void;
}

const DocumentFilterDrawer = forwardRef(
  (
    {
      defaultValues,
      ownerTypeOptions,
      documentTypeOptions,
      documentStatusOptions,
      onApplyFilter,
      onResetFilter
    }: DocumentFilterDrawerProps,
    ref: ForwardedRef<DocumentFilterDrawerRef>
  ) => {
    const { t } = useAppTranslation();
    const { isMobile, isTablet } = useResponsive();
    const { control, handleSubmit, reset } = useForm<DocumentFilterForm>({
      mode: 'onTouched',
      defaultValues
    });
    const [isOpen, setIsOpen] = useState<boolean>(false);

    const open = useCallback(
      (data: DocumentFilterForm) => {
        reset(data);
        setIsOpen(true);
      },
      [reset]
    );
    const close = useCallback(() => setIsOpen(false), []);

    useImperativeHandle(ref, () => ({ open, close }), [open, close]);

    const onApply = useCallback(
      (data: DocumentFilterForm) => {
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
            <div>Bộ lọc tài liệu</div>
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
            placeholder="Nhập tên file, ghi chú"
            control={control}
          />
          <AppSelectControl
            name="ownerType"
            label="Loại chủ sở hữu"
            placeholder="Chọn loại chủ sở hữu"
            options={ownerTypeOptions}
            control={control}
          />
          <AppTextFieldControl
            name="ownerId"
            label="Mã chủ sở hữu"
            placeholder="Nhập mã chủ sở hữu"
            control={control}
          />
          <AppSelectControl
            name="docType"
            label="Loại tài liệu"
            placeholder="Chọn loại tài liệu"
            options={documentTypeOptions}
            control={control}
          />
          <AppSelectControl
            name="status"
            label="Trạng thái"
            placeholder="Chọn trạng thái"
            options={documentStatusOptions}
            control={control}
          />
        </Flex>
      </Drawer>
    );
  }
);

DocumentFilterDrawer.displayName = 'DocumentFilterDrawer';

export default DocumentFilterDrawer;
