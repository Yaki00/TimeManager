import { Link } from 'react-router';
import { DashboardOutlined, FieldTimeOutlined, SettingOutlined, FileSearchOutlined, TeamOutlined } from '@ant-design/icons';
import { getRoles } from './getRoles';

const getItem = (
	label,
	icon,
	url,
	roles = ['Employer', 'Manager', 'responsable'],
) => {
	return {
		key: url,
		icon,
		label: <Link to={url}>{label}</Link>,
		url,
		roles,
	};
}

const allItems = [
	getItem('Dashboard', <DashboardOutlined />, '/'),
	getItem('Time', <FieldTimeOutlined />, '/time'),
	getItem('Teams', <SettingOutlined />, '/teams', ['Manager', 'responsable']),
	getItem('Effectif', <TeamOutlined />, '/effectif', ['Manager', 'responsable']),
	getItem('Recherche', <FileSearchOutlined />, '/search-user', ['responsable']),
];

export const getFilteredItems = () => {
	const userRole = getRoles();
	if (!userRole) return allItems.filter(item => item.roles.includes('Employer'));

	return allItems.filter(item => item.roles.includes(userRole));
};

export const items = getFilteredItems();