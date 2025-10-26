
import styled from 'styled-components';
import dayjs from 'dayjs';
import 'dayjs/locale/fr';
import { Table as AntTable, Button, Space, Tag } from 'antd';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import {
	BarChart,
	Bar,
	LineChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	ResponsiveContainer,
	
} from 'recharts';
import { KPICard, StatCard, StatLabel, StatValue, StatsGrid, WideKPICard, DashboardGrid,ChartContainer  } from '../../utils/dashboardStyle';
import { TableStyle } from '../../utils/TableStyle';
import { TagStyle } from '../../utils/TagStyle';

dayjs.locale('fr');



const RequestsCard = styled(KPICard)`
  grid-column: 1 / -1;

  .ant-table {
    background: transparent;
  }

  .ant-table-thead > tr > th {
    background: #f8fafc;
    color: #475569;
    font-weight: 600;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    border-bottom: 2px solid #e2e8f0;
  }

  .ant-table-tbody > tr > td {
    border-bottom: 1px solid #e2e8f0;
  }

  .ant-table-tbody > tr:hover > td {
    background: #f8fafc;
  }

  .ant-table-wrapper {
    border-radius: 12px;
  }
`;

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];


const columns = [
		{
			title: 'Membre',
			dataIndex: 'member',
			key: 'member',
			render: (text) => <strong>{text}</strong>,
			sorter: (a, b) => a.member.localeCompare(b.member),
		},
		{
			title: 'Type',
			dataIndex: 'type',
			key: 'type',
			width: 120,
			render: (type) => (
				<TagStyle text={type} color="blue" />
			),
			filters: [
				{ text: 'Congé', value: 'Congé' },
				{ text: 'RTT', value: 'RTT' },
				{ text: 'Télétravail', value: 'Télétravail' },
				{ text: 'Congé maladie', value: 'Congé maladie' },
				{ text: 'Formation', value: 'Formation' },
			],
			onFilter: (value, record) => record.type.includes(value),
		},
		{
			title: 'Date début',
			dataIndex: 'startDate',
			key: 'startDate',
			width: 180,
			render: (date) => dayjs(date).format('DD/MM/YYYY'),
			sorter: (a, b) => dayjs(a.startDate).unix() - dayjs(b.startDate).unix(),
		},
		{
			title: 'Date fin',
			dataIndex: 'endDate',
			key: 'endDate',
			width: 180,
			render: (date) => dayjs(date).format('DD/MM/YYYY'),
			sorter: (a, b) => dayjs(a.endDate).unix() - dayjs(b.endDate).unix(),
		},
		{
			title: 'Raison',
			dataIndex: 'reason',
			key: 'reason',
			ellipsis: true,
		},
		{
			title: 'Statut',
			dataIndex: 'status',
			key: 'status',
			width: 120,
			render: (status) => {
				let color = 'default';
				if (status === 'Approuvé') color = 'success';
				if (status === 'Refusé') color = 'error';
				if (status === 'En attente') color = 'warning';
				
				return (
					<TagStyle color={color} text={status} />
				);
			},
			filters: [
				{ text: 'Approuvé', value: 'Approuvé' },
				{ text: 'Refusé', value: 'Refusé' },
				{ text: 'En attente', value: 'En attente' },
			],
			onFilter: (value, record) => record.status === value,
		},
		{
			title: 'Actions',
			key: 'actions',
			render: (_, record) => (
				record.status === 'En attente' ? (
					<Space size="small">
						<Button
							type="primary"
							icon={<CheckOutlined />}
							size="small"
							style={{ background: '#10B981', borderColor: '#10B981' }}
							onClick={() => handleRequestAction(record.id, 'approve')}
						>
							Approuver
						</Button>
						<Button
							danger
							icon={<CloseOutlined />}
							size="small"
							onClick={() => handleRequestAction(record.id, 'reject')}
						>
							Refuser
						</Button>
					</Space>
				) : (
					<span style={{ color: '#999', fontSize: '12px' }}>Traité</span>
				)
			),
		},
	];
const handleRequestAction = (requestId, action) => {
console.log(`Action ${action} sur la demande ${requestId}`);
alert(`Demande ${requestId} ${action === 'approve' ? 'approuvée' : 'refusée'}`);
	};
export const Manager = ({ selectedTeam, mockManagerTeams }) => {
	const currentTeamData = mockManagerTeams[selectedTeam];

	return (
		<>
			<StatsGrid>
				<StatCard color="#4F46E5">
					<StatLabel>Présence Équipe</StatLabel>
						<StatValue>{currentTeamData.teamAttendance.rate}%</StatValue>
					</StatCard>
					<StatCard color="#10B981">
						<StatLabel>Heures Moyenne</StatLabel>
						<StatValue>{(currentTeamData.hoursWorked.reduce((acc, curr) => acc + curr.hours, 0) / currentTeamData.hoursWorked.length).toFixed(1)}h</StatValue>
					</StatCard>
					<StatCard color="#EF4444">
						<StatLabel>Avertissements</StatLabel>
						<StatValue>{currentTeamData.warnings.reduce((acc, curr) => acc + curr.count, 0)}</StatValue>
					</StatCard>
					<StatCard color="#8B5CF6">
						<StatLabel>Membres</StatLabel>
						<StatValue>{currentTeamData.attendance.length}</StatValue>
					</StatCard>
				</StatsGrid>

				<DashboardGrid>
					<KPICard>
						<h3>Taux de Présence par Membre</h3>
						<ChartContainer>
							<ResponsiveContainer width="100%" height={280}>
								<BarChart data={currentTeamData.attendance}>
									<defs>
										<linearGradient id="colorPresence" x1="0" y1="0" x2="0" y2="1">
											<stop offset="5%" stopColor="#4F46E5" stopOpacity={0.8}/>
											<stop offset="95%" stopColor="#4F46E5" stopOpacity={0.4}/>
										</linearGradient>
									</defs>
									<CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
									<XAxis dataKey="name" stroke="#6B7280" />
									<YAxis domain={[0, 100]} stroke="#6B7280" />
									<Tooltip 
										contentStyle={{ 
											background: 'white', 
											border: '1px solid #E5E7EB',
											borderRadius: '8px',
											boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
										}}
									/>
									<Bar dataKey="rate" fill="url(#colorPresence)" radius={[8, 8, 0, 0]} />
								</BarChart>
							</ResponsiveContainer>
						</ChartContainer>
					</KPICard>

					<KPICard>
						<h3>Heures Travaillées par Membre</h3>
						<ChartContainer>
							<ResponsiveContainer width="100%" height={280}>
								<BarChart data={currentTeamData.hoursWorked}>
									<defs>
										<linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
											<stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
											<stop offset="95%" stopColor="#10B981" stopOpacity={0.4}/>
										</linearGradient>
									</defs>
									<CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
									<XAxis dataKey="member" stroke="#6B7280" />
									<YAxis stroke="#6B7280" />
									<Tooltip 
										contentStyle={{ 
											background: 'white', 
											border: '1px solid #E5E7EB',
											borderRadius: '8px',
											boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
										}}
									/>
									<Bar dataKey="hours" fill="url(#colorHours)" radius={[8, 8, 0, 0]} />
								</BarChart>
							</ResponsiveContainer>
						</ChartContainer>
					</KPICard>

					<KPICard>
						<h3>Avertissements par Membre</h3>
						<ChartContainer>
							<ResponsiveContainer width="100%" height={280}>
								<BarChart data={currentTeamData.warnings}>
									<defs>
										<linearGradient id="colorWarnings" x1="0" y1="0" x2="0" y2="1">
											<stop offset="5%" stopColor="#EF4444" stopOpacity={0.8}/>
											<stop offset="95%" stopColor="#EF4444" stopOpacity={0.4}/>
										</linearGradient>
									</defs>
									<CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
									<XAxis dataKey="member" stroke="#6B7280" />
									<YAxis stroke="#6B7280" />
									<Tooltip 
										contentStyle={{ 
											background: 'white', 
											border: '1px solid #E5E7EB',
											borderRadius: '8px',
											boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
										}}
									/>
									<Bar dataKey="count" fill="url(#colorWarnings)" radius={[8, 8, 0, 0]} />
								</BarChart>
							</ResponsiveContainer>
						</ChartContainer>
					</KPICard>

					<WideKPICard>
						<h3>Conformité au Contrat (% des heures)</h3>
						<ChartContainer>
							<ResponsiveContainer width="100%" height={320}>
								<LineChart data={currentTeamData.contractCompliance}>
									<CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
									<XAxis dataKey="month" stroke="#6B7280" />
									<YAxis domain={[90, 105]} stroke="#6B7280" />
									<Tooltip 
										contentStyle={{ 
											background: 'white', 
											border: '1px solid #E5E7EB',
											borderRadius: '8px',
											boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
										}}
									/>
									<Legend 
										wrapperStyle={{
											paddingTop: '20px'
										}}
									/>
									{currentTeamData.attendance.map((member, index) => (
										<Line 
											key={member.name}
											type="monotone" 
											dataKey={member.name} 
											stroke={COLORS[index % COLORS.length]} 
											strokeWidth={3}
											dot={{ r: 5, strokeWidth: 2, fill: 'white' }}
											activeDot={{ r: 7 }}
										/>
									))}
								</LineChart>
							</ResponsiveContainer>
						</ChartContainer>
					</WideKPICard>

					<KPICard>
						<h3>Temps de Pause Moyen</h3>
						<ChartContainer>
							<ResponsiveContainer width="100%" height={280}>
								<BarChart data={currentTeamData.pauseTime}>
									<defs>
										<linearGradient id="colorPause" x1="0" y1="0" x2="0" y2="1">
											<stop offset="5%" stopColor="#F59E0B" stopOpacity={0.8}/>
											<stop offset="95%" stopColor="#F59E0B" stopOpacity={0.4}/>
										</linearGradient>
									</defs>
									<CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
									<XAxis dataKey="member" stroke="#6B7280" />
									<YAxis stroke="#6B7280" />
									<Tooltip 
										contentStyle={{ 
											background: 'white', 
											border: '1px solid #E5E7EB',
											borderRadius: '8px',
											boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
										}}
									/>
									<Bar dataKey="minutes" fill="url(#colorPause)" radius={[8, 8, 0, 0]} />
								</BarChart>
							</ResponsiveContainer>
						</ChartContainer>
					</KPICard>

					<KPICard>
						<h3>Jours de Congé par Membre</h3>
						<ChartContainer>
							<ResponsiveContainer width="100%" height={280}>
								<BarChart data={currentTeamData.leaveDays}>
									<defs>
										<linearGradient id="colorLeave" x1="0" y1="0" x2="0" y2="1">
											<stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
											<stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.4}/>
										</linearGradient>
									</defs>
									<CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
									<XAxis dataKey="member" stroke="#6B7280" />
									<YAxis stroke="#6B7280" />
									<Tooltip 
										contentStyle={{ 
											background: 'white', 
											border: '1px solid #E5E7EB',
											borderRadius: '8px',
											boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
										}}
									/>
									<Bar dataKey="days" fill="url(#colorLeave)" radius={[8, 8, 0, 0]} />
								</BarChart>
							</ResponsiveContainer>
						</ChartContainer>
					</KPICard>

					<RequestsCard>
						<h3>Demandes des Membres</h3>
						<TableStyle
							columns={columns}
							dataSource={currentTeamData.requests}
							pagination={false}
							locale={{
								filterConfirm: 'Filtrer',
								filterReset: 'Réinitialiser',
								emptyText: 'Aucune demande',
							}}
						/>
					</RequestsCard>
				</DashboardGrid>
			</>
		);
	};