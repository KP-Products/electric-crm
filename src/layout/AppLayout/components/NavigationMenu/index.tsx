'use client';
import {
  ReconciliationOutlined,
  SafetyCertificateOutlined,
  SettingOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { Menu } from 'antd';
import { ItemType } from 'antd/es/menu/interface';
import type { MenuInfo } from 'rc-menu/es/interface';
import { memo, useCallback, useEffect, useMemo } from 'react';

import { K_SIZE_1, K_SIZE_2, K_SIZE_3, K_SIZE_4, K_SIZE_5 } from '@constant';
import { dispatch } from '@redux-common';
import { selectMenuKeys, selectOpenKeys } from '@redux-selector/app';
import { appActions } from '@redux-slice/app';
import { ROUTES } from 'config/routes';
import UserMenu from 'layout/AppLayout/components/UserMenu';
import { usePathname, useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { useAppTranslation } from 'utils/i18n';
import { PERMISSION_VIEW_ACTION, useCheckAction } from 'utils/permission.util';

export const MENU_GROUP_KEYS = {
  PARAMETER: K_SIZE_1.toString(),
  LOOKUP: K_SIZE_2.toString(),
  REPORT: K_SIZE_3.toString(),
  OTHER_FUNCTION: K_SIZE_4.toString(),
  SYSTEM_ADMINISTRATION: K_SIZE_5.toString()
};

const NavigationMenu = () => {
  const { t } = useAppTranslation();
  const router = useRouter();
  const pathname = usePathname();

  const selectedMenuKeys = useSelector(selectMenuKeys);
  const selectedOpenKeys = useSelector(selectOpenKeys);

  const { hasPermission } = useCheckAction();

  const handleClickMenuItem = useCallback(
    (info: MenuInfo) => {
      const { key: navigationPath } = info;
      router.push(navigationPath);
    },
    [router]
  );

  const rawMenuItems = useMemo(
    (): any[] => [
      {
        key: MENU_GROUP_KEYS.SYSTEM_ADMINISTRATION,
        label: t('menu:system_administration'),
        icon: <SettingOutlined />,
        children: [
          {
            key: ROUTES.MANAGE_USER,
            label: t('menu:user_management'),
            icon: <TeamOutlined />,
            type: 'item',
            permission: PERMISSION_VIEW_ACTION.SYSTEM_MANAGEMENT_USER_VIEW_ACTION
          },
          {
            key: ROUTES.MANAGE_PERMISSION_GROUP,
            label: t('menu:permission_group_management'),
            icon: <SafetyCertificateOutlined />,
            type: 'item',
            permission: PERMISSION_VIEW_ACTION.SYSTEM_MANAGEMENT_AUTHORIZATION_VIEW_ACTION
          },
          // {
          //   key: ROUTES.APPROVAL_MATRIX,
          //   label: t('menu:approval_matrix'),
          //   icon: <ApartmentOutlined />,
          //   type: 'item',
          //   permission: PERMISSION_VIEW_ACTION.SYSTEM_MANAGEMENT_APPROVAL_MATRIX_VIEW_ACTION
          // },
          // {
          //   key: ROUTES.FEE_CALCULATE_CONDITION,
          //   label: t('menu:fee_calculation_condition_category'),
          //   icon: <ContainerOutlined />,
          //   type: 'item',
          //   permission: PERMISSION_VIEW_ACTION.SYSTEM_MANAGEMENT_FEE_CONDITION_VIEW_ACTION
          // },
          {
            key: ROUTES.DEFAULT_PARAMETERS,
            label: t('menu:default_parameter_management'),
            icon: <ReconciliationOutlined />,
            type: 'item',
            permission: PERMISSION_VIEW_ACTION.SYSTEM_MANAGEMENT_DEFAULT_PARAMETER_VIEW_ACTION
          }
          // {
          //   key: ROUTES.JOB_LIST_MANAGEMENT,
          //   label: t('menu:job_list_management'),
          //   icon: <DatabaseOutlined />,
          //   type: 'item',
          //   permission:
          //     PERMISSION_VIEW_ACTION.SYSTEM_MANAGEMENT_JOB_CREATE_RECURRING_DATA_VIEW_ACTION
          // },
          // {
          //   key: ROUTES.JOB_HISTORY,
          //   label: t('menu:daily_job_history'),
          //   icon: <FileSearchOutlined />,
          //   type: 'item',
          //   permission:
          //     PERMISSION_VIEW_ACTION.SYSTEM_MANAGEMENT_JOB_HISTORY_ACTIVITY_CREATE_DATA_VIEW_ACTION
          // },
          // {
          //   key: ROUTES.MANAGE_CODE_FEE_GROUP,
          //   label: t('menu:fee_code_group_management'),
          //   icon: <CodeOutlined />,
          //   type: 'item',
          //   permission: PERMISSION_VIEW_ACTION.SYSTEM_MANAGEMENT_FEE_CODE_VIEW_ACTION
          // },
          // {
          //   key: ROUTES.MANAGE_CUSTOMER_GROUP,
          //   label: t('menu:customer_group_management'),
          //   icon: <UsergroupAddOutlined />,
          //   type: 'item',
          //   permission: PERMISSION_VIEW_ACTION.SYSTEM_MANAGEMENT_CUSTOMER_GROUP_VIEW_ACTION
          // },
          // {
          //   key: ROUTES.FORM_MANAGEMENT,
          //   label: t('menu:form_management'),
          //   icon: <FormOutlined />,
          //   type: 'item',
          //   permission: PERMISSION_VIEW_ACTION.SYSTEM_MANAGEMENT_TEMPLATE_VIEW_ACTION
          // }
        ]
      }
    ],
    [t]
  );

  const filterMenu = useCallback(
    (items: any[]): ItemType[] => {
      return items
        .map((item) => {
          if (item.children) {
            const children = filterMenu(item.children);
            if (!children.length) return null;

            return { ...item, children };
          }
          if (item.permission && !hasPermission(item.permission)) {
            return null;
          }
          return item;
        })
        .filter(Boolean) as ItemType[];
    },
    [hasPermission]
  );

  const menuItems = useMemo(() => {
    return filterMenu(rawMenuItems);
  }, [rawMenuItems, filterMenu]);

  useEffect(() => {
    const matchedRoute = Object.values(ROUTES)
      .filter((route) => pathname.startsWith(route) && route !== ROUTES.ROOT)
      .sort((a, b) => a.length - b.length)?.[0];
    dispatch(appActions.setSelectedMenuKeys([matchedRoute]));
  }, [pathname]);

  return (
    <div className="flex h-full w-[254px] flex-col">
      {/*<div>*/}
      {/*  <IconSvgLocal*/}
      {/*    height={K_SIZE_44}*/}
      {/*    name="ICON_PVCB_LOGO"*/}
      {/*    fill="none"*/}
      {/*    classNames="cursor-pointer mx-24 my-16"*/}
      {/*    onClick={() => router.push(ROUTES.ROOT)}*/}
      {/*  />*/}
      {/*</div>*/}
      <Menu
        mode="inline"
        items={menuItems}
        onClick={handleClickMenuItem}
        selectedKeys={selectedMenuKeys}
        openKeys={selectedOpenKeys}
        onOpenChange={(keys) => dispatch(appActions.setSelectedOpenKeys(keys))}
        // eslint-disable-next-line tailwindcss/no-custom-classname
        className="navigation-menu"
      />
      <UserMenu />
    </div>
  );
};

export default memo(NavigationMenu);
