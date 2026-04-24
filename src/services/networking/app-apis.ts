const ApiEndPoint = {
  // AUTH
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  // AUTH

  // USER
  GET_LIST_USER: '/admin/users/list',
  GET_USER_SEARCH_LIST: '/admin/users/search',
  DOWNLOAD_LIST_USER: '/admin/users/download',
  ADD_USER: '/admin/users/create',
  ADD_LIST_USER: '/admin/users/create-list',
  UPLOAD_USER: '/admin/users/upload',
  EDIT_USER: '/admin/users/update',
  // USER

  // ROLE
  GET_LIST_ROLE: '/admin/roles/list',
  GET_ROLE_DETAIL: '/admin/roles/detail',
  ADD_ROLE: '/admin/roles/create',
  EDIT_ROLE: '/admin/roles/update',
  DELETE_ROLE: '/admin/roles/delete',
  DOWNLOAD_LIST_ROLE: '/role/download',
  GET_LIST_PERMISSION: '/admin/permissions/list',
  // ROLE

  // SYSTEM PARAMETER
  SYSTEM_PARAMETER_LIST: '/system-parameters/get',
  SYSTEM_PARAMETER_UPDATE: '/system-parameters/update',
  // SYSTEM PARAMETER

  // MANAGE CUSTOMERS
  CUSTOMER_LIST: '/admin/customers/list',
  CUSTOMER_CREATE: '/admin/customers/create',
  CUSTOMER_UPDATE: '/admin/customers/update',
  CUSTOMER_DELETE: '/admin/customers/delete',
  CUSTOMER_DETAIL: '/admin/customers/detail',
  CUSTOMER_DOWNLOAD: '/admin/customers/download'
  // MANAGE CUSTOMERS
} as const;

const configApi = () => {
  const apiOb: Record<string, string> = {};
  Object.keys(ApiEndPoint).forEach((x) => {
    const valueApi = ApiEndPoint[x as keyof typeof ApiEndPoint];
    apiOb[x] = valueApi; //API_VERSION + valueApi;
  });
  return apiOb;
};

type ApiConstantsType<T> = {
  [a in keyof T]: string;
};

export const ApiConstants = configApi() as ApiConstantsType<typeof ApiEndPoint>;
