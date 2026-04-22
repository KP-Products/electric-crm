'use client';
import { K_SIZE_44 } from '@constant';
import { Layout } from 'antd';
import { IconSvgLocal } from 'components/icon-vec-local';

const { Header: LayoutHeader } = Layout;

const Header = () => {
  return (
    <LayoutHeader className="flex !h-[76px] justify-start bg-color-50 px-40 py-16 !leading-44 tablet:px-24 tablet:py-16 mobile:p-12">
      <IconSvgLocal height={K_SIZE_44} name="ICON_PVCB_LOGO" fill="none" />
    </LayoutHeader>
  );
};

export default Header;
