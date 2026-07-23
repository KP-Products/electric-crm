// import { useMemo } from 'react';
// import {
//   PERMISSION_ADD_ACTION,
//   PERMISSION_DELETE_ACTION,
//   PERMISSION_EDIT_ACTION,
//   PERMISSION_VIEW_ACTION,
//   useCheckAction
// } from 'utils/permission.util';

export default function usePpeItemPermission() {
  // const { hasPermission } = useCheckAction();

  // const permission = useMemo(() => {
  //   const canView =
  //     hasPermission(PERMISSION_VIEW_ACTION.PPE_ITEM_VIEW_ACTION) ||
  //     hasPermission(PERMISSION_VIEW_ACTION.SYSTEM_MANAGEMENT_CUSTOMER_GROUP_VIEW_ACTION);
  //   const canAdd = hasPermission(PERMISSION_ADD_ACTION.PPE_ITEM_CREATE_ACTION);
  //   const canEdit = hasPermission(PERMISSION_EDIT_ACTION.PPE_ITEM_EDIT_ACTION);
  //   const canDelete = hasPermission(PERMISSION_DELETE_ACTION.PPE_ITEM_DELETE_ACTION);

  //   return {
  //     canView,
  //     canAdd,
  //     canEdit,
  //     canDelete
  //   };
  // }, [hasPermission]);

  const permission = {
    canView: true,
    canAdd: true,
    canEdit: true,
    canDelete: true
  };

  return { permission };
}
