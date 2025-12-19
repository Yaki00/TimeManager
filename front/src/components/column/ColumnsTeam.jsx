import { Button, message } from "antd";
import { DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { Link } from "react-router";
import { useDeleteTeam } from "../../service/useTeam";


const Action = ({ record, handleDelete, isLoading }) => {


	return (<div style={{ display: 'flex', gap: 8 }}>
			<Link to={`/teams/${record.id}`} state={{ id: record.id }}>
				<Button type="primary" icon={<EyeOutlined />}></Button>
			</Link>
			<Button 
				type="primary" 
				danger 
				icon={<DeleteOutlined />} 
				onClick={() => handleDelete(record)}
				loading={isLoading}
			></Button>
		</div>
	);
}
export const columnsTeam = (handleDelete, isLoading) => [
	{
		title: 'ID',
		dataIndex: 'id',
		key: 'id',
		width: "10%",
	},
	{
		title: 'Name',
		dataIndex: 'teamName',
		key: 'teamName',
		width: "20%",
		render: (text) => <p>{text}</p>,
	},
	{
		title: 'Members',
		dataIndex: 'members',
		key: 'members',
		width: "30%",
		render: (members) => (
			members.map(member => (
				member.firstName
			)).join(", ")
		),
	},
	{
		title: 'Description',
		dataIndex: 'description',
		key: 'description',
		width: "40%",
	},
	{
		title: 'Action',
		key: 'action',
		width: "10%",
		render: (_, record) => (
			<Action record={record}  handleDelete={handleDelete} isLoading={isLoading} />
		),
	}
];