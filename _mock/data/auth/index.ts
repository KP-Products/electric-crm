import { LogoutResult } from 'model/auth';

export const fakeLogin = {
  username: 'hungnh',
  bio: '',
  image: '',
  email: 'hungnh@htc.net.vn',
  actions: [],
  fullName: 'Nguyen Van A',
  roleId: '',
  roleName: '',
  roleType: '',
  unit: {
    id: 'b51d0240-c2f1-4bb9-9426-06dbafd18bef',
    code: 'CNTT',
    name: 'Công nghệ thông tin',
    status: 'ACTIVE'
  },
  department: {
    id: '9bc4f3f7-74b2-49f4-a076-d5cf660f46f7',
    code: 'PTUD 1',
    name: 'Phát triển ứng dụng 1',
    status: 'ACTIVE'
  },
  token:
    'eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJ1c2Vycy1zZXJ2aWNlIiwic3ViIjoiYTUzODQwODgtNDlmYi00YWQ3LWEzNWItNzEwYzJhODhlODlkIiwiaWF0IjoxNzcyNjgwNjcyLCJjb21wbGVtZW50YXJ5LXN1YnNjcmlwdGlvbiI6ImMxNDk4OThhLWFhYTMtNGExOC04NGRhLWM0ODI1NjE0NDk1YSIsIlJPTEVTIjpbIlVTRVIiLCJBRE1JTiJdLCJleHAiOjE3NzI2ODEyNzJ9.BPmqK6cfN0hVI8pdGPD2PQROXKLdiY5vlKEGen6BzWpYEqW0kJaHHvztKOr2pk2zV5L5iNRfw-5UV3RGdhrsZQ'
};

export const fakeLogout: LogoutResult = {
  code: 0,
  message: 'Đăng xuất thành công',
  data: null
};
