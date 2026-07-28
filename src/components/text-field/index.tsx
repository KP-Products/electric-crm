'use client';
import { NULL_VALUE } from '@constant';
import type { InputProps, InputRef } from 'antd';
import { Input } from 'antd';
import AppHelperText from 'components/helper-text';
import { IconSvgLocal } from 'components/icon-vec-local';
import { TextBase } from 'components/text';
import type { Ref } from 'react';
import React, { forwardRef } from 'react';
import type { Control, FieldError, FieldValues, Path } from 'react-hook-form';
import { useController } from 'react-hook-form';
import { formatIntegerWithCommas, sanitizeIntegerInput } from 'utils/number-input';

export interface AppTextFieldProps extends InputProps {
  label?: React.ReactNode;
  labelSuffix?: React.ReactNode;
  caption?: string;
  captionPrefix?: React.ReactNode;
  wrapperClassName?: string;
  labelSuffixClassName?: string;
  type?: 'text' | 'password' | 'number';
  error?: FieldError | string;
  classNameMore?: string;
  isView?: boolean;
  classNameIsView?: string;
  onlyNumber?: boolean;
  formatNumberWithCommas?: boolean;
}

export interface AppTextFieldControlProps<T extends FieldValues>
  extends Omit<AppTextFieldProps, 'error'> {
  name: Path<T>;
  control: Control<T>;
  customError?: FieldError | string | null;
}

export const AppTextField = forwardRef((props: AppTextFieldProps, ref: Ref<InputRef>) => {
  const {
    name,
    label,
    labelSuffix,
    caption,
    captionPrefix,
    wrapperClassName,
    labelSuffixClassName,
    type = 'text',
    size = 'large',
    error,
    classNameMore,
    isView,
    classNameIsView,
    onlyNumber,
    formatNumberWithCommas,
    value,
    onChange,
    onKeyDown,
    inputMode,
    pattern,
    ...restProps
  } = props;

  const isPasswordType = type === 'password';
  const isNumericInput = type === 'number' || onlyNumber || formatNumberWithCommas;
  const inputType = isNumericInput && !isPasswordType ? 'text' : type;

  const TextField = isPasswordType ? Input.Password : Input;
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const allowedControlKeys = [
      'Backspace',
      'Delete',
      'Tab',
      'Enter',
      'ArrowLeft',
      'ArrowRight',
      'ArrowUp',
      'ArrowDown',
      'Home',
      'End'
    ];

    if (
      isNumericInput &&
      !event.ctrlKey &&
      !event.metaKey &&
      !allowedControlKeys.includes(event.key) &&
      event.key.length === 1 &&
      !/^\d$/.test(event.key)
    ) {
      event.preventDefault();
    }
    if (onKeyDown) {
      onKeyDown(event);
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (isNumericInput) {
      event.target.value = formatNumberWithCommas
        ? formatIntegerWithCommas(event.target.value)
        : sanitizeIntegerInput(event.target.value);
    }
    onChange?.(event);
  };
  const renderPasswordSuffix = (visible: boolean) => (
    <div>
      <IconSvgLocal
        name={visible ? 'ICON_EYE_SPLASH' : 'ICON_EYE_OPEN'}
        height={20}
        fill="rgb(var(--color-700)"
      />
    </div>
  );

  const displayValue = Array.isArray(value)
    ? value.join(', ')
    : value !== undefined && value !== null && value !== ''
      ? String(value)
      : NULL_VALUE;

  return (
    <div className={`w-full ${wrapperClassName}`}>
      {label && (
        <label
          htmlFor={name}
          className="mb-4 inline-flex flex-row items-center text-14 font-semibold leading-24 text-color-900"
        >
          {label}
          {labelSuffix && (
            <span className={`ml-4 text-color-900 ${labelSuffixClassName}`}>{labelSuffix}</span>
          )}
        </label>
      )}
      {isView ? (
        <TextBase classNames={classNameIsView}>{displayValue}</TextBase>
      ) : (
        <TextField
          type={inputType}
          id={name}
          name={name}
          size={size}
          onKeyDown={handleKeyDown}
          onChange={handleChange}
          inputMode={isNumericInput ? inputMode || 'numeric' : inputMode}
          pattern={
            isNumericInput ? pattern || (formatNumberWithCommas ? '[0-9,]*' : '[0-9]*') : pattern
          }
          value={value}
          {...restProps}
          ref={ref}
          {...(isPasswordType
            ? {
                iconRender: renderPasswordSuffix
              }
            : {})}
          className={`
      border-color-300
      text-14
      text-color-800
      placeholder:text-color-600
      focus:shadow-none
      py-[10px]
      disabled:!border-color-200
      disabled:!bg-color-200
      disabled:!text-color-800
      [&:has(input:disabled)]:!border-color-300
      [&:has(input:disabled)]:!bg-color-200
      [&:has(input:focus)]:shadow-none
      [&>input]:text-color-800
      [&>input]:placeholder:text-color-600
      [&_.ant-input-password-icon]:cursor-pointer
      
      ${classNameMore}
      ${
        error
          ? '!border-error-500'
          : 'focus-within:!border-primary-500 hover:!border-primary-500 focus:!border-primary-500'
      }
    `}
        />
      )}
      <AppHelperText caption={caption} captionPrefix={captionPrefix} error={error} />
    </div>
  );
});

AppTextField.displayName = 'AppTextField';

export function AppTextFieldControl<T extends FieldValues>({
  name,
  control,
  customError,
  ...restProps
}: AppTextFieldControlProps<T>) {
  const {
    field,
    fieldState: { error }
  } = useController({ name, control });
  return (
    <AppTextField
      {...field}
      {...restProps}
      error={customError === null ? undefined : customError || error}
    />
  );
}
