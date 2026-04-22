import { Department, Unit } from 'model/master-data';

export interface LoginParams {
  username: string;
  password: string;
}

export interface LoginResult {
  username: string;
  bio: string;
  image: string;
  email: string;
  token: string;
  fullName: string;
  roleId: string;
  roleType: string;
  roleName: string;
  unit: Unit;
  department: Department;
  actions: string[];
}

export interface LogoutResult {
  code?: number;
  message?: string;
  data?: null;
}
