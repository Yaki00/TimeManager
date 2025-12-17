
import React, { useState } from 'react';
import styled from 'styled-components';
import { DatePicker, Select } from 'antd';
import dayjs from 'dayjs';
import 'dayjs/locale/fr';
import { Header,PageWrapper, ScrollableContent } from '../../utils/layoutStyle';
import { Breadcrumbs } from '../../utils/Breadcrumb';
import { Responsable } from './Responsable';
import { Manager } from './Manager';
import { Employer } from './Employer';
import { useGetTeams } from '../../service/useTeam';

dayjs.locale('fr');

const { RangePicker } = DatePicker;


const ViewSwitcher = styled.div`
  display: flex;
  gap: 8px;
  background: #f1f5f9;
  padding: 4px;
  border-radius: 10px;
  width: fit-content;
`;

const ViewButton = styled.button`
  padding: 10px 24px;
  border: none;
  border-radius: 8px;
  background: ${props => props.active ? 'white' : 'transparent'};
  color: ${props => props.active ? '#4F46E5' : '#64748b'};
  font-weight: ${props => props.active ? '700' : '600'};
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: ${props => props.active ? '0 2px 8px rgba(0, 0, 0, 0.08)' : 'none'};

  &:hover {
    color: ${props => props.active ? '#4F46E5' : '#1e293b'};
    background: ${props => props.active ? 'white' : '#e2e8f0'};
  }
`;

const TeamSelector = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  background: #f1f5f9;
  padding: 4px 4px 4px 16px;
  border-radius: 10px;
  width: fit-content;
  
  label {
    font-weight: 600;
    color: #64748b;
    font-size: 14px;
    white-space: nowrap;
  }

  .ant-select {
    min-width: 200px;

    .ant-select-selector {
      border: none;
      border-radius: 8px;
      background: white;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      padding: 6px 16px;
      height: auto;
      
      &:hover {
        background: #fafafa;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
      }
    }

    &.ant-select-focused .ant-select-selector {
      background: white;
      box-shadow: 0 2px 8px rgba(79, 70, 229, 0.2);
    }

    .ant-select-selection-item {
      font-size: 14px;
      font-weight: 600;
      color: #1e293b;
    }

    .ant-select-arrow {
      color: #64748b;
    }
  }
`;

const DateRangeSelector = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  background: #f1f5f9;
  padding: 4px 4px 4px 16px;
  border-radius: 10px;
  
  label {
    font-weight: 600;
    color: #64748b;
    font-size: 14px;
    white-space: nowrap;
  }

  .ant-picker {
    border-radius: 8px;
    border: none;
    background: white;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    
    &:hover {
      background: #fafafa;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
    }
    
    &.ant-picker-focused {
      background: white;
      box-shadow: 0 2px 8px rgba(79, 70, 229, 0.2);
    }
  }

  .ant-picker-input > input {
    font-size: 14px;
    font-weight: 600;
    color: #1e293b;
  }
`;


export const Dashboard = () => {
	const [activeView, setActiveView] = useState('responsable');
	const [selectedTeam, setSelectedTeam] = useState(null);
	const [dateRange, setDateRange] = useState([
		dayjs().subtract(30, 'days'),
		dayjs()
	]);

	const { data: teams, isLoading: isLoadingTeams } = useGetTeams();

	const handleRequestAction = (requestId, action) => {
		console.log(`Action ${action} sur la demande ${requestId}`);
		alert(`Demande ${requestId} ${action === 'approve' ? 'approuvée' : 'refusée'}`);
	};

	const handleDateRangeChange = (dates) => {
		if (dates) {
			setDateRange(dates);
			console.log('Période sélectionnée:', {
				debut: dates[0].format('YYYY-MM-DD'),
				fin: dates[1].format('YYYY-MM-DD')
			});
		}
	};

	const rangePresets = [
		{
			label: 'Aujourd\'hui',
			value: [dayjs().startOf('day'), dayjs().endOf('day')],
		},
		{
			label: '7 derniers jours',
			value: [dayjs().subtract(7, 'days'), dayjs()],
		},
		{
			label: '15 derniers jours',
			value: [dayjs().subtract(15, 'days'), dayjs()],
		},
		{
			label: '30 derniers jours',
			value: [dayjs().subtract(30, 'days'), dayjs()],
		},
		{
			label: '3 derniers mois',
			value: [dayjs().subtract(3, 'months'), dayjs()],
		},
		{
			label: '6 derniers mois',
			value: [dayjs().subtract(6, 'months'), dayjs()],
		},
		{
			label: '1 an',
			value: [dayjs().subtract(1, 'year'), dayjs()],
		},
		{
			label: 'Ce mois',
			value: [dayjs().startOf('month'), dayjs().endOf('month')],
		},
		{
			label: 'Mois dernier',
			value: [dayjs().subtract(1, 'month').startOf('month'), dayjs().subtract(1, 'month').endOf('month')],
		},
		{
			label: 'Cette année',
			value: [dayjs().startOf('year'), dayjs().endOf('year')],
		},
	];
return (
		<PageWrapper>
			<Header>
				<Breadcrumbs
					items={[
						{ label: "Dashboard", path: "/" },
					]}
				/>
				<h1>Dashboard</h1>
				<div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent:"space-between", marginTop: 10 }}>
					<div style={{display: "flex", gap: '15px'}}>
						<ViewSwitcher>
							<ViewButton 
								active={activeView === 'responsable'} 
								onClick={() => setActiveView('responsable')}
							>
								Vue Responsable
							</ViewButton>
							<ViewButton 
								active={activeView === 'manager'} 
								onClick={() => setActiveView('manager')}
							>
								Vue Manager
							</ViewButton>
							<ViewButton 
								active={activeView === 'user'} 
								onClick={() => setActiveView('user')}
							>
								Vue Utilisateur
							</ViewButton>
						</ViewSwitcher>
						
						{activeView === 'manager' && (
							<TeamSelector>
								<label>Équipe :</label>
								<Select
									value={selectedTeam}
									onChange={setSelectedTeam}
									loading={isLoadingTeams}
									placeholder="Sélectionner une équipe"
									options={teams?.map((team) => ({
										label: team.teamName,
										value: team.id.toString(),
									})) || []}
									style={{ minWidth: '200px' }}
								/>
							</TeamSelector>
						)}
					</div>
						<DateRangeSelector>
							<label>Période :</label>
							<RangePicker
								value={dateRange}
								onChange={handleDateRangeChange}
								presets={rangePresets}
								format="DD/MM/YYYY"
								placeholder={['Date début', 'Date fin']}
								style={{ minWidth: '280px' }}
							/>
						</DateRangeSelector>
				</div>
			</Header>
			<ScrollableContent>
				{activeView === 'responsable' && <Responsable selectedTeam={selectedTeam} dateRange={dateRange} onRequestAction={handleRequestAction} />}
				{activeView === 'manager' && <Manager selectedTeam={selectedTeam} dateRange={dateRange} onRequestAction={handleRequestAction} />}
        		{activeView === 'user' && <Employer dateRange={dateRange} />}
			</ScrollableContent>
		</PageWrapper>
	);
}