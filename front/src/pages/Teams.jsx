import { Button, Card, Avatar, Input , Modal, Form, Select, Divider, Table } from "antd";
import { UserOutlined, AntDesignOutlined, EyeOutlined,DeleteOutlined } from '@ant-design/icons';
import styled from "styled-components";
import { Link } from "react-router";
import React, { useEffect, useState } from "react";
import { Breadcrumbs } from "../utils/Breadcrumb";
import { CreateTeamForm } from "../components/Form/CreateTeamForm";
import { ButtonStyle } from "../utils/ButtonStyle";
import { useUserStore } from "../zustand/store";

const teams = {
	  "teams": [
			{
				"id": 1,
				"name": "Development",
				"members": [
					{ "id": 1, "name": "Alice Johnson", "role": "Frontend Developer" },
					{ "id": 2, "name": "Bob Smith", "role": "Backend Developer" },
					{ "id": 5, "name": "Eve Adams", "role": "Full Stack Developer" },

				],
				"description": "Handles all development tasks. "
			},
			{
				"id": 2,
				"name": "Marketing",
				"members": [
					{ "id": 3, "name": "Charlie Brown", "role": "SEO Specialist" },
					{ "id": 4, "name": "Diana Prince", "role": "Content Strategist" }
				],
				"description": "Responsible for marketing and outreach."
			},
			{
				"id": 3,
				"name": "Design",
				"members": [
					{ "id": 6, "name": "Frank Castle", "role": "UI/UX Designer" },
					{ "id": 7, "name": "Grace Hopper", "role": "Graphic Designer" }
				],
				"description": "Focuses on user experience and visual design."
			},
			{
				"id": 4,
				"name": "Sales",
				"members": [
					{ "id": 8, "name": "Hank Pym", "role": "Sales Manager" },
					{ "id": 9, "name": "Ivy League", "role": "Account Executive" }
				],
				"description": "Manages client relationships and sales."
			},
			{
				"id": 5,
				"name": "HR",
				"members": [
					{ "id": 10, "name": "Jack Ryan", "role": "HR Manager" },
					{ "id": 11, "name": "Karen Page", "role": "Recruiter" }
				],
				"description": "Oversees recruitment and employee relations."
			},
			{
				"id": 6,
				"name": "Support",
				"members": [
					{ "id": 12, "name": "Leo Messi", "role": "Support Specialist" },
					{ "id": 13, "name": "Mia Wong", "role": "Customer Service Rep" }
				],
				"description": "Provides customer support and assistance."
			},
			{
				"id": 7,
				"name": "Finance",
				"members": [
					{ "id": 14, "name": "Nina Simone", "role": "Financial Analyst" },
					{ "id": 15, "name": "Oscar Wilde", "role": "Accountant" }
				],
				"description": "Manages company finances and budgeting."
			},
			{
				"id": 8,
				"name": "Operations",
				"members": [
					{ "id": 16, "name": "Paul Allen", "role": "Operations Manager" },
					{ "id": 17, "name": "Quincy Jones", "role": "Logistics Coordinator" }
				],
				"description": "Ensures smooth day-to-day operations."	

			},
			{
				"id": 9,
				"name": "Legal",
				"members": [
					{ "id": 18, "name": "Rachel Green", "role": "Legal Advisor" },
					{ "id": 19, "name": "Steve Rogers", "role": "Compliance Officer" }
				],
				"description": "Handles legal matters and compliance."
			},
			{
				"id": 10,
				"name": "Product",
				"members": [
					{ "id": 20, "name": "Tony Stark", "role": "Product Manager" },
					{ "id": 21, "name": "Uma Thurman", "role": "Business Analyst" }
				],
				"description": "Oversees product development and strategy."
			}
		]
};



const columns = [
	{
		title: 'Name',
		dataIndex: 'name',
		key: 'name',
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
				member.name
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
			<div style={{ display: 'flex', gap: 8 }}>
			<Link to={`/teams/${record.id}`}>
				<Button type="primary" icon={<EyeOutlined />}></Button>
			</Link>
			<Button type="primary" danger icon={<DeleteOutlined />}></Button>
		</div>
		),
	}
];


