'use client';

import { K_SIZE_16 } from '@constant';
import { TextBase } from 'components/text';
import { IconSvgLocal } from 'components/icon-vec-local';
import React from 'react';
import { IconSvgTypes } from 'assets/svg';
import { Tooltip } from 'antd';
import { TooltipPlacement } from 'antd/es/tooltip';

interface Props {
  content?: string;
  contentTooltip?: string;
  contentClassName?: string;
  textClassName?: string;
  onClick?: () => void;
  onClose?: () => void;
  bodyClassName?: string;
  rootClassName?: string;
  tooltipPlacement?: TooltipPlacement;
  iconClose?: IconSvgTypes;
  iconFillColor?: string;
  hiddenClose?: boolean;
}
const TagFilter = ({
  content,
  contentTooltip,
  contentClassName = '',
  textClassName = '',
  bodyClassName = '',
  rootClassName = '',
  tooltipPlacement = 'top',
  onClick,
  onClose,
  iconClose = 'ICON_CLOSE_TAKE_NOTE',
  iconFillColor = 'rgb(var(--pending-600))',
  hiddenClose = false
}: Props) => {
  return (
    <Tooltip
      className={`cursor-pointer text-color-700 hover:text-color-800 ${rootClassName}`}
      placement={tooltipPlacement}
      title={contentTooltip}
      color={'rgb(var(--color-50)'}
      classNames={{
        body: `!text-text-primary ${bodyClassName}`
      }}
    >
      <div
        className={`flex items-center gap-4 rounded-full border border-primary-500  bg-primary-50 px-12 hover:border-primary-600 hover:bg-primary-100 ${contentClassName}`}
        onClick={() => {
          onClick?.();
        }}
      >
        <TextBase
          text={content}
          classNames={`m-4 mt-[6px] text-14 text-pending-600 max-w-[160px] truncate ${textClassName}`}
        />
        {!hiddenClose && (
          <IconSvgLocal
            name={iconClose}
            height={K_SIZE_16}
            width={K_SIZE_16}
            fill={iconFillColor}
            classNames={'cursor-pointer'}
            onClick={() => {
              onClose?.();
            }}
          />
        )}
      </div>
    </Tooltip>
  );
};

export default TagFilter;
