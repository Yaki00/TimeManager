import styled from 'styled-components';

export const PageWrapper = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f8fafc;
  overflow: hidden;
  position: relative;
`;

export const Header = styled.div`
  padding: 40px 40px 20px 40px;
  background: white;
  flex-shrink: 0;
  position: relative;
  z-index: 10;
  border-bottom: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  
  h1 {
    margin: 16px 0 0 0;
    color: #1e293b;
    font-size: 32px;
    font-weight: 800;
  }
`;

export const ScrollableContent = styled.div`
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 0 40px 40px 40px;
  position: relative;
  z-index: 1;
  background: #f8fafc;
`;