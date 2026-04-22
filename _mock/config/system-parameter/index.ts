import { MockApiConfig } from '@mock/types';
import { ApiConstants } from 'services/networking/app-apis';
import { fakeSysParameterList } from '@mock/data';

export const mockSysParameterApis: MockApiConfig[] = [
  {
    name: 'SYSTEM_PARAMETER_LIST',
    url: ApiConstants.SYSTEM_PARAMETER_LIST,
    method: 'get',
    delay: 5000,
    handler: () => {
      return fakeSysParameterList;
    }
  },
  {
    name: 'SYSTEM_PARAMETER_UPDATE',
    url: `${ApiConstants.SYSTEM_PARAMETER_UPDATE}/:id`,
    method: 'put',
    delay: 5000,
    handler: (body, query, params) => {
      return {
        code: '00',
        message: 'Success',

        data: {
          id: params.id,
          ...body
        },
        timestamp: new Date().toISOString()
      };
    }
  }
];
