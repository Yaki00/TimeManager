import { Tag, Button, Popconfirm } from "antd";
import { DeleteOutlined, EditOutlined, EyeOutlined } from '@ant-design/icons';
import { TagStyle } from "@/utils/TagStyle";

const getRoleColor = (role) => {
  switch (role) {
    case 'Responsable':
      return '#ff4d4f';
    case 'Manager':
      return '#1890ff';
    case 'Employer':
      return '#52c41a';
    default:
      return '#d9d9d9';
  }
};

const getRoleLabel = (role) => {
  switch (role) {
    case 'Responsable':
      return 'Responsable';
    case 'Manager':
      return 'Manager';
    case 'Employer':
      return 'Employé';
    default:
      return role;
  }
};

const Actions = ({ record, onDetail, onEdit, onDelete, isDeleting }) => {
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <Button 
        type="default" 
        icon={<EyeOutlined />}
        onClick={() => onDetail(record)}
        title="Détails"
      />
      <Button 
        type="primary" 
        icon={<EditOutlined />}
        onClick={() => onEdit(record)}
        title="Modifier"
      />
      <Popconfirm
        title="Supprimer l'utilisateur"
        description={`Êtes-vous sûr de vouloir supprimer ${record.firstName} ${record.lastName} ?`}
        onConfirm={() => onDelete(record)}
        okText="Oui"
        cancelText="Non"
        okButtonProps={{ danger: true }}
      >
        <Button 
          type="primary" 
          danger 
          icon={<DeleteOutlined />}
          loading={isDeleting}
          title="Supprimer"
        />
      </Popconfirm>
    </div>
  );
};

export const columnsEffectif = (onDetail, onEdit, onDelete, isDeleting) => [
  {
    title: 'ID',
    dataIndex: 'id',
    key: 'id',
    width: 80,
    fixed: 'left',
  },
  {
    title: 'Nom',
    dataIndex: 'lastName',
    key: 'lastName',
    width: 120,
    fixed: 'left',
    render: (text) => <strong>{text}</strong>,
    sorter: (a, b) => a.lastName.localeCompare(b.lastName),
  },
  {
    title: 'Prénom',
    dataIndex: 'firstName',
    key: 'firstName',
    width: 120,
    sorter: (a, b) => a.firstName.localeCompare(b.firstName),
  },
  {
    title: 'Email',
    dataIndex: 'email',
    key: 'email',
    width: 220,
    render: (text) => <span style={{ color: '#64748b' }}>{text}</span>,
  },
  {
    title: 'Téléphone',
    dataIndex: 'phoneNumber',
    key: 'phoneNumber',
    width: 140,
    render: (text) => text || <span style={{ color: '#d9d9d9' }}>Non renseigné</span>,
  },
  {
    title: 'Rôle',
    dataIndex: 'role',
    key: 'role',
    width: 130,
    render: (role) => (
      <TagStyle color={getRoleColor(role)} text={getRoleLabel(role)} />
    ),
    sorter: (a, b) => a.role.localeCompare(b.role),
  },
  {
    title: 'Équipe(s)',
    dataIndex: 'teams',
    key: 'teams',
    width: 200,
    render: (teams) => {
      if (!teams || teams.length === 0) {
        return <span style={{ color: '#d9d9d9' }}>Aucune équipe</span>;
      }
      return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {teams.map((team, index) => (
            <Tag key={index} color="blue">
              {team.teamName}
            </Tag>
          ))}
        </div>
      );
    },
  },
  {
    title: 'Actions',
    key: 'actions',
    width: 150,
    fixed: 'right',
    render: (_, record) => (
      <Actions 
        record={record} 
        onDetail={onDetail}
        onEdit={onEdit}
        onDelete={onDelete}
        isDeleting={isDeleting}
      />
    ),
  },
];

