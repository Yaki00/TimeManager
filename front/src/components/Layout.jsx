import React, { useState } from 'react';
import {UserOutlined} from '@ant-design/icons';
import { Layout, Menu } from 'antd';
import styled from 'styled-components';
import { Link } from 'react-router';
import { items } from '../utils/getItemLayout.jsx';

const { Content, Sider } = Layout;

const Profile = styled(	Link)`
  text-align: center;
  display: flex;
  padding: ${props => (props.$collapsed ? 0 : "0px 16px 0 24px")};
  gap: 10px;
  align-items: center;
  justify-content: ${props => (props.$collapsed ? 'center' : 'flex-start')};
  cursor: pointer;
  margin: 10px;
  height: 40px;
  color: rgba(0, 0, 0, 0.88);
  transition: all 0.3s;
  border-radius: 6px;

  &:hover {
	background-color: #C0C0F6 !important;
  color: white !important;
  }
  &p {
	margin: 0;
  }
`;

const SiderStyle = styled(Sider)`
	background-color: #fff;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	&.ant-layout-sider .ant-layout-sider-trigger {
		background-color: #fff !important;
		color: black !important;
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
  justify-content: space-between;
}
`;

const MenuStyle = styled(Menu)`
	margin-top: 20px;
  .ant-menu-item-selected {
	background-color: #C0C0F6 !important;
	color: white !important;
  }
`;

export const LayoutComponent = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
return (
	<Layout style={{ minHeight: '100vh' }}>
		<SiderStyle
		collapsible
		collapsed={collapsed}
		onCollapse={(value) => setCollapsed(value)}
		style={{
			backgroundColor: '#fff',
			display: 'flex',
			flexDirection: 'column',
			justifyContent: 'space-between',
		}}
	>
		<div>
			<MenuStyle
				defaultSelectedKeys={[	'1']}
				mode="inline"
				items={items}
				title=""
			/>
		</div>
		<Profile to="/profile" $collapsed={collapsed}>
			<UserOutlined />
			{!collapsed && <p>Profile</p>}
		</Profile>
		</SiderStyle>
		<Content style={{ margin: "30px 50px 30px 50px" }}>
			{children}
		</Content>
	</Layout>
);
};