import { Form, Input, Button } from 'antd';
import { MailOutlined, LockOutlined } from '@ant-design/icons';
import { Link } from 'react-router';

export const LoginForm = ({ onFinish, loading }) => {
	return (
		<Form
			name="login"
			onFinish={onFinish}
			layout="vertical"
			style={{ width: '100%' }}
		>
			<Form.Item
				name="email"
				label="Email"
				rules={[{ required: true, message: 'Veuillez entrer votre email' }]}
			>
				<Input
					prefix={<MailOutlined style={{ color: '#9191fa' }} />}
					placeholder="Entrez votre email"
					style={{
						borderRadius: 8,
						borderColor: '#c0c0f6',
						height: 40,
					}}
				/>
			</Form.Item>

			<Form.Item
				name="password"
				label="Mot de passe"
				rules={[{ required: true, message: 'Veuillez entrer votre mot de passe' }]}
			>
				<Input.Password
					prefix={<LockOutlined style={{ color: '#9191fa' }} />}
					placeholder="Mot de passe"
					style={{
						borderRadius: 8,
						borderColor: '#c0c0f6',
						height: 40,
					}}
				/>
			</Form.Item>

			<Form.Item>
				<Button
					type="primary"
					block
					htmlType="submit"
					loading={loading}
					style={{
						marginTop: 10,
						backgroundColor: '#9191fa',
						borderColor: '#9191fa',
						borderRadius: 8,
						height: 42,
						fontWeight: 500,
						transition: 'all 0.3s ease',
					}}
				>
					{loading ? 'Connexion...' : 'Se connecter'}
				</Button>

				<div style={{ textAlign: 'center', marginTop: 15, color: '#555' }}>
					Pas de compte ?{' '}
					<Link to="/register" style={{ color: '#9191fa', fontWeight: 500 }}>
						S’inscrire
					</Link>
				</div>
			</Form.Item>
		</Form>
	);
};
