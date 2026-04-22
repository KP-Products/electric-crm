import { useMemo } from 'react';
import {
  PERMISSION_ADD_ACTION,
  PERMISSION_DELETE_ACTION,
  PERMISSION_DOWNLOAD_ACTION,
  PERMISSION_EDIT_ACTION,
  useCheckAction
} from 'utils/permission.util';

export default function useManagePermissionGroupPermission() {
  const { hasPermission } = useCheckAction();

  const permission = useMemo(() => {
    const canAdd = hasPermission(
      PERMISSION_ADD_ACTION.SYSTEM_MANAGEMENT_AUTHORIZATION_CREATE_ACTION
    );
    const canEdit = hasPermission(
      PERMISSION_EDIT_ACTION.SYSTEM_MANAGEMENT_AUTHORIZATION_EDIT_ACTION
    );
    const canDelete = hasPermission(
      PERMISSION_DELETE_ACTION.SYSTEM_MANAGEMENT_AUTHORIZATION_DELETE_ACTION
    );
    const canDownload = hasPermission(
      PERMISSION_DOWNLOAD_ACTION.SYSTEM_MANAGEMENT_AUTHORIZATION_DOWNLOAD_ACTION
    );
    return { canAdd, canEdit, canDelete, canDownload };
  }, [hasPermission]);

  return {
    permission
  };
}
