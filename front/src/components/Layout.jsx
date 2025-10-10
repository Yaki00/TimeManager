import React, { useState } from 'react';
import {UserOutlined} from '@ant-design/icons';
import { Layout, Menu,Avatar, Divider } from 'antd';
import styled from 'styled-components';
import { Link } from 'react-router';
import { items } from '../utils/GetItemLayout.jsx';

const { Content, Sider, Header } = Layout;

const Profile = styled(	Link)`
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
  color: rgba(0, 0, 0, 0.88);
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

const MenuStyle = styled(Menu)`
  border-right: none !important;
  .ant-menu-item-selected {
	background-color: #C0C0F6 !important;
	color: white !important;
  }
`;

const HeaderStyle = styled(Header)`
  background: #fff;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const TitleSideStyle = styled.div`
  display: flex;
  align-items: center;
  justify-content: ${props => (props.collapsed ? 'center' : 'flex-start')};
  margin: 20px;
  & h2 {
	margin: 0;
	color: #c0c0f6;
	min-width: 100px;
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
			style={{
				backgroundColor: '#fff',
				display: 'flex',
				flexDirection: 'column',
			}}
		>
				<TitleSideStyle collapsed={collapsed}>
					{!collapsed ? 
						<h2>Time Master</h2> 
					: 
						<div style={{ height: '30px', width: '30px'}}>
							<svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
								<path d="M6 6H42L36 24L42 42H6L12 24L6 6Z" fill="#c0c0f6"></path>
							</svg>
						</div>
					}
				</TitleSideStyle>
			<div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', marginTop: '50px' }}>
				<MenuStyle
					defaultSelectedKeys={['1']}
					mode="inline"
					items={items}
					title=""
				/>
				<Profile to="/profile">
					{/* <UserOutlined />
					{!collapsed && <p>Profile</p>} */}
					 <Avatar  size={30} src="https://api.dicebear.com/7.x/miniavs/svg?seed=1" />
					 {/* {!collapsed && <p>Profile</p>} */}
				</Profile>
			</div>
				
		</SiderStyle>
		 {/* <HeaderStyle>
			
				<div>
					<h2 style={{ marginLeft: '20px' }}>{title}</h2>
				</div>
				<Profile to="/profile" $collapsed={collapsed}>
					<UserOutlined />
				</Profile>
		 </HeaderStyle> */}
		<Content style={{ margin: '30px 50px 30px 50px' }}>
			{children}
		</Content>
	</Layout>
)};