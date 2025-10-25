import React from 'react';
import { Tag } from 'antd';
import dayjs from 'dayjs';


export const columns = [
  {
	title: 'Debut',
	dataIndex: 'startDate',
	key: 'startDate',
	render: (text) => dayjs(text).format('dddd DD MMMM YYYY'),
  },
  {
	title: 'Fin',
	dataIndex: 'endDate',
	key: 'endDate',
	render: (text) => dayjs(text).format('dddd DD MMMM YYYY'),
  },
  {
	title: 'Justification',
	dataIndex: 'justification',
	key: 'justification',
	width: '30%',
  },
  {
	title: 'Nombre de jours',
	dataIndex: 'daysLeave',
	key: 'daysLeave',
	sorter: (a, b) => a.daysLeave - b.daysLeave,
  },
  {
	title: 'Statut',
	dataIndex: 'status',
	key: 'status',
	render: (text) => {
	   return <Tag color={text === 'Accepted' ? 'green' : 'volcano'}>{text}</Tag>
	}
  },
];