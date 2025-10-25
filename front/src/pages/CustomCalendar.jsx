import React, { useState } from 'react';
import styled from 'styled-components';
import { Badge, Tooltip } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import 'dayjs/locale/fr';
dayjs.locale('fr');

const CalendarWrapper = styled.div`
  background: linear-gradient(135deg, #fdfdff 0%, #f4f6ff 100%);
  border-radius: 16px;
  padding: 28px 32px;
  box-shadow: 0 6px 22px rgba(0,0,0,0.08);
  user-select: none;
  width: 100%;
  transition: all 0.3s ease;
`;

const CustomHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 26px;
  color: #4a4a6a;

  .month-year {
    font-size: 24px;
    font-weight: 700;
    text-transform: capitalize;
    letter-spacing: 0.3px;
  }
`;

const ArrowButton = styled.button`
  background: transparent;
  border: none;
  cursor: pointer;
  color: #9191fa;
  font-size: 24px;
  padding: 4px 8px;
  border-radius: 8px;
  transition: all 0.25s ease;

  &:hover {
    background: rgba(145,145,250,0.1);
    color: #6363d1;
  }
`;

const WeekRow = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  font-weight: 600;
  color: #777;
  margin-bottom: 12px;

  div {
    padding-bottom: 6px;
    border-bottom: 2px solid rgba(145, 145, 250, 0.15);
  }
`;

const DayGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 10px;
`;

const DayCell = styled.div`
  position: relative;
  border-radius: 10px;
  height: 90px;
  background: ${(p) => (p.isSelected ? '#9191fa' : 'white')};
  color: ${(p) => (p.isSelected ? 'white' : p.isSameMonth ? '#333' : '#aaa')};
  box-shadow: ${(p) => (p.isSelected ? '0 6px 12px rgba(145,145,250,0.3)' : '0 2px 8px rgba(0,0,0,0.05)')};
  transition: all 0.25s ease;
  cursor: ${(p) => (p.isSameMonth ? 'pointer' : 'default')};
  opacity: ${(p) => (p.isSameMonth ? 1 : 0.5)};
  padding: 6px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: space-between;

  &:hover {
    transform: ${(p) => (p.isSameMonth ? 'translateY(-3px)' : 'none')};
    background: ${(p) => (p.isSelected ? '#7a7af8' : '#f1f2ff')};
  }

  .date-number {
    font-weight: 600;
    font-size: 16px;
  }

  .leave-badge {
    position: absolute;
    bottom: 8px;
    left: 8px;
    font-size: 11px;
    background: ${(p) => {
      if (!p.leaveColor) return 'transparent';
      if (p.leaveColor === 'green') return '#00c48c';
      if (p.leaveColor === 'orange') return '#ff9f43';
      if (p.leaveColor === 'red') return '#ee5a6f';
      return '#00c48c';
    }};
    color: white;
    padding: 3px 8px;
    border-radius: 12px;
    font-weight: 600;
    letter-spacing: 0.2px;
    text-transform: uppercase;
  }
`;

export const CustomCalendar = ({ leaves = [], selectedDate, onSelect }) => {

  console.log("Leaves in CustomCalendar:", leaves);
  const [currentMonth, setCurrentMonth] = useState(selectedDate.startOf('month'));

  const prevMonth = () => setCurrentMonth(currentMonth.subtract(1, 'month'));
  const nextMonth = () => setCurrentMonth(currentMonth.add(1, 'month'));

  const monthYearLabel = currentMonth.format('MMMM YYYY');

  const startDay = currentMonth.startOf('month').startOf('week');
  const endDay = currentMonth.endOf('month').endOf('week');
  const dayCount = endDay.diff(startDay, 'day') + 1;

  const calendarDays = Array.from({ length: dayCount }, (_, i) => startDay.add(i, 'day'));

  const isSameMonth = (date) => date.isSame(currentMonth, 'month');
  const isSelected = (date) => date.isSame(selectedDate, 'day');
  
  const getLeaveInfo = (date) => {
    const leave = leaves.find((l) => l.date === date.format('YYYY-MM-DD'));
    return leave || null;
  };

  return (
    <CalendarWrapper>
      <CustomHeader>
        <ArrowButton onClick={prevMonth}>
          <LeftOutlined />
        </ArrowButton>
        <div className="month-year">{monthYearLabel}</div>
        <ArrowButton onClick={nextMonth}>
          <RightOutlined />
        </ArrowButton>
      </CustomHeader>

      <WeekRow>
        {[, 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((d) => (
          <div key={d}>{d}</div>
        ))}
      </WeekRow>

      <DayGrid>
        {calendarDays.map((day) => {
          const leaveInfo = getLeaveInfo(day);
          const statusLabel = leaveInfo?.status === 'Accepte' ? 'Approuvé' : 
                             leaveInfo?.status === 'EnAttente' ? 'En attente' : 
                             leaveInfo?.status === 'Refuse' ? 'Refusé' : null;
          
          return (
            <Tooltip 
              key={day.toString()} 
              title={leaveInfo ? `${statusLabel} - ${leaveInfo.type || 'Congé'}` : null}
            >
              <DayCell
                isSelected={isSelected(day)}
                isSameMonth={isSameMonth(day)}
                leaveColor={leaveInfo?.color}
                onClick={() => isSameMonth(day) && onSelect(day)}
              >
                <span className="date-number">{day.date()}</span>
                {leaveInfo && <span className="leave-badge">{statusLabel}</span>}
              </DayCell>
            </Tooltip>
          );
        })}
      </DayGrid>
    </CalendarWrapper>
  );
};
