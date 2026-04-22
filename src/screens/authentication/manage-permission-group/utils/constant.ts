import { TYPE_STATUS } from 'components/status';
import { I18nKeys } from 'utils/i18n';

export const USER_ACTION = {
  VIEW: 'VIEW_ACTION',
  ADD: 'CREATE_ACTION',
  EDIT: 'EDIT_ACTION',
  DELETE: 'DELETE_ACTION',
  DOWNLOAD: 'DOWNLOAD_ACTION',
  APPROVE: 'APPROVE_ACTION'
};

export const ROLE_STATUS = {
  INACTIVE: 'INACTIVE',
  ACTIVE: 'ACTIVE'
};

export const ROLE_STATUS_LABEL_MAP: Record<string, I18nKeys> = {
  [ROLE_STATUS.INACTIVE]: 'common:status_inactive',
  [ROLE_STATUS.ACTIVE]: 'common:status_active'
};

export const ROLE_STATUS_TYPE_MAP = {
  [ROLE_STATUS.INACTIVE]: TYPE_STATUS.ERROR,
  [ROLE_STATUS.ACTIVE]: TYPE_STATUS.SUCCESS
};
