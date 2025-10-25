import React from 'react';
import { Form, DatePicker, Button } from 'antd';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;


export const CreateLeaveForm = ({ onFinish, isLoading }) => {

	return (
		<Form
          layout="vertical"
          onFinish={onFinish}
        >
          <Form.Item 
            label="Période de congé" 
            name="dateRange" 
            rules={[{ required: true, message: 'Veuillez sélectionner une période!' }]}
          >
            <RangePicker 
              style={{ width: '100%' }}
              format="DD/MM/YYYY"
              disabledDate={(current) => current && current < dayjs().startOf('day')}
            />
          </Form.Item>
          <Form.Item>
            <Button 
              type="primary" 
              loading={isLoading} 
              htmlType="submit" 
              style={{ width: '100%' }}
            >
              Soumettre la demande
            </Button>
          </Form.Item>
        </Form>
	)
}