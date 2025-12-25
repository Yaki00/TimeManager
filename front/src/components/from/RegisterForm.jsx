import React from 'react';
import {
  Button,
  Form,
  Input,
  Upload
} from 'antd';

import { InboxOutlined } from '@ant-design/icons';
import { Link } from 'react-router';


export const RegisterForm = ({ onFinish, loading }) => {
// 	  const [fileList, setFileList] = useState([]);
// 	 const handleBeforeUpload = (file) => {
//     setFileList([file]);
//     return false;
//   };

  //   const fileName = (e) => {
  //     console.log('Upload event:', e);
  //     if (Array.isArray(e)) {
  //       return e;
  //     }
  //     return e?.fileList;
  //   };

  return (
    <Form
      name="register"
      onFinish={onFinish}
      style={{ maxWidth: 300 }}
      scrollToFirstError
      layout="vertical"
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
            message: "S'il vous plaît saisir votre mot de passe!",
            min: 8
			
          },
          {
            pattern: /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>_\-+=~`])(?=.*[a-zA-Z]).{8,}$/,
            message: "Le mot de passe doit contenir au moins 8 caractères, un caractère spécial, un chiffre et une majuscule",
          }
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
            message: "S'il vous plaît confirmer votre mot de passe!",
          },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue('password') === value) {
                return Promise.resolve();
              }
              return Promise.reject(new Error("Le nouveau mot de passe que vous avez saisi ne correspond pas !"));
            },
          }),
        ]}
      >
        <Input.Password />
      </Form.Item>
      <Form.Item
        name="phoneNumber"
        label="Numéro de téléphone"
        rules={[{ required: true, message: "S'il vous plaît saisir votre numéro de téléphone!" }]}
      >
        <Input  style={{ width: '100%' }} />
      </Form.Item>
      {/* <Form.Item label="Avatar" name="avatar" valuePropName="fileList" getValueFromEvent={fileName}>
				<Upload.Dragger
					name="file"
					beforeUpload={handleBeforeUpload} 
					multiple={false}
				>
					<p className="ant-upload-drag-icon">
						<InboxOutlined />
					</p>
					<p className="ant-upload-text">Cliquez ou glissez un fichier ici</p>
					<p className="ant-upload-hint">Le fichier ne sera pas uploadé automatiquement</p>
				</Upload.Dragger>
			</Form.Item> */}
      <Form.Item>
        <Button type="primary" block htmlType="submit" loading={loading} style={{ backgroundColor: '#9191fa', borderColor: '#9191fa' }}>
          Inscription
        </Button>
      </Form.Item>
      <Form.Item style={{ marginBottom: 0 }}>
        Vous avez déjà un compte ? <Link to="/login" style={{ color: '#9191fa' }}>Connectez-vous maintenant!</Link>
      </Form.Item>
    </Form>
  )
}