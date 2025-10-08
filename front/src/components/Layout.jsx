import React, { useState } from 'react';
import "../index.css";
import {
  DashboardOutlined,
  FieldTimeOutlined,
  SettingOutlined,
  FileSearchOutlined,
  UserOutlined
} from '@ant-design/icons';
import { Breadcrumb, Layout, Menu, theme } from 'antd';
import styled from 'styled-components';
import { Link } from 'react-router';

const { Content, Sider } = Layout;

const Profile = styled(Link)`
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

const MenuStyle = styled(Menu)`
  .ant-menu-item-selected {
	background-color: #C0C0F6 !important;
	color: white !important;
  }
`;




function getItem(
  label,
  key,
  icon,
  children,
  title,
  url,
){
  return {
	key,
	icon,
	children,
	label : <Link to={url}>{label}</Link>,
	title: "",
	url
  };
}

const items  = [
  getItem('Dashboard', '1', <DashboardOutlined />, null, 'Dashboard', '/'),
  getItem('Time', '2', <FieldTimeOutlined />, null, 'Time', '/time'),
  getItem('Teams', '3', <SettingOutlined />, null, 'Teams', '/teams'),
  getItem('Recherche', '4', <FileSearchOutlined />, null, 'Recherche', '/search-user'),
];

const LayoutComponent = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);

return (
	<Layout style={{ minHeight: '100vh' }}>
		<Sider
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
				defaultSelectedKeys={['1']}
				mode="inline"
				items={items}
				title=""
				style={{ marginTop: '20px' }}
			/>
		</div>
		<Profile to="/profile" $collapsed={collapsed}>
			<UserOutlined />
			{!collapsed && <p>Profil</p>}
		</Profile>
		</Sider>

		<Content style={{ margin: "30px 50px 30px 50px" }}>
			{children}
		</Content>
	</Layout>
);
};

export default LayoutComponent;