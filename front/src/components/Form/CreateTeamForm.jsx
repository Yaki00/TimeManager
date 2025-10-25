import React, { useState, useEffect } from 'react';
import { Form, Input, Select } from 'antd';
import styled from 'styled-components';

import { ButtonStyle } from '../../utils/ButtonStyle';
import { useUsers } from '../../service/useUser';
import { useUserStore } from '../../zustand/store';


export const CreateTeamForm = ({form, onFinish, initialValues}) => {
	const {users, loadingUsers} = useUsers();
	const [userlist, setUserlist] = useState([]);
	const userStore = useUserStore((state) => state.user);


	useEffect(() => {
		if (users && users.length > 0) {
			setUserlist(users.filter(u => u.id !== userStore.id));
		}
	}, [users, userStore.id]);

	if (loadingUsers || !users) return <div>Loading users...</div>;
console.log("User list for team creation:", initialValues);
	const formInitialValues = initialValues
		? {
				...initialValues,
				members: Array.isArray(initialValues.members)
					? initialValues.members.map(m => (m && typeof m === 'object' ? m.id : m))
					: [],
		  }
		: undefined;

	return (
		<Form
			form={form}
			name="basic"
			labelCol={{ span: 24 }}
			wrapperCol={{ span: 24 }}
			onFinish={onFinish}
			autoComplete="off"
			layout="vertical"
			initialValues={formInitialValues}
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
				<Input size="large" placeholder="Nom de la team" name="teamName" />
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
				options={ userlist?.filter(user => user.id !== "Manager").map(user => ({
					label: `${user.firstName} ${user.lastName}`,
					value: user.id,
				}))}
				loading={loadingUsers}
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