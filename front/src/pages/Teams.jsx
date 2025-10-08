import styled from "styled-components";
import { Button, Table, Modal } from "antd";
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { useState } from "react";
import { FormUpdateTeam } from "../components/FormUpdateTeam";

const Content = styled.div`
  flex: 1;
  margin-top: 50px;
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

const columns = [
  {
	title: 'Name',
	dataIndex: 'name',
	key: 'name',
  },
  {
	title: 'Age',
	dataIndex: 'age',
	key: 'age',
  },
  {
	title: 'Address',
	dataIndex: 'address',
	key: 'address',
  },
  {
	title: 'Action',
	key: 'action',
	width: '10px',
	render: () => (
	  <Action />
	),
  }
];

const Action = () => {
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [isModalUpdateTeamOpen, setIsModalUpdateTeamOpen] = useState(false);




  const showModal = () => {
	setIsModalOpen(true);
  };

  const handleOk = () => {
	setIsModalOpen(false);
  };

  const handleCancel = () => {
	setIsModalOpen(false);
  };
  return (
	<div style={{ display: 'flex', gap: '10px' }}>
	  <Button type="primary" style={{ marginTop: '20px', backgroundColor: 'red'  }} icon={<DeleteOutlined />}onClick={showModal}/>
	  <Modal
	  		closable={{ 'aria-label': 'Custom Close Button' }}
			open={isModalUpdateTeamOpen}
			onOk={() => setIsModalUpdateTeamOpen(false)}
			onCancel={() => setIsModalUpdateTeamOpen(false)}
			width={400}
			footer={null}
		  >
			<FormUpdateTeam onClose={() => setIsModalUpdateTeamOpen(false)} />
		  </Modal>		
	  <Button type="primary" style={{ marginTop: '20px', backgroundColor: 'grey' }} icon={<EditOutlined />} onClick={() => setIsModalUpdateTeamOpen(true)} />
		<Modal
		  closable={{ 'aria-label': 'Custom Close Button' }}
		  open={isModalOpen}
		  onOk={handleOk}
		  onCancel={handleCancel}
		  width={400}
		  footer={[
			<Button key="back" onClick={handleCancel}> Annuler </Button>,
			<Button key="submit" type="primary" onClick={handleOk} style={{ backgroundColor: "#C0C0F6", boxShadow:"none" }}>
			  Confirmer
			</Button>,
		  ]}
		>
		  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
			<p>etes vous sure de vouloir modifier ?</p>
		  </div>
		</Modal>
	</div>
  )
}

const Footer = () => {
  return (<div style={{  }}>
	<Button type="primary" style={{ backgroundColor: "#C0C0F6", boxShadow:"none" }}>Add Team</Button>
  </div>
  )
}


const TableStyle = styled(Table)`
  .ant-table{
	border-radius: 8px;
  }
  .ant-table-thead > tr > th {
  }
  .ant-table-footer{
	border-radius: 8px;
	padding: 10px 16px;
  }
  .ant-table-thead{
	background-color: #fafafa;
  }
`;


export const Teams = () => {
  return (
	<>
	<h1>Teams Page</h1>
	<div>
		<Content>
			<TableStyle dataSource={dataSource} columns={columns} pagination={false} footer={() => <Footer />} />
		</Content>
	</div>
	</>
  );
};