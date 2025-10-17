import React from 'react';
import { Form, Input, Select } from 'antd';
import styled from 'styled-components';

import { ButtonStyle } from '../../utils/ButtonStyle';


export const CreateTeamForm = ({onFinish, onFinishFailed, teams, initialValues}) => {
	return (
		<Form
			name="basic"
			labelCol={{ span: 24 }}
			wrapperCol={{ span: 24 }}
			onFinish={onFinish}
			onFinishFailed={onFinishFailed}
			initialValues={initialValues}
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
				label={<span style={{ fontWeight: 500 }}>Nom de la team</span>}
				name="teamName"
				rules={[{ required: true, message: 'Please input the team name!' }]}
				style={{ flex: 1 }}
			>
				<Input size="large" placeholder="Nom de la team" />
			</Form.Item>
			<Form.Item
			label={<span style={{ fontWeight: 500 }}>Membres</span>}
			name="members"
			rules={[{ required: true, message: 'Please input at least one member!' }]}
			style={{ flex: 1 }}
			>
			<Select
				mode="multiple"
				placeholder="Select members"
				options={ teams.teams.flatMap(team => {
					return team.members.map(member => ({ value: member.id, label: member.name }));
				})}
				size="large"
				style={{ width: "100%" }}
			/>
			</Form.Item>
		</div>
		<Form.Item
		label={<span style={{ fontWeight: 500 }}>Déscription</span>}
		name="description"
		rules={[{ required: true, message: 'Please input the description!' }]}
		>
		<Input.TextArea rows={4} size="large" placeholder="Description de la team" style={{ resize: "none" }} />
		</Form.Item>
		<Form.Item label={null}>
		<ButtonStyle type="primary" htmlType="submit" style={{ width: "100%", height: 40, fontWeight: 600, fontSize: 16 }}>
			Submit
		</ButtonStyle>
		</Form.Item>
	</Form>	
	)
};