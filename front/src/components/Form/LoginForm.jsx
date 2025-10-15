import { Form, Input, Button } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { Link } from 'react-router';

export const LoginForm = ({ onFinish, loading }) => {

  return (
    <Form
      name="login"
      initialValues={{ remember: true }}
      onFinish={onFinish}
      style={{
		maxWidth:300,
      }}
      layout="vertical"
    >
      <Form.Item
        name="email"
        label="Email"	
        rules={[{ required: true, message: 'Please input your email!' }]}
      >
        <Input
          prefix={<UserOutlined style={{ color: '#4d4c93' }} />}
          placeholder="Email"
          style={{ width: '100%', borderColor: '#4d4c93' }}
        />
      </Form.Item>

      <Form.Item
        name="password"
        label="Mot de passe"
        rules={[{ required: true, message: 'Please input your password!' }]}
      >
        <Input.Password
          prefix={<LockOutlined />}
          placeholder="Password"
          style={{ width: '100%', borderColor: '#4d4c93' }}
        />
      </Form.Item>

      <Form.Item>
        <Button
          type="primary"
          block
          htmlType="submit"
          loading={loading}
          style={{ marginTop: 10, backgroundColor: '#9191fa', borderColor: '#9191fa' }}
        >
          {loading ? 'Loading...' : 'Connexion'}
        </Button>
        <div style={{ textAlign: 'center', marginTop: 10 }}>
          ou <Link to="/register" style={{ color: '#9191fa' }}>Inscription</Link>
        </div>
      </Form.Item>
    </Form>
  );
};
