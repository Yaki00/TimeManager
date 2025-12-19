import { Button, Table , Modal, Form, Input, Select, Tag } from "antd";
import { Breadcrumbs } from "../utils/Breadcrumb";
import { EditOutlined, DeleteOutlined, TeamOutlined, UserOutlined, FileTextOutlined } from '@ant-design/icons';
import { useState } from "react";
import { ButtonStyle } from "../utils/ButtonStyle";
import { getRoles } from "../utils/getRoles";
import styled from "styled-components";
import { CreateTeamForm } from "../components/form/CreateTeamForm";
import { useUserStore } from "../zustand/store";
import { useLocation } from "react-router";
import { useCreateTeam, useGetTeamById, useUpdateTeam } from "../service/useTeam";
import { useGetAllLeavesForTeam } from "../service/useLeave";
import { PageWrapper, Header, ScrollableContent } from "../utils/layoutStyle";
import { columns } from "../components/column/ColumnsTeamDetails";

const HeaderContent = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: end;
	margin-top: 24px;
`;

const TeamHeader = styled.div`
	flex: 1;
`;

const TeamTitle = styled.h1`
	margin: 0 0 12px 0;
	color: #1e293b;
	font-size: 32px;
	font-weight: 700;
	display: flex;
	align-items: center;
	gap: 12px;
`;

const TeamMeta = styled.div`
	display: flex;
	align-items: center;
	gap: 24px;
	margin-top: 12px;
`;

const MetaItem = styled.div`
	display: flex;
	align-items: center;
	gap: 8px;
	color: #64748b;
	font-size: 14px;

	.anticon {
		color: #9191fa;
		font-size: 16px;
	}

	strong {
		color: #1e293b;
		font-weight: 600;
	}
`;


const DescriptionCard = styled.div`
	background: linear-gradient(135deg, #f8f9ff 0%, #fafbff 100%);
	border-radius: 12px;
	padding: 20px 24px;
	margin: 24px 0;
	border: 1px solid #e8e9ff;
	position: relative;
	
	&::before {
		content: '';
		position: absolute;
		left: 0;
		top: 0;
		bottom: 0;
		width: 4px;
		background: linear-gradient(180deg, #9191fa, #C0C0F6);
		border-radius: 12px 0 0 12px;
	}
`;

const DescriptionLabel = styled.div`
	display: flex;
	align-items: center;
	gap: 8px;
	font-weight: 600;
	color: #475569;
	font-size: 13px;
	text-transform: uppercase;
	letter-spacing: 0.5px;
	margin-bottom: 8px;

	.anticon {
		color: #9191fa;
	}
`;

const DescriptionText = styled.p`
	color: #1e293b;
	font-size: 15px;
	line-height: 1.6;
	margin: 0;
	padding-left: 4px;
`;

const SectionTitle = styled.h2`
	font-size: 18px;
	font-weight: 600;
	color: #1e293b;
	margin: 0 0 20px 0;
	display: flex;
	align-items: center;
	gap: 8px;
`;


const TableStyle = styled(Table)`
	border-radius: 12px;
	overflow: hidden;
	box-shadow: 0 4px 15px rgba(145, 145, 250, 0.1);

	.ant-table {
		border-radius: 12px;
		overflow: hidden;
	}
	.ant-table-thead > tr > th {
		background-color: #ffffff;
		color: #2d2d69;
		font-weight: 600;
		font-size: 14px;
		padding: 12px 16px;
	}

	.ant-table-tbody > tr:nth-child(even) > td {
		background-color: #faf9ff;
	}

	.ant-table-cell {
		padding: 14px 12px;
		font-size: 14px;
		color: #333366;
	}

	.ant-table-footer {
		background-color: #ffffff;
		color: #2d2d69;
		font-weight: 600;
		font-size: 14px;
		padding: 12px 16px;
		border-radius: 0 0 12px 12px;
		box-shadow: 0 -2px 10px rgba(145, 145, 250, 0.15);
	}
`;

const ActionButtons = styled.div`
	display: flex;
	gap: 12px;
`;
const StatItem = styled.div`
	display: flex;
	align-items: center;
	gap: 8px;
	font-size: 14px;
	color: #64748b;
	font-weight: 600;

	span {
		color: #9191fa;
		font-weight: 700;
		font-size: 16px;
	}
`;
export const TeamDetails = () => {
	let { state} = useLocation();
	const { data: teamsData, isLoading: loadingTeams } = useGetTeamById(state.id);
	const [iseUpdateTeamModalOpen, setIsUpdateTeamModalOpen] = useState(false);
	const {updateTeamAsync} = useUpdateTeam();
	const { data: leavesData, isLoading: loadingLeaves } = useGetAllLeavesForTeam(state.id);
	const Footer = () => {
	return (
	<StatItem>
		Total des équipes : <span>{teamsData?.members?.length}</span>
	</StatItem>
	)
}
const onFinish = async (values) => {
	const data = {
		...values,
		id: state.id,
	}
	const response = await updateTeamAsync(data);
	setIsUpdateTeamModalOpen(false);
}

if(loadingTeams || loadingLeaves) return <div>Loading...</div>


	return (
		<PageWrapper>
			<Header>
				<Breadcrumbs
					items={[
						{ label: "Dashboard", path: "/" },
						{ label: "Teams", path: "/teams" },
						{ label: teamsData?.teamName || "Détails" },
					]}
				/>
				<HeaderContent>
					<TeamHeader>
						<TeamTitle>
							<TeamOutlined style={{ color: '#9191fa' }} />
							{teamsData?.teamName}
						</TeamTitle>
						<TeamMeta>
							<MetaItem>
								<UserOutlined />
								<span><strong>{teamsData?.members?.length || 0}</strong> membres</span>
							</MetaItem>
						</TeamMeta>
					</TeamHeader>
					<ActionButtons>
						<ButtonStyle 
							type="primary" 
							icon={<EditOutlined />}
							onClick={() => setIsUpdateTeamModalOpen(true)}
						>
							Modifier l'équipe
						</ButtonStyle>
					</ActionButtons>
				</HeaderContent>
			</Header>
			<ScrollableContent>
				{teamsData?.description && (
					<DescriptionCard>
						<DescriptionLabel>
							<FileTextOutlined />
							Description
						</DescriptionLabel>
						<DescriptionText>
							{teamsData.description}
						</DescriptionText>
					</DescriptionCard>
				)}

			<div style={{marginTop: 40}}>

<TableStyle dataSource={teamsData.members} columns={columns} pagination={false} footer={() => <Footer />} />

				<Modal
					title={
						<span style={{ 
							fontWeight: 700, 
							fontSize: 22,
							background: 'linear-gradient(135deg, #9191fa, #C0C0F6)',
							WebkitBackgroundClip: 'text',
							WebkitTextFillColor: 'transparent'
						}}>
							Modifier l'équipe
						</span>
					}
					open={iseUpdateTeamModalOpen}
					onCancel={() => setIsUpdateTeamModalOpen(false)}
					centered
					footer={null}
					width={600}
					styles={{
						body: {
							background: "#fafbff",
							borderRadius: 12,
							padding: "32px 24px"
						}
					}}>
					<CreateTeamForm onFinish={onFinish}  teams={{teams: []}} initialValues={teamsData || {}} />
				</Modal>
			</div>
			</ScrollableContent>
		</PageWrapper>
	)
}
