import styled from 'styled-components';
import { useAuth } from '../../service/useAuth';
import { LoginForm } from '../../components/form/LoginForm';
import { useNavigate } from 'react-router';

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  margin: 0 auto;
`;

export const Login = () => {
	const { loadingLogin, mutateAsync: LoginMutation } = useAuth();
let navigate = useNavigate();
	const onFinish = async (values) => {
		try {
			console.log('Success:', values);
			const response = await LoginMutation(values);
			navigate("/");
			console.log("response login", response);
		} catch (error) {
			console.error("Login error:", error);
		}
	};

	return (
		<Container>
			<LoginForm onFinish={onFinish} loading={loadingLogin} />
	</Container>

)};
