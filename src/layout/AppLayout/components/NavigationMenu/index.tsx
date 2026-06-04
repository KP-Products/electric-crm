'use client';
import {
  ApartmentOutlined,
  AuditOutlined,
  CalculatorOutlined,
  CloudSyncOutlined,
  CarryOutOutlined,
  DollarCircleOutlined,
  EnvironmentOutlined,
  FileTextOutlined,
  FundProjectionScreenOutlined,
  ProfileOutlined,
  ReconciliationOutlined,
  SafetyCertificateOutlined,
  ScheduleOutlined,
  SettingOutlined,
  TeamOutlined,
  UsergroupAddOutlined
} from '@ant-design/icons';
import { Menu } from 'antd';
import { ItemType } from 'antd/es/menu/interface';
import type { MenuInfo } from 'rc-menu/es/interface';
import { memo, useCallback, useEffect, useMemo } from 'react';

import { K_SIZE_1, K_SIZE_2, K_SIZE_3 } from '@constant';
import { dispatch } from '@redux-common';
import { selectMenuKeys, selectOpenKeys } from '@redux-selector/app';
import { appActions } from '@redux-slice/app';
import { ROUTES } from 'config/routes';
import UserMenu from 'layout/AppLayout/components/UserMenu';
import { usePathname, useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { useAppTranslation } from 'utils/i18n';
import { PERMISSION_VIEW_ACTION } from 'utils/permission.util';
import { TextBase } from '../../../../components/text';

export const MENU_GROUP_KEYS = {
  SYSTEM_ADMINISTRATION: K_SIZE_1.toString(),
  CONTRACT: K_SIZE_2.toString(),
  DEVICE: K_SIZE_3.toString(),
  BILLING: '4',
  CATALOG: '5'
};

const NavigationMenu = () => {
  const { t } = useAppTranslation();
  const router = useRouter();
  const pathname = usePathname();

  const selectedMenuKeys = useSelector(selectMenuKeys);
  const selectedOpenKeys = useSelector(selectOpenKeys);

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
          {
            key: ROUTES.DEFAULT_PARAMETERS,
            label: t('menu:default_parameter_management'),
            icon: <ReconciliationOutlined />,
            type: 'item',
            permission: PERMISSION_VIEW_ACTION.SYSTEM_MANAGEMENT_DEFAULT_PARAMETER_VIEW_ACTION
          },
          {
            key: ROUTES.APPROVAL_MATRIX,
            label: t('menu:approval_matrix'),
            icon: <ApartmentOutlined />,
            type: 'item',
            permission: PERMISSION_VIEW_ACTION.SYSTEM_MANAGEMENT_APPROVAL_MATRIX_VIEW_ACTION
          },
          {
            key: ROUTES.PENDING_TASK,
            label: t('menu:pending_tasks'),
            icon: <ScheduleOutlined />,
            type: 'item'
            // permission: PERMISSION_VIEW_ACTION.OTHER_FEATURE_WAITING_APPROVE_TASK_VIEW_ACTION
          },
          {
            key: ROUTES.MY_PENDING,
            label: t('menu:my_pending_tasks'),
            icon: <CarryOutOutlined />,
            type: 'item',
            // permission: PERMISSION_VIEW_ACTION.OTHER_FEATURE_MY_PENDING_TASK_VIEW_ACTION
          }
        ]
      },
      {
        key: MENU_GROUP_KEYS.CATALOG,
        label: 'Danh mục',
        icon: <ProfileOutlined />,
        children: [
          {
            key: ROUTES.ELECTRIC_TARIFF,
            label: 'Danh mục giá điện',
            icon: <DollarCircleOutlined />,
            type: 'item',
            permission: PERMISSION_VIEW_ACTION.SYSTEM_MANAGEMENT_CUSTOMER_GROUP_VIEW_ACTION
          }
        ]
      },
      {
        key: MENU_GROUP_KEYS.CONTRACT,
        label: 'Hợp đồng',
        icon: <SettingOutlined />,
        children: [
          {
            key: ROUTES.MANAGE_CONTRACT,
            label: 'Quản lý hợp đồng mua bán điện',
            icon: <AuditOutlined />,
            type: 'item',
            permission: PERMISSION_VIEW_ACTION.SYSTEM_MANAGEMENT_CUSTOMER_GROUP_VIEW_ACTION
          },
          {
            key: ROUTES.MANAGE_CUSTOMER,
            label: 'Quản lý khách hàng',
            icon: <UsergroupAddOutlined />,
            type: 'item',
            permission: PERMISSION_VIEW_ACTION.SYSTEM_MANAGEMENT_CUSTOMER_GROUP_VIEW_ACTION
          },
          {
            key: ROUTES.MANAGE_DOCUMENT,
            label: 'Quản lý hồ sơ giấy tờ',
            icon: <FileTextOutlined />,
            type: 'item',
            permission: PERMISSION_VIEW_ACTION.SYSTEM_MANAGEMENT_CUSTOMER_GROUP_VIEW_ACTION
          },
          {
            key: ROUTES.MANAGE_SERVICE_LOCATION,
            label: 'Quản lý địa điểm sử dụng điện',
            icon: <EnvironmentOutlined />,
            type: 'item',
            permission: PERMISSION_VIEW_ACTION.SYSTEM_MANAGEMENT_CUSTOMER_GROUP_VIEW_ACTION
          }
        ]
      },
      {
        key: MENU_GROUP_KEYS.DEVICE,
        label: 'Thiết bị',
        icon: <SettingOutlined />,
        children: [
          {
            key: ROUTES.METER_MANAGEMENT,
            label: 'Quản lý công tơ',
            icon: <SettingOutlined />,
            type: 'item',
            permission: PERMISSION_VIEW_ACTION.SYSTEM_MANAGEMENT_CUSTOMER_GROUP_VIEW_ACTION
          }
        ]
      },
      {
        key: MENU_GROUP_KEYS.BILLING,
        label: 'Chỉ số - Hoá đơn',
        icon: <CalculatorOutlined />,
        children: [
          {
            key: ROUTES.MANUAL_METER_READING,
            label: 'Nhập chỉ số thủ công',
            icon: <FundProjectionScreenOutlined />,
            type: 'item',
            permission: PERMISSION_VIEW_ACTION.SYSTEM_MANAGEMENT_CUSTOMER_GROUP_VIEW_ACTION
          },
          {
            key: ROUTES.REMOTE_METER_READING,
            label: 'Nhập chỉ số đo xa',
            icon: <CloudSyncOutlined />,
            type: 'item',
            permission: PERMISSION_VIEW_ACTION.SYSTEM_MANAGEMENT_CUSTOMER_GROUP_VIEW_ACTION
          }
        ]
      },
    ],
    [t]
  );

  const filterMenu = useCallback((items: any[]): ItemType[] => {
    return items
      .map((item) => {
        if (item.children) {
          const children = filterMenu(item.children);
          if (!children.length) return null;

          return { ...item, children };
        }
        // if (item.permission && !hasPermission(item.permission)) {
        //   return null;
        // }
        return item;
      })
      .filter(Boolean) as ItemType[];
  }, []);

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
      <div>
        {/*<IconSvgLocal*/}
        {/*  height={K_SIZE_44}*/}
        {/*  name="ICON_PVCB_LOGO"*/}
        {/*  fill="none"*/}
        {/*  classNames="cursor-pointer mx-24 my-16"*/}
        {/*  onClick={() => router.push(ROUTES.ROOT)}*/}
        {/*/>*/}
        <TextBase preset="h4" text={'⚡️ CRM Điện'} classNames={'text-center my-[34px]'} />
      </div>
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
