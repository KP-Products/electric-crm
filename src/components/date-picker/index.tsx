'use client';
/* eslint-disable react/display-name */
import { ISO_DATE_TIME_FORMAT, NULL_VALUE } from '@constant';
import type { DatePickerProps } from 'antd/lib/date-picker';
import DatePicker from 'antd/lib/date-picker';
import { IconSvgTypes } from 'assets/svg';
import { useDatePickerLanguage } from 'components/date-picker/hooks/useDatePickerLanguage';
import AppHelperText from 'components/helper-text';
import { TextBase } from 'components/text';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import React, { useImperativeHandle, useMemo, useRef } from 'react';
import type { Control, FieldError, FieldValues, Path } from 'react-hook-form';
import { useController } from 'react-hook-form';
import { IconSvgLocal } from '../icon-vec-local';

export interface AppDatePickerProps extends Omit<DatePickerProps, 'suffixIcon' | 'className'> {
  name?: string;
  label?: string;
  labelSuffix?: React.ReactNode;
  suffixIcon?: IconSvgTypes | React.ReactNode;
  wrapperClassName?: string;
  labelSuffixClassName?: string;
  datePickerClassName?: string;
  popupClassName?: string;
  isView?: boolean;
  classNameIsView?: string;
  backendFormat?: string;

  error?: FieldError | string;
  caption?: string;
  captionPrefix?: React.ReactNode;
}

export interface AppDatePickerControlProps<T extends FieldValues>
  extends Omit<AppDatePickerProps, 'name'> {
  name: Path<T>;
  control: Control<T>;
  customError?: FieldError | string | null;
}

interface InputRef {
  blur: () => void;
  focus: () => void;
}

const AppDatePicker = React.forwardRef<InputRef, AppDatePickerProps>((props, ref) => {
  const {
    name,
    label,
    labelSuffix,
    suffixIcon = 'ICON_CALENDAR',
    wrapperClassName,
    labelSuffixClassName,
    datePickerClassName,
    popupClassName,
    isView,
    classNameIsView,
    ...restProps
  } = props;

  const { locale, placeholder, format } = useDatePickerLanguage();

  const currentFormat = props?.format ?? format;

  const inputRef = useRef<any>(null);

  const focus = () => {
    inputRef.current.focus();
  };

  const blur = () => {
    inputRef.current.blur();
  };

  useImperativeHandle(ref, () => ({
    blur: () => {
      blur();
    },
    focus: () => {
      focus();
    }
  }));

  // disable
  // const disabledDate: RangePickerProps['disabledDate'] = (current) => {
  //   const isPastDate = current && current < dayjs().startOf('day');
  //   const isEndOfMonth = current && [29, 30, 31].includes(current.date());
  //   return isPastDate || isEndOfMonth;
  // };

  const displayValue =
    restProps.value && dayjs.isDayjs(restProps.value)
      ? restProps.value.format(String(currentFormat))
      : NULL_VALUE;

  return (
    <div className={` flex w-fit flex-col gap-4 text-color-900 ${wrapperClassName} `}>
      {label && (
        <label htmlFor={name} className="text-14 font-semibold leading-24">
          {label}
          {labelSuffix && <span className={`ml-4 ${labelSuffixClassName}`}>{labelSuffix}</span>}
        </label>
      )}
      {isView ? (
        <TextBase classNames={classNameIsView}>{displayValue}</TextBase>
      ) : (
        <DatePicker
          // disabledDate={disabledDate}
          className={` 
        rounded-radius-m border-color-300 p-12 hover:border-primary-500 
        [&_.ant-picker-input>input]:placeholder:text-color-600 ${datePickerClassName}
        ${props?.error ? '[&.ant-picker]:!border-error-500' : ''}`}
          popupClassName={popupClassName}
          id={name}
          allowClear={false}
          locale={locale}
          placeholder={placeholder}
          format={currentFormat}
          ref={inputRef}
          suffixIcon={
            typeof suffixIcon === 'string' ? (
              <IconSvgLocal name={suffixIcon as IconSvgTypes} height={20} width={20} />
            ) : (
              <div>{suffixIcon}</div>
            )
          }
          {...restProps}
        />
      )}
      <AppHelperText
        caption={props?.caption}
        captionPrefix={props?.captionPrefix}
        error={props?.error}
      />
    </div>
  );
});

const AppDatePickerControl = <T extends FieldValues>({
  name,
  control,
  onChange,
  backendFormat = ISO_DATE_TIME_FORMAT,
  customError,
  ...restProps
}: AppDatePickerControlProps<T>) => {
  const {
    field,
    fieldState: { error }
  } = useController({ name, control });
  const parsedValue = useMemo(
    () => (field.value ? dayjs(field.value, backendFormat) : null),
    [field.value, backendFormat]
  );

  return (
    <AppDatePicker
      {...restProps}
      {...field}
      error={customError === null ? undefined : customError || error}
      value={parsedValue}
      onChange={(value: Dayjs | null, dateString: string | string[]) => {
        if (onChange) onChange(value as Dayjs, dateString);

        field.onChange(value ? value.format(backendFormat) : null);
      }}
    />
  );
};
const MemoizedAppDatePicker = React.memo(AppDatePicker);
const MemoizedAppDatePickerControl = React.memo(AppDatePickerControl) as <T extends FieldValues>(
  props: AppDatePickerControlProps<T>
) => JSX.Element;

export {
  MemoizedAppDatePicker as AppDatePicker,
  MemoizedAppDatePickerControl as AppDatePickerControl
};
