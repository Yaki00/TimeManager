import React, { useState } from 'react';
import { Layout, Divider, Button } from 'antd';
import styled from 'styled-components';
import { RightOutlined, LeftOutlined } from '@ant-design/icons';
import { TitleLayout } from './Title.jsx';
import { MenuLayout } from './Menu.jsx';
import { useLocation } from 'react-router';

const { Content, Sider } = Layout;

const SiderStyle = styled(Sider)`
  background-color: #fff;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  border-right: 1px solid #f0f0f0 !important;

  .ant-layout-sider-children {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  li:hover {
    background-color: #C0C0F6 !important;
    color: white !important;
  }

  span, a {
    transition: none !important;
  }
`;

export const LayoutComponent = ({ children }) => {
  const [collapsed, setCollapsed] = useState(true);
   const location = useLocation();

  return (
    <Layout style={{ height: '100vh' }}>
      <SiderStyle
        collapsible
        trigger={null} 
        collapsed={collapsed}
        width={220}
      >
        <TitleLayout collapsed={collapsed} />

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <MenuLayout collapsed={collapsed} />
          <div style={{ textAlign: 'center', paddingBottom: 16, paddingTop: 10 }}>
            <Button
              type="text"
              icon={collapsed ? <RightOutlined /> : <LeftOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{
                fontSize: 18,
                color: '#9191fa',
                border: 'none',
                transition: 'all 0.3s ease'
              }}
            />
          </div>
        </div>
      </SiderStyle>
      <Content style={{ margin: location.pathname !== "/profile" ? '50px 50px 0 50px' : '0', overflow: location.pathname === "/profile" ? "scroll" : "auto" }}>{children}</Content>
    </Layout>
  );
};
