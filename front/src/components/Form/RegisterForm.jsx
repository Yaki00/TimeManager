
import {
	Button,
  Form,
  Input,
  Upload
} from 'antd';

import { InboxOutlined } from '@ant-design/icons';


export const RegisterForm = ({ onFinish, loading }) => {
	const normFile = e => {
  console.log('Upload event:', e);
  if (Array.isArray(e)) {
    return e;
  }
  return e?.fileList;
};
	return (
		 <Form
      name="register"
      onFinish={onFinish}
      style={{ maxWidth: 600 }}
      scrollToFirstError
    >
		<Form.Item
		name="firstName"
		label="Prénom"
		rules={[{ required: true, message: 'Please input your firstName!', whitespace: true }]}
				>
		<Input />
				</Form.Item>
		<Form.Item
		name="lastName"
		label="Nom"
		rules={[{ required: true, message: 'Please input your lastName!', whitespace: true }]}
				>
		<Input />
				</Form.Item>
      <Form.Item
        name="email"
        label="E-mail"
        rules={[
          {
            type: 'email',
            message: 'The input is not valid E-mail!',
          },
          {
            required: true,
            message: 'Please input your E-mail!',
          },
        ]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        name="password"
        label="Mot de passe"
        rules={[
          {
            required: true,
            message: 'Please input your password!',
          },
        ]}
        hasFeedback
      >
        <Input.Password />
      </Form.Item>

      <Form.Item
        name="confirm"
        label="Confirmer le mot de passe"
        dependencies={['password']}
        hasFeedback
        rules={[
          {
            required: true,
            message: 'Please confirm your password!',
          },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue('password') === value) {
                return Promise.resolve();
              }
              return Promise.reject(new Error('The new password that you entered do not match!'));
            },
          }),
        ]}
      >
        <Input.Password />
      </Form.Item>
      <Form.Item
        name="phone"
        label="Numéro de téléphone"
        rules={[{ required: true, message: 'Please input your phone number!' }]}
      >
        <Input  style={{ width: '100%' }} />
      </Form.Item>
	  <Form.Item label="Dragger">
      <Form.Item name="dragger" valuePropName="fileList" getValueFromEvent={normFile} noStyle>
        <Upload.Dragger name="files" action="#">
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">Click or drag file to this area to upload</p>
          <p className="ant-upload-hint">Support for a single or bulk upload.</p>
        </Upload.Dragger>
      </Form.Item>
		</Form.Item>
	  <Form.Item>
				<Button type="primary" block htmlType="submit" loading={loading}>
					Register
				</Button>
			</Form.Item>
	  <Form.Item style={{ marginBottom: 0 }}>
		Already have an account? <a href="/login">Login now!</a>
	  </Form.Item>
    </Form>
	)
}