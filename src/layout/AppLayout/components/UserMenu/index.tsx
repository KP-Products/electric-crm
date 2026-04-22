'use client';
import { MoreOutlined } from '@ant-design/icons';
import { K_SIZE_16, K_SIZE_4, K_SIZE_40, NULL_VALUE } from '@constant';
import { Dropdown } from 'antd';
import { IconSvgLocal } from 'components/icon-vec-local';
import useUserMenu from 'layout/AppLayout/components/UserMenu/useUserMenu';

const UserMenu = () => {
  const { userInfo, userMenuItems, onUserMenuClick } = useUserMenu({});

  return (
    <div className="sticky bottom-0 mt-auto flex shrink-0 items-center justify-between gap-8 bg-color-200 px-16 py-12 tablet:hidden">
      <div className="flex items-center">
        <div className="relative flex size-40 shrink-0 items-center justify-center rounded-full bg-color-50">
          <IconSvgLocal name="ICON_USER" height={K_SIZE_40} fill="rgb(var(--color-600)" />
        </div>
        <div className="ml-8">
          <div className="text-14 font-semibold leading-20 text-color-black">
            {userInfo?.fullName || NULL_VALUE}
          </div>
          <div className="mt-4 text-12 leading-16 text-color-700">
            {userInfo?.unit?.name || NULL_VALUE}
          </div>
        </div>
      </div>
      <Dropdown
        menu={{ items: userMenuItems, onClick: onUserMenuClick }}
        trigger={['click']}
        align={{
          points: ['tl', 'tr'],
          offset: [K_SIZE_4, K_SIZE_16]
        }}
        overlayStyle={{ minWidth: 'unset' }}
      >
        <div className="flex size-32 shrink-0 cursor-pointer items-center justify-center rounded-radius-m">
          <MoreOutlined className="text-16" />
        </div>
      </Dropdown>
    </div>
  );
};

export default UserMenu;
