'use client';

import { CaretRightOutlined } from '@ant-design/icons';
import { K_SIZE_90 } from '@constant';
import { Collapse, CollapseProps } from 'antd';
import { useMemo } from 'react';
import { UseFormReturn } from 'react-hook-form';
import PermissionGroupBody from 'screens/authentication/manage-permission-group/form/components/PermissionCollapseView/PermissionGroupBody';
import PermissionGroupHeader from 'screens/authentication/manage-permission-group/form/components/PermissionCollapseView/PermissionGroupHeader';
import { PermissionGroupForm } from 'screens/authentication/manage-permission-group/hooks/useManagePermissionGroupForm';
import { PermissionGroup } from 'screens/authentication/manage-permission-group/utils/type';

interface PermissionCollapseViewProps {
  permissionGroup: PermissionGroup[];
  form: UseFormReturn<PermissionGroupForm>;
}

const PermissionCollapseView = ({ permissionGroup, form }: PermissionCollapseViewProps) => {
  const collapseItems = useMemo(() => {
    return permissionGroup.map((item) => ({
      key: item.moduleId,
      label: <PermissionGroupHeader data={item} form={form} />,
      children: <PermissionGroupBody data={item} form={form} />,
      className: '!border-b-weight-none',
      classNames: {
        header: 'bg-primary-50 !rounded-radius-m',
        body: '!pb-0 !pt-8'
      }
    })) as CollapseProps['items'];
  }, [permissionGroup, form]);

  return (
    <Collapse
      bordered={false}
      expandIconPosition="end"
      collapsible="icon"
      expandIcon={({ isActive }) => (
        <CaretRightOutlined rotate={isActive ? -K_SIZE_90 : K_SIZE_90} />
      )}
      className="grid grid-cols-2 items-start gap-16 bg-color-50 mobile:grid-cols-1"
      items={collapseItems}
    />
  );
};

export default PermissionCollapseView;
