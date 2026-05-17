'use client';

import { K_SIZE_1, K_SIZE_16, K_SIZE_24, K_SIZE_8 } from '@constant';
import { Divider, Flex } from 'antd';
import clsx from 'clsx';
import ButtonBase from 'components/button';
import { IconSvgLocal } from 'components/icon-vec-local';
import { AppSelect } from 'components/select';
import { TextBase } from 'components/text';
import { AppTextFieldControl } from 'components/text-field';
import { Controller } from 'react-hook-form';
import { ManageUserFormProps } from 'screens/authentication/manage-user/hooks/useManageUserForm';
import Link from 'next/link';
import { ROUTES } from '../../../../config/routes';
import PageWithBreadcrumb from '../../../../layout/AppLayout/PageWithBreadcumb';
import useManageMeterForm from '../hooks/useManageMeterForm';
import { AppDatePickerControl } from '../../../../components/date-picker';

const ManageMeterForm = (props: ManageUserFormProps) => {
  const { isAddMode, isView } = props;

  const { t, action, onSubmit, userForm, onBack, onEdit, roleOptions } = useManageMeterForm(props);
  const breadcrumbList = [
    {
      title: t('menu:system_administration'),
      key: ROUTES.MANAGE_USER
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
  // const { permission } = useManageUserPermission();

  const {
    control,
    handleSubmit,
    formState: {}
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
          {/*{isView && permission.canEdit && (*/}
          <Flex
            flex={K_SIZE_1}
            justify={'end'}
            gap={K_SIZE_16}
            className={'mobile:w-full mobile:flex-col'}
          >
            <Flex gap={K_SIZE_16}>
              <ButtonBase
                type={'ghost'}
                customContent={t('common:edit')}
                leftIcon={'ICON_EDIT'}
                onClick={onEdit}
                classNames={'mobile:flex-1 mobile:justify-center'}
              />
            </Flex>
          </Flex>
          {/*)}*/}
        </Flex>
        <Divider className={'my-16'} />
        <div className="grid grid-cols-3 gap-16 mobile:grid-cols-1">
          <AppTextFieldControl
            name="meterCode"
            label={'Mã công tơ'}
            placeholder={'Nhập mã công tơ'}
            isView={isView}
            control={control}
            disabled={!isAddMode}
          />
          <AppTextFieldControl
            name="customerId"
            label={'Mã khách hàng'}
            placeholder={'Nhập mã khách hàng'}
            isView={isView}
            control={control}
            disabled={!isAddMode}
          />
          <AppDatePickerControl
            control={control}
            name="installDate"
            label={'Ngày lắp đặt'}
            placeholder={'Chọn ngày lắp đặt'}
            disabled={!isAddMode}
            isView={isView}
          />
          <AppTextFieldControl
            name="voltageLevel"
            label={'Mức điện áp'}
            placeholder={'Nhập mức điện áp'}
            isView={isView}
            control={control}
            disabled={!isAddMode}
          />
          <AppTextFieldControl
            name="voltageType"
            label={'Loại điện áp'}
            placeholder={'Nhập loại điện áp'}
            isView={isView}
            control={control}
            disabled={!isAddMode}
          />
          <Controller
            control={control}
            name="roleId"
            render={({ field: { name, value, onChange }, fieldState: { error } }) => {
              return (
                <AppSelect
                  name={name}
                  value={value}
                  onSelectOption={({ key }) => {
                    onChange(key);
                  }}
                  label={t('manage_user:role')}
                  placeholder={t('manage_user:select_role')}
                  isView={isView}
                  options={roleOptions}
                  wrapperClassName="w-full"
                  error={error}
                />
              );
            }}
          />
        </div>
        <Divider className={'mb-16 mt-20'} />
        {/*<PermissionTableView form={userForm as any} isView />*/}
        {!isView && (
          //  eslint-disable-next-line tailwindcss/no-contradicting-classname
          <div className="fixed bottom-0 left-[254px] right-0 z-[9] bg-color-50 shadow-up-m shadow-[rgb(var(--color-black)/0.05)] tablet:left-0">
            <div className="flex justify-end gap-16 px-24 py-16">
              <ButtonBase
                classNames="app-common-btn flex justify-center items-center mobile:flex-1"
                type="ghost"
                customContent={t('common:close')}
                onClick={onBack}
              />
              <ButtonBase
                classNames="app-common-btn flex justify-center items-center mobile:flex-1"
                type="primary"
                customContent={t('common:confirm')}
                // disabled={!isValid || loading}
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
