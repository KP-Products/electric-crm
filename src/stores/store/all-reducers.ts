import { approvalMatrixReducer } from '@redux-slice/approval-matrix';
import { feeLookupSlice } from '@redux-slice/fee-lookup';
import { feeScheduleSlice } from '@redux-slice/fee-schedule';
import { formManagementSlice } from '@redux-slice/form-management';
import { jobManagementSlice } from '@redux-slice/job-management';
import { groupCodeFeeSlice } from '@redux-slice/manage-code-fee-group';
import { roleReducer } from '@redux-slice/role';
import { userReducer } from '@redux-slice/user';
import { combineReducers } from '@reduxjs/toolkit';
import { appReducer } from 'stores/action-slice/app';
import { authReducer } from 'stores/action-slice/auth';
import { customerReducer } from 'stores/action-slice/customer-slice';
import { feeCodeReducer } from 'stores/action-slice/fee-code-slice';
import { feeConditionReducer } from 'stores/action-slice/fee-condition-slice';
import { feeFormulaReducer } from 'stores/action-slice/fee-formula-slice';
import { pendingTaskReducer } from 'stores/action-slice/pending-task-slice';
import { productReducer } from 'stores/action-slice/product-slice';
import { sysParameterReducer } from 'stores/action-slice/sys-parameter-slice';

export const allReducer = combineReducers({
  app: appReducer,
  auth: authReducer,
  user: userReducer,
  customer: customerReducer,
  approvalMatrix: approvalMatrixReducer,
  role: roleReducer,
  sysParameter: sysParameterReducer,
  feeCondition: feeConditionReducer,
  feeFormula: feeFormulaReducer,
  feeCode: feeCodeReducer,
  pendingTask: pendingTaskReducer,
  product: productReducer,
  [jobManagementSlice.name]: jobManagementSlice.reducer,
  [feeScheduleSlice.name]: feeScheduleSlice.reducer,
  [feeLookupSlice.name]: feeLookupSlice.reducer,
  [groupCodeFeeSlice.name]: groupCodeFeeSlice.reducer,
  [formManagementSlice.name]: formManagementSlice.reducer
});

export type RootState = ReturnType<typeof allReducer>;
