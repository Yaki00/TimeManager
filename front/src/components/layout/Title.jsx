import styled from 'styled-components';

const TitleSideStyle = styled.div`
  display: flex;
  align-items: center;
  justify-content: ${props => (props.collapsed ? 'center' : 'flex-start')};
  margin: 50px 20px;
  width: ${props => (props.collapsed ? '40px' : '180px')};
  & h2 {
	margin: 0;
	/* color: #9191fa; */
	color: black;
	min-width: 100px;
	max-width: fit-content;
  }
`;

export const TitleLayout = ({ collapsed }) => {
	return (
		<TitleSideStyle $collapsed={collapsed}>
			{!collapsed ? 
			<div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
			<div style={{ height: '30px', width: '30px'}}>
					<svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
						<path d="M6 6H42L36 24L42 42H6L12 24L6 6Z" fill="#c0c0f6"></path>
					</svg>
				</div>
				<h2>Time Master</h2> 
				</div>
			: 
				<div style={{ height: '30px', width: '30px'}}>
					<svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
						<path d="M6 6H42L36 24L42 42H6L12 24L6 6Z" fill="#c0c0f6"></path>
					</svg>
				</div>
			}
		</TitleSideStyle>
	)
}