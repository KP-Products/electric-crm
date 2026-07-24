'use client';

import { K_SIZE_24, K_SIZE_8 } from '@constant';
import { zodResolver } from '@hookform/resolvers/zod';
import { Drawer, Flex } from 'antd';
import ButtonBase from 'components/button';
import { IconSvgLocal } from 'components/icon-vec-local';
import { AppSelectControl, type AppSelectOption } from 'components/select';
import { AppTextFieldControl } from 'components/text-field';
import {
  ForwardedRef,
  ReactNode,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState
} from 'react';
import { useForm } from 'react-hook-form';
import { useAppTranslation } from 'utils/i18n';
import { useResponsive } from 'utils/responsive';
import { z } from 'zod';
import useDocumentOwnerLookup from '../useDocumentOwnerLookup';

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
  operationUnitId: string;
}

const optionalUuidSchema = (message: string) =>
  z
    .string()
    .trim()
    .refine((value) => !value || z.string().uuid().safeParse(value).success, {
      message
    });

const documentFilterSchema = z.object({
  keyword: z.string().trim(),
  ownerType: z.string().trim(),
  ownerId: optionalUuidSchema('ID chủ sở hữu không hợp lệ'),
  docType: z.string().trim(),
  status: z.string().trim(),
  operationUnitId: optionalUuidSchema('ID đơn vị vận hành không hợp lệ')
});

interface DocumentFilterDrawerProps {
  defaultValues: DocumentFilterForm;
  ownerTypeOptions: AppSelectOption[];
  documentTypeOptions: AppSelectOption[];
  documentStatusOptions: AppSelectOption[];
  operationUnitOptions: AppSelectOption[];
  operationUnitDropdownRender: (menuInstance: ReactNode) => ReactNode;
  onOpenOperationUnitDropdown: (open?: boolean) => void;
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
      operationUnitOptions,
      operationUnitDropdownRender,
      onOpenOperationUnitDropdown,
      onApplyFilter,
      onResetFilter
    }: DocumentFilterDrawerProps,
    ref: ForwardedRef<DocumentFilterDrawerRef>
  ) => {
    const { t } = useAppTranslation();
    const { isMobile, isTablet } = useResponsive();
    const { control, handleSubmit, reset, setValue, watch } = useForm<DocumentFilterForm>({
      mode: 'onTouched',
      defaultValues,
      resolver: zodResolver(documentFilterSchema)
    });
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const selectedOwnerType = watch('ownerType');
    const previousOwnerTypeRef = useRef<string>();
    const { ownerOptions, resetOwnerOptions, onOpenOwnerDropdown, ownerDropdownRender } =
      useDocumentOwnerLookup(selectedOwnerType);

    useEffect(() => {
      const previousOwnerType = previousOwnerTypeRef.current;
      if (previousOwnerType === undefined) {
        previousOwnerTypeRef.current = selectedOwnerType;
        return;
      }

      if (previousOwnerType !== selectedOwnerType) {
        setValue('ownerId', '', { shouldDirty: true });
        resetOwnerOptions();
        previousOwnerTypeRef.current = selectedOwnerType;
      }
    }, [resetOwnerOptions, selectedOwnerType, setValue]);

    const open = useCallback(
      (data: DocumentFilterForm) => {
        reset(data);
        previousOwnerTypeRef.current = data.ownerType;
        resetOwnerOptions();
        setIsOpen(true);
      },
      [reset, resetOwnerOptions]
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
            name="operationUnitId"
            label="Đơn vị vận hành"
            placeholder="Chọn đơn vị vận hành"
            options={operationUnitOptions}
            dropdownRender={operationUnitDropdownRender}
            onOpenChange={onOpenOperationUnitDropdown}
            control={control}
          />
          <AppSelectControl
            name="ownerType"
            label="Loại chủ sở hữu"
            placeholder="Chọn loại chủ sở hữu"
            options={ownerTypeOptions}
            control={control}
          />
          <AppSelectControl
            name="ownerId"
            label="Chủ sở hữu"
            placeholder="Chọn chủ sở hữu"
            options={ownerOptions}
            disabled={!selectedOwnerType}
            dropdownRender={ownerDropdownRender}
            onOpenChange={onOpenOwnerDropdown}
            onChange={(ownerId) =>
              setValue('ownerId', String(ownerId || ''), {
                shouldDirty: true,
                shouldTouch: true,
                shouldValidate: true
              })
            }
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
