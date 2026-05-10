import { K_SIZE_0, K_SIZE_1 } from '@constant';
import { Permission } from 'model/role';
import { USER_ACTION } from 'screens/authentication/manage-permission-group/utils/constant';
import { PermissionGroup } from 'screens/authentication/manage-permission-group/utils/type';

export const mapPermissionGroup = (data: Permission[]): PermissionGroup[] => {
  const permissions = data.filter((p) => !p.actionCode?.includes(USER_ACTION.APPROVE));
  if (!permissions.length) return [];
  const groupMap = new Map<
    string,
    PermissionGroup & { functionMap: Map<string, PermissionGroup['functions'][number]> }
  >();
  permissions.forEach((item) => {
    if (!groupMap.has(item.actionGroup)) {
      groupMap.set(item.actionGroup, {
        moduleId: item.actionGroup,
        title: item.actionGroupName || item.actionGroup,
        functions: [],
        functionMap: new Map()
      });
    }
    const group = groupMap.get(item.actionGroup)!;
    if (!group.functionMap.has(item.actionSubGroup)) {
      const func = {
        functionId: item.actionSubGroup,
        order: '',
        title: item.actionSubGroupName || item.actionSubGroup,
        permissions: []
      };
      group.functionMap.set(item.actionSubGroup, func);
      group.functions.push(func);
    }
    group.functionMap.get(item.actionSubGroup)!.permissions.push({
      permissionId: item.id,
      title: item.actionCode
    });
  });
  let functionOrder = K_SIZE_0;
  const result = Array.from(groupMap.values()).map(({ functionMap, ...group }) => {
    group.functions.forEach((func) => {
      functionOrder += K_SIZE_1;
      func.order = functionOrder.toString();
    });
    return group;
  });
  return result;
};
