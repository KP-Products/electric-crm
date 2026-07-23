import { roleReducer } from '@redux-slice/role';
import { userReducer } from '@redux-slice/user';
import { combineReducers } from '@reduxjs/toolkit';
import { appReducer } from 'stores/action-slice/app';
import { authReducer } from 'stores/action-slice/auth';
import { customerReducer } from 'stores/action-slice/customer-slice';
import { sysParameterReducer } from 'stores/action-slice/sys-parameter-slice';
import { meterReducer } from '@redux-slice/meter';
import { meterVerificationReducer } from '@redux-slice/meter-verification';
import { meterChangeEventReducer } from '@redux-slice/meter-change-event';
import { electricTariffReducer } from '@redux-slice/electric-tariff';
import { operationPriceReducer } from '@redux-slice/operation-price';
import { contractReducer } from '@redux-slice/contract';
import { operationUnitReducer } from '@redux-slice/operation-unit';
import { documentReducer } from '@redux-slice/document';
import { companyLegalDocumentReducer } from '@redux-slice/company-legal-document';
import { incomingDocumentReducer } from '@redux-slice/incoming-document';
import { employeeReducer } from '@redux-slice/employee';
import { serviceLocationReducer } from '@redux-slice/service-location';
import { branchReducer } from '@redux-slice/branch';
import { approvalMatrixReducer } from '@redux-slice/approval-matrix';
import { pendingTaskReducer } from '@redux-slice/pending-task-slice';

export const allReducer = combineReducers({
  app: appReducer,
  auth: authReducer,
  user: userReducer,
  customer: customerReducer,
  role: roleReducer,
  sysParameter: sysParameterReducer,
  meter: meterReducer,
  meterVerification: meterVerificationReducer,
  meterChangeEvent: meterChangeEventReducer,
  electricTariff: electricTariffReducer,
  operationPrice: operationPriceReducer,
  contract: contractReducer,
  operationUnit: operationUnitReducer,
  document: documentReducer,
  companyLegalDocument: companyLegalDocumentReducer,
  incomingDocument: incomingDocumentReducer,
  employee: employeeReducer,
  serviceLocation: serviceLocationReducer,
  branch: branchReducer,
  approvalMatrix: approvalMatrixReducer,
  pendingTask: pendingTaskReducer
});

export type RootState = ReturnType<typeof allReducer>;
