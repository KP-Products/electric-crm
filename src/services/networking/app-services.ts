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
    const { data, ...rest } = error.response || {};
    const responseData = data && typeof data === 'object' ? data : {};
    const responseMessage = typeof data === 'string' ? data : responseData?.message;
    const message =
      responseMessage ||
      responseData?.detailMessage ||
      responseData?.businessErrorMessage ||
      responseData?.systemErrorMessage ||
      error?.message ||
      t('common:system_error');
    const status = error.response?.status;

    if (status && [401, 403].includes(status) && !window.location.href.includes(ROUTES.LOGIN)) {
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

    return Promise.reject({
      ...rest,
      ...responseData,
      businessErrorMessage: responseData?.businessErrorMessage || responseMessage,
      detailMessage: responseData?.detailMessage || responseMessage,
      message
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
