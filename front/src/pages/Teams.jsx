import { Button, Card } from "antd";
import { Avatar, Input } from 'antd';
import { UserOutlined, AntDesignOutlined } from '@ant-design/icons';
import styled from "styled-components";
import { Link } from "react-router";
import React, { useState } from "react";

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



const CardStyle = styled(Card)`
  padding: 0px !important;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  height: 150px;
  .ant-card-body{
	padding: 10px;
  }
`;


export const Teams = () => {

	const [searchTerm, setSearchTerm] = useState(teams.teams);


	const handleSearch = (e) => {
		const value = e.target.value;
	const filteredTeams = teams.teams.filter(team => team.name.toLowerCase().includes(value.toLowerCase()));
	setSearchTerm(filteredTeams);

	console.log("Filtered Teams:", filteredTeams);

	}




	return (
		<>
		<h1>Teams</h1>
		<div style={{ marginTop: 50, display: 'flex', justifyContent: "space-between"}}>
			<Input placeholder="Search teams..." style={{width: 200}} onChange={(e) => handleSearch(e)}/>
			<Button type="primary" style={{marginLeft: 10, backgroundColor: "#9191fa", borderColor: "#9191fa"}}>Add Team</Button>
			</div>
		<div style={{display: 'grid', gap: 20, gridTemplateColumns: 'repeat(3, 1fr)', marginTop: 20,overflow : 'scroll', height: '70vh', paddingBottom: 10}}>
			{searchTerm.map(team => (
				<Link to={`/teams/${team.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
				<CardStyle key={team.id}>
					<div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', flexDirection: 'row'}}>
						<h2>{team.name}</h2>
						<Avatar.Group shape="square">
						{team.members.slice(0, 3).map(member => (
							<Avatar key={member.id} style={{ backgroundColor: '#f56a00' }}>{member.name.charAt(0)}</Avatar>
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
		
		</>
	)
}