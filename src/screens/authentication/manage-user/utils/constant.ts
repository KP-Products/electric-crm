import { TYPE_STATUS } from 'components/status';
import { I18nKeys } from 'utils/i18n';

export const USER_STATUS = {
  INACTIVE: 'INACTIVE',
  ACTIVE: 'ACTIVE'
};

export const USER_STATUS_UPLOAD = {
  FAILED: 'FAILED',
  SUCCESS: 'SUCCESS'
};

export const USER_STATUS_LABEL_MAP: Record<string, I18nKeys> = {
  [USER_STATUS.INACTIVE]: 'manage_user:status_inactive',
  [USER_STATUS.ACTIVE]: 'manage_user:status_active'
};

export const USER_STATUS_TYPE_MAP = {
  [USER_STATUS.INACTIVE]: TYPE_STATUS.ERROR,
  [USER_STATUS.ACTIVE]: TYPE_STATUS.SUCCESS
};

export const USER_STATUS_OPTIONS = [
  { value: USER_STATUS.INACTIVE, label: USER_STATUS_LABEL_MAP[USER_STATUS.INACTIVE] },
  { value: USER_STATUS.ACTIVE, label: USER_STATUS_LABEL_MAP[USER_STATUS.ACTIVE] }
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
