import { Link } from 'react-router';
import { DashboardOutlined, FieldTimeOutlined, SettingOutlined, FileSearchOutlined } from '@ant-design/icons';

const getItem = (
	label,
	key,
	icon,
	children,
	title,
	url,
) => {
	return {
		key,
		icon,
		children,
		label: <Link to={url}>{label}</Link>,
	  	title: "",
	 	url
	};
}
  
export const items  = [
	getItem('Dashboard', '1', <DashboardOutlined />, null, 'Dashboard', '/'),
	getItem('Time', '2', <FieldTimeOutlined />, null, 'Time', '/time'),
	getItem('Teams', '3', <SettingOutlined />, null, 'Teams', '/teams'),
	getItem('Recherche', '4', <FileSearchOutlined />, null, 'Recherche', '/search-user'),
];