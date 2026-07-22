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

  // METER VERIFICATION
  METER_VERIFICATION_SEARCH: '/admin/meter-verifications/search',
  METER_VERIFICATION_LIST: '/admin/meter-verifications/list',
  METER_VERIFICATION_DETAIL: '/admin/meter-verifications/detail',
  METER_VERIFICATION_CREATE: '/admin/meter-verifications/create',
  METER_VERIFICATION_UPDATE: '/admin/meter-verifications/update',
  METER_VERIFICATION_DELETE: '/admin/meter-verifications/delete',
  METER_VERIFICATION_FILE_VIEW: '/admin/meter-verifications',
  // METER VERIFICATION

  // DOCUMENT
  DOCUMENT_UPLOAD: '/admin/documents/upload',
  DOCUMENT_UPDATE: '/admin/documents/update',
  DOCUMENT_SEARCH: '/admin/documents/search',
  DOCUMENT_LIST: '/admin/documents/list',
  DOCUMENT_DETAIL: '/admin/documents/get',
  DOCUMENT_DELETE: '/admin/documents/delete',
  // DOCUMENT

  // COMPANY LEGAL DOCUMENT
  COMPANY_LEGAL_DOCUMENT_CREATE: '/admin/company-legal-documents/create',
  COMPANY_LEGAL_DOCUMENT_UPDATE: '/admin/company-legal-documents/update',
  COMPANY_LEGAL_DOCUMENT_SEARCH: '/admin/company-legal-documents/search',
  COMPANY_LEGAL_DOCUMENT_DETAIL: '/admin/company-legal-documents/detail',
  COMPANY_LEGAL_DOCUMENT_DELETE: '/admin/company-legal-documents/delete',
  COMPANY_LEGAL_DOCUMENT_ATTACHMENT: '/admin/company-legal-documents',
  // COMPANY LEGAL DOCUMENT

  // SERVICE LOCATION
  SERVICE_LOCATION_CREATE: '/admin/locations/create',
  SERVICE_LOCATION_UPDATE: '/admin/locations/update',
  SERVICE_LOCATION_SEARCH: '/admin/locations/search',
  SERVICE_LOCATION_LIST: '/admin/locations/list',
  SERVICE_LOCATION_DETAIL: '/admin/locations/get',
  SERVICE_LOCATION_DELETE: '/admin/locations/delete',

  // BRANCH
  BRANCH_CREATE: '/admin/branches/create',
  BRANCH_UPDATE: '/admin/branches/update',
  BRANCH_SEARCH: '/admin/branches/search',
  BRANCH_LIST: '/admin/branches/list',
  BRANCH_DETAIL: '/admin/branches/detail',
  BRANCH_DELETE: '/admin/branches/delete',
  BRANCH_USERS: '/admin/branches/users',

  // BILLING 5.1 - NHAP CHI SO
  BILLING_READING_PERIOD_UPDATE: '/admin/billing/reading-periods/update',
  BILLING_READING_PERIOD_SEARCH: '/admin/billing/reading-periods/search',
  BILLING_READING_PERIOD_GET: '/admin/billing/reading-periods/get',
  BILLING_READING_PERIOD_DELETE: '/admin/billing/reading-periods/delete',
  BILLING_READING_PERIOD_CREATE: '/admin/billing/reading-periods/create',

  // BILLING 2.1 - DANH MUC GIA DIEN
  BILLING_TARIFF_LIST: '/admin/billing/tariffs/list',
  BILLING_TARIFF_DETAIL: '/admin/billing/tariffs/detail',
  BILLING_TARIFF_CREATE: '/admin/billing/tariffs/create',
  BILLING_TARIFF_TOU_LIST: '/admin/billing/tariffs/tou/list',
  BILLING_TARIFF_TOU_CREATE: '/admin/billing/tariffs/tou/create',

  // BILLING 5.2 - NHAP CHI SO TU FILE
  BILLING_REMOTE_READING_IMPORT_UPLOAD: '/admin/billing/readings/import/upload',
  BILLING_REMOTE_READING_IMPORT_TEMPLATE: '/admin/billing/readings/import/template',

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
  HISTORY_TASK: '/user-action-log/get-list'
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
