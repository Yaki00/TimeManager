import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import dayjs from 'dayjs';
import { CustomCalendar } from './CustomCalendar';
import {
  CalendarOutlined,
  ClockCircleOutlined,
  FieldTimeOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Button, Modal, DatePicker, message, Progress, Avatar, Tag } from 'antd';
import { Breadcrumbs } from '../utils/Breadcrumb';
import { useCreateLeave, useGetLeavesByUserId } from '../service/useLeave';
const { RangePicker } = DatePicker;
import {
  
  Form,
  
} from 'antd';
import { useUserStore } from '../zustand/store';
import { formatedDataForCalendar } from '../utils/formatedData';
import { CreateLeaveForm } from '../components/form/CreateLeaveForm';
import { TableStyle } from '../utils/TableStyle';
import { columns } from '../components/column/ColumnsLeave';

const Page = styled.div`
  padding: 40px;
  font-family: 'Inter', sans-serif;
  background: #f9f9fb;
  min-height: 100vh;
  color: #333;
  overflow: auto;
  margin-top:40px;
`;

const Content = styled.div`
  display: flex;
  gap: 40px;
  width: 100%;
  max-width: 100%;
  
  @media (max-width: 1200px) {
    gap: 24px;
  }
  
  @media (max-width: 900px) {
    flex-direction: column;
    gap: 20px;
  }
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
  flex: 0 0 auto;
  width: 350px;
  
  @media (max-width: 1200px) {
    min-width: 250px;
    width: 300px;
  }
  
  @media (max-width: 900px) {
    width: 100%;
    min-width: 100%;
  }
`;

const Section = styled.div`
  background: white;
  border-radius: 14px;
  padding: 20px 18px;
  box-shadow: 0 2px 10px rgba(145, 145, 250, 0.15);
  transition: transform 0.2s ease;
  overflow: ${props => props.scroll ? 'auto' : 'hidden'};
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

  &:hover {
    background: linear-gradient(90deg, #7a7af8, #b0b0ff)  !important;
    transform: translateY(-2px);
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

const dataSource = [
  {
    key: '1',
    name: 'Mike',
    age: 32,
    address: '10 Downing Street',
  },
  {
    key: '2',
    name: 'John',
    age: 42,
    address: '10 Downing Street',
  },
];




const dummyBadges = [
  { time: '08:15', label: 'Entrée', icon: <ClockCircleOutlined /> },
  { time: '12:00', label: 'Sortie Pause', icon: <ClockCircleOutlined /> },
  { time: '13:00', label: 'Retour Pause', icon: <ClockCircleOutlined /> },
  { time: '13:00', label: 'Retour Pause', icon: <ClockCircleOutlined /> },
  

];

export const Time = () => {
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [leaves, setLeaves] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newLeaveDate, setNewLeaveDate] = useState(null);
  const user = useUserStore((state) => state.user);
  const userId = user.id;

  const { createLeaveAsync, isLoading } = useCreateLeave();
  const { data: userLeaves, isLoading: isLoadingLeaves } = useGetLeavesByUserId(userId);

  const leaveStats = React.useMemo(() => {
    if (!userLeaves || userLeaves.length === 0) {
      return { usedDays: 0, remainingDays: 20, totalDays: 20 };
    }

    const approvedLeaves = userLeaves.filter(leave => leave.status === 'approved');
    const usedDays = approvedLeaves.reduce((total, leave) => total + (leave.dayLeave || 0), 0);
    const totalDays = 20; 
    const remainingDays = totalDays - usedDays;

    return { usedDays, remainingDays, totalDays };
  }, [userLeaves]);

  useEffect(() => {
    if (userLeaves) {
      setLeaves(formatedDataForCalendar(userLeaves));
    }
  }, [userLeaves]);

  console.log("User leaves fetched:", userLeaves);
  console.log("Formatted leaves for calendar:", leaves);
  const onSelect = (date) => setSelectedDate(date);

  const openRequestModal = () => {
    setModalVisible(true);
  };

  const onFinish = async (value) => {
      const response = await createLeaveAsync({
        startDate: dayjs(value.dateRange[0]).format('YYYY-MM-DD'),
        endDate: dayjs(value.dateRange[1]).format('YYYY-MM-DD'),
        justification: 'Congé payé',
        dayLeave: dayjs(value.dateRange[1]).diff(dayjs(value.dateRange[0]), 'day') + 1,
      });
      console.log("Create leave response:", response);
      if(response.status !== "error") {
        message.success(`Congé demandé du ${dayjs(value.dateRange[0]).format('DD/MM/YYYY')} au ${dayjs(value.dateRange[1]).format('DD/MM/YYYY')}`);
        setModalVisible(false);
      }else {
        message.error(response.message || "Erreur lors de la création du congé");
      }
      
  };

  if (isLoadingLeaves) return <div>Loading leaves...</div>;


  return (
	<div style={{ marginTop: '50px' }}>
	<Breadcrumbs
				items={[
				{ label: "Dashboard", path: "/" },
				{ label: "Teams" },
				]}
			/>
			<h1>Congés</h1>
    <Page>
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

          <Section scroll={true}>
            <h3>
              <FieldTimeOutlined style={{ marginRight: 8 }} />
              Badge du jour ({selectedDate.format('DD/MM/YYYY')})
            </h3>
            {dummyBadges.map(({ time, label, icon }, i) => (
              <BadgeItem key={i}>
                {icon} <span>{label}</span> <span className="time">{time}</span>
              </BadgeItem>
            ))}
          </Section>

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
            <h3>Nouvelle demande</h3>
            <p style={{ color: '#666', marginBottom: 14 }}>
              Planifiez vos prochains jours de repos.
            </p>
            <RequestButton type="primary" onClick={() => setModalVisible(true)}>
              Demander un congé
            </RequestButton>
          </Section>
        </Sidebar>
        <MainContent>
          <CustomCalendar
            leaves={leaves}
            selectedDate={selectedDate}
            onSelect={onSelect}
          />

          <TableStyle dataSource={userLeaves} columns={columns} pagination={false} scroll={{ y: 450 }} />
        </MainContent>
        

      </Content>

      <Modal
        title="Demander un congé"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        <CreateLeaveForm onFinish={onFinish} isLoading={isLoadingLeaves} />
      </Modal>
    </Page>
	</div>

  );
};
