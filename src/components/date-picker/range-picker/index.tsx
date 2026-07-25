'use client';
/* eslint-disable react/display-name */
import { K_SIZE_0, K_SIZE_1, NULL_VALUE } from '@constant';
import DatePicker from 'antd/lib/date-picker';
import { IconSvgTypes } from 'assets/svg';
import { useDatePickerLanguage } from 'components/date-picker/hooks/useDatePickerLanguage';
import { TextBase } from 'components/text';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import React, { useImperativeHandle, useMemo, useRef } from 'react';
import type { Control, FieldError, FieldValues, Path } from 'react-hook-form';
import { useController } from 'react-hook-form';
import { RangePickerProps } from 'antd/es/date-picker';
import { IconSvgLocal } from 'components/icon-vec-local';
import AppHelperText from 'components/helper-text';
import { API_DATE_INPUT_FORMATS, FORMAT_DATE_API } from 'utils/date';

dayjs.extend(customParseFormat);

export interface AppDatePickerProps extends Omit<RangePickerProps, 'suffixIcon' | 'className'> {
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

  caption?: string;
  captionPrefix?: React.ReactNode;
  error?: FieldError | string;
  disabledBeforeCurrent?: boolean;
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

const { RangePicker } = DatePicker;

const AppDateRangePicker = React.forwardRef<InputRef, AppDatePickerProps>((props, ref) => {
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
    caption,
    captionPrefix,
    error,
    disabledBeforeCurrent = false,
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
  const disabledDate: RangePickerProps['disabledDate'] = (current, { from }) => {
    const isPastDate = current && current < dayjs().startOf('day');
    if (from) {
      return current.isBefore(from);
    }

    return isPastDate;
  };

  const displayValue =
    restProps.value &&
    dayjs.isDayjs(restProps.value?.[K_SIZE_0]) &&
    dayjs.isDayjs(restProps.value?.[K_SIZE_1])
      ? `${restProps.value[K_SIZE_0].format(String(currentFormat))} - ${restProps.value[
          K_SIZE_1
        ].format(String(currentFormat))}`
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
        <RangePicker
          disabledDate={disabledBeforeCurrent ? disabledDate : undefined}
          className={`rounded-radius-m border-color-300 p-12 !shadow-none hover:border-primary-500 
        [&_.ant-picker-input>input]:placeholder:text-color-600 ${datePickerClassName} [&_.ant-picker-active-bar]:hidden`}
          popupClassName={popupClassName}
          id={name}
          allowClear={false}
          locale={locale}
          placeholder={[placeholder, placeholder]}
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
      <AppHelperText caption={caption} captionPrefix={captionPrefix} error={error} />
    </div>
  );
});

const AppDateRangePickerControl = <T extends FieldValues>({
  name,
  control,
  onChange,
  backendFormat = FORMAT_DATE_API,
  customError,
  ...restProps
}: AppDatePickerControlProps<T>) => {
  const {
    field,
    fieldState: { error }
  } = useController({ name, control });
  const parsedValue = useMemo(
    () =>
      field.value
        ? field.value.map((v: string) =>
            v ? dayjs(v, [backendFormat, ...API_DATE_INPUT_FORMATS]) : null
          )
        : null,
    [field.value, backendFormat]
  );

  return (
    <AppDateRangePicker
      {...restProps}
      {...field}
      value={parsedValue}
      onChange={(dates, dateString) => {
        if (onChange) onChange(dates as [Dayjs, Dayjs], dateString);

        field.onChange(dates ? dates.map((date) => date?.format(backendFormat)) : null);
      }}
      error={customError === null ? undefined : customError || error}
    />
  );
};
const MemoizedAppDateRangePicker = React.memo(AppDateRangePicker);
const MemoizedAppDateRangePickerControl = React.memo(AppDateRangePickerControl) as <
  T extends FieldValues
>(
  props: AppDatePickerControlProps<T>
) => JSX.Element;

export {
  MemoizedAppDateRangePicker as AppDateRangePicker,
  MemoizedAppDateRangePickerControl as AppDateRangePickerControl
};
