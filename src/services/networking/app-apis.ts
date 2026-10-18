const ApiEndPoint = {
  // AUTH
  LOGIN: '/auth/login',
  // AUTH

  // USER
  GET_LIST_USER: '/admin/users/list',
  GET_USER_SEARCH_LIST: '/admin/users/search',
  ADD_USER: '/admin/users/create',
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
  GET_LIST_PERMISSION: '/admin/permissions/list',
  ASSIGN_PERMISSION: '/admin/roles/permissions/assign',
  REMOVE_PERMISSION: '/admin/roles/permissions/remove',
  // ROLE

  // SYSTEM PARAMETER
  SYSTEM_PARAMETER_LIST: '/admin/system-parameters/search',
  SYSTEM_PARAMETER_DETAIL: '/admin/system-parameters/detail',
  SYSTEM_PARAMETER_CREATE: '/admin/system-parameters/create',
  SYSTEM_PARAMETER_UPDATE: '/admin/system-parameters/update',
  SYSTEM_PARAMETER_DELETE: '/admin/system-parameters/delete',
  // SYSTEM PARAMETER

  // MANAGE CUSTOMERS
  CUSTOMER_LIST: '/admin/customers/list',
  CUSTOMER_SEARCH: '/admin/customers/search',
  CUSTOMER_CREATE: '/admin/customers/create',
  CUSTOMER_UPDATE: '/admin/customers/update',
  CUSTOMER_DELETE: '/admin/customers/delete',
  CUSTOMER_DETAIL: '/admin/customers/detail',
  // MANAGE CUSTOMERS

  // CONTRACT
  CONTRACT_CREATE: '/contracts/create',
  CONTRACT_UPDATE: '/contracts/update',
  CONTRACT_SEARCH: '/contracts/search',
  CONTRACT_LIST: '/contracts/list',
  CONTRACT_DETAIL: '/contracts/detail',
  CONTRACT_DELETE: '/contracts/delete',
  CONTRACT_EXPORT_PDF: '/contracts/export-pdf',
  CONTRACT_AVAILABLE_METERS: '/contracts/available-meters',
  CONTRACT_FEEDERS: '/contracts/feeders',
  // CONTRACT

  // OPERATION CONTRACT
  OPERATION_CONTRACT_CREATE: '/admin/operation-contracts/create',
  OPERATION_CONTRACT_UPDATE: '/admin/operation-contracts/update',
  OPERATION_CONTRACT_SEARCH: '/admin/operation-contracts/search',
  OPERATION_CONTRACT_DETAIL: '/admin/operation-contracts/detail',
  OPERATION_CONTRACT_DELETE: '/admin/operation-contracts/delete',
  // OPERATION CONTRACT

  // OPERATION UNIT
  OPERATION_UNIT_CREATE: '/admin/operation-units/create',
  OPERATION_UNIT_UPDATE: '/admin/operation-units/update',
  OPERATION_UNIT_SEARCH: '/admin/operation-units/search',
  OPERATION_UNIT_DETAIL: '/admin/operation-units/detail',
  OPERATION_UNIT_DELETE: '/admin/operation-units/delete',
  // OPERATION UNIT

  // METER
  GET_LIST_METER: '/admin/meters/list',
  GET_METER_SEARCH_LIST: '/admin/meters/search',
  ADD_METER: '/admin/meters/create',
  EDIT_METER: '/admin/meters/update',
  DELETE_METER: '/admin/meters/delete',
  METER_DETAIL: '/admin/meters/detail',
  METER_MULTIPLIER_HISTORY: '/admin/meters/multiplier-history/list',
  // METER

  // MEASURING DEVICE
  MEASURING_DEVICE_SEARCH: '/admin/measuring-devices/search',
  MEASURING_DEVICE_DETAIL: '/admin/measuring-devices/detail',
  MEASURING_DEVICE_CREATE: '/admin/measuring-devices/create',
  MEASURING_DEVICE_UPDATE: '/admin/measuring-devices/update',
  MEASURING_DEVICE_DELETE: '/admin/measuring-devices/delete',
  // MEASURING DEVICE

  // METER VERIFICATION
  METER_VERIFICATION_SEARCH: '/admin/meter-verifications/search',
  METER_VERIFICATION_LIST: '/admin/meter-verifications/list',
  METER_VERIFICATION_CREATE: '/admin/meter-verifications/create',
  METER_VERIFICATION_UPDATE: '/admin/meter-verifications/update',
  METER_VERIFICATION_DELETE: '/admin/meter-verifications/delete',
  METER_VERIFICATION_FILE_VIEW: '/admin/meter-verifications',
  // METER VERIFICATION

  // METER CHANGE EVENT
  METER_CHANGE_EVENT_SEARCH: '/admin/meter-change-events/search',
  METER_CHANGE_EVENT_DETAIL: '/admin/meter-change-events/detail',
  METER_CHANGE_EVENT_CREATE: '/admin/meter-change-events/create',
  METER_CHANGE_EVENT_UPDATE: '/admin/meter-change-events/update',
  METER_CHANGE_EVENT_DELETE: '/admin/meter-change-events/delete',
  // METER CHANGE EVENT

  // PPE ITEM
  PPE_ITEM_SEARCH: '/admin/ppe-items/search',
  PPE_ITEM_DETAIL: '/admin/ppe-items/detail',
  PPE_ITEM_CREATE: '/admin/ppe-items/create',
  PPE_ITEM_UPDATE: '/admin/ppe-items/update',
  PPE_ITEM_DELETE: '/admin/ppe-items/delete',
  // PPE ITEM

  // PPE ITEM HISTORY
  PPE_ITEM_HISTORY_SEARCH: '/admin/ppe-item-history/search',
  PPE_ITEM_HISTORY_DETAIL: '/admin/ppe-item-history/detail',
  PPE_ITEM_HISTORY_CREATE: '/admin/ppe-item-history/create',
  PPE_ITEM_HISTORY_UPDATE: '/admin/ppe-item-history/update',
  PPE_ITEM_HISTORY_DELETE: '/admin/ppe-item-history/delete',
  // PPE ITEM HISTORY

  // DOCUMENT
  DOCUMENT_UPLOAD: '/admin/documents/upload',
  DOCUMENT_UPDATE: '/admin/documents/update',
  DOCUMENT_SEARCH: '/admin/documents/search',
  DOCUMENT_LIST: '/admin/documents/list',
  DOCUMENT_DETAIL: '/admin/documents/get',
  DOCUMENT_DELETE: '/admin/documents/delete',
  DOCUMENT_BY_UNIT: '/admin/documents/by-unit',
  DOCUMENT_BASE: '/admin/documents',
  // DOCUMENT

  // COMPANY LEGAL DOCUMENT
  COMPANY_LEGAL_DOCUMENT_CREATE: '/admin/company-legal-documents/create',
  COMPANY_LEGAL_DOCUMENT_UPDATE: '/admin/company-legal-documents/update',
  COMPANY_LEGAL_DOCUMENT_SEARCH: '/admin/company-legal-documents/search',
  COMPANY_LEGAL_DOCUMENT_DETAIL: '/admin/company-legal-documents/detail',
  COMPANY_LEGAL_DOCUMENT_DELETE: '/admin/company-legal-documents/delete',
  COMPANY_LEGAL_DOCUMENT_ATTACHMENT: '/admin/company-legal-documents',
  // COMPANY LEGAL DOCUMENT

  // INCOMING DOCUMENT
  INCOMING_DOCUMENT_CREATE: '/admin/incoming-documents/create',
  INCOMING_DOCUMENT_UPDATE: '/admin/incoming-documents/update',
  INCOMING_DOCUMENT_SEARCH: '/admin/incoming-documents/search',
  INCOMING_DOCUMENT_DETAIL: '/admin/incoming-documents/detail',
  INCOMING_DOCUMENT_DELETE: '/admin/incoming-documents/delete',
  INCOMING_DOCUMENT_ATTACHMENT: '/admin/incoming-documents',
  // INCOMING DOCUMENT

  // EMPLOYEE
  EMPLOYEE_CREATE: '/admin/employees/create',
  EMPLOYEE_UPDATE: '/admin/employees/update',
  EMPLOYEE_SEARCH: '/admin/employees/search',
  EMPLOYEE_DETAIL: '/admin/employees/detail',
  EMPLOYEE_DELETE: '/admin/employees/delete',
  EMPLOYEE_BASE: '/admin/employees',
  EMPLOYEE_SALARY_HISTORY_ADD: '/admin/employees/salary-history/add',
  EMPLOYEE_SALARY_HISTORY_DELETE: '/admin/employees/salary-history/delete',
  // EMPLOYEE

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
  BILLING_READING_METER_SEARCH: '/admin/billing/readings/meter-search',
  BILLING_READING_PERIOD_UPDATE: '/admin/billing/reading-periods/update',
  BILLING_READING_PERIOD_SEARCH: '/admin/billing/reading-periods/search',
  BILLING_READING_PERIOD_GET: '/admin/billing/reading-periods/get',
  BILLING_READING_PERIOD_DELETE: '/admin/billing/reading-periods/delete',
  BILLING_READING_PERIOD_CREATE: '/admin/billing/reading-periods/create',
  BILLING_READING_PERIOD_REVIEW: '/admin/billing/reading-periods/review',
  BILLING_READING_PERIOD_CONFIRM: '/admin/billing/reading-periods/confirm',
  BILLING_READING_PERIOD_REJECT: '/admin/billing/reading-periods/reject',
  BILLING_READING_PERIOD_EXPORT_RECORD: '/admin/billing/reading-periods/export-record',
  BILLING_READING_PHOTO_UPLOAD: '/admin/billing/reading-periods/photos/upload',
  BILLING_READING_PHOTO_LIST: '/admin/billing/reading-periods/photos/list',
  BILLING_READING_PHOTO_VIEW: '/admin/billing/reading-periods/photos/view',
  BILLING_READING_PHOTO_DELETE: '/admin/billing/reading-periods/photos/delete',

  // BILLING 2.1 - DANH MUC GIA DIEN
  BILLING_TARIFF_BASE: '/admin/billing/tariffs',
  BILLING_TARIFF_LIST: '/admin/billing/tariffs/list',
  BILLING_TARIFF_DETAIL: '/admin/billing/tariffs/detail',
  BILLING_TARIFF_CREATE: '/admin/billing/tariffs/create',
  BILLING_TARIFF_UPDATE: '/admin/billing/tariffs/update',
  BILLING_TARIFF_DELETE: '/admin/billing/tariffs/delete',

  // BILLING 2.2 - DON GIA VAN HANH
  BILLING_OPERATION_PRICE_SEARCH: '/admin/billing/operation-prices/search',
  BILLING_OPERATION_PRICE_DETAIL: '/admin/billing/operation-prices/detail',
  BILLING_OPERATION_PRICE_CREATE: '/admin/billing/operation-prices/create',
  BILLING_OPERATION_PRICE_UPDATE: '/admin/billing/operation-prices/update',
  BILLING_OPERATION_PRICE_DELETE: '/admin/billing/operation-prices/delete',
  BILLING_OPERATION_PRICE_CONTRACT_LOOKUP: '/admin/billing/operation-prices/contract-lookup',

  // BILLING 5.2 - NHAP CHI SO TU FILE
  BILLING_REMOTE_READING_IMPORT_UPLOAD: '/admin/billing/readings/import/upload',
  BILLING_REMOTE_READING_IMPORT_TEMPLATE: '/admin/billing/readings/import/template',

  // BILLING 5.3 - TINH HOA DON / GIAY BAO CSPK
  BILLING_BILL_SEARCH: '/admin/billing/bills/search',
  BILLING_BILL_CREATE_FOR_PERIOD: '/admin/billing/bills/create-for-period',
  BILLING_BILL_DETAIL: '/admin/billing/bills/detail',
  BILLING_BILL_CONFIRM: '/admin/billing/bills/confirm',
  BILLING_BILL_EXPORT_NOTICE: '/admin/billing/bills/export-notice',

  // BILLING 5.5 - CHOT SO EVN
  BILLING_READING_BATCH_SEARCH: '/admin/billing/reading-batches/search',
  BILLING_READING_BATCH_CREATE: '/admin/billing/reading-batches/create',
  BILLING_READING_BATCH_DETAIL: '/admin/billing/reading-batches/detail',
  BILLING_READING_BATCH_UPDATE: '/admin/billing/reading-batches/update',
  BILLING_READING_BATCH_DELETE: '/admin/billing/reading-batches/delete',
  BILLING_READING_BATCH_CONFIRM: '/admin/billing/reading-batches/confirm',
  BILLING_READING_BATCH_METERS_BY_FEEDER: '/admin/billing/reading-batches/meters-by-feeder',
  BILLING_READING_BATCH_EXPORT_RECORD: '/admin/billing/reading-batches/export-record',

  // BILLING 6.1 - NHAP DU LIEU SAO KE
  BILLING_PAYMENT_SEARCH: '/admin/billing/payments/search',
  BILLING_PAYMENT_UPLOAD: '/admin/billing/payments/upload',
  BILLING_PAYMENT_TEMPLATE: '/admin/billing/payments/template',
  BILLING_PAYMENT_EXPORT: '/admin/billing/payments/export',
  BILLING_PAYMENT_DETAIL: '/admin/billing/payments/detail',
  BILLING_PAYMENT_CREATE: '/admin/billing/payments/create',
  BILLING_PAYMENT_UPDATE: '/admin/billing/payments/update',
  BILLING_PAYMENT_DELETE: '/admin/billing/payments/delete',

  // BILLING 6.2 - TINH TUOI NO
  BILLING_DEBT_AGING_CALCULATE: '/admin/billing/debt-aging/calculate',
  BILLING_DEBT_AGING_EXPORT: '/admin/billing/debt-aging/export',

  // REPORT 7.4 - 7.8
  REPORT_CATALOG: '/admin/reports/catalog',
  REPORT_EXPORT: '/admin/reports/export',

  // APPROVAL MATRIX
  APPROVAL_MATRIX_DETAIL: '/approval-matrix/detail',
  EDIT_APPROVAL_MATRIX: '/approval-matrix',
  // APPROVAL MATRIX

  MY_REQUEST_LIST: '/pending-task/my-request/list',
  TASK_APPROVE_LIST: '/pending-task/approvals/list',
  APPROVE_TASK: '/approval-matrix/approve',
  REJECT_TASK: '/approval-matrix/reject',
  DELETE_TASK: '/approval-matrix/delete-bbrequest'
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