const CardStyle = styled(Card)`
  padding: 0px !important;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  height: 150px;
  .ant-card-body{
	padding: 10px;
  }
`;

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


export const Teams = () => {
	const preference = useUserStore((state) => state.user.preferences.filterTeams);
	const setPreferences = useUserStore((state) => state.setPreferences);
	const [searchTerm, setSearchTerm] = useState(teams.teams);
	const [isModalOpen, setIsModalOpen] = useState(false);

	const onFinish = (values) => {
		console.log('Success:', values);
	};

	const onFinishFailed = (errorInfo) => {
		console.log('Failed:', errorInfo);
	};

	const showModal = () => {
		setIsModalOpen(true);
	};

	const handleOk = () => {
		setIsModalOpen(false);
	};

	const handleCancel = () => {
		setIsModalOpen(false);
	};

	const toggleView = () => {
		const newPreference = preference === "card" ? "table" : "card";
		setPreferences({ filterTeams: newPreference });
		console.log("New Preference:", newPreference);
	};



	const handleSearch = (e) => {
		const value = e.target.value;
	const filteredTeams = teams.teams.filter(team => team.name.toLowerCase().includes(value.toLowerCase()));
	setSearchTerm(filteredTeams);

	console.log("Filtered Teams:", filteredTeams);
	}

	const Footer = () => {
		  return (<div style={{ textAlign: 'right' }}>
			<p style={{marginRight:20}}>Total: {searchTerm.length}</p>
		</div>);
	}

	
	return (
		<>
		<Breadcrumbs
			items={[
			{ label: "Dashboard", path: "/" },
			{ label: "Teams" },
			]}
		/>
		<h1>Teams</h1>
		<div style={{ marginTop: 40, }}>
			<div style={{display: 'flex', justifyContent: "space-between"}}>
				<div>
					<Input placeholder="Search teams..." style={{width: 200}} onChange={(e) => handleSearch(e)}/>
					<Divider type="vertical" />
					<Button icon={<AntDesignOutlined />} shape="circle" onClick={toggleView}/>
				</div>
				<ButtonStyle type="primary" onClick={showModal}>create team</ButtonStyle>
			</div>
			<Modal
				title={<span style={{ fontWeight: 700, fontSize: 22 }}>Création d'une équipe</span>}
				open={isModalOpen}
				onOk={handleOk}
				onCancel={handleCancel}
				centered
				footer={null}
				width={600}
				styles={{
					body: {
						background: "#efedfa",
						borderRadius: 12,
						padding: "32px 24px"
					}
				}}
				
			>
				<CreateTeamForm onFinish={onFinish} onFinishFailed={onFinishFailed} teams={teams} initialValues={{}} />
	  		</Modal>
			{preference === "card" ? (

			<div style={{display: 'grid', gap: 20, gridTemplateColumns: 'repeat(3, 1fr)', marginTop: 20,overflow : 'scroll', height: '70vh', paddingBottom: 10}}>
				{searchTerm.map(team => (
					<Link to={`/teams/${team.id}`} style={{ textDecoration: 'none', color: 'inherit' }} key={team.id}>
					<CardStyle >
						<div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', flexDirection: 'row'}}>
							<h2>{team.name}</h2>
							<Avatar.Group shape="square">
							{team.members.slice(0, 3).map(member => (
								<Avatar key={member.id} style={{ backgroundColor: '#9191fa' }}>{member.name.charAt(0)}</Avatar>
							))}
							{team.members.length > 3 && <Avatar>+{team.members.length - 3}</Avatar>}
							</Avatar.Group>
						</div>
						<div style={{marginTop: 10}}>
							<p>{team.description}</p>
						</div>
					</CardStyle>
					</Link>
				))}
			</div>
		) : (
			<div style={{marginTop: 20}}>
				<TableStyle columns={columns} dataSource={searchTerm} pagination={false} scroll={{ y: 450 }} footer={() => <Footer />} />
			</div>
		)}
		</div>
		</>
	);
}