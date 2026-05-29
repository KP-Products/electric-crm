'use client';

import { K_SIZE_0, K_SIZE_20 } from '@constant';
import ButtonBase from 'components/button';
import TagFilter from 'components/tag-filter';
import { TextBase } from 'components/text';
import { RefObject, useCallback, useMemo } from 'react';
import { Control, useController } from 'react-hook-form';
import { SelectUserModalRef } from 'screens/authentication/approval-matrix/form/components/SelectUserModal';
import { ViewUserModalRef } from 'screens/authentication/approval-matrix/form/components/ViewUserModal';
import { ApprovalMatrixForm } from 'screens/authentication/approval-matrix/hooks/useApprovalMatrixForm';
import { useAppTranslation } from 'utils/i18n';

interface SelectUserProps {
  isView: boolean;
  index: number;
  control: Control<ApprovalMatrixForm>;
  selectUserModalRef: RefObject<SelectUserModalRef>;
  viewUserModalRef: RefObject<ViewUserModalRef>;
  maxTagRender?: number;
}

const SelectUser = ({
  isView,
  index,
  control,
  selectUserModalRef,
  viewUserModalRef,
  maxTagRender = K_SIZE_20
}: SelectUserProps) => {
  const { t } = useAppTranslation();

  const {
    field: { value, onChange }
  } = useController({ control, name: `approvalLevel.${index}.user` });

  const onClose = useCallback(
    (userId: string) => {
      onChange(value.filter((u) => u.id !== userId));
    },
    [value, onChange]
  );

  const onAdd = useCallback(
    () => selectUserModalRef.current?.open(value, onChange, index),
    [value, onChange, selectUserModalRef, index]
  );

  const onViewAll = useCallback(
    () => viewUserModalRef.current?.open(value, onChange),
    [value, onChange, viewUserModalRef]
  );

  const users = useMemo(() => value.slice(K_SIZE_0, maxTagRender), [value, maxTagRender]);

  return (
    <div className="flex flex-wrap items-center gap-8 rounded-radius-m border border-color-300 px-16 py-12">
      {users.map((user) => (
        <TagFilter
          key={user.id}
          content={user.username}
          hiddenClose={isView}
          onClose={() => onClose(user.id)}
        />
      ))}
      {value.length > maxTagRender && (
        <div className="flex h-24 items-center gap-8">
          <TextBase
            t18n="approval_matrix:other_approval"
            t18nOptions={{ num: value.length - maxTagRender }}
            classNames="body1 !text-color-800"
          />
          <div className="cursor-pointer" onClick={onViewAll}>
            <TextBase t18n="approval_matrix:view_all" classNames="body1 !text-link-600" />
          </div>
        </div>
      )}
      {!isView && (
        <ButtonBase
          classNames="app-common-btn flex justify-center items-center mobile:flex-1"
          type="whiteGhost"
          leftIcon={'IC_ADD_OUTLINE2'}
          customContent={t('approval_matrix:add_approver')}
          onClick={onAdd}
        />
      )}
    </div>
  );
};

export default SelectUser;
