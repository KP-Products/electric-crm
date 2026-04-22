'use client';

import React from 'react';
import { IconSvgLocal } from 'components/icon-vec-local/index';
import { K_SIZE_24 } from '@constant';
import { Tooltip } from 'antd';
import { IconSvgTypes } from 'assets/svg';

interface Props {
  title?: string;
  rootClassName?: string;
  bodyClassName?: string;
  icon?: IconSvgTypes;
  iconHeight?: number;
  iconClassName?: string;
  onClick?: () => void;
}
const IconHover = ({
  title = '',
  rootClassName = '',
  bodyClassName = '',
  icon = 'ICON_EDIT',
  iconHeight = K_SIZE_24,
  iconClassName = '',
  onClick
}: Props) => {
  return (
    <Tooltip
      className={`cursor-pointer text-color-700 hover:text-color-800 ${rootClassName}`}
      placement={'bottomLeft'}
      title={title}
      color={'rgb(var(--color-50)'}
      classNames={{
        body: `!text-text-primary ${bodyClassName}`
      }}
    >
      <IconSvgLocal name={icon} classNames={iconClassName} height={iconHeight} onClick={onClick} />
    </Tooltip>
  );
};

export default IconHover;
