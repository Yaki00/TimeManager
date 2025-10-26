import styled from 'styled-components';

export const KPICard = styled.div`
  background: linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%);
  padding: 28px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(79, 70, 229, 0.08);
  border: 1px solid rgba(79, 70, 229, 0.08);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;

  &::before {
	content: '';
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	height: 4px;
	background: linear-gradient(90deg, #4F46E5, #7C3AED);
	transform: scaleX(0);
	transform-origin: left;
	transition: transform 0.4s ease;
  }

  &:hover {
	transform: translateY(-4px);
	box-shadow: 0 12px 40px rgba(79, 70, 229, 0.15);
	border-color: rgba(79, 70, 229, 0.2);

	&::before {
	  transform: scaleX(1);
	}
  }

  h3 {
	margin: 0 0 24px 0;
	color: #1F2937;
	font-size: 16px;
	font-weight: 700;
	text-transform: uppercase;
	letter-spacing: 0.5px;
	display: flex;
	align-items: center;
	gap: 8px;

	&::before {
	  content: '';
	  width: 8px;
	  height: 8px;
	  background: linear-gradient(135deg, #4F46E5, #7C3AED);
	  border-radius: 50%;
	  display: inline-block;
	}
  }
`;

export const WideKPICard = styled(KPICard)`
  grid-column: span 2;
`;

export const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
  margin-top: 24px;
`;
export const StatCard = styled.div`
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  border: 1px solid #e2e8f0;
  border-left: 4px solid ${props => props.color || '#4F46E5'};
  transition: all 0.3s ease;

  &:hover {
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	transform: translateY(-2px);
  }
`;

export const StatLabel = styled.div`
  font-size: 12px;
  color: #64748b;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export const StatValue = styled.div`
  font-size: 36px;
  font-weight: 800;
  color: ${props => props.color || '#1e293b'};
  margin: 8px 0;
  line-height: 1;
`;

export const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
  gap: 24px;
  margin-top: 24px;
`;

export const ChartContainer = styled.div`
  background: #f8fafc;
  padding: 16px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
`;