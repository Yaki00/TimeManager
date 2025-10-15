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
  background-color: #f5f6fa !important;
`;

const Header = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	margin-bottom: 20px;
`

const Wrapper = styled.div`
width: 300px;
    padding: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
	background-color: white;
	box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
	border-radius: 8px;
`



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
			<Wrapper>
				<Header>
				<div style={{ height: '50px', width: '50px', marginBottom: '10px' }}>
					<svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
						<path d="M6 6H42L36 24L42 42H6L12 24L6 6Z" fill="#9191fa"></path>
					</svg>
				</div>
				<h1>Time Master</h1>
			</Header>
			<LoginForm onFinish={onFinish} loading={loadingLogin} />
			</Wrapper>
	</Container>

)};
