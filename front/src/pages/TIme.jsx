import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import dayjs from 'dayjs';
import { CustomCalendar } from '../components/CustomCalendar';
import {
	CalendarOutlined,
	ClockCircleOutlined,
	FieldTimeOutlined,
	UserOutlined,
} from '@ant-design/icons';
import { Button, Modal, DatePicker, message, Progress, Avatar, Tag, Alert } from 'antd';
import { Breadcrumbs } from '../utils/Breadcrumb';
import { useCreateLeave, useGetLeavesByUserId } from '../service/useLeave';

import { useUserStore } from '../zustand/store';
import { formatedDataForCalendar } from '../utils/formatedData';
import { CreateLeaveForm } from '../components/form/CreateLeaveForm';
import { TableStyle } from '../utils/TableStyle';
import { columns } from '../components/column/ColumnsLeave';
import { PageWrapper, Header, ScrollableContent } from '../utils/layoutStyle';

// const PageWrapper = styled.div`
//   height: 100vh;
//   display: flex;
//   flex-direction: column;
//   background: #f9f9fb;
//   overflow: hidden;
// `;

// const Header = styled.div`
//   padding: 40px 40px 20px 40px;
//   background: #f9f9fb;
	
//   h1 {
//     margin: 16px 0 0 0;
//     color: #333;
//   }
// `;

// const ScrollableContent = styled.div`
//   flex: 1;
//   overflow-y: auto;
//   overflow-x: hidden;
//   padding: 0 40px 40px 40px;
// `;


const Content = styled.div`
	display: flex;
	gap: 40px;
	width: 100%;
	max-width: 100%;
	margin-top: 24px;
`;


const Sidebar = styled.div`
	display: flex;
	flex-direction: column;
	gap: 24px;
	background: linear-gradient(180deg, #ffffff 0%, #f6f7ff 100%);
	border-radius: 18px;
	padding: 28px 24px;
	box-shadow: 0 8px 28px rgba(0, 0, 0, 0.08);
	transition: all 0.3s ease;
	min-width: 280px;
	width: 350px;
`;

const SectionsContainer = styled.div`
	display: flex;
	flex-direction: column;
	gap: 24px;
	flex: 1;
	overflow-y: auto;
	padding-right: 4px;
`;

const Section = styled.div`
	background: white;
	border-radius: 14px;
	padding: 20px 18px;
	box-shadow: 0 2px 10px rgba(145, 145, 250, 0.15);
	transition: transform 0.2s ease;
	
	&:hover {
		transform: translateY(-3px);
	}

	h3 {
		margin-bottom: 16px;
		color: #9191fa;
		font-weight: 700;
		font-size: 16px;
	}
`;

const BadgeSection = styled(Section)`
background: white;
	max-height: 400px;
	overflow-y: auto;
	box-shadow: 0 2px 10px rgba(145, 145, 250, 0.15);

`;

const ProfileCard = styled.div`
	display: flex;
	align-items: center;
	gap: 16px;
	padding: 16px;
	background: linear-gradient(135deg, #9191fa, #c0c0f6);
	border-radius: 14px;
	color: white;
	box-shadow: 0 4px 18px rgba(145, 145, 250, 0.3);

	.info {
		display: flex;
		flex-direction: column;
		line-height: 1.3;
	}

	.name {
		font-weight: 700;
		font-size: 16px;
	}

	.role {
		font-size: 13px;
		opacity: 0.9;
	}
`;

const BadgeItem = styled.div`
	display: flex;
	align-items: center;
	margin-bottom: 10px;
	font-size: 15px;
	color: #333;

	svg {
		font-size: 20px;
		margin-right: 12px;
		color: #9191fa;
	}

	span {
		flex: 1;
	}

	.time {
		font-weight: 600;
		color: #4a4a6a;
	}
`;

const LeaveSummary = styled.div`
	display: flex;
	flex-direction: column;
	gap: 12px;

	.leave-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		color: #444;
		font-size: 15px;

		.label {
			color: #555;
		}

		.value {
			font-weight: 700;
			color: #9191fa;
		}
	}
`;

const StyledProgress = styled(Progress)`
	.ant-progress-inner {
		background: #eaeaff;
	}
	.ant-progress-bg {
		background: linear-gradient(90deg, #9191fa, #c0c0f6);
	}
`;

const RequestButton = styled(Button)`
	margin-top: 12px;
	background: linear-gradient(90deg, #9191fa, #c0c0f6);
	border: none;
	color: white;
	height: 42px;
	font-weight: 600;
	border-radius: 10px;
	box-shadow: 0 4px 12px rgba(145, 145, 250, 0.3);
	transition: all 0.25s ease;
	width: 100%;

	&:hover {
		background: linear-gradient(90deg, #7a7af8, #b0b0ff)  !important;
		transform: translateY(-2px);
		color: white !important;
	}
`;

const ButtonSection = styled.div`
	background: white;
	border-radius: 14px;
	padding: 20px 18px;
	box-shadow: 0 2px 10px rgba(145, 145, 250, 0.15);
	margin-top: auto;

	h3 {
		margin-bottom: 8px;
		color: #9191fa;
		font-weight: 700;
		font-size: 16px;
	}

	p {
		color: #666;
		margin-bottom: 0;
		font-size: 14px;
	}
`;

const MainContent = styled.div`
	flex: 1;
	min-width: 0;
	display: flex;
	flex-direction: column;
	gap: 20px;
	width: 100%;
`;





const dummyBadges = [
	{ time: '08:15', label: 'Entrée', icon: <ClockCircleOutlined /> },
	{ time: '17:30', label: 'Sortie', icon: <ClockCircleOutlined /> },
	{ time: '08:15', label: 'Entrée', icon: <ClockCircleOutlined /> },
	{ time: '17:30', label: 'Sortie', icon: <ClockCircleOutlined /> },
	{ time: '08:15', label: 'Entrée', icon: <ClockCircleOutlined /> },
	{ time: '17:30', label: 'Sortie', icon: <ClockCircleOutlined /> },
	{ time: '08:15', label: 'Entrée', icon: <ClockCircleOutlined /> },
	{ time: '17:30', label: 'Sortie', icon: <ClockCircleOutlined /> },
];

export const Time = () => {
	const [selectedDate, setSelectedDate] = useState(dayjs());
	const [leaves, setLeaves] = useState([]);
	const [modalVisible, setModalVisible] = useState(false);
	const [newLeaveDate, setNewLeaveDate] = useState(null);
	const user = useUserStore((state) => state.user);
	const userId = user.id;

	const { createLeaveAsync, isLoading } = useCreateLeave();
	const { data: userLeaves, isLoading: isLoadingLeaves, error: leavesError } = useGetLeavesByUserId(userId);

	// S'assurer que userLeaves est toujours un tableau
	const safeUserLeaves = React.useMemo(() => {
		if (!userLeaves) return [];
		return Array.isArray(userLeaves) ? userLeaves : [];
	}, [userLeaves]);

	const leaveStats = React.useMemo(() => {
		if (!safeUserLeaves || safeUserLeaves.length === 0) {
			return { 
				usedDays: 0, 
				remainingDays: 20, 
				totalDays: 20,
				remoteDays: 0,
				remainingRemoteDays: 24,
				totalRemoteDays: 24
			};
		}

		const approvedLeaves = safeUserLeaves.filter(leave => leave.status === 'approved');
		const usedDays = approvedLeaves
			.filter(leave => leave.leaveType !== 'remote')
			.reduce((total, leave) => total + (leave.dayLeave || 0), 0);
		
		const remoteDays = approvedLeaves
			.filter(leave => leave.leaveType === 'remote')
			.reduce((total, leave) => total + (leave.dayLeave || 0), 0);
		
		const totalDays = 20; 
		const remainingDays = totalDays - usedDays;
		
		const totalRemoteDays = 24;
		const remainingRemoteDays = totalRemoteDays - remoteDays;

		return { 
			usedDays, 
			remainingDays, 
			totalDays,
			remoteDays,
			remainingRemoteDays,
			totalRemoteDays
		};
	}, [safeUserLeaves]);

	useEffect(() => {
		if (safeUserLeaves && safeUserLeaves.length > 0) {
			setLeaves(formatedDataForCalendar(safeUserLeaves));
		} else {
			setLeaves([]);
		}
	}, [safeUserLeaves]);

	const onSelect = (date) => setSelectedDate(date);


	const onFinish = async (value) => {
			const leaveTypeLabels = {
				leave: 'Congé payé',
				remote: 'Télétravail',
				sick: 'Arrêt maladie',
				other: 'Autre absence'
			};

			const response = await createLeaveAsync({
				startDate: dayjs(value.dateRange[0]).format('YYYY-MM-DD'),
				endDate: dayjs(value.dateRange[1]).format('YYYY-MM-DD'),
				justification: value.justification,
				leaveType: value.leaveType,
				dayLeave: dayjs(value.dateRange[1]).diff(dayjs(value.dateRange[0]), 'day') + 1,
			});
			if(response.status !== "error") {
				const typeLabel = leaveTypeLabels[value.leaveType] || 'Demande';
				message.success(`${typeLabel} demandé${value.leaveType === 'remote' ? '' : 'e'} du ${dayjs(value.dateRange[0]).format('DD/MM/YYYY')} au ${dayjs(value.dateRange[1]).format('DD/MM/YYYY')}`);
				setModalVisible(false);
			}else {
				message.error(response.message || "Erreur lors de la création de la demande");
			}
			
	};

	if(isLoadingLeaves || isLoading) return <div>Loading leaves...</div>;

	if(leavesError) {
		return (
			<PageWrapper>
				<Header>
					<Breadcrumbs
						items={[
							{ label: "Dashboard", path: "/" },
							{ label: "Absences & Télétravail" },
						]}
					/>
					<h1>Gestion des Absences</h1>
				</Header>
				<ScrollableContent>
					<div style={{ padding: '40px', textAlign: 'center' }}>
						<Alert
							message="Erreur"
							description={leavesError.message || 'Erreur lors du chargement des données'}
							type="error"
							showIcon
						/>
					</div>
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
						{ label: "Absences & Télétravail" },
					]}
				/>
				<h1>Gestion des Absences</h1>
			</Header>
			<ScrollableContent>
					<Content>
						<Sidebar>
					<ProfileCard>
						<Avatar
							size={48}
							icon={<UserOutlined />}
							style={{ backgroundColor: '#b1b1ff' }}
						/>
						<div className="info">
							<span className="name">{user.firstName} {user.lastName}</span>
							<span className="role">{user.role}</span>
						</div>
					</ProfileCard>
					<SectionsContainer>
						<BadgeSection>
							<h3>
								<FieldTimeOutlined style={{ marginRight: 8 }} />
								Badge du jour ({selectedDate.format('DD/MM/YYYY')})
							</h3>
							{dummyBadges.map(({ time, label, icon }, i) => (
								<BadgeItem key={i}>
									{icon} <span>{label}</span> <span className="time">{time}</span>
								</BadgeItem>
							))}
						</BadgeSection>

						<Section>
							<h3>
								<CalendarOutlined style={{ marginRight: 8 }} />
								Récapitulatif des congés
							</h3>
							<LeaveSummary>
								<div className="leave-row">
									<span className="label">Congés pris :</span>
									<span className="value">{leaveStats.usedDays} jours</span>
								</div>
								<div className="leave-row">
									<span className="label">Congés restants :</span>
									<span className="value">{leaveStats.remainingDays} jours</span>
								</div>
								<StyledProgress 
									percent={(leaveStats.usedDays / leaveStats.totalDays) * 100} 
									showInfo={false} 
								/>
							</LeaveSummary>
						</Section>

						<Section>
							<h3>
								<CalendarOutlined style={{ marginRight: 8 }} />
								Récapitulatif télétravail
							</h3>
							<LeaveSummary>
								<div className="leave-row">
									<span className="label">Jours utilisés :</span>
									<span className="value">{leaveStats.remoteDays} jours</span>
								</div>
								<div className="leave-row">
									<span className="label">Jours restants :</span>
									<span className="value">{leaveStats.remainingRemoteDays} jours</span>
								</div>
								<StyledProgress 
									percent={(leaveStats.remoteDays / leaveStats.totalRemoteDays) * 100} 
									showInfo={false} 
								/>
							</LeaveSummary>
						</Section>
					</SectionsContainer>
					<ButtonSection>
						<h3>Nouvelle demande</h3>
						<p>Congé, télétravail ou absence : faites votre demande ici.</p>
						<RequestButton type="primary" onClick={() => setModalVisible(true)}>
							Nouvelle demande
						</RequestButton>
					</ButtonSection>
				</Sidebar>
				<MainContent>
					<CustomCalendar
						leaves={leaves}
						selectedDate={selectedDate}
						onSelect={onSelect}
					/>
					<TableStyle dataSource={safeUserLeaves} columns={columns} pagination={false} scroll={{ y: 450 }} />
				</MainContent>
			</Content>
			<Modal
				title={
					<span style={{ 
						fontWeight: 700, 
						fontSize: 20,
						background: 'linear-gradient(135deg, #9191fa 0%, #C0C0F6 100%)',
						WebkitBackgroundClip: 'text',
						WebkitTextFillColor: 'transparent',
						backgroundClip: 'text'
					}}>
						Nouvelle demande d'absence
					</span>
				}
				open={modalVisible}
				onCancel={() => setModalVisible(false)}
				centered
				footer={null}
				width={600}
				styles={{
					body: {
						background: "#fafbff",
						borderRadius: 12,
						padding: "32px 24px"
					}
				}}
			>
				<CreateLeaveForm onFinish={onFinish} isLoading={isLoadingLeaves} />
			</Modal>
			</ScrollableContent>
	</PageWrapper>

	);
};
