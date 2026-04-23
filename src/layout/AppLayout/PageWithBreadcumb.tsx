import { memo } from 'react';
import { ItemType } from 'antd/es/breadcrumb/Breadcrumb';
import { Breadcrumb, Layout } from 'antd';

export interface PageWithHeaderProps {
  children: React.ReactNode;
  breadcrumbList?: ItemType[];
}
const { Content } = Layout;
const PageWithBreadcrumb = ({ children, breadcrumbList }: PageWithHeaderProps) => {
  return (
    <>
      {breadcrumbList && breadcrumbList.length > 0 && (
        <div className="flex h-36 w-full items-center bg-color-50 pl-24 mobile:px-12">
          <Breadcrumb className="w-full" items={breadcrumbList} />
        </div>
      )}
      <Content className="bg-color-50 px-24 py-8 mobile:px-12">{children}</Content>
    </>
  );
};

export default memo(PageWithBreadcrumb);
