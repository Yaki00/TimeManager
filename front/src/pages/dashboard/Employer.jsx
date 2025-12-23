import React from 'react';
import styled from 'styled-components';
import { DatePicker, Spin, Alert } from 'antd';
import dayjs from 'dayjs';
import 'dayjs/locale/fr';
import { useGetCurrentUserKPIs } from '../../service/useKpi';
import { useUserStore } from '../../zustand/store';
import {
	BarChart,
	Bar,
	LineChart,
	Line,
	PieChart,
	Pie,
	Cell,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	ResponsiveContainer,
	AreaChart,
	Area
} from 'recharts';

import { KPICard, StatCard, StatLabel, StatValue, StatsGrid, WideKPICard, DashboardGrid,ChartContainer  } from '../../utils/dashboardStyle';


dayjs.locale('fr');


const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export const Employer = ({dateRange}) => {
	const user = useUserStore((state) => state.user);
	const startDate = dateRange?.[0]?.format('YYYY-MM-DD');
	const endDate = dateRange?.[1]?.format('YYYY-MM-DD');
	
	const { data: userData, isLoading, error } = useGetCurrentUserKPIs(startDate, endDate);

	if (isLoading) {
		return (
			<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
				<Spin size="large" />
			</div>
		);
	}

	if (error) {
		return (
			<Alert
				message="Erreur"
				description={error.message || 'Erreur lors du chargement des données'}
				type="error"
				showIcon
			/>
		);
	}

	const kpiData = userData || {};
	const avgPresence = kpiData.personalAttendance?.length > 0
		? (kpiData.personalAttendance.reduce((acc, curr) => acc + curr.rate, 0) / kpiData.personalAttendance.length).toFixed(1)
		: 0;

	return (
		<>
			<StatsGrid>
				<StatCard color="#4F46E5">
					<StatLabel>Présence</StatLabel>
					<StatValue>{avgPresence}%</StatValue>
				</StatCard>
				<StatCard color="#10B981">
					<StatLabel>Conformité</StatLabel>
					<StatValue>{kpiData.contractRate?.rate || 0}%</StatValue>
				</StatCard>
				<StatCard color="#F59E0B">
					<StatLabel>Pause Moy.</StatLabel>
					<StatValue>{kpiData.pauseAverage?.minutes || 0}min</StatValue>
				</StatCard>
				<StatCard color="#8B5CF6">
					<StatLabel>Congés</StatLabel>
					<StatValue>{kpiData.leaveDays?.average || 0}j</StatValue>
				</StatCard>
			</StatsGrid>

			<DashboardGrid>
				<KPICard>
					<h3>Taux de Présence Personnel</h3>
					<ChartContainer>
						<ResponsiveContainer width="100%" height={280}>
							<AreaChart data={kpiData.personalAttendance || []}>
								<defs>
									<linearGradient id="colorUserPresence" x1="0" y1="0" x2="0" y2="1">
										<stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3}/>
										<stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
									</linearGradient>
								</defs>
								<CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
								<XAxis dataKey="month" stroke="#6B7280" />
								<YAxis domain={[0, 100]} stroke="#6B7280" />
								<Tooltip 
									contentStyle={{ 
										background: 'white', 
										border: '1px solid #E5E7EB',
										borderRadius: '8px',
										boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
									}}
								/>
								<Area 
									type="monotone" 
									dataKey="rate" 
									stroke="#4F46E5" 
									strokeWidth={3}
									fill="url(#colorUserPresence)"
								/>
							</AreaChart>
						</ResponsiveContainer>
					</ChartContainer>
				</KPICard>

				<KPICard>
					<h3>Heures Travaillées Mensuelles</h3>
					<ChartContainer>
						<ResponsiveContainer width="100%" height={280}>
							<BarChart data={kpiData.monthlyHours || []}>
								<defs>
									<linearGradient id="colorUserHours" x1="0" y1="0" x2="0" y2="1">
										<stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
										<stop offset="95%" stopColor="#10B981" stopOpacity={0.4}/>
									</linearGradient>
								</defs>
								<CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
								<XAxis dataKey="month" stroke="#6B7280" />
								<YAxis stroke="#6B7280" />
								<Tooltip 
									contentStyle={{ 
										background: 'white', 
										border: '1px solid #E5E7EB',
										borderRadius: '8px',
										boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
									}}
								/>
								<Bar dataKey="hours" fill="url(#colorUserHours)" radius={[8, 8, 0, 0]} />
							</BarChart>
						</ResponsiveContainer>
					</ChartContainer>
				</KPICard>

				<WideKPICard>
					<h3>Heures d'Arrivée et Départ</h3>
					<ChartContainer>
						<ResponsiveContainer width="100%" height={280}>
							<LineChart data={kpiData.arrivalDeparture || []}>
								<CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
								<XAxis dataKey="day" stroke="#6B7280" />
								<YAxis domain={[7, 19]} stroke="#6B7280" />
								<Tooltip 
									formatter={(value) => `${Math.floor(value)}h${Math.round((value % 1) * 60).toString().padStart(2, '0')}`}
									contentStyle={{ 
										background: 'white', 
										border: '1px solid #E5E7EB',
										borderRadius: '8px',
										boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
									}}
								/>
								<Legend />
								<Line 
									type="monotone" 
									dataKey="arrival" 
									stroke="#4F46E5" 
									strokeWidth={3} 
									name="Arrivée"
									dot={{ r: 5, strokeWidth: 2, fill: 'white' }}
									activeDot={{ r: 7 }}
								/>
								<Line 
									type="monotone" 
									dataKey="departure" 
									stroke="#10B981" 
									strokeWidth={3} 
									name="Départ"
									dot={{ r: 5, strokeWidth: 2, fill: 'white' }}
									activeDot={{ r: 7 }}
								/>
							</LineChart>
						</ResponsiveContainer>
					</ChartContainer>
				</WideKPICard>

				<KPICard>
					<h3>Avertissements par Type</h3>
					<ChartContainer>
						<ResponsiveContainer width="100%" height={280}>
							<PieChart>
								<Pie
									data={kpiData.warningsByType || []}
									cx="50%"
									cy="50%"
									labelLine={false}
									label={({ type, count }) => count > 0 ? `${type}: ${count}` : ''}
									outerRadius={90}
									fill="#8884d8"
									dataKey="count"
								>
									{(kpiData.warningsByType || []).map((entry, index) => (
										<Cell key={`cell-${index}`} fill={entry.color} />
									))}
								</Pie>
								<Tooltip />
							</PieChart>
						</ResponsiveContainer>
					</ChartContainer>
				</KPICard>
			</DashboardGrid>
		</>
	);
};