import { fakeLogin } from '@mock/data/auth';
import { MockApiConfig } from '@mock/types';
import { LoginParams } from 'model/auth';
import { ApiConstants } from 'services/networking/app-apis';

export const mockAuthApis: MockApiConfig[] = [
  {
    name: 'login',
    url: ApiConstants.LOGIN,
    method: 'post',
    // status: 201,
    delay: 500,
    handler: (
      body: LoginParams
    ): {
      username: string;
      bio: string;
      image: string;
      email: string;
      actions: any[];
      fullName: string;
      roleId: string;
      roleName: string;
      roleType: string;
      unit: { id: string; code: string; name: string; status: string };
      department: { id: string; code: string; name: string; status: string };
      token: string;
    } => {
      return fakeLogin;
    }
  }
];
