import { Button, Table , Modal, Form, Input, Select} from "antd";
import { Breadcrumbs } from "../utils/Breadcrumb";
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useState } from "react";
import { ButtonStyle } from "../utils/ButtonStyle";
import { getRoles } from "../utils/getRoles";
import styled from "styled-components";
import { CreateTeamForm } from "../components/form/CreateTeamForm";
import { useUserStore } from "../zustand/store";
import { useLocation } from "react-router";
import { useCreateTeam, useGetTeamById, useUpdateTeam } from "../service/useTeam";
import { useGetAllLeavesForTeam } from "../service/useLeave";


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

const columns = [
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
		width: "30%",
	},
	{
		title: 'Rôle',
		dataIndex: 'role',
		key: 'role',
	},
	{
		title: 'demandes',
	}
];



const TableStyle = styled(Table)`
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(145, 145, 250, 0.1);

  .ant-table {
    border-radius: 12px;
    overflow: hidden;
  }
  .ant-table-thead > tr > th {
    background-color: #ffffff;
    color: #2d2d69;
    font-weight: 600;
    font-size: 14px;
    padding: 12px 16px;
  }

  .ant-table-tbody > tr:nth-child(even) > td {
    background-color: #faf9ff;
  }

  .ant-table-cell {
    padding: 14px 12px;
    font-size: 14px;
    color: #333366;
  }

  .ant-table-footer {
    background-color: #ffffff;
    color: #2d2d69;
    font-weight: 600;
    font-size: 14px;
    padding: 12px 16px;
    border-radius: 0 0 12px 12px;
    box-shadow: 0 -2px 10px rgba(145, 145, 250, 0.15);
  }
`;

export const TeamDetails = () => {
	let { state} = useLocation();
	const { data: teamsData, isLoading: loadingTeams } = useGetTeamById(state.id);
	const [iseUpdateTeamModalOpen, setIsUpdateTeamModalOpen] = useState(false);
	const {updateTeamAsync} = useUpdateTeam();
	const { data: leavesData, isLoading: loadingLeaves } = useGetAllLeavesForTeam(state.id);
	const Footer = () => {
  return (<div style={{  }}>
	<ButtonStyle type="primary" onClick={() => setIsUpdateTeamModalOpen(true)}>update team</ButtonStyle>
  </div>
  )
}
const onFinish = async (values) => {
	const data = {
		...values,
		id: state.id,
	}
	const response = await updateTeamAsync(data);
	console.log("Update team response:", response);
	setIsUpdateTeamModalOpen(false);
}

if(loadingTeams || loadingLeaves) return <div>Loading...</div>
console.log("leavesData:", leavesData);


	return (
		<>
		<Breadcrumbs
				items={[
				  { label: "Dashboard", path: "/" },
				  { label: "Teams", path: "/teams" },
				  { label: "Team Details" },
				]}
			  />
			<h1>Team {teamsData?.teamName}</h1>
			<div style={{marginTop: 40}}>

<TableStyle dataSource={teamsData.members} columns={columns} pagination={false} footer={() => <Footer />} />
			<Modal
				title={<span style={{ fontWeight: 700, fontSize: 22 }}>Update Team</span>}
				open={iseUpdateTeamModalOpen}
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
				<CreateTeamForm onFinish={onFinish}  teams={{teams: []}} initialValues={teamsData || {}} />
			</Modal>
			</div>
		</>
	)
}
