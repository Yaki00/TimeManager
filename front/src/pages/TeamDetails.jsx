import { Button, Table , Modal, Form, Input, Select} from "antd";
import { Breadcrumbs } from "../utils/Breadcrumb";
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useState } from "react";
import { ButtonStyle } from "../utils/ButtonStyle";
import { getRoles } from "../utils/getRoles";
import styled from "styled-components";
import { CreateTeamForm } from "../components/Form/CreateTeamForm";
import { useUserStore } from "../zustand/store";

const dataSource = 

[
  {
    key: '1',
    lastName: 'Mike',
	firstName: 'John',
	email: 'john@example.com',
	role: 'Admin',
  },
  {
	key: '2',
	lastName: 'Doe',
	firstName: 'Jane',
	email: 'jane@example.com',
	role: 'User',
  },
];

const columns = (handleEditUser, handleDeleteUser) => [
	{
		title: 'Nom',
		dataIndex: 'lastName',
		key: 'lastName',
	},
	{
		title: 'Prenom',
		dataIndex: 'firstName',
		key: 'firstName',
	},
	{
		title: 'Email',
		dataIndex: 'email',
		key: 'email',
	},
	{
		title: 'Rôle',
		dataIndex: 'role',
		key: 'role',
	},
	{
		title: 'Action',
		key: 'action',
		render: (_, record) => <ActionColumn record={record} handleEditUser={handleEditUser} handleDeleteUser={handleDeleteUser} />,
	}
];


const ActionColumn = ({ text, record, handleEditUser, handleDeleteUser }) => (
  <div>
	<Button type="primary" icon={<EditOutlined />} style={{ marginRight: 8 }} onClick={() => handleEditUser(record)} />
	<Button type="danger" icon={<DeleteOutlined />} style={{ backgroundColor: 'red', borderColor: 'red', color: 'white' }} onClick={() => handleDeleteUser(record)} />
  </div>
);




const TableStyle = styled(Table)`
  .ant-table{
	border-radius: 8px;
  }
  .ant-table-thead > tr > th {
  }
  .ant-table-footer{
	border-radius: 8px;
	padding: 10px 16px;
  }
  .ant-table-thead{
	background-color: #fafafa;
  }
`;

