import styled, { keyframes } from 'styled-components';
import { useAuth } from '@/service/useAuth';
import { LoginForm } from '@/components/from/LoginForm';
import { useNavigate } from 'react-router';

const gradientMove = keyframes`
	0% { background-position: 0% 50%; }
	50% { background-position: 100% 50%; }
	100% { background-position: 0% 50%; }
`;

const fadeInUp = keyframes`
	from { opacity: 0; transform: translateY(10px); }
	to { opacity: 1; transform: translateY(0); }
`;

const Page = styled.div`
	display: flex;
	height: 100vh;
	font-family: 'Inter', sans-serif;
	background-color: #f9f9fb;
`;

const LeftPanel = styled.div`
	flex: 1;
background: radial-gradient(circle at 20% 40%, #a5a5ff 0%, #9191fa 35%, #7d7cf7 65%, #c0c0f6 100%);
animation: ${gradientMove} 14s ease infinite;

	color: #fff;
	padding: 80px 60px;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	position: relative;
	overflow: hidden;

	.content {
		position: relative;
		z-index: 2;
		max-width: 520px;
		animation: ${fadeInUp} 1s ease both;
	}

	h1 {
		font-size: 44px;
		font-weight: 700;
		margin-bottom: 20px;
		line-height: 1.2;
	}

	.highlight {
		background: rgba(255, 255, 255, 0.15);
		padding: 3px 10px;
		border-radius: 6px;
	}

	p {
		font-size: 18px;
		line-height: 1.7;
		opacity: 0.95;
		margin-bottom: 40px;
	}

	.image-container {
		position: relative;
		z-index: 2;
		display: flex;
		justify-content: flex-end;
	}

	.image {
		width: 480px;
		height: auto;
		filter: drop-shadow(0 10px 20px rgba(0,0,0,0.2));
	}

 
`;

const RightPanel = styled.div`
	flex: 1;
	display: flex;
	align-items: center;
	justify-content: center;
	background-color: #f9f9fb;
`;

const Card = styled.div`
	width: 380px;
	background: #ffffff;
	border-radius: 14px;
	padding: 48px 36px;
	box-shadow: 0 4px 24px rgba(0, 0, 0, 0.05);
	text-align: center;
	animation: ${fadeInUp} 1s ease both;

	h2 {
		font-size: 22px;
		font-weight: 600;
		color: #333;
		margin-bottom: 8px;
	}

	p {
		color: #666;
		font-size: 14px;
		margin-bottom: 30px;
	}

	.icon-logo {
		height: 46px;
		width: 46px;
		margin-bottom: 15px;
		fill: #9191fa;
	}
`;

export const Login = () => {
  const { loadingLogin, mutateAsync: LoginMutation } = useAuth();
  const navigate = useNavigate();

  const onFinish = async (values) => {
    try {
      await LoginMutation(values);
      navigate('/');
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  return (
    <Page>
      <LeftPanel>
        <div className="content">
          <h1>
            Gérez votre <span className="highlight">temps</span> intelligemment.
          </h1>
          <p>
            Time Manager vous aide à planifier, suivre et optimiser votre journée pour atteindre vos objectifs sans stress.
          </p>
        </div>
        <div className="image-container">
          <img
            src="/Schedule-amico.svg"
            alt="Illustration Time Management"
            className="image"
          />
        </div>
      </LeftPanel>

      <RightPanel>
        <Card>
          <svg
            fill="none"
            viewBox="0 0 48 48"
            xmlns="http://www.w3.org/2000/svg"
            className="icon-logo"
          >
            <path d="M6 6H42L36 24L42 42H6L12 24L6 6Z" />
          </svg>
          <h2>Connexion</h2>
          <p>Connectez-vous à votre compte Time Manager</p>
          <LoginForm onFinish={onFinish} loading={loadingLogin} />
        </Card>
      </RightPanel>
    </Page>
  );
};
