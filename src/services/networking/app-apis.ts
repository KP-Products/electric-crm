const ApiEndPoint = {
  // AUTH
  LOGIN: '/user/login',
  LOGOUT: '/user/logout',
  // AUTH

  // MASTER DATA
  MASTER_DATA_TEMPLATE: '/masterdata/template',
  MASTER_DATA_UNIT: '/masterdata/unit',
  MASTER_DATA_DEPARTMENT: '/masterdata/department',
  // MASTER DATA

  // USER
  GET_LIST_USER: '/user/list',
  DOWNLOAD_LIST_USER: '/user/download',
  ADD_USER: '/user/create',
  ADD_LIST_USER: '/user/create-list',
  UPLOAD_USER: '/user/upload',
  EDIT_USER: '/user/update',
  // USER

  // APPROVAL MATRIX
  GET_LIST_APPROVAL_FUNCTION: '/permission/approval-action',
  APPROVAL_MATRIX_DETAIL: '/approval-matrix/detail',
  EDIT_APPROVAL_MATRIX: '/approval-matrix',
  // APPROVAL MATRIX

  // ROLE
  GET_LIST_ROLE: '/role/list',
  GET_ROLE_DETAIL: '/role/detail',
  ADD_ROLE: '/role/create',
  EDIT_ROLE: '/role/update',
  DELETE_ROLE: '/role/delete',
  DOWNLOAD_LIST_ROLE: '/role/download',
  GET_LIST_PERMISSION: '/permission/list',
  // ROLE

  // SYSTEM PARAMETER
  SYSTEM_PARAMETER_LIST: '/system-parameters/get',
  SYSTEM_PARAMETER_UPDATE: '/system-parameters/update',
  // SYSTEM PARAMETER

  // FEE CONDITION
  FEE_CONDITION_LIST: '/fees/fee-condition/get',
  FEE_CONDITION_CREATE: '/fees/fee-condition/create',
  FEE_CONDITION_UPDATE: '/fees/fee-condition/update',
  FEE_CONDITION_DELETE: '/fees/fee-condition/delete',
  FEE_CONDITION_DOWNLOAD: '/fees/fee-condition/download',
  FEE_CONDITION_DATA_FIELD: '/fees/fee-condition/data-field',
  // FEE CONDITION

  // FEE CODE
  FEE_CODE_LIST: '/fee-code/get-list',
  FEE_CODE_CREATE: '/fee-code/create',
  FEE_CODE_DELETE: '/fee-code/delete',
  FEE_CODE_UPDATE_STATUS: '/fee-code/update-status',
  FEE_CODE_UPDATE: '/fee-code/update',

  MASTERDATA_CUS_SEGMENT: '/masterdata/cate-customer-segment',
  MASTERDATA_CUS_TYPE: '/masterdata/cate-customer-type',
  DOWNLOAD_UNUSED_FEE_CODE: '/fee-code/download-unused',
  FEE_CODE_BY_CIF: '/lookup/feecode-by-cif',
  CUSTOMER_LIST: '/customer/get-list',

  // CUSTOMER_GROUP
  CUSTOMER_GROUP_LIST: '/group-customer/get',
  CUSTOMER_GROUP_CREATE: '/group-customer/create',
  CUSTOMER_GROUP_UPDATE: '/group-customer/update',
  CUSTOMER_GROUP_DOWNLOAD: '/group-customer/download',
  // CUSTOMER_GROUP
  // FEE CODE

  // FEE FORMULA
  FEE_FORMULA_LIST: 'fees/fee-formula/get',
  FEE_FORMULA_CREATE: 'fees/fee-formula/create',
  FEE_FORMULA_UPDATE: 'fees/fee-formula/update',
  FEE_FORMULA_DELETE: 'fees/fee-formula/delete',
  FEE_FORMULA_DOWNLOAD: 'fees/fee-formula/download',
  // FEE FORMULA

  // JOBS
  JOBS: '/jobs',
  JOBS_LIST: '/jobs/list',
  JOBS_DETAIL: '/jobs/detail',
  JOBS_UPDATE: '/jobs/update',
  RERUN_JOBS: '/jobs/run',
  EXECUTION_LOGS: '/jobs/execution-logs',
  DOWNLOAD_JOB_LIST: '/jobs/download',
  DOWNLOAD_EXECUTION_LOG: '/jobs/execution-logs/download',
  // JOBS

  // PRODUCT
  PRODUCT_LIST: '/product-service-catalog/list',
  PRODUCT_DETAIL: '/product-service-catalog/detail',
  PRODUCT_CREATE: '/product-service-catalog/create',
  PRODUCT_UPDATE: '/product-service-catalog/update',
  PRODUCT_DOWNLOAD: '/product-service-catalog/download',
  PRODUCT_CHANGE_FEE: '/product-service-catalog/convert',
  // APPROVE
  PRODUCT_REVISE: '/product-service-catalog/revise',
  PRODUCT_CHANGE_FEE_REVISE: '/product-service-catalog/convert/revise',
  // PRODUCT

  // APPROVE
  MY_REQUEST_LIST: '/pending-task/my-request/list',
  TASK_APPROVE_LIST: '/pending-task/approvals/list',
  TASK_DETAIL: '/pending-task/detail',
  APPROVE_TASK: '/approval-matrix/approve',
  REJECT_TASK: '/approval-matrix/reject',
  DELETE_TASK: '/approval-matrix/delete-bbrequest',
  HISTORY_TASK: '/approval-matrix/history',
  // APPROVE

  // FEE SCHEDULE
  FEE_SCHEDULE_LIST: '/fee-schedule/list',
  CREATE_FEE_SCHEDULE: '/fee-schedule/create',
  UPDATE_FEE_SCHEDULE: '/fee-schedule/update',
  FEE_SCHEDULE_DETAIL: '/fee-schedule/detail',
  DOWNLOAD_LIST_FEE_SCHEDULE: '/fee-schedule/download',
  CHANGE_FEE_CODE: '/fee-schedule/request-change-fee-code',
  DOWNLOAD_FEE_CODE_BY_FEE_SCHEDULE: '/fee-code/download',
  UPLOAD_FEE_CODE: '/fee-schedule/upload',
  GET_DETAIL_REQUEST_CHANGE_FEE_CODE: '/fee-schedule/convert-fee-code/detail',
  // FEE SCHEDULE

  // FEE LOOKUP
  FEE_LOOKUP_COLLECTION_HISTORY: '/lookup/fee-collection-history',
  FEE_LOOKUP_COLLECTION_ESTIMATE: '/lookup/fee-collection-estimate',
  DOWNLOAD_LOOKUP: '/lookup/download',
  // FEE LOOKUP

  // GROUP CODE FEE
  GROUP_CODE_FEE_LIST: '/jobs/group-code-fee/list',
  GROUP_CODE_FEE_CREATE: '/jobs/group-code-fee',
  GROUP_CODE_FEE_UPDATE: '/jobs/group-code-fee/update',
  GROUP_CODE_FEE_DELETE: '/jobs/group-code-fee/delete',
  GROUP_CODE_FEE_DETAIL: '/jobs/group-code-fee/detail',
  GROUP_CODE_FEE_DOWNLOAD: '/jobs/group-code-fee/download',
  // GROUP CODE FEE

  // FORM MANAGEMENT
  FORM_MANAGEMENT_LIST: '/form-template/list',
  FORM_MANAGEMENT_CREATE: '/form-template/create',
  FORM_MANAGEMENT_UPDATE: '/form-template/update',
  FORM_MANAGEMENT_DETAIL: '/form-template/detail',
  FORM_MANAGEMENT_SOURCE_TABLE: '/form-template/source-table/list'
  // FORM MANAGEMENT
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
