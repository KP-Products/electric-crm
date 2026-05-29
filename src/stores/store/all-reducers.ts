import { roleReducer } from '@redux-slice/role';
import { userReducer } from '@redux-slice/user';
import { combineReducers } from '@reduxjs/toolkit';
import { appReducer } from 'stores/action-slice/app';
import { authReducer } from 'stores/action-slice/auth';
import { customerReducer } from 'stores/action-slice/customer-slice';
import { sysParameterReducer } from 'stores/action-slice/sys-parameter-slice';
import { meterReducer } from '@redux-slice/meter';
import { contractReducer } from '@redux-slice/contract';
import { documentReducer } from '@redux-slice/document';
import { serviceLocationReducer } from '@redux-slice/service-location';
import { approvalMatrixReducer } from '@redux-slice/approval-matrix';

export const allReducer = combineReducers({
  app: appReducer,
  auth: authReducer,
  user: userReducer,
  customer: customerReducer,
  role: roleReducer,
  sysParameter: sysParameterReducer,
  meter: meterReducer,
  contract: contractReducer,
  document: documentReducer,
  serviceLocation: serviceLocationReducer,
  approvalMatrix: approvalMatrixReducer
});

export type RootState = ReturnType<typeof allReducer>;
