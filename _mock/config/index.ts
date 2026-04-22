import { MockApiConfig } from '@mock/types';
import { mockAuthApis } from './auth';
import { mockSysParameterApis } from '@mock/config/system-parameter';

const mockConfig: MockApiConfig[] = [
  {
    url: '/getData/:id1/:id2',
    method: 'get',
    handler: (_, query, params) => {
      return { message: 'This is a GET request with queries and params', query, params };
    }
  },
  {
    url: '/postData',
    method: 'post',
    handler: (body) => {
      return { message: 'This is a POST request with body', data: body };
    }
  },
  // Thêm các endpoint ở đây
  ...mockAuthApis,
  ...mockSysParameterApis
];

export default mockConfig;
