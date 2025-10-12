import { Form, Input, Button } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';

export const LoginForm = ({ onFinish, loading }) => {
  return (
    <Form
      name="login"
      initialValues={{ remember: true }}
      onFinish={onFinish}
      style={{
        maxWidth: 400,       
      }}
      layout="vertical"  
    >
      <Form.Item
        name="email"
        label="Email"
        rules={[{ required: true, message: 'Please input your email!' }]}
      >
        <Input
          prefix={<UserOutlined />}
          placeholder="Email"
          style={{ width: '100%' }}
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
          style={{ width: '100%' }} 
        />
      </Form.Item>

      <Form.Item>
        <Button
          type="primary"
          block
          htmlType="submit"
          loading={loading}
          style={{ marginTop: 10 }}
        >
          {loading ? 'Loading...' : 'Connexion'}
        </Button>
        <div style={{ textAlign: 'center', marginTop: 10 }}>
          ou <a href="/register">Inscription</a>
        </div>
      </Form.Item>
    </Form>
  );
};
