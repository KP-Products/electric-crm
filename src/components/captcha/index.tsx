import { RedoOutlined } from '@ant-design/icons';
import { Skeleton } from 'antd';
import { t } from 'i18next';
import Image from 'next/image';
import type { Control, FieldError, FieldValues, Path } from 'react-hook-form';

import { K_SIZE_20 } from '@constant';
import { EventHandler } from 'react';
import { AppTextFieldControl } from '../text-field';

export interface AppCaptchaProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  isLoading: boolean;
  captchaBase64: string;
  onRefetchCaptcha: () => void;
  placeholder?: string;
  customError?: FieldError | string | null;
  onClick?: EventHandler<any>;
  label?: string;
}

export default function AppCaptcha<T extends FieldValues>({
  name,
  control,
  isLoading,
  captchaBase64,
  onRefetchCaptcha,
  placeholder,
  customError,
  onClick = () => {},
  label
}: AppCaptchaProps<T>) {
  return (
    <div className="flex flex-row items-end gap-16">
      <AppTextFieldControl
        name={name}
        label={label}
        placeholder={placeholder || t('login_screen:verification_code')}
        control={control}
        autoComplete="off"
        maxLength={K_SIZE_20}
        customError={customError}
        onClick={onClick}
      />
      <div className="relative flex h-[37px] w-[96px] shrink-0 items-center justify-center">
        {isLoading ? (
          <Skeleton.Button active size="large" block />
        ) : (
          captchaBase64 && (
            <Image src={`data:image/png;base64,${captchaBase64}`} alt="Captcha" fill />
          )
        )}
      </div>
      {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events */}
      <div className="flex h-[37px] cursor-pointer items-center" onClick={onRefetchCaptcha}>
        <RedoOutlined className="text-24 text-link-600" />
      </div>
    </div>
  );
}
