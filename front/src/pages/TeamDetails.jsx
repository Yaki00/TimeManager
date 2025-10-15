import { Table, Breadcrumb } from "antd";

const dataSource = [
  {
    key: '1',
    name: 'Mike',
    age: 32,
    address: '10 Downing Street',
  },
  {
    key: '2',
    name: 'John',
    age: 42,
    address: '10 Downing Street',
  },
];

const columns = [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: 'Age',
    dataIndex: 'age',
    key: 'age',
  },
  {
    title: 'Address',
    dataIndex: 'address',
    key: 'address',
  },
  {
	title: 'Action',
	key: 'action',
	render: (_, record) => <ActionColumn record={record} />,
  }
];




const ActionColumn = ({ text, record }) => (
  <span>
	<a style={{ marginRight: 16 }}>Edit</a>
	<a>Delete</a>
  </span>
);


export const TeamDetails = () => {
	return (
		<>
			<h1>Team Details</h1>
			<div style={{marginTop: 50}}>

			<Table dataSource={dataSource} columns={columns} />
			</div>
		</>
	)
}
