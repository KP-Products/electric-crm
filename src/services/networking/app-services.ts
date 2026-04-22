import { CLEAR_STORE } from '@redux-action-type/auth';
import { dispatch, getState } from '@redux-common';
import axios, { AxiosRequestConfig } from 'axios';
import { showDialog } from 'components/dialog';
import { TYPE_ACTION, TYPE_MESSAGE } from 'components/dialog/type';
import { ENVConfig } from 'config/env';
import { ROUTES } from 'config/routes';
import { t } from 'i18next';
import { SLICE_NAME } from 'stores/types';

const appServices = axios.create({ baseURL: ENVConfig.API_URL });

// ==============================|| AXIOS - FOR APP SERVICES ||============================== //

/**
 * Request interceptor to add Authorization token to request
 */
appServices.interceptors.request.use(
  async (config) => {
    const { token } = getState(SLICE_NAME.AUTH);
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

appServices.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      [401, 403].includes(error.response.status) &&
      !window.location.href.includes(ROUTES.LOGIN)
    ) {
      showDialog({
        title: t('common:title_session_expired'),
        content: t('common:session_expired'),
        type: TYPE_MESSAGE.CONFIRM,
        actions: [
          {
            title: t('common:login'),
            type: TYPE_ACTION.PRIMARY,
            onPress: () => {
              dispatch({ type: CLEAR_STORE });
            }
          }
        ]
      });
      // window.location.pathname = ROUTES.LOGIN;
    }

    const { data, ...rest } = error.response || {};
    return Promise.reject({
      ...rest,
      ...(data || {}),
      message:
        data?.detailMessage ||
        data?.businessErrorMessage ||
        data?.systemErrorMessage ||
        t('common:system_error')
    });
  }
);

export default appServices;

export const fetcher = async (args: string | [string, AxiosRequestConfig]) => {
  const [url, config] = Array.isArray(args) ? args : [args];

  const res = await appServices.get(url, { ...config });

  return res.data;
};

export const fetcherPost = async (args: string | [string, AxiosRequestConfig]) => {
  const [url, config] = Array.isArray(args) ? args : [args];

  const res = await appServices.post(url, { ...config });

  return res.data;
};
