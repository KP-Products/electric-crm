'use client';

import { K_SIZE_1, K_SIZE_16, K_SIZE_24, K_SIZE_8, REQUIRED_MARK } from '@constant';
import { Divider, Flex } from 'antd';
import clsx from 'clsx';
import ButtonBase from 'components/button';
import { IconSvgLocal } from 'components/icon-vec-local';
import { TextBase } from 'components/text';
import { AppTextFieldControl } from 'components/text-field';
import useManagePermissionGroupForm, {
  ManagePermissionGroupFormProps
} from 'screens/authentication/manage-permission-group/hooks/useManagePermissionGroupForm';
import useManagePermissionGroupPermission from 'screens/authentication/manage-permission-group/hooks/useManagePermissionGroupPermission';
import PageWithBreadcrumb from '../../../../layout/AppLayout/PageWithBreadcumb';
import { ROUTES } from '../../../../config/routes';
import Link from 'next/link';
import PermissionTableView from './components/PermissionTableView';

const ManagePermissionGroupForm = (props: ManagePermissionGroupFormProps) => {
  const { isView } = props;

  const { t, action, onSubmit, permissionGroupForm, loading, onBack, onEdit } =
    useManagePermissionGroupForm(props);

  const { permission } = useManagePermissionGroupPermission();

  const {
    control,
    handleSubmit,
    formState: { isValid }
  } = permissionGroupForm;
  const breadcrumbList = [
    {
      title: t('menu:system_administration'),
      key: ROUTES.MANAGE_USER
    },
    {
      title: (
        <Link href={ROUTES.MANAGE_PERMISSION_GROUP}>{t('menu:permission_group_management')}</Link>
      ),
      key: ROUTES.MANAGE_PERMISSION_GROUP
    },
    {
      title: t('manage_role:title', { action }),
      key: ROUTES.MANAGE_PERMISSION_GROUP_DETAIL
    }
  ];
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
            <TextBase classNames="title4" text={t('manage_role:title', { action })} />
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
            name="groupCode"
            label={t('manage_role:role_code')}
            placeholder={t('manage_role:enter_role_code')}
            labelSuffix={isView || REQUIRED_MARK}
            labelSuffixClassName="text-error-600"
            isView={isView}
            control={control}
          />
          <AppTextFieldControl
            name="groupName"
            label={t('manage_role:role_name')}
            placeholder={t('manage_role:enter_role_name')}
            labelSuffix={isView || REQUIRED_MARK}
            labelSuffixClassName="text-error-600"
            isView={isView}
            control={control}
          />
          <AppTextFieldControl
            name="note"
            label={t('manage_role:note')}
            placeholder={t('manage_role:enter_note')}
            isView={isView}
            control={control}
          />
        </div>
        <Divider className={'mb-16 mt-20'} />
        <PermissionTableView form={permissionGroupForm} isView={isView} />
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
    </PageWithBreadcrumb>
  );
};

export default ManagePermissionGroupForm;
