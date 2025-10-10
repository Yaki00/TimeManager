import { Form, Input, Button } from 'antd';
import styled from 'styled-components';
import { RegisterForm } from '../../components/form/RegisterForm';
import { useAuth } from '../../service/useAuth';
import { useNavigate } from 'react-router';

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  margin: 0 auto;
`;

export const Register = () => {
let navigate = useNavigate();
	const {loadingRegister, mutateAsync: RegisterMutation} = useAuth();

	const onFinish = async (values) => {
	try{
		console.log('Success:', values);
		const response = await RegisterMutation(values);
		navigate("/login");
		
		console.log("response register", response);
	} catch (error) {
		console.error("Error registering:", error);
	}
	  };
  return (
	<Container>
   <RegisterForm  onFinish={onFinish} loading={loadingRegister} />
	</Container>
  );
};
