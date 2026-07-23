/* eslint-disable prettier/prettier */
/* eslint-disable eqeqeq */
import { NULL_VALUE } from '@constant';
import type { InputProps, MenuProps } from 'antd';
import { Dropdown, Input, Skeleton } from 'antd';
import type { DropdownProps } from 'antd/lib';
import AppHelperText from 'components/helper-text';
import { IconSvgLocal } from 'components/icon-vec-local';
import { TextBase } from 'components/text';
import React, { useCallback, useMemo } from 'react';
import type { Control, FieldError, FieldValues, Path } from 'react-hook-form';
import { useController } from 'react-hook-form';
import { I18nKeys, useAppTranslation } from 'utils/i18n';

const DEFAULT_DROPDOWN_TRIGGER: DropdownProps['trigger'] = ['click'];
const NOOP_OPEN_CHANGE: NonNullable<AppSelectProps['onOpenChange']> = () => {};

export interface AppSelectProps extends InputProps {
  hiddenSuffix?: boolean;
  name: string;
  options: AppSelectOption[];
  onSelectOption?: MenuProps['onClick'];
  label?: string;
  labelClassName?: string;
  labelSuffix?: React.ReactNode;
  caption?: string | React.ReactNode;
  captionPrefix?: React.ReactNode;
  wrapperClassName?: string;
  children?: React.ReactNode; // for custom trigger element
  dropdownRender?: (menuInstance: React.ReactNode) => React.ReactNode; // for custom render dropdown
  customOption?: (option: AppSelectOption, value?: string | number) => React.ReactNode; // for custom option
  error?: FieldError;
  block?: boolean;
  value?: string | number;
  selectable?: boolean;
  onChange?: (e: any) => void;
  open?: boolean;
  onOpenChange?: (
    open?: boolean,
    info?: {
      source: 'trigger' | 'menu';
    }
  ) => void;
  disabledInput?: boolean;
  isLoading?: boolean;
  triggerDropdown?: DropdownProps['trigger'];
  placement?:
    | 'bottomRight'
    | 'topLeft'
    | 'topCenter'
    | 'topRight'
    | 'bottomLeft'
    | 'bottomCenter'
    | 'top'
    | 'bottom';
  isView?: boolean;
  classNameIsView?: string;
  classNameMore?: string;
  isTranslationLabel?: boolean;
}

export interface AppSelectControlProps<T extends FieldValues>
  extends Omit<AppSelectProps, 'onSelectOption' | 'error'> {
  name: Path<T>;
  control: Control<T>;
  unSeleted?: boolean;
  onSelectExpand?: () => void;
}

export interface AppSelectOption {
  value: string | number;
  label: string | React.ReactNode;
  rawData?: {
    [key: string]: any;
  };
  leftIcon?: React.ReactNode;
  className?: string;
  data?: any;
}

