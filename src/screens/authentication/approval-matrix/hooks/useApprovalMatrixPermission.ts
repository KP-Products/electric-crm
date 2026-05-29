import { useMemo } from 'react';
import { PERMISSION_EDIT_ACTION, useCheckAction } from 'utils/permission.util';

export default function useApprovalMatrixPermission() {
  const { hasPermission } = useCheckAction();

  const permission = useMemo(() => {
    const canEdit = hasPermission(
      PERMISSION_EDIT_ACTION.SYSTEM_MANAGEMENT_APPROVAL_MATRIX_EDIT_ACTION
    );
    return { canEdit };
  }, [hasPermission]);

  return {
    permission
  };
}
