import { Menu,Avatar, Popover, Button } from 'antd';
import styled from 'styled-components';
import { Link } from 'react-router';
import { items } from '../../utils/GetItemLayout.jsx';
import { useUserStore } from '../../zustand/store.js';
import { useNavigate } from 'react-router';


const MenuStyle = styled(Menu)`
  border-right: none !important;
  .ant-menu-item-selected {
	background-color: #C0C0F6 !important;
	color: white !important;
  }
`;
const Profile = styled.div`
  text-align: center;
  display: flex;
  gap: 10px;
  align-items: center;
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
export const MenuLayout = ({ collapsed }) => {
let navigate = useNavigate();


	const handleLogout = () => {
		useUserStore.getState().logout();
		navigate("/login");
	  }


	return (
		<div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
			<MenuStyle
				defaultSelectedKeys={['1']}
				mode="inline"
				items={items}
				title=""
			/>
			<Profile>
				<Popover
					placement={collapsed ? "right" : "top"}
					content={
						<Button type="primary" 
							style={{ backgroundColor: 'red', border: 'none' }}
							onClick={handleLogout}>
							Logout
						</Button>
					}
					>
					<Link to="/profile">
						<Avatar  size={30} src="https://api.dicebear.com/7.x/miniavs/svg?seed=1" />
					</Link>
				</Popover>
			</Profile>
		</div>
	)
}