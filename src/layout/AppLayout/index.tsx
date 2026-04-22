'use client';
import { K_SIZE_0, K_SIZE_2, K_SIZE_254 } from '@constant';
import { Layout } from 'antd';
import Header from 'layout/AppLayout/components/Header';
import NavigationMenu from 'layout/AppLayout/components/NavigationMenu';
import { ReactNode } from 'react';
import { useResponsive } from 'utils/responsive';
import Footer from './components/Footer';

const { Sider, Content } = Layout;

const AppLayout = ({ children }: { children: ReactNode }) => {
  const { isDesktop } = useResponsive();

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {isDesktop && (
        <Sider
          breakpoint="lg"
          collapsedWidth="0"
          style={{
            overflow: 'auto',
            height: '100vh',
            position: 'fixed',
            display: 'block',
            zIndex: K_SIZE_2,
            left: K_SIZE_0,
            top: K_SIZE_0,
            bottom: K_SIZE_0,
            backgroundColor: 'rgb(var(--color-200)'
          }}
          className="tablet:hidden"
          width={K_SIZE_254}
          theme="light"
          trigger={null}
          collapsible
        >
          <NavigationMenu />
        </Sider>
      )}
      <Layout className="ml-[254px] tablet:ml-0">
        {!isDesktop && <Header />}
        <Content className="bg-color-50 px-24 py-16 mobile:px-12">{children}</Content>
        <Footer />
      </Layout>
    </Layout>
  );
};

export default AppLayout;
