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
  DELETE_USER: '/admin/users/delete',
  ASSIGN_ROLE_USER: '/admin/users/roles/assign',
  REVOKE_ROLE_USER: '/admin/users/roles/revoke',
  // USER

  // ROLE
  GET_LIST_ROLE: '/admin/roles/list',
  GET_LIST_ROLE_SEARCH: '/admin/roles/search',
  GET_ROLE_DETAIL: '/admin/roles/detail',
  ADD_ROLE: '/admin/roles/create',
  EDIT_ROLE: '/admin/roles/update',
  DELETE_ROLE: '/admin/roles/delete',
  DOWNLOAD_LIST_ROLE: '/role/download',
  GET_LIST_PERMISSION: '/admin/permissions/list',
  ASSIGN_PERMISSION: '/admin/roles/permissions/assign',
  REMOVE_PERMISSION: '/admin/roles/permissions/remove',
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
  CUSTOMER_DOWNLOAD: '/admin/customers/download',
  // MANAGE CUSTOMERS

  // CONTRACT
  CONTRACT_CREATE: '/contracts/create',
  CONTRACT_UPDATE: '/contracts/update',
  CONTRACT_SEARCH: '/contracts/search',
  CONTRACT_LIST: '/contracts/list',
  CONTRACT_DETAIL: '/contracts/detail',
  CONTRACT_DELETE: '/contracts/delete',
  // CONTRACT

  // METER
  GET_LIST_METER: '/admin/meters/list',
  GET_METER_SEARCH_LIST: '/admin/meters/search',
  ADD_METER: '/admin/meters/create',
  EDIT_METER: '/admin/meters/update',
  DELETE_METER: '/admin/meters/delete',
  METER_DETAIL: '/admin/meters/detail',
  // METER

  // DOCUMENT
  DOCUMENT_UPLOAD: '/admin/documents/upload',
  DOCUMENT_UPDATE: '/admin/documents/update',
  DOCUMENT_SEARCH: '/admin/documents/search',
  DOCUMENT_LIST: '/admin/documents/list',
  DOCUMENT_DETAIL: '/admin/documents/get',
  DOCUMENT_DELETE: '/admin/documents/delete',
  // DOCUMENT

  // SERVICE LOCATION
  SERVICE_LOCATION_CREATE: '/admin/locations/create',
  SERVICE_LOCATION_UPDATE: '/admin/locations/update',
  SERVICE_LOCATION_SEARCH: '/admin/locations/search',
  SERVICE_LOCATION_LIST: '/admin/locations/list',
  SERVICE_LOCATION_DETAIL: '/admin/locations/get',
  SERVICE_LOCATION_DELETE: '/admin/locations/delete',

  // APPROVAL MATRIX
  APPROVAL_MATRIX_DETAIL: '/approval-matrix/detail',
  EDIT_APPROVAL_MATRIX: '/approval-matrix',
  // APPROVAL MATRIX

  MY_REQUEST_LIST: '/pending-task/my-request/list',
  TASK_APPROVE_LIST: '/pending-task/approvals/list',
  TASK_DETAIL: '/pending-task/detail',
  APPROVE_TASK: '/approval-matrix/approve',
  REJECT_TASK: '/approval-matrix/reject',
  DELETE_TASK: '/approval-matrix/delete-bbrequest',
  HISTORY_TASK: '/user-action-log/get-list',
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
