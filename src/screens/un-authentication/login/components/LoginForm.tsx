'use client';
import { K_SIZE_64 } from '@constant';
import ButtonBase from 'components/button';
import { AppTextFieldControl } from 'components/text-field';
import useLogin from '../hooks/useLogin';

const LoginForm = () => {
  const { t, handleLoginSubmit, loginForm, loading } = useLogin();

  const {
    control,
    handleSubmit,
    formState: { isValid }
  } = loginForm;

  return (
    <form onSubmit={handleSubmit(handleLoginSubmit)}>
      <AppTextFieldControl
        wrapperClassName="mb-16"
        name="username"
        label={t('login_screen:username')}
        placeholder={t('login_screen:enter_username')}
        maxLength={K_SIZE_64}
        control={control}
      />
      <AppTextFieldControl
        id="passwordLoginInput"
        wrapperClassName="mb-24"
        name="password"
        label={t('login_screen:password')}
        placeholder={t('login_screen:enter_password')}
        maxLength={K_SIZE_64}
        control={control}
        type="password"
      />
      <ButtonBase
        htmlType="submit"
        disabled={!isValid || loading}
        type="primary"
        customContent={t('login_screen:login')}
        classNames="w-full flex justify-center mb-16"
      />
    </form>
  );
};

export default LoginForm;
