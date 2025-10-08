import styled from "styled-components";
import { Table } from "antd";

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
];

export const SearchUser = () => {
  return (
    <>
	<h1>Search User Page</h1>
	<div>
		<Content>
			<Table dataSource={dataSource} columns={columns} />

		</Content>
	</div>
	
	</>
  );
};