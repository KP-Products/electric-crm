import { ResultBase } from './common';

export interface SystemParameter {
  id: string;
  paramCode: string;
  valueType: string;
  paramValue: string;
  description: string;
}

export interface SystemParameterResult extends ResultBase<SystemParameter[]> {}
