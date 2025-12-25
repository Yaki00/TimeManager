import React from 'react';
import { Form, DatePicker, Button, Select, Input } from 'antd';
import dayjs from 'dayjs';
import { ButtonStyle } from '@/utils/ButtonStyle';

const { RangePicker } = DatePicker;
const { TextArea } = Input;


export const CreateLeaveForm = ({ onFinish, isLoading }) => {

  return (
    <Form
      layout="vertical"
      onFinish={onFinish}
    >
      <Form.Item 
        label="Type de demande" 
        name="leaveType" 
        rules={[{ required: true, message: 'Veuillez sélectionner un type!' }]}
        initialValue="leave"
      >
        <Select
          placeholder="Sélectionnez le type de demande"
          options={[
            { value: 'leave', label: 'Congé payé' },
            { value: 'remote', label: 'Télétravail' },
            { value: 'sick', label: 'Arrêt maladie' },
            { value: 'other', label: 'Autre absence' },
          ]}
        />
      </Form.Item>

      <Form.Item 
        label="Période" 
        name="dateRange" 
        rules={[{ required: true, message: 'Veuillez sélectionner une période!' }]}
      >
        <RangePicker 
          style={{ width: '100%' }}
          format="DD/MM/YYYY"
          disabledDate={(current) => current && current < dayjs().startOf('day')}
        />
      </Form.Item>

      <Form.Item 
        label="Justification" 
        name="justification"
        rules={[{ required: true, message: 'Veuillez fournir une justification!' }]}
      >
        <TextArea 
          rows={4} 
          placeholder="Décrivez la raison de votre demande..."
          maxLength={500}
          showCount
        />
      </Form.Item>

      <Form.Item>
        <ButtonStyle 
          type="primary" 
          loading={isLoading} 
          htmlType="submit" 
          style={{ width: '100%', height: '42px' }}
        >
          Soumettre la demande
        </ButtonStyle>
      </Form.Item>
    </Form>
  )
}