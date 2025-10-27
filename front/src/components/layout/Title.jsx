import styled from 'styled-components';

const TitleSideStyle = styled.div`
  display: flex;
  align-items: center;
  justify-content: ${props => (props.$collapsed ? 'center' : 'flex-start')};
  padding: 50px 20px; 
  width: 100%;
  /* min-height: 60px;  */
  transition: all 0.3s ease;

  h2 {
    margin: 0;
    color: black;
    white-space: nowrap;
    opacity: ${props => (props.$collapsed ? 0 : 1)};
    transition: opacity 0.3s ease;
  }
`;

export const TitleLayout = ({ collapsed }) => {
	return (
		<TitleSideStyle $collapsed={collapsed}>
			{!collapsed ? 
			<div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
			<div style={{ height: '30px', width: '30px'}}>
					<svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
						<path d="M6 6H42L36 24L42 42H6L12 24L6 6Z" fill="#9191fa"></path>
					</svg>
				</div>
				<h2>Time Master</h2> 
				</div>
			: 
				<div style={{ height: '30px', width: '30px'}}>
					<svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
						<path d="M6 6H42L36 24L42 42H6L12 24L6 6Z" fill="#9191fa"></path>
					</svg>
				</div>
			}
		</TitleSideStyle>
	)
}