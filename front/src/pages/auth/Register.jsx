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
	const {loadingRegister,registerAsync: RegisterMutation} = useAuth();

	const onFinish = async (values) => {
		console.log('Success:', values);
		const response = await RegisterMutation(values);
		console.log("response register", response.error);
		if(response.status === 201){
			alert("Registration successful! Please log in.");
			navigate("/login");
		}else{
			alert(response.response.error || "Registration failed. Please try again.");
		}
	  };
  return (
	<Container>
   <RegisterForm  onFinish={onFinish} loading={loadingRegister} />
	</Container>
  );
};
