import React, { useState } from 'react';
import { Form, Input, Button, message, Divider, Spin, Card, Avatar } from 'antd';
import { UserOutlined, EditOutlined, LockOutlined } from '@ant-design/icons';
import { useUserStore } from '../zustand/store';
import styled from 'styled-components';
import { useUpdateUser } from '../service/useUser';

export const Profile = () => {
  const [edited, setEdited] = useState(false);
  const data = useUserStore((state) => state.user);
  const [messageApi, contextHolder] = message.useMessage();

  const { updateUser, loadingUpdateUser } = useUpdateUser(
    (updatedUser) => {
      messageApi.success('Profile updated successfully!');
      setEdited(false);
    },
    (error) => {
      messageApi.error('Profile update failed. Please try again.');
    }
  );

  const onFinish = (values) => {
    const newUser = {
      id: data.id,
      ...values
    }
    updateUser(newUser);
  }

  if (!data)
    return (
      <Centered>
        <Spin size="large" />
      </Centered>
    );

  return (
    <>
      {contextHolder}
      <PageContainer>
        <HeaderCard>
          <Avatar size={100} icon={<UserOutlined />} />
          <HeaderInfo>
            <h1>
            {data.firstName} {data.lastName}
          </h1>
          <p>{data.email}</p>
          <RoleTag>{data.role}</RoleTag>
        </HeaderInfo>
      </HeaderCard>

      <Divider />

      <ContentWrapper>
        <StyledCard title={<><EditOutlined /> Edit Profile</>}>
          <Form
            layout="vertical"
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

            <ButtonRow>
              <Button type="primary" htmlType="submit" disabled={!edited} loading={loadingUpdateUser}>
                Save Changes
              </Button>
              <Button onClick={() => setEdited(!edited)} type="default" disabled={loadingUpdateUser}>
                {edited ? 'Cancel' : 'Edit'}
              </Button>
            </ButtonRow>
          </Form>
        </StyledCard>

        <StyledCard title={<><LockOutlined /> Change Password</>}>
          <Form
            layout="vertical"
            onFinish={(values) => {
              console.log('Change Password Values:', values);
              message.success('Password changed successfully!');
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

            <Button type="primary" htmlType="submit" block>
              Change Password
            </Button>
          </Form>
        </StyledCard>
      </ContentWrapper>
    </PageContainer>
	</>
  );
};

const PageContainer = styled.div`
  max-width: 1000px;
  margin: 40px auto;
  padding: 30px;
  background-color: #f9f9ff;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
`;

const HeaderCard = styled(Card)`
  display: flex;
  align-items: center;
  gap: 20px;
  background-color: #e3e9ff;
  color: #1f2a44;
  border-radius: 16px;
  padding: 35px ;
  border: 1px solid rgba(92, 110, 255, 0.15);
  box-shadow: 0 4px 20px rgba(92, 110, 255, 0.12);
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 6px 25px rgba(92, 110, 255, 0.22);
    transform: translateY(-2px);
  }
`;

const HeaderInfo = styled.div`
  h1 {
    margin: 0;
    font-size: 24px;
    font-weight: 600;
    color: #1f2a44;
  }
  p {
    margin: 4px 0;
    opacity: 0.8;
    color: #4a5472;
  }
`;

const RoleTag = styled.p`
  font-style: italic;
  color: #4a5472;
  background: rgba(255, 255, 255, 0.7);
  padding: 4px 10px;
  border-radius: 8px;
  font-weight: 500;
  border: 1px solid rgba(92, 110, 255, 0.2);
`;

const ContentWrapper = styled.div`
  display: flex;
  gap: 20px;
  margin-top: 30px;
  flex-wrap: wrap;
  justify-content: space-between;
  
`;

const StyledCard = styled(Card)`
  flex: 1;
  min-width: 400px;
  background: white;
  border-radius: 14px;
  border: 1px solid rgba(193, 193, 255, 0.3);
  box-shadow: 0 3px 10px rgba(160, 160, 255, 0.25);
  transition: all 0.25s ease;

  &:hover {
    box-shadow: 0 6px 18px rgba(145, 145, 250, 0.4);
    transform: translateY(-3px);
  }
`;


const ButtonRow = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 10px;

  button {
    border-radius: 8px;
    font-weight: 500;
  }

  /* .ant-btn-primary {
    background: linear-gradient(90deg, #9191fa, #c0c0f6);
    border: none;
    &:hover {
      background: linear-gradient(90deg, #7a7af5, #b2b2f3);
    }
  } */
`;

const Centered = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 80vh;
`;

