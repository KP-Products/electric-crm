'use client';

import {
  K_SIZE_0,
  K_SIZE_1,
  K_SIZE_16,
  K_SIZE_200,
  K_SIZE_24,
  K_SIZE_8,
  NULL_VALUE
} from '@constant';
import { Divider, Flex } from 'antd';
import clsx from 'clsx';
import ButtonBase from 'components/button';
import { IconSvgLocal } from 'components/icon-vec-local';
import { TextBase } from 'components/text';
import ApprovalLevel from 'screens/authentication/approval-matrix/form/components/ApprovalLevel';
import SelectUserModal from 'screens/authentication/approval-matrix/form/components/SelectUserModal';
import ViewUserModal from 'screens/authentication/approval-matrix/form/components/ViewUserModal';
import useApprovalMatrixForm, {
  ApprovalMatrixFormProps
} from 'screens/authentication/approval-matrix/hooks/useApprovalMatrixForm';
import useApprovalMatrixPermission from 'screens/authentication/approval-matrix/hooks/useApprovalMatrixPermission';
import { MAX_APPROVAL_LEVEL } from 'screens/authentication/approval-matrix/utils/constant';

const ApprovalMatrixForm = (props: ApprovalMatrixFormProps) => {
  const { isView } = props;

  const {
    t,
    action,
    onSubmit,
    approvalMatrixForm,
    approvalLevel,
    onAddLevel,
    onDeleteLevel,
    loading,
    onBack,
    onEdit,
    selectUserModalRef,
    viewUserModalRef
  } = useApprovalMatrixForm(props);

  const { permission } = useApprovalMatrixPermission();

  const {
    control,
    getValues,
    handleSubmit,
    formState: { isValid }
  } = approvalMatrixForm;

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
          <TextBase classNames="title4" text={t('approval_matrix:title', { action })} />
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
      <TextBase classNames="mb-16" preset="title4" text={t('approval_matrix:approval_function')} />
      <TextBase
        text={getValues('function.description') || getValues('function.action') || NULL_VALUE}
        classNames="text-color-800 py-8 px-12 bg-color-200 rounded-radius-m w-fit"
      />
      <Divider className={'my-16 mt-20'} />
      <TextBase classNames="mb-16" preset="title4" text={t('approval_matrix:approval_level')} />
      <div className={'flex flex-col gap-24'}>
        {approvalLevel.map((field, index) => (
          <ApprovalLevel
            key={field.id}
            isView={isView}
            index={index}
            control={control}
            totalLevel={approvalLevel.length}
            selectUserModalRef={selectUserModalRef}
            viewUserModalRef={viewUserModalRef}
            onDeleteLevel={onDeleteLevel}
          />
        ))}
        {isView && approvalLevel.length === K_SIZE_0 && (
          <div className="flex h-[50vh] flex-col items-center justify-center gap-16">
            <IconSvgLocal name="ICON_EMPTY" width={K_SIZE_200} />
            <TextBase
              t18n="approval_matrix:has_no_approval_matrix"
              classNames="leading-20 text-14 text-color-600"
            />
          </div>
        )}
      </div>
      {!isView && approvalLevel.length < MAX_APPROVAL_LEVEL && (
        <div className="flex justify-end py-16">
          <ButtonBase
            classNames="app-common-btn flex justify-center items-center mobile:flex-1"
            type="whiteGhost"
            leftIcon={'IC_ADD_OUTLINE2'}
            customContent={t('approval_matrix:add_level')}
            onClick={onAddLevel}
          />
        </div>
      )}
      {!isView && (
        //  eslint-disable-next-line tailwindcss/no-contradicting-classname
        <div className="fixed bottom-0 left-[254px] right-0 z-[1] bg-color-50 shadow-up-m shadow-[rgb(var(--color-black)/0.05)] tablet:left-0">
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
      <SelectUserModal ref={selectUserModalRef} control={control} />
      <ViewUserModal ref={viewUserModalRef} isView={isView} />
    </div>
  );
};

export default ApprovalMatrixForm;
