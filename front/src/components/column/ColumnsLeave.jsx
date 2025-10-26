import React from 'react';
import { Tag } from 'antd';
import dayjs from 'dayjs';
import { TagStyle } from '../../utils/TagStyle';


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
	render: (status) => {
		let color = 'default';
				if (status === 'Accepted') color = 'success';
				if (status === 'Refused') color = 'error';
				if (status === 'EnAttente') color = 'warning';
				
				return (
					<TagStyle color={color} text={status} />
				);
	}
  },
];