import { roleReducer } from '@redux-slice/role';
import { userReducer } from '@redux-slice/user';
import { combineReducers } from '@reduxjs/toolkit';
import { appReducer } from 'stores/action-slice/app';
import { authReducer } from 'stores/action-slice/auth';
import { customerReducer } from 'stores/action-slice/customer-slice';
import { sysParameterReducer } from 'stores/action-slice/sys-parameter-slice';

export const allReducer = combineReducers({
  app: appReducer,
  auth: authReducer,
  user: userReducer,
  customer: customerReducer,
  role: roleReducer,
  sysParameter: sysParameterReducer
});

export type RootState = ReturnType<typeof allReducer>;
