import { useMemo } from 'react';
import {
  PERMISSION_ADD_ACTION,
  PERMISSION_DOWNLOAD_ACTION,
  PERMISSION_EDIT_ACTION,
  useCheckAction
} from 'utils/permission.util';

export default function useManageUserPermission() {
  const { hasPermission } = useCheckAction();

  const permission = useMemo(() => {
    const canAdd = hasPermission(PERMISSION_ADD_ACTION.SYSTEM_MANAGEMENT_USER_CREATE_ACTION);
    const canEdit = hasPermission(PERMISSION_EDIT_ACTION.SYSTEM_MANAGEMENT_USER_EDIT_ACTION);
    const canDownload = hasPermission(
      PERMISSION_DOWNLOAD_ACTION.SYSTEM_MANAGEMENT_USER_DOWNLOAD_ACTION
    );
    return { canAdd, canEdit, canDownload };
  }, [hasPermission]);

  return {
    permission
  };
}
