import { KeyOutlined, LogoutOutlined, UserOutlined } from '@ant-design/icons';
import { K_SIZE_0, K_SIZE_1, K_SIZE_2, K_SIZE_3, NULL_VALUE } from '@constant';
import { LOGOUT } from '@redux-action-type/auth';
import { dispatch } from '@redux-common';
import { selectUserInfo } from '@redux-selector/auth';
import { MenuProps } from 'antd';
import { showDialog } from 'components/dialog';
import { TYPE_ACTION, TYPE_MESSAGE } from 'components/dialog/type';
import { ROUTES } from 'config/routes';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useAppTranslation } from 'utils/i18n';

interface UserMenuProps {
  isShowProfile?: boolean;
}

export default function useUserMenu({ isShowProfile }: UserMenuProps) {
  const router = useRouter();
  const { t } = useAppTranslation();
  const userInfo = useSelector(selectUserInfo);

  const userMenuItems = useMemo((): MenuProps['items'] => {
    const menu: MenuProps['items'] = [
      {
        label: t('user_menu:change_password'),
        icon: <KeyOutlined />,
        key: K_SIZE_1.toString()
      },
      {
        label: t('user_menu:user_info'),
        icon: <UserOutlined />,
        key: K_SIZE_2.toString()
      },
      {
        label: t('user_menu:logout'),
        icon: <LogoutOutlined />,
        key: K_SIZE_3.toString(),
        danger: true
      }
    ];
    if (isShowProfile) {
      menu.unshift(
        {
          label: (
            <div>
              <div className="text-14 font-semibold leading-20 text-color-black">
                {userInfo?.fullName || NULL_VALUE}
              </div>
              <div className="mt-4 text-12 leading-16 text-color-700">
                {userInfo?.unit?.name || NULL_VALUE}
              </div>
            </div>
          ),
          key: K_SIZE_0.toString()
        },
        {
          type: 'divider'
        }
      );
    }
    return menu;
  }, [t, isShowProfile, userInfo]);

  const handleLogout = useCallback(() => {
    return showDialog({
      title: t('user_menu:logout'),
      content: t('user_menu:logout_confirm'),
      type: TYPE_MESSAGE.ALERT,
      actions: [
        {
          title: t('common:agree'),
          type: TYPE_ACTION.PRIMARY,
          onPress: () =>
            dispatch({ type: LOGOUT, payload: { onSuccess: () => router.push(ROUTES.LOGIN) } })
        },
        {
          title: t('common:cancel'),
          type: TYPE_ACTION.SECONDARY
        }
      ]
    });
  }, [t, router]);

  const onUserMenuClick = useCallback(
    ({ key }: { key: string }) => {
      switch (key) {
        case K_SIZE_3.toString():
          return handleLogout();
        default:
          return;
      }
    },
    [handleLogout]
  );

  return {
    userInfo,
    userMenuItems,
    onUserMenuClick
  };
}
