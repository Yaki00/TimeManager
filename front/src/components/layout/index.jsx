import React, { useState } from 'react';
import { Layout } from 'antd';
import styled from 'styled-components';
import { TitleLayout } from './Title.jsx';
import { MenuLayout } from './Menu.jsx';

const { Content, Sider } = Layout;

const Profile = styled.div`
  text-align: center;
  display: flex;
  /* padding: ${props => (props.$collapsed ? 0 : '0px 16px 0 24px')}; */
  gap: 10px;
  align-items: center;
  /* justify-content: ${props => (props.$collapsed ? 'center' : 'flex-start')}; */
  justify-content: center;
  cursor: pointer;
  margin: 10px;
  height: 40px;
  transition: all 0.3s;
  border-radius: 6px;

  /* &:hover {
	background-color: #C0C0F6 !important;
  color: white !important;
  } */
  &p {
	margin: 0;
  }
`;

const SiderStyle = styled(Sider)`
	background-color: #fff;
	display: flex;
	flex-direction: column;
	
	&.ant-layout-sider{
	border-right: 1px solid #f0f0f0 !important;
	}
	&.ant-layout-sider .ant-layout-sider-trigger {
		background-color: #fff !important;
		color: black !important;
	border-right: 1px solid #f0f0f0 !important;

	}
		li:hover {
		background-color: #C0C0F6 !important;
		color: white !important;
		transition: none !important;
		}
	span,a {
		transition: none !important;
	}
	.ant-layout-sider-children{
  display: flex;
  flex-direction: column;

}
`;




export const LayoutComponent = ({ children, title }) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
  	<Layout style={{ minHeight: '100vh' }}>
		<SiderStyle
			collapsible
			collapsed={collapsed}
			onCollapse={(value) => setCollapsed(value)}
		>
			<TitleLayout collapsed={collapsed} />
			<MenuLayout collapsed={collapsed} />
		</SiderStyle>
		<Content style={{ margin: '50px' }}>
			{children}
		</Content>
	</Layout>
)};