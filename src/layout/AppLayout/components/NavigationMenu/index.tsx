'use client';
import {
  ApartmentOutlined,
  AuditOutlined,
  CalculatorOutlined,
  CloudSyncOutlined,
  CarryOutOutlined,
  DollarCircleOutlined,
  FileTextOutlined,
  FundProjectionScreenOutlined,
  HistoryOutlined,
  IdcardOutlined,
  ProfileOutlined,
  ReconciliationOutlined,
  SnippetsOutlined,
  SafetyCertificateOutlined,
  SettingOutlined,
  SwapOutlined,
  TagsOutlined,
  TeamOutlined,
  UsergroupAddOutlined
} from '@ant-design/icons';
import { Menu } from 'antd';
import { ItemType } from 'antd/es/menu/interface';
import type { MenuInfo } from 'rc-menu/es/interface';
import { memo, useCallback, useMemo } from 'react';

import { K_SIZE_1, K_SIZE_2, K_SIZE_3 } from '@constant';
import { dispatch } from '@redux-common';
import { selectOpenKeys } from '@redux-selector/app';
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
  CATALOG: '5',
  DEBT: '6',
  LEGAL_DOCUMENT: '7',
  HUMAN_RESOURCE: '8',
  REPORT: '9'
};

const NavigationMenu = () => {
  const { t } = useAppTranslation();
  const router = useRouter();
  const pathname = usePathname();

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
            key: ROUTES.MANAGE_BRANCH,
            label: 'Quản lý chi nhánh',
            icon: <ApartmentOutlined />,
            type: 'item'
          },
          {
            key: ROUTES.METER_VERIFICATION,
            label: 'Kiểm định công tơ',
            icon: <CarryOutOutlined />,
            type: 'item',
            permission: PERMISSION_VIEW_ACTION.SYSTEM_MANAGEMENT_CUSTOMER_GROUP_VIEW_ACTION
          },
          {
            key: ROUTES.DEFAULT_PARAMETERS,
            label: t('menu:default_parameter_management'),
            icon: <ReconciliationOutlined />,
            type: 'item',
            permission: PERMISSION_VIEW_ACTION.SYSTEM_MANAGEMENT_DEFAULT_PARAMETER_VIEW_ACTION
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
          },
          {
            key: ROUTES.OPERATION_PRICE,
            label: 'Đơn giá vận hành',
            icon: <TagsOutlined />,
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
            key: ROUTES.MANAGE_CUSTOMER,
            label: 'Quản lý khách hàng',
            icon: <UsergroupAddOutlined />,
            type: 'item',
            permission: PERMISSION_VIEW_ACTION.SYSTEM_MANAGEMENT_CUSTOMER_GROUP_VIEW_ACTION
          },
          {
            key: ROUTES.MANAGE_CONTRACT,
            label: 'Quản lý hợp đồng mua bán điện',
            icon: <AuditOutlined />,
            type: 'item',
            permission: PERMISSION_VIEW_ACTION.SYSTEM_MANAGEMENT_CUSTOMER_GROUP_VIEW_ACTION
          },
          {
            key: ROUTES.MANAGE_OPERATION_UNIT,
            label: 'Quản lý đơn vị vận hành',
            icon: <ApartmentOutlined />,
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
            key: ROUTES.MANAGE_OPERATION_CONTRACT,
            label: 'Quản lý hợp đồng vận hành',
            icon: <AuditOutlined />,
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
          },
          {
            key: ROUTES.MEASURING_DEVICE_MANAGEMENT,
            label: 'Quản lý TU/TI',
            icon: <SettingOutlined />,
            type: 'item',
            permission: PERMISSION_VIEW_ACTION.SYSTEM_MANAGEMENT_CUSTOMER_GROUP_VIEW_ACTION
          },
          {
            key: ROUTES.METER_CHANGE_EVENTS,
            label: 'Biến động công tơ/TU/TI',
            icon: <SwapOutlined />,
            type: 'item',
            permission: PERMISSION_VIEW_ACTION.SYSTEM_MANAGEMENT_CUSTOMER_GROUP_VIEW_ACTION
          },
          {
            key: ROUTES.PPE_ITEMS,
            label: 'Quản lý bảo hộ lao động',
            icon: <SafetyCertificateOutlined />,
            type: 'item'
            // permission: PERMISSION_VIEW_ACTION.PPE_ITEM_VIEW_ACTION
          },
          {
            key: ROUTES.PPE_ITEM_HISTORY,
            label: 'Lịch sử bàn giao thiết bị',
            icon: <HistoryOutlined />,
            type: 'item'
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
          },
          {
            key: ROUTES.ELECTRICITY_NOTICE_CSPK,
            label: 'Quản lý giấy báo tiền điện CSPK',
            icon: <FileTextOutlined />,
            type: 'item',
            permission: PERMISSION_VIEW_ACTION.SYSTEM_MANAGEMENT_CUSTOMER_GROUP_VIEW_ACTION
          },
          {
            key: ROUTES.READING_DATA_APPROVAL,
            label: 'Xác nhận số liệu',
            icon: <CarryOutOutlined />,
            type: 'item',
            permission: PERMISSION_VIEW_ACTION.SYSTEM_MANAGEMENT_CUSTOMER_GROUP_VIEW_ACTION
          },
          {
            key: ROUTES.EVN_READING_BATCH,
            label: 'Chốt điện với EVN',
            icon: <CarryOutOutlined />,
            type: 'item',
            permission: PERMISSION_VIEW_ACTION.SYSTEM_MANAGEMENT_CUSTOMER_GROUP_VIEW_ACTION
          }
        ]
      },
      {
        key: MENU_GROUP_KEYS.DEBT,
        label: 'Công nợ',
        icon: <FileTextOutlined />,
        children: [
          {
            key: ROUTES.PAYMENT_STATEMENT,
            label: 'Nhập dữ liệu sao kê',
            icon: <FileTextOutlined />,
            type: 'item',
            permission: PERMISSION_VIEW_ACTION.SYSTEM_MANAGEMENT_CUSTOMER_GROUP_VIEW_ACTION
          },
          {
            key: ROUTES.DEBT_AGING,
            label: 'Tính tuổi nợ',
            icon: <HistoryOutlined />,
            type: 'item',
            permission: PERMISSION_VIEW_ACTION.SYSTEM_MANAGEMENT_CUSTOMER_GROUP_VIEW_ACTION
          }
        ]
      },
      {
        key: MENU_GROUP_KEYS.LEGAL_DOCUMENT,
        label: 'Văn bản pháp lý',
        icon: <FileTextOutlined />,
        children: [
          {
            key: ROUTES.COMPANY_LEGAL_DOCUMENTS,
            label: 'Văn bản pháp lý công ty',
            icon: <FileTextOutlined />,
            type: 'item',
            permission: PERMISSION_VIEW_ACTION.SYSTEM_MANAGEMENT_CUSTOMER_GROUP_VIEW_ACTION
          },
          {
            key: ROUTES.INCOMING_DOCUMENTS,
            label: 'Văn bản đến',
            icon: <FileTextOutlined />,
            type: 'item',
            permission: PERMISSION_VIEW_ACTION.SYSTEM_MANAGEMENT_CUSTOMER_GROUP_VIEW_ACTION
          }
        ]
      },
      {
        key: MENU_GROUP_KEYS.REPORT,
        label: 'Báo cáo',
        icon: <SnippetsOutlined />,
        children: [
          {
            key: ROUTES.REPORTS,
            label: 'Xuất báo cáo',
            icon: <FileTextOutlined />,
            type: 'item'
          }
        ]
      },
      {
        key: MENU_GROUP_KEYS.HUMAN_RESOURCE,
        label: 'Quản Lý Nhân sự',
        icon: <IdcardOutlined />,
        children: [
          {
            key: ROUTES.EMPLOYEE_LIST,
            label: 'Danh sách nhân sự',
            icon: <TeamOutlined />,
            type: 'item'
          },
          {
            key: ROUTES.EMPLOYEE_ADD,
            label: 'Thêm nhân sự',
            icon: <UsergroupAddOutlined />,
            type: 'item'
          }
        ]
      }
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

  const menuRouteKeys = useMemo(() => {
    const collectLeafKeys = (items: ItemType[]): string[] =>
      items.flatMap((item: any) => {
        if (item?.children) return collectLeafKeys(item.children);
        return typeof item?.key === 'string' && item.key.startsWith('/') ? [item.key] : [];
      });

    return collectLeafKeys(menuItems);
  }, [menuItems]);

  const selectedMenuKey = useMemo(() => {
    return menuRouteKeys
      .filter((route) => pathname === route || pathname.startsWith(`${route}/`))
      .sort((a, b) => b.length - a.length)?.[0];
  }, [menuRouteKeys, pathname]);

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
        selectedKeys={selectedMenuKey ? [selectedMenuKey] : []}
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
