import { Button } from 'antd';
import styled from 'styled-components';

export const ButtonStyle = styled(Button)`
  background-color: #7a7af8 !important;
  border-color: #7a7af8 !important;
  box-shadow: 0 4px 12px rgba(122, 122, 248, 0.3) !important;
  transition: all 0.3s ease !important;
  
  &:hover, &:focus {
	background-color: #9191fa !important;
	border-color: #9191fa !important;
	box-shadow: 0 6px 20px rgba(145, 145, 250, 0.4) !important;
	transform: translateY(-2px) !important;
  }

  
`;