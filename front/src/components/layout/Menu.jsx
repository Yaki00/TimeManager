import { Menu,Avatar, Popover, Button } from 'antd';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { items } from '../../utils/GetItemLayout.jsx';
import { useUserStore } from '../../zustand/store.js';
import { useNavigate,useLocation } from 'react-router';


const MenuStyle = styled(Menu)`
  border-right: none !important;
  .ant-menu-item-selected {
	background-color: #9191fa !important;
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
  const navigate = useNavigate();
 const location = useLocation();
  const handleLogout = () => {
    useUserStore.getState().logout();
    navigate("/login");
  };
 const selectedKey = location.pathname === "/profile" ? [] : [location.pathname];
  return (
    <>
      <MenuStyle
        mode="inline"
        defaultSelectedKeys={['1']}
        items={items}
		selectedKeys={selectedKey}
        style={{ flex: 1, borderRight: 'none' }}
      />
      <Profile>
        <Popover
          placement={collapsed ? "right" : "top"}
          content={
            <Button
              type="primary"
              danger
              style={{ border: 'none' }}
              onClick={handleLogout}
            >
              Logout
            </Button>
          }
        >
          <Link to="/profile">
            <Avatar
              size={40}
              src="https://api.dicebear.com/7.x/miniavs/svg?seed=1"
              style={{
                border: '2px solid #9191fa',
                transition: 'all 0.3s ease'
              }}
            />
          </Link>
        </Popover>
      </Profile>
    </>
  );
};
