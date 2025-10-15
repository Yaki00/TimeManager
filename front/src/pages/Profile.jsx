import { Form, Input, Button,message, Divider, Spin } from 'antd';
import { useUserStore } from '../zustand/store';
import React, {useState} from 'react';





export const Profile = () => {
	const [edited, setEdited] = useState(false);


	const data = useUserStore((state) => state.user);
	console.log("User data in Profile:", data.firstName);


	const onFinish = (values) => {
		console.log('Profile Update Values:', values);
	}

	return (
		<>
			<h1>Profile Page</h1>
			<p>This is the profile page.</p>
			{!data ? <Spin /> : <div style={{marginTop: 50, display: 'flex', gap: 20, width: "100%"}}>
				<div>
					<h2>Change Password</h2>
				<Form 
					layout="vertical" 
					style={{ width: 400 }} 
					onFinish={onFinish}
				 	initialValues={{
						firstName: data.firstName,
						lastName: data.lastName,
						email: data.email,
						phoneNumber: data.phoneNumber,
						role: data.role,
					}}
					>
					<Form.Item label="First Name" name="firstName">
						<Input disabled={!edited} />
					</Form.Item>
					<Form.Item label="Last Name" name="lastName">
						<Input disabled={!edited} />
					</Form.Item>
					<Form.Item label="Email" name="email">
						<Input disabled={!edited} />
					</Form.Item>
					<Form.Item label="Phone Number" name="phoneNumber">
						<Input disabled={!edited} />
					</Form.Item>
					<Form.Item label="Role" name="role">
						<Input disabled />
					</Form.Item>
					<Button type="primary" htmlType="submit" disabled={!edited}>
						Update Profile
					</Button>
					<Button onClick={() => setEdited(!edited)}>
						Edit
					</Button>
				</Form>
				</div>
				
				<div>
					<h2>Change Password</h2>
					<Form
						layout="vertical"
						style={{ width: 400 }}
						onFinish={(values) => {
							console.log('Change Password Values:', values);
							message.success('Password change functionality is not implemented yet.');
						}}
					>
						<Form.Item
							label="Current Password"
							name="currentPassword"
							rules={[{ required: true, message: 'Please input your current password!' }]}
						>
							<Input.Password />
						</Form.Item>
						<Form.Item
							label="New Password"
							name="newPassword"
							rules={[{ required: true, message: 'Please input your new password!' }]}
						>
							<Input.Password />
						</Form.Item>
						<Form.Item
							label="Confirm New Password"
							name="confirmNewPassword"
							dependencies={['newPassword']}
							rules={[
								{ required: true, message: 'Please confirm your new password!' },	
								({ getFieldValue }) => ({
									validator(_, value) {
										if (!value || getFieldValue('newPassword') === value) {
											return Promise.resolve();
										}
										return Promise.reject(new Error('The two passwords do not match!'));
									},
								}),
							]}
						>
							<Input.Password />
						</Form.Item>
						<Form.Item>
							<Button type="primary" htmlType="submit">
								Change Password
							</Button>
						</Form.Item>
					</Form>
				</div>
			</div>
		}
		</>
	);
};
