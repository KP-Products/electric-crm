'use client';
import { K_SIZE_50, K_SIZE_64 } from '@constant';
import ButtonBase from 'components/button';
import { AppTextFieldControl } from 'components/text-field';
import useLogin from '../hooks/useLogin';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Spin } from 'antd';
import React from 'react';

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
        classNameMore={'!py-[14px]'}
        prefix={
          <div className={'px-4'}>
            <UserOutlined />
          </div>
        }
      />
      <AppTextFieldControl
        id="passwordLoginInput"
        wrapperClassName="mb-48"
        name="password"
        label={t('login_screen:password')}
        placeholder={t('login_screen:enter_password')}
        maxLength={K_SIZE_64}
        control={control}
        type="password"
        classNameMore={'!py-[14px]'}
        prefix={
          <div className={'px-4'}>
            <LockOutlined />
          </div>
        }
      />
      <ButtonBase
        htmlType="submit"
        disabled={!isValid || loading}
        type="primary"
        customContent={
          <div className="flex flex-row items-center justify-center">
            <div>{t('login_screen:login')}</div>
            {loading && (
              <div className="ml-8">
                <Spin size={'small'} />
              </div>
            )}
          </div>
        }
        classNames="w-full flex justify-center mb-16"
        size={K_SIZE_50}
      />
    </form>
  );
};

export default LoginForm;
