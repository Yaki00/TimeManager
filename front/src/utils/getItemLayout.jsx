import { Link } from 'react-router';
import { DashboardOutlined, FieldTimeOutlined, SettingOutlined, FileSearchOutlined } from '@ant-design/icons';

const getItem = (
	label,
	icon,
	url,
) => {
	return {
    key: url,
    icon,
    label: <Link to={url}>{label}</Link>,
    url,
  };
}
  

export const items = [
  getItem('Dashboard', <DashboardOutlined />, '/'),
  getItem('Time', <FieldTimeOutlined />, '/time'),
  getItem('Teams', <SettingOutlined />, '/teams'),
  getItem('Recherche', <FileSearchOutlined />, '/search-user'),
];