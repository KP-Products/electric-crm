'use client';
import { Radio, Space, type RadioGroupProps, type SpaceProps } from 'antd';
import clsx from 'clsx';
import AppHelperText from 'components/helper-text';
import type { Control, FieldError, FieldValues, Path } from 'react-hook-form';
import { useController } from 'react-hook-form';

export interface AppRadioProps extends RadioGroupProps {
  options: AppRadioOption[];
  label?: string;
  labelSuffix?: React.ReactNode;
  caption?: string;
  captionPrefix?: React.ReactNode;
  wrapperClassName?: string;
  labelClassName?: string;
  direction?: SpaceProps['direction'];
  error?: FieldError;
  isView?: boolean;
  spaceClassName?: string;
}
export interface AppRadioControlProps<T extends FieldValues> extends AppRadioProps {
  name: Path<T>;
  control: Control<T>;
  externalOnChange?: () => void;
  hideError?: boolean;
}

export interface AppRadioOption {
  value: string | number;
  label: string;
  subTitle?: string;
}

export default function AppRadio(props: AppRadioProps) {
  const {
    name,
    options,
    label,
    labelSuffix,
    caption,
    captionPrefix,
    wrapperClassName,
    labelClassName,
    direction = 'horizontal',
    error,
    isView,
    spaceClassName,
    ...restProps
  } = props;

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

      {isView ? (
        <div className="flex items-center gap-16">
          {options.map((option, index) => {
            const isSelected = restProps.value === option.value;

            return (
              <div
                key={option.value}
                className={clsx(
                  !isSelected && 'text-color-500 line-through',
                  index < options.length - 1 && 'border-r border-color-300 pr-16'
                )}
              >
                {option.label}
              </div>
            );
          })}
        </div>
      ) : (
        <div>
          <Radio.Group name={name} {...restProps}>
            <Space direction={direction} className={spaceClassName}>
              {options.map((option) => (
                <Radio key={option.value} value={option.value} className={labelClassName}>
                  {option.label}
                </Radio>
              ))}
            </Space>
          </Radio.Group>
        </div>
      )}

      <AppHelperText caption={caption} captionPrefix={captionPrefix} error={error} />
    </div>
  );
}

export function AppRadioControl<T extends FieldValues>({
  name,
  control,
  externalOnChange,
  hideError,
  ...restProps
}: AppRadioControlProps<T>) {
  const {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    field: { ref, onChange, ...resField },
    fieldState: { error }
  } = useController({ name, control });
  return (
    <AppRadio
      {...resField}
      {...restProps}
      onChange={(e) => {
        onChange(e.target.value);
        if (externalOnChange) externalOnChange();
      }}
      error={hideError ? undefined : error}
    />
  );
}
