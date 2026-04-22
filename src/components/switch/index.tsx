'use client';
import { Switch, type SwitchProps } from 'antd';
import type { Ref } from 'react';
import { forwardRef } from 'react';
import type { Control, FieldValues, Path } from 'react-hook-form';
import { useController } from 'react-hook-form';

import { TextBase } from 'components/text';
import AppHelperText from '../helper-text';

export interface AppSwitchProps extends Omit<SwitchProps, 'size'> {
  size?: 'small' | 'medium';
  isView?: boolean;
  labelChecked?: string;
  labelUnchecked?: string;
  classNameLabelIsView?: string;
}

export interface AppSwitchControlProps<T extends FieldValues> extends AppSwitchProps {
  name: Path<T>;
  control: Control<T>;
  label?: string;
  labelSuffix?: React.ReactNode;
  caption?: string;
  captionPrefix?: React.ReactNode;
  wrapperClassName?: string;
}

export const AppSwitch = forwardRef(
  (
    {
      size = 'small',
      isView,
      onChange,
      checked,
      labelChecked = 'Yes',
      labelUnchecked = 'No',
      classNameLabelIsView,
      className,
      ...restProps
    }: AppSwitchProps,
    ref: Ref<any>
  ) => {
    return isView ? (
      <TextBase classNames={classNameLabelIsView}>
        {checked ? labelChecked : labelUnchecked}
      </TextBase>
    ) : (
      <Switch
        ref={ref}
        defaultChecked={false}
        size={size === 'small' ? 'default' : 'small'}
        checked={checked}
        {...restProps}
        onChange={!isView ? onChange : undefined}
        className={isView ? 'pointer-events-none' : className}
      />
    );
  }
);

AppSwitch.displayName = 'AppSwitch';

export function AppSwitchControl<T extends FieldValues>(props: AppSwitchControlProps<T>) {
  const {
    name,
    label,
    labelSuffix,
    caption,
    captionPrefix,
    wrapperClassName,
    control,
    ...restProps
  } = props;

  const {
    field: { value, onChange },
    fieldState: { error }
  } = useController({ name, control });

  return (
    <div className={`w-full ${wrapperClassName}`}>
      {label && (
        <label
          htmlFor={name}
          className="mb-4 inline-flex flex-row items-center text-14 font-semibold leading-24 text-color-900"
        >
          {label}
          {labelSuffix && <span className="ml-4 text-color-900">{labelSuffix}</span>}
        </label>
      )}
      <AppSwitch checked={value} onChange={onChange} {...restProps} />
      <AppHelperText caption={caption} captionPrefix={captionPrefix} error={error} />
    </div>
  );
}
