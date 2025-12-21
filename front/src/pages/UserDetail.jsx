import { useParams, useNavigate, useLocation } from "react-router";
import { Card, Tag, Spin, Row, Col, Statistic, Progress, Avatar, Divider } from "antd";
import { ArrowLeftOutlined, EditOutlined, ClockCircleOutlined, CheckCircleOutlined, WarningOutlined, CalendarOutlined, UserOutlined, MailOutlined, PhoneOutlined, TeamOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { Breadcrumbs } from "../utils/Breadcrumb";
import { useUsers } from "../service/useUser";
import { useGetUserKPIs } from "../service/useKpi";
import { Header, PageWrapper, ScrollableContent } from "../utils/layoutStyle";
import { ButtonStyle } from "../utils/ButtonStyle";
import { KPICard, StatCard, StatLabel, StatValue, StatsGrid } from "../utils/dashboardStyle";

const UserHeader = styled.div`
  background: white;
  padding: 32px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  border: 1px solid #e2e8f0;
  margin: 24px 0;
  display: flex;
  align-items: center;
  gap: 24px;
`;

const UserAvatar = styled(Avatar)`
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #4F46E5, #7C3AED);
  font-size: 32px;
  font-weight: bold;
  flex-shrink: 0;
`;

const UserInfo = styled.div`
  flex: 1;

  h1 {
    margin: 0 0 8px 0;
    color: #1F2937;
    font-size: 24px;
    font-weight: 700;
  }

  .user-meta {
    display: flex;
    gap: 12px;
    align-items: center;
    margin-bottom: 12px;
  }

  .user-contacts {
    display: flex;
    gap: 20px;
    flex-wrap: wrap;
    color: #64748b;
    font-size: 14px;

    .contact-item {
      display: flex;
      align-items: center;
      gap: 6px;
    }
  }
`;

const InfoCard = styled.div`
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  border: 1px solid #e2e8f0;
  border-left: 4px solid ${props => props.color || '#4F46E5'};
  height: 100%;

  .info-label {
    font-size: 12px;
    color: #64748b;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 8px;
  }

  .info-value {
    font-size: 16px;
    color: #1F2937;
    font-weight: 600;
  }
`;

const SectionTitle = styled.h3`
  font-size: 14px;
  font-weight: 700;
  color: #1F2937;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 32px 0 16px 0;
  display: flex;
  align-items: center;
  gap: 8px;

  &::before {
    content: '';
    width: 8px;
    height: 8px;
    background: linear-gradient(135deg, #4F46E5, #7C3AED);
    border-radius: 50%;
  }
`;

const MonthCard = styled.div`
  text-align: center;
  padding: 16px;
  background: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }

  .month-value {
    font-size: 24px;
    font-weight: 700;
    color: #4F46E5;
  }

  .month-label {
    font-size: 11px;
    color: #64748b;
    font-weight: 600;
    text-transform: uppercase;
    margin-top: 4px;
  }
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 20px;
`;

const getRoleColor = (role) => {
	switch (role) {
		case 'Responsable':
			return '#EF4444';
		case 'Manager':
			return '#3B82F6';
		case 'Employer':
			return '#10B981';
		default:
			return '#6B7280';
	}
};

const getRoleLabel = (role) => {
	switch (role) {
		case 'Responsable':
			return 'Responsable';
		case 'Manager':
			return 'Manager';
		case 'Employer':
			return 'Employé';
		default:
			return role;
	}
};

const getContractTypeLabel = (type) => {
	switch (type) {
		case 'H15':
			return '15h/semaine';
		case 'H35':
			return '35h/semaine';
		case 'H40':
			return '40h/semaine';
		default:
			return type;
	}
};

export const UserDetail = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const location = useLocation();
	const { users, loadingUsers } = useUsers();
	const { data: kpiData, isLoading: loadingKPIs } = useGetUserKPIs(parseInt(id));

	// Déterminer la page précédente depuis le state de navigation ou utiliser l'historique
	const getPreviousPath = () => {
		// Si on vient du dashboard ou d'une autre page, utiliser l'historique
		if (location.state?.from) {
			return location.state.from;
		}
		// Sinon, utiliser navigate(-1) pour revenir à la page précédente
		return null;
	};

	const handleGoBack = () => {
		const previousPath = getPreviousPath();
		if (previousPath) {
			navigate(previousPath);
		} else {
			// Utiliser l'historique du navigateur pour revenir à la page précédente
			navigate(-1);
		}
	};

	if (loadingUsers) {
		return (
			<PageWrapper>
				<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
					<Spin size="large" />
				</div>
			</PageWrapper>
		);
	}

	const user = users?.find(u => u.id === parseInt(id));

	if (!user) {
		return (
			<PageWrapper>
				<Header>
					<Breadcrumbs
						items={[
							{ label: "Dashboard", path: "/" },
							{ label: "Effectif", path: "/effectif" },
							{ label: "Utilisateur introuvable" },
						]}
					/>
					<h1>Utilisateur introuvable</h1>
				</Header>
				<ScrollableContent>
					<Card>
						<p>L'utilisateur demandé n'existe pas ou a été supprimé.</p>
						<ButtonStyle onClick={handleGoBack}>
							Retour
						</ButtonStyle>
					</Card>
				</ScrollableContent>
			</PageWrapper>
		);
	}

	return (
		<PageWrapper>
			<Header>
				<Breadcrumbs
					items={[
						{ label: "Dashboard", path: "/" },
						{ label: "Effectif", path: "/effectif" },
						{ label: `${user.firstName} ${user.lastName}` },
					]}
				/>
				<HeaderActions>
					<ButtonStyle 
						icon={<ArrowLeftOutlined />}
						onClick={handleGoBack}
					>
						Retour
					</ButtonStyle>
					<ButtonStyle 
						type="primary"
						icon={<EditOutlined />}
						onClick={() => navigate(`/effectif/${id}/edit`)}
					>
						Modifier
					</ButtonStyle>
				</HeaderActions>
			</Header>
			<ScrollableContent>
				{/* User Header */}
				<UserHeader>
					<UserAvatar icon={<UserOutlined />}>
						{user.firstName.charAt(0)}{user.lastName.charAt(0)}
					</UserAvatar>
					<UserInfo>
						<h1>{user.firstName} {user.lastName}</h1>
						<div className="user-meta">
							<Tag color={getRoleColor(user.role)}>{getRoleLabel(user.role)}</Tag>
							<Tag color="purple">{getContractTypeLabel(user.contractType)}</Tag>
							<span style={{ color: '#9CA3AF', fontSize: '14px' }}>ID: #{user.id}</span>
						</div>
						<div className="user-contacts">
							<div className="contact-item">
								<MailOutlined />
								<a href={`mailto:${user.email}`}>{user.email}</a>
							</div>
							{user.phoneNumber && (
								<div className="contact-item">
									<PhoneOutlined />
									<a href={`tel:${user.phoneNumber}`}>{user.phoneNumber}</a>
								</div>
							)}
							{user.teams && user.teams.length > 0 && (
								<div className="contact-item">
									<TeamOutlined />
									{user.teams.map(t => t.teamName).join(', ')}
								</div>
							)}
						</div>
					</UserInfo>
				</UserHeader>

				{/* KPIs */}
				{loadingKPIs ? (
					<div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
						<Spin size="large" />
					</div>
				) : kpiData && (
					<>
						<SectionTitle>Statistiques principales</SectionTitle>
						<StatsGrid>
							<StatCard color="#4F46E5">
								<StatLabel>Conformité contrat</StatLabel>
								<StatValue color="#4F46E5">{kpiData.contractRate?.rate || 0}%</StatValue>
								<Progress 
									percent={kpiData.contractRate?.rate || 0} 
									strokeColor="#4F46E5"
									showInfo={false}
								/>
							</StatCard>

							<StatCard color="#10B981">
								<StatLabel>Pause moyenne</StatLabel>
								<StatValue color="#10B981">{kpiData.pauseAverage?.minutes || 0} min</StatValue>
							</StatCard>

							<StatCard color="#3B82F6">
								<StatLabel>Jours de congé</StatLabel>
								<StatValue color="#3B82F6">{kpiData.leaveDays?.average || 0}</StatValue>
							</StatCard>

							<StatCard color="#EF4444">
								<StatLabel>Avertissements</StatLabel>
								<StatValue color="#EF4444">
									{kpiData.warningsByType?.reduce((sum, w) => sum + w.count, 0) || 0}
								</StatValue>
							</StatCard>
						</StatsGrid>

						{/* Détails */}
						<Row gutter={[24, 24]} style={{ marginTop: '32px' }}>
							{/* Heures mensuelles */}
							{kpiData.monthlyHours && kpiData.monthlyHours.length > 0 && (
								<Col xs={24} lg={12}>
									<KPICard>
										<h3>Heures travaillées</h3>
										<Row gutter={[12, 12]}>
											{kpiData.monthlyHours.map((month, index) => (
												<Col xs={8} sm={6} md={4} key={index}>
													<MonthCard>
														<div className="month-value">{month.hours}h</div>
														<div className="month-label">{month.month}</div>
													</MonthCard>
												</Col>
											))}
										</Row>
									</KPICard>
								</Col>
							)}

							{/* Présence */}
							{kpiData.personalAttendance && kpiData.personalAttendance.length > 0 && (
								<Col xs={24} lg={12}>
									<KPICard>
										<h3>Taux de présence</h3>
										<Row gutter={[12, 12]}>
											{kpiData.personalAttendance.map((attendance, index) => (
												<Col xs={8} sm={6} md={4} key={index}>
													<MonthCard>
														<Progress 
															type="circle" 
															percent={attendance.rate} 
															width={50}
															strokeColor="#4F46E5"
															format={(percent) => <span style={{ fontSize: '12px', fontWeight: 'bold' }}>{percent}%</span>}
														/>
														<div className="month-label" style={{ marginTop: '8px' }}>{attendance.month}</div>
													</MonthCard>
												</Col>
											))}
										</Row>
									</KPICard>
								</Col>
							)}

							{/* Avertissements */}
							{kpiData.warningsByType && kpiData.warningsByType.length > 0 && (
								<Col xs={24}>
									<KPICard>
										<h3>Avertissements par type</h3>
										<Row gutter={[16, 16]}>
											{kpiData.warningsByType.map((warning, index) => (
												<Col xs={24} sm={8} key={index}>
													<InfoCard color={warning.color}>
														<div className="info-label">{warning.type}</div>
														<div className="info-value" style={{ color: warning.color, fontSize: '32px' }}>
															{warning.count}
														</div>
													</InfoCard>
												</Col>
											))}
										</Row>
									</KPICard>
								</Col>
							)}
						</Row>
					</>
				)}
			</ScrollableContent>
		</PageWrapper>
	);
};
