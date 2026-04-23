export interface LoginParams {
  username: string;
  password: string;
}
export interface LoginResult {
  timestamp: string;
  message: string;
  data: AuthData;
}

export interface AuthData {
  accessToken: string;
  refreshToken: string;
  username: string;
  roles: string[];
}
export interface LogoutResult {
  code?: number;
  message?: string;
  data?: null;
}
