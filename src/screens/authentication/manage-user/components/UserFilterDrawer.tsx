'use client';

import { K_SIZE_24, K_SIZE_8 } from '@constant';
import { Drawer, Flex } from 'antd';
import ButtonBase from 'components/button';
import { IconSvgLocal } from 'components/icon-vec-local';
import { AppSelectControl, AppSelectOption } from 'components/select';
import { AppTextFieldControl } from 'components/text-field';
import { ForwardedRef, forwardRef, useCallback, useImperativeHandle, useState } from 'react';
import { useForm } from 'react-hook-form';
import { USER_STATUS_OPTIONS } from 'screens/authentication/manage-user/utils/constant';
import { useAppTranslation } from 'utils/i18n';
import { useResponsive } from 'utils/responsive';

export interface UserFilterDrawerRef {
  open: (data: UserFilterForm) => void;
  close: () => void;
}

export interface UserFilterForm {
  username: string;
  fullName: string;
  unitId: string;
  departmentId: string;
  status: string;
  roleId: string;
  email: string;
}

interface UserFilterDrawerProps {
  defaultValues: UserFilterForm;
  onApplyFilter: (data: UserFilterForm) => void;
  onResetFilter: () => void;
  roleOptions: AppSelectOption[];
}

const UserFilterDrawer = forwardRef(
  (
    { defaultValues, onApplyFilter, onResetFilter, roleOptions }: UserFilterDrawerProps,
    ref: ForwardedRef<UserFilterDrawerRef>
  ) => {
    const { t } = useAppTranslation();
    const { isMobile, isTablet } = useResponsive();

    const { control, handleSubmit, reset } = useForm<UserFilterForm>({
      mode: 'onTouched',
      defaultValues
    });

    const [isOpen, setIsOpen] = useState<boolean>(false);

    const open = useCallback(
      (data: UserFilterForm) => {
        reset(data);
        setIsOpen(true);
      },
      [reset]
    );
    const close = useCallback(() => setIsOpen(false), []);

    useImperativeHandle(ref, () => ({ open, close }), [open, close]);

    const onApply = useCallback(
      (data: UserFilterForm) => {
        onApplyFilter(data);
        close();
      },
      [onApplyFilter, close]
    );

    const onReset = useCallback(() => {
      onResetFilter();
      close();
    }, [onResetFilter, close]);

    return (
      <Drawer
        open={isOpen}
        title={
          <Flex justify={'space-between'}>
            <div>{t('manage_user:title', { action: t('common:filter') })}</div>
            <IconSvgLocal
              name={'IC_CLOSE_OUTLINE'}
              classNames={'text-color-700 cursor-pointer hover:text-color-800'}
              height={K_SIZE_24}
              onClick={close}
            />
          </Flex>
        }
        destroyOnClose
        placement={'right'}
        closable={false}
        onClose={close}
        width={isTablet || isMobile ? '80vw' : '40vw'}
        footer={
          <Flex justify={'end'}>
            <Flex justify={'end'} gap={K_SIZE_8}>
              <ButtonBase
                type={'secondary'}
                classNames={'app-common-btn'}
                customContent={t('common:clear_filter')}
                onClick={onReset}
              />
              <ButtonBase
                type={'primary'}
                customContent={t('common:apply')}
                classNames={'app-common-btn'}
                onClick={handleSubmit(onApply)}
              />
            </Flex>
          </Flex>
        }
      >
        <Flex vertical gap={K_SIZE_8}>
          <AppTextFieldControl
            name="username"
            label={t('login_screen:username')}
            placeholder={t('login_screen:enter_username')}
            control={control}
          />
          <AppTextFieldControl
            name="fullName"
            label={t('manage_user:fullname')}
            placeholder={t('manage_user:enter_fullname')}
            control={control}
          />
          <AppTextFieldControl
            name="email"
            label={t('manage_user:email')}
            placeholder={t('manage_user:enter_email')}
            control={control}
          />
          <AppSelectControl
            name="status"
            label={t('common:status')}
            placeholder={t('common:select_status')}
            control={control}
            options={USER_STATUS_OPTIONS}
            isTranslationLabel
            wrapperClassName="w-full"
          />
          <AppSelectControl
            name="roleId"
            label={t('manage_user:role')}
            placeholder={t('manage_user:select_role')}
            control={control}
            options={roleOptions}
            wrapperClassName="w-full"
          />
        </Flex>
      </Drawer>
    );
  }
);

export default UserFilterDrawer;