export const TeamDetails = () => {
	  const [isModalOpen, setIsModalOpen] = useState(false);
	  const [isModalDeleteOpen, setIsModalDeleteOpen] = useState(false);
	  const [iseUpdateTeamModalOpen, setIsUpdateTeamModalOpen] = useState(false);
	const [selectedRecord, setSelectedRecord] = useState(null);

	const preference = useUserStore((state) => state.user.preferences.filterTeams);
console.log("Preference in TeamDetails:", preference);
	const Footer = () => {
  return (<div style={{  }}>
	<ButtonStyle type="primary" onClick={() => setIsUpdateTeamModalOpen(true)}>update team</ButtonStyle>
  </div>
  )
}
const showModalEditUser = () => {
    setIsModalOpen(true);
  };

  const handleOkEdit = () => {
    setIsModalOpen(false);
  };

  const handleCancelEdit = () => {
    setIsModalOpen(false);
  };
  const handleOk = () => {
	setIsModalDeleteOpen(false);
  };
  
  const handleCancel = () => {
	setIsModalDeleteOpen(false);
  }

  const handleEditUser = (record) => {
	console.log("Record to edit:", record);
    setSelectedRecord(record);
    showModalEditUser();
  };
  const handleDeleteUser = (record) => {
	console.log("Record to delete:", record);
	setSelectedRecord(record);
	setIsModalDeleteOpen(true);
  };


  console.log(getRoles());
	return (
		<>
		<Breadcrumbs
				items={[
				  { label: "Dashboard", path: "/" },
				  { label: "Teams", path: "/teams" },
				  { label: "Team Details" },
				]}
			  />
			<h1>Team Details</h1>
			<div style={{marginTop: 40}}>

<TableStyle dataSource={dataSource} columns={columns(handleEditUser,handleDeleteUser)} pagination={false} footer={() => <Footer />} />
			<Modal
				title={<span style={{ fontWeight: 700, fontSize: 22 }}>modification d'un membre</span>}
				open={isModalOpen}
				onOk={handleOkEdit}
				onCancel={handleCancelEdit}
				centered
				footer={null}
				width={600}
				styles={{
					body: {
						background: "#efedfa",
						borderRadius: 12,
						padding: "32px 24px"
					}
				}}>
				<Form
					name="basic"
					labelCol={{ span: 24 }}
					wrapperCol={{ span: 24 }}
					// onFinish={onFinish}
					// onFinishFailed={onFinishFailed}
					initialValues={
						{
							lastName: selectedRecord ? selectedRecord.lastName : '',
							firstName: selectedRecord ? selectedRecord.firstName : '',
							role: selectedRecord ? selectedRecord.role : '',
							email: selectedRecord ? selectedRecord.email : '',
						}
					}
					autoComplete="off"
					layout="vertical"
					style={{
						width: "100%",
						background: "#fff",
						borderRadius: 10,
						padding: 24,
						boxShadow: "0 2px 8px rgba(0,0,0,0.06)"
					}}
				>
				<div style={{display: 'flex', gap: 24}}>
					<Form.Item
						label={<span style={{ fontWeight: 500 }}>Nom du membre</span>}
						name="lastName"
						rules={[{ required: true, message: 'Please input the user name!' }]}
						style={{ flex: 1 }}
					>
						<Input size="large" placeholder="Nom du membre" />
					</Form.Item>
					<Form.Item
					label={<span style={{ fontWeight: 500 }}>Prénom</span>}
					name="firstName"
					rules={[{ required: true, message: 'Please input the first name!' }]}
					style={{ flex: 1 }}
					>
						<Input size="large" placeholder="Prénom" />
					</Form.Item>
					
				</div>
				<Form.Item
					label={<span style={{ fontWeight: 500 }}>Rôle</span>}
					name="role"
					rules={[{ required: true, message: 'Please input the role!' }]}
					style={{ flex: 1 }}
					>
					<Input disabled={getRoles() !== "Admin"} size="large" placeholder="Rôle" />
					</Form.Item>
				<Form.Item
				label={<span style={{ fontWeight: 500 }}>Email</span>}
				name="email"
				rules={[{ required: true, message: 'Please input the email!' }]}
				>
				<Input size="large" placeholder="Email" />
				</Form.Item>
				<Form.Item label={null}>
				<ButtonStyle type="primary" htmlType="submit" style={{ width: "100%", height: 40, fontWeight: 600, fontSize: 16 }}>
					Submit
				</ButtonStyle>
				</Form.Item>
			</Form>
			</Modal>
			<Modal
				title={<span style={{ fontWeight: 700, fontSize: 22 }}>Suppression d'un membre</span>}
				open={isModalDeleteOpen}
				onOk={handleOk}
				onCancel={handleCancel}
				centered
				footer={null}
				width={600}
				>
			<div>
				<p>Êtes-vous sûr de vouloir supprimer {selectedRecord ? selectedRecord.firstName : ''} {selectedRecord ? selectedRecord.lastName : ''}?</p>
				<div style={{display: 'flex', justifyContent: 'flex-end', gap: 10}}>
					<Button onClick={handleCancel} >Cancel</Button>
					<Button type="danger" style={{ backgroundColor: 'red', borderColor: 'red', color: 'white' }}>Delete</Button>
				</div>
				</div>
			</Modal>

			<Modal
				title={<span style={{ fontWeight: 700, fontSize: 22 }}>Update Team</span>}
				open={iseUpdateTeamModalOpen}
				onOk={() => setIsUpdateTeamModalOpen(false)}
				onCancel={() => setIsUpdateTeamModalOpen(false)}
				centered
				footer={null}
				width={600}
				styles={{
					body: {
						background: "#efedfa",
						borderRadius: 12,
						padding: "32px 24px"
					}
				}}>
				<CreateTeamForm onFinish={() => {}} onFinishFailed={() => {}} teams={{teams: []}} initialValues={selectedRecord || {}} />
			</Modal>
			</div>
		</>
	)
}
