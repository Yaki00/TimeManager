import React from 'react';
import { Card, Avatar, Button } from 'antd';
import styled from 'styled-components';
import { Link } from 'react-router';

import { DeleteOutlined } from '@ant-design/icons';


const CardStyle = styled(Card)`
  padding: 0px !important;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  height: 200px;
  overflow: hidden;
  .ant-card-body{
	padding: 10px;
	height: 100%;
    display: flex;
    justify-content: space-between;
    flex-direction: column;
  }
`;


export const TeamCard = ({ team, handleDelete }) => {
	return (
			<CardStyle>
		<Link to={`/teams/${team.id}`} state={{ id: team.id }} style={{ textDecoration: 'none', color: 'inherit' }} key={team.id}>

						<div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', flexDirection: 'row'}}>
							<h2>{team.teamName}</h2>
							<Avatar.Group shape="square">
								{team.members.slice(0, 3).map(member => (
									<Avatar key={member.id} style={{ backgroundColor: '#9191fa' }}>{member.firstName.charAt(0)}</Avatar>
								))}
								{team.members.length > 3 && <Avatar>+{team.members.length - 3}</Avatar>}
							</Avatar.Group>
						</div>
						<div style={{marginTop: 10}}>
							<p>{team.description}</p>
						</div>
		</Link>

						<div style={{    display: "flex", justifyContent: "flex-end", alignItems: "flex-end", height: "100%", width: "100%"}}>
				<Button type="primary" icon={<DeleteOutlined />}  danger onClick={() => handleDelete(team)} />
						</div>
			</CardStyle>
	)
}