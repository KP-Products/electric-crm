'use client';
import { MenuOutlined } from '@ant-design/icons';
import { K_SIZE_254, K_SIZE_40 } from '@constant';
import { Drawer, Dropdown } from 'antd';
import { IconSvgLocal } from 'components/icon-vec-local';
import NavigationMenu from 'layout/AppLayout/components/NavigationMenu';
import useUserMenu from 'layout/AppLayout/components/UserMenu/useUserMenu';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const Header = () => {
  const pathname = usePathname();

  const { userMenuItems, onUserMenuClick } = useUserMenu({ isShowProfile: true });

  const [open, setOpen] = useState<boolean>(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div className="hidden items-center justify-between border-b border-color-300 bg-color-50 px-24 py-12 tablet:flex mobile:px-12">
      <div
        className="flex size-40 cursor-pointer items-center justify-center"
        onClick={() => setOpen(true)}
      >
        <MenuOutlined className="text-20" />
      </div>
      <Dropdown
        menu={{ items: userMenuItems, onClick: onUserMenuClick }}
        trigger={['click']}
        placement="bottomRight"
      >
        <div className="relative flex size-40 shrink-0 items-center justify-center rounded-full bg-color-200">
          <IconSvgLocal name="ICON_USER" height={K_SIZE_40} fill="rgb(var(--color-600)" />
        </div>
      </Dropdown>
      <Drawer
        open={open}
        placement={'left'}
        closable={false}
        onClose={() => setOpen(false)}
        width={K_SIZE_254}
        classNames={{ body: '!p-0 !bg-color-200' }}
      >
        <NavigationMenu />
      </Drawer>
    </div>
  );
};

export default Header;
