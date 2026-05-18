import { TYPE_STATUS } from 'components/status';
import { I18nKeys } from 'utils/i18n';

export const USER_STATUS = {
  INACTIVE: 'INACTIVE',
  ACTIVE: 'ACTIVE',
  LOCKED: 'LOCKED'
};

export const USER_STATUS_UPLOAD = {
  FAILED: 'FAILED',
  SUCCESS: 'SUCCESS'
};

export const USER_STATUS_LABEL_MAP = {
  [USER_STATUS.INACTIVE]: 'Không hoạt động',
  [USER_STATUS.ACTIVE]: 'Hoạt động',
  [USER_STATUS.LOCKED]: 'Bị khoá'
};

export const USER_STATUS_TYPE_MAP = {
  [USER_STATUS.INACTIVE]: TYPE_STATUS.DEFAULT,
  [USER_STATUS.ACTIVE]: TYPE_STATUS.SUCCESS,
  [USER_STATUS.LOCKED]: TYPE_STATUS.ERROR
};

export const USER_STATUS_OPTIONS = [
  { value: USER_STATUS.INACTIVE, label: 'Không hoạt động' },
  { value: USER_STATUS.ACTIVE, label: 'Hoạt động' },
  { value: USER_STATUS.LOCKED, label: 'Bị khoá' }
];

export const USER_FILTER_LABEL_MAP: Record<string, I18nKeys> = {
  username: 'login_screen:username',
  fullName: 'manage_user:fullname',
  unitId: 'manage_user:unit',
  departmentId: 'manage_user:department',
  status: 'common:status',
  roleId: 'manage_user:role',
  email: 'manage_user:email'
};
