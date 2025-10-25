import { Table } from "antd";
import styled from "styled-components";

export const TableStyle = styled(Table)`
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(145, 145, 250, 0.1);

  .ant-table {
    border-radius: 12px;
    overflow: hidden;
  }
  .ant-table-thead > tr > th {
    background-color: #ffffff;
    color: #2d2d69;
    font-weight: 600;
    font-size: 14px;
    padding: 12px 16px;
  }

  .ant-table-tbody > tr:nth-child(even) > td {
    background-color: #faf9ff;
  }

  .ant-table-cell {
    padding: 14px 12px;
    font-size: 14px;
    color: #333366;
  }

  .ant-table-footer {
    background-color: #ffffff;
    color: #2d2d69;
    font-weight: 600;
    font-size: 14px;
    padding: 12px 16px;
    border-radius: 0 0 12px 12px;
    box-shadow: 0 -2px 10px rgba(145, 145, 250, 0.15);
  }
`;