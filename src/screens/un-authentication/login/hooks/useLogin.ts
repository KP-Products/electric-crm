import { K_SIZE_1, K_SIZE_6 } from '@constant';
import { zodResolver } from '@hookform/resolvers/zod';
import { LOGIN } from '@redux-action-type/auth';
import { dispatch } from '@redux-common';
import { selectLoginLoading } from '@redux-selector/auth';
import { appActions } from '@redux-slice/app';
import { showToast } from 'components/toast';
import { TYPE_TOAST } from 'components/toast/type';
import { ROUTES } from 'config/routes';
import { MENU_GROUP_KEYS } from 'layout/AppLayout/components/NavigationMenu';
import { LoginParams, LoginResult } from 'model/auth';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { DebugUtils } from 'utils/debug-utils';
import { useAppTranslation } from 'utils/i18n';
import { z } from 'zod';
export default function useLogin() {
  const { t } = useAppTranslation();
  const router = useRouter();
  const loading = useSelector(selectLoginLoading);

  const loginSchema = z.object({
    username: z
      .string()
      .trim()
      .min(K_SIZE_1, { message: t('validate:required', { name: t('login_screen:username') }) }),
    password: z
      .string()
      .trim()
      .min(K_SIZE_6, {
        message: t('validate:at_least_characters', {
          name: t('login_screen:password'),
          number: K_SIZE_6.toString()
        })
      })
  });

  type LoginForm = z.infer<typeof loginSchema>;

  const loginForm = useForm<LoginForm>({
    mode: 'onTouched',
    defaultValues: { username: '', password: '' },
    resolver: zodResolver(loginSchema)
  });

  const onLoginSuccess = (res: LoginResult) => {
    DebugUtils.logS(res);
    dispatch(appActions.setSelectedOpenKeys(Object.values(MENU_GROUP_KEYS)));
    router.push(ROUTES.MANAGE_USER);
  };

  const onLoginFailed = () => {
    showToast({
      type: TYPE_TOAST.ERROR,
      content: t('login_screen:login_failed')
    });
  };

  const handleLoginSubmit = (data: LoginForm) => {
    const body: LoginParams = {
      username: data.username,
      password: data.password
    };
    dispatch({
      type: LOGIN,
      payload: { body, onSuccess: onLoginSuccess, onFailed: onLoginFailed }
    });
  };

  return {
    t,
    handleLoginSubmit,
    loginForm,
    loading
  };
}
