'use client';

import { K_SIZE_1, K_SIZE_16, K_SIZE_24, K_SIZE_8 } from '@constant';
import { Divider, Flex } from 'antd';
import clsx from 'clsx';
import ButtonBase from 'components/button';
import { IconSvgLocal } from 'components/icon-vec-local';
import { AppSelect, AppSelectControl } from 'components/select';
import { TextBase } from 'components/text';
import { AppTextFieldControl } from 'components/text-field';
import { Controller } from 'react-hook-form';
import PermissionTableView from 'screens/authentication/manage-permission-group/form/components/PermissionTableView';
import SelectDepartment from 'screens/authentication/manage-user/components/SelectDepartment';
import SelectUnit from 'screens/authentication/manage-user/components/SelectUnit';
import useManageUserForm, {
  ManageUserFormProps
} from 'screens/authentication/manage-user/hooks/useManageUserForm';
import useManageUserPermission from 'screens/authentication/manage-user/hooks/useManageUserPermission';
import { USER_STATUS_OPTIONS } from 'screens/authentication/manage-user/utils/constant';

const ManageUserForm = (props: ManageUserFormProps) => {
  const { isAddMode, isView } = props;

  const { t, action, onSubmit, userForm, loading, onBack, onEdit, roleOptions, getUserPermission } =
    useManageUserForm(props);

  const { permission } = useManageUserPermission();

  const {
    control,
    setValue,
    setError,
    clearErrors,
    handleSubmit,
    formState: { isValid }
  } = userForm;

  return (
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
          <TextBase classNames="title4" text={t('manage_user:title', { action })} />
        </div>
        {isView && permission.canEdit && (
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
        )}
      </Flex>
      <Divider className={'my-16'} />
      <div className="grid grid-cols-3 gap-16 mobile:grid-cols-1">
        <AppTextFieldControl
          name="username"
          label={t('login_screen:username')}
          placeholder={t('login_screen:enter_username')}
          isView={isView}
          control={control}
          disabled={!isAddMode}
        />
        <AppTextFieldControl
          name="fullName"
          label={t('manage_user:fullname')}
          placeholder={t('manage_user:enter_fullname')}
          isView={isView}
          control={control}
          disabled={!isAddMode}
        />
        <AppTextFieldControl
          name="email"
          label={t('manage_user:email')}
          placeholder={t('manage_user:enter_email')}
          isView={isView}
          control={control}
          disabled={!isAddMode}
        />
        <AppTextFieldControl
          name="phone"
          label={t('manage_user:phone')}
          placeholder={t('manage_user:enter_phone')}
          isView={isView}
          control={control}
          disabled={!isAddMode}
        />
        <SelectUnit
          isView={isView}
          control={control}
          name={'unitId'}
          onSelectExpand={() => setValue('departmentId', '')}
          disabled={!isAddMode}
        />
        <SelectDepartment
          isView={isView}
          control={control}
          name={'departmentId'}
          unitIdFieldName={'unitId'}
          setError={setError}
          clearErrors={clearErrors}
          disabled={!isAddMode}
        />
        <AppSelectControl
          name="status"
          label={t('common:status')}
          placeholder={t('common:select_status')}
          isView={isView}
          control={control}
          options={USER_STATUS_OPTIONS}
          isTranslationLabel
          wrapperClassName="w-full"
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
                  setValue('permissions', getUserPermission(key));
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
      <PermissionTableView form={userForm as any} isView />
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
              disabled={!isValid || loading}
              onClick={handleSubmit(onSubmit)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUserForm;
