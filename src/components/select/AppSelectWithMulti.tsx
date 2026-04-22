import { NULL_VALUE } from '@constant';
import type { SelectProps } from 'antd';
import { Select, Skeleton } from 'antd';
import AppHelperText from 'components/helper-text';
import { IconSvgLocal } from 'components/icon-vec-local';
import { TextBase } from 'components/text';
import React, { useMemo } from 'react';
import {
  useController,
  type Control,
  type FieldError,
  type FieldValues,
  type Path
} from 'react-hook-form';
import { I18nKeys, useAppTranslation } from 'utils/i18n';
import '../../styles/components/select-multi.scss';

export interface AppSelectOption {
  value: string | number;
  label: string | React.ReactNode;
  rawData?: Record<string, any>;
  disabled?: boolean;
}

export interface AppSelectWithMultiProps extends SelectProps {
  name: string;
  options: AppSelectOption[];
  label?: string;
  labelClassName?: string;
  labelSuffix?: React.ReactNode;
  caption?: string | React.ReactNode;
  captionPrefix?: React.ReactNode;
  wrapperClassName?: string;
  error?: FieldError;
  isLoading?: boolean;
  isView?: boolean;
  classNameIsView?: string;
  isTranslationLabel?: boolean;
}

export interface AppSelectWithMultiControlProps<T extends FieldValues>
  extends Omit<AppSelectWithMultiProps, 'error' | 'value' | 'onChange'> {
  name: Path<T>;
  control: Control<T>;
}

export function AppSelectWithMulti(props: AppSelectWithMultiProps) {
  const {
    name,
    options: originOptions,
    label,
    labelClassName,
    labelSuffix,
    caption,
    captionPrefix,
    wrapperClassName,
    error,
    isLoading,
    isView,
    classNameIsView,
    isTranslationLabel,
    value,
    ...restProps
  } = props;

  const { t } = useAppTranslation();

  const options = useMemo(() => {
    if (!isTranslationLabel) return originOptions;

    return originOptions?.map((opt) => ({
      ...opt,
      label: t(opt.label as I18nKeys)
    }));
  }, [originOptions, isTranslationLabel, t]);

  if (isLoading) {
    return <Skeleton.Input active />;
  }

  const renderViewValue = () => {
    if (!value || (Array.isArray(value) && value.length === 0)) {
      return NULL_VALUE;
    }

    if (restProps.mode === 'multiple' && Array.isArray(value)) {
      const selected = value
        .map((val) => options?.find((o) => String(o.value) === String(val)))
        .filter(Boolean);

      if (!selected.length) return NULL_VALUE;

      return (
        <div className="flex items-center gap-4">
          {selected.map((item) => (
            <TextBase
              key={item!.value}
              classNames="self-start rounded-[4px] bg-[rgba(0,0,0,0.06)] px-8 py-0 leading-[22px]"
            >
              {item!.label}
            </TextBase>
          ))}
        </div>
      );
    }

    return options?.find((o) => String(o.value) === String(value))?.label || NULL_VALUE;
  };

  return (
    <div className={`w-full ${wrapperClassName}`}>
      {/* Label */}
      {label && (
        <label
          htmlFor={name}
          className={`mb-4 inline-flex items-center text-14 font-semibold text-color-900 ${labelClassName}`}
        >
          {label}
          {labelSuffix && <span className="ml-4">{labelSuffix}</span>}
        </label>
      )}

      {/* View mode */}
      {isView ? (
        <TextBase classNames={classNameIsView}>{renderViewValue()}</TextBase>
      ) : (
        <Select
          virtual={false}
          id={name}
          value={value}
          options={options}
          status={error ? 'error' : undefined}
          {...restProps}
          suffixIcon={
            <IconSvgLocal height={20} name="ICON_DROP_DOWN" fill={'rgb(var(--color-900))'} />
          }
        />
      )}

      {/* Helper text */}
      <AppHelperText caption={caption} captionPrefix={captionPrefix} error={error} />
    </div>
  );
}

export function AppSelectWithMultiControl<T extends FieldValues>({
  name,
  control,
  ...restProps
}: AppSelectWithMultiControlProps<T>) {
  const {
    field: { value, onChange },
    fieldState: { error }
  } = useController({ name, control });

  return (
    <AppSelectWithMulti
      name={name}
      value={value}
      onChange={onChange}
      error={error}
      {...restProps}
    />
  );
}
