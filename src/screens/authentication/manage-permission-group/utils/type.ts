interface Permission {
  permissionId: string;
  title: string;
}

interface Function {
  functionId: string;
  order: string;
  title: string;
  permissions: Permission[];
}

export interface PermissionGroup {
  moduleId: string;
  title: string;
  functions: Function[];
}
