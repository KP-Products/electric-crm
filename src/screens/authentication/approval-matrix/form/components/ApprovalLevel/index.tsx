'use client';

import { K_SIZE_1, K_SIZE_24 } from '@constant';
import { IconSvgLocal } from 'components/icon-vec-local';
import { TextBase } from 'components/text';
import { RefObject } from 'react';
import { Control } from 'react-hook-form';
import SelectUser from 'screens/authentication/approval-matrix/form/components/ApprovalLevel/SelectUser';
import { SelectUserModalRef } from 'screens/authentication/approval-matrix/form/components/SelectUserModal';
import { ViewUserModalRef } from 'screens/authentication/approval-matrix/form/components/ViewUserModal';
import { ApprovalMatrixForm } from 'screens/authentication/approval-matrix/hooks/useApprovalMatrixForm';
import { useAppTranslation } from 'utils/i18n';

interface ApprovalLevelProps {
  isView: boolean;
  index: number;
  control: Control<ApprovalMatrixForm>;
  totalLevel: number;
  selectUserModalRef: RefObject<SelectUserModalRef>;
  viewUserModalRef: RefObject<ViewUserModalRef>;
  onDeleteLevel: (index: number) => void;
}

const ApprovalLevel = ({
  isView,
  index,
  control,
  totalLevel,
  selectUserModalRef,
  viewUserModalRef,
  onDeleteLevel
}: ApprovalLevelProps) => {
  const { t } = useAppTranslation();

  return (
    <div className="rounded-radius-m border border-color-300 p-16">
      <div className="mb-16 flex justify-between">
        <TextBase
          preset="title4"
          text={t('approval_matrix:level_order', { order: index + K_SIZE_1 })}
        />
        {!isView && totalLevel > K_SIZE_1 && (
          <IconSvgLocal
            name={'IC_CLOSE_OUTLINE'}
            classNames={'text-color-700 cursor-pointer hover:text-color-800'}
            height={K_SIZE_24}
            onClick={() => onDeleteLevel(index)}
          />
        )}
      </div>
      <TextBase classNames="mb-4" preset="sub-title4" text={t('approval_matrix:approver')} />
      <SelectUser
        isView={isView}
        index={index}
        control={control}
        selectUserModalRef={selectUserModalRef}
        viewUserModalRef={viewUserModalRef}
      />
    </div>
  );
};

export default ApprovalLevel;