export function AppSelect(props: AppSelectProps) {
  const {
    name,
    options: originOptions,
    onSelectOption,
    value,
    selectable,
    label,
    labelClassName,
    labelSuffix,
    caption,
    captionPrefix,
    wrapperClassName,
    children,
    dropdownRender,
    customOption,
    error,
    block = true,
    size = 'large',
    disabled = false,
    onChange,
    open,
    onOpenChange = NOOP_OPEN_CHANGE,
    disabledInput = true,
    isLoading = false,
    placement,
    suffix,
    triggerDropdown,
    isView = false,
    classNameIsView = '',
    classNameMore,
    isTranslationLabel = false,
    ...restProps
  } = props;

  const { t } = useAppTranslation();

  const options = useMemo(() => {
    const safeOptions = Array.isArray(originOptions) ? originOptions : [];
    if (!isTranslationLabel) return safeOptions;
    return safeOptions.map((option) => ({ ...option, label: t(option.label as I18nKeys) }));
  }, [t, isTranslationLabel, originOptions]);

  const defaultOption = (option: AppSelectOption) => <p className="leading-36">{option.label}</p>;
  const dropdownRenderDefault = useCallback(
    (menuInstance: React.ReactNode) => (
      // eslint-disable-next-line tailwindcss/no-contradicting-classname
      <div className="flex flex-col rounded-radius-m border border-color-200 bg-color-50 shadow-down-m shadow-[rgb(var(--color-black)/0.05)]">
        <div className="max-h-[300px] overflow-auto [&_.ant-dropdown-menu-item-selected>div]:block [&_.ant-dropdown-menu]:shadow-none">
          {React.cloneElement(menuInstance as React.ReactElement)}
        </div>
      </div>
    ),
    []
  );

  const items: MenuProps['items'] = useMemo(
    () =>
      options.map((option) => ({
        label: customOption ? customOption(option, value) : defaultOption(option),
        key: option.value,
        icon: option.leftIcon,
        className: option.className
      })),
    [options, customOption, value]
  );

  const selectedKeys = useMemo(() => {
    if (selectable) return Array.isArray(value) ? value.map(String) : [];
    return value !== undefined && value !== null ? [String(value)] : [];
  }, [selectable, value]);

  const menuProps = useMemo(
    () => ({
      items,
      onClick: onSelectOption,
      selectedKeys,
      selectable
    }),
    [items, onSelectOption, selectedKeys, selectable]
  );

  if (isLoading) {
    return <Skeleton.Input active />;
  }

  return (
    <div className={`${block ? 'w-full' : 'inline-block'} ${wrapperClassName}`}>
      {label && (
        <label
          htmlFor={name}
          className={`mb-4 inline-flex flex-row items-center text-14 font-semibold leading-24 text-color-900 ${labelClassName}`}
        >
          {label}
          {labelSuffix && <span className="ml-4 text-color-900">{labelSuffix}</span>}
        </label>
      )}
      {isView ? (
        <TextBase classNames={classNameIsView}>
          {options?.find((o) => o.value === value)?.label || NULL_VALUE}
        </TextBase>
      ) : (
        <Dropdown
          onOpenChange={onOpenChange}
          open={open}
          menu={menuProps}
          trigger={triggerDropdown || DEFAULT_DROPDOWN_TRIGGER}
          disabled={disabled}
          placement={placement}
          dropdownRender={dropdownRender || dropdownRenderDefault}
          overlayClassName="z-[5] [&_.ant-dropdown-menu-vertical]:max-h-full"
        >
          <div
            className={` rounded-radius-m border border-color-300
            ${
              // eslint-disable-next-line no-nested-ternary, prettier/prettier
              disabled
                ? `!border-color-200
                  !bg-color-200
                  [&:has(input:disabled)]:!bg-color-200
                  [&:has(input:hover)]:!border-color-200`
                : error
                  ? '!border-error-500 [&.ant-dropdown-open]:!border-error-500'
                  : `hover:!border-primary-500 
                    focus:!border-primary-500
                    [&.ant-dropdown-open]:!border-primary-500
                    [&:has(input:hover)]:!border-primary-500`
            }
          `}
          >
            {children ? (
              <div className={`w-full ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                {children}
              </div>
            ) : (
              <Input
                id={name}
                name={name}
                size={size}
                value={
                  (options.find((option) => option.value === value)?.label as string) ?? value ?? ''
                }
                variant="borderless"
                onChange={onChange}
                suffix={
                  suffix || (
                    <IconSvgLocal
                      height={20}
                      name="ICON_DROP_DOWN"
                      fill={disabled ? 'rgb(var(--color-400))' : 'rgb(var(--color-900))'}
                    />
                  )
                }
                {...restProps}
                disabled={disabledInput}
                className={`
                px-[11px]
                py-[10px]
                !text-14
                text-color-800
                placeholder:!text-color-600
                disabled:!pointer-events-none
                disabled:!text-color-800
                [&>input:disabled]:!pointer-events-none 
                [&>input:disabled]:!text-color-800
                [&>input]:placeholder:!text-color-600
                ${classNameMore}
              ${
                disabled
                  ? `!bg-color-200
                  disabled:cursor-not-allowed
                  [&:has(input:disabled)]:!cursor-not-allowed
                  [&:has(input:disabled)]:!bg-color-200
                  [&>input:disabled]:!cursor-not-allowed
                  `
                  : `disabled:cursor-pointer
                  disabled:!bg-color-50
                  [&:has(input:disabled)]:!cursor-pointer
                  [&:has(input:disabled)]:!bg-color-50
                  [&>input:disabled]:!cursor-pointer
              `
                // eslint-disable-next-line prettier/prettier
              }
            `}
              />
            )}
          </div>
        </Dropdown>
      )}
      <AppHelperText caption={caption} captionPrefix={captionPrefix} error={error} />
    </div>
  );
}

export function AppSelectControl<T extends FieldValues>({
  name,
  control,
  unSeleted,
  onSelectExpand,
  ...restProps
}: AppSelectControlProps<T>) {
  const {
    field: { onChange, value },
    fieldState: { error }
  } = useController({ name, control });

  const handleSelectionChange: MenuProps['onClick'] = ({ key }) => {
    const option = restProps?.options?.find((opt) => String(opt.value) === key);

    onSelectExpand?.();

    if (unSeleted && value && String(value) === key) {
      onChange('');
      restProps?.onChange?.('');
      return;
    }

    if (option) {
      onChange(option.value);
      restProps?.onChange?.(option.value);
    }
  };

  return (
    <AppSelect
      name={name}
      value={value}
      error={error}
      onSelectOption={handleSelectionChange}
      {...restProps}
    />
  );
}
