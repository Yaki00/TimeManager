import styled from "styled-components";
import dayjs from "dayjs";
import "dayjs/locale/fr";
import { useState } from "react";
import {
  Table as AntTable,
  Button,
  Space,
  Tag,
  Spin,
  Alert,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  message,
  Tooltip,
} from "antd";
import {
  CheckOutlined,
  CloseOutlined,
  EyeOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router";
import { useGetManagerKPIs } from "@/service/useKpi";
import { useGetTeamById } from "@/service/useTeam";
import { warningApi } from "@/api/warning";
import { useUserStore } from "@/zustand/store";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  KPICard,
  StatCard,
  StatLabel,
  StatValue,
  StatsGrid,
  WideKPICard,
  DashboardGrid,
  ChartContainer,
} from "@/utils/dashboardStyle";
import { TableStyle } from "@/utils/TableStyle";
import { TagStyle } from "@/utils/TagStyle";

dayjs.locale("fr");

const RequestsCard = styled(KPICard)`
  grid-column: 1 / -1;

  .ant-table {
    background: transparent;
  }

  .ant-table-thead > tr > th {
    background: #f8fafc;
    color: #475569;
    font-weight: 600;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    border-bottom: 2px solid #e2e8f0;
  }

  .ant-table-tbody > tr > td {
    border-bottom: 1px solid #e2e8f0;
  }

  .ant-table-tbody > tr:hover > td {
    background: #f8fafc;
  }

  .ant-table-wrapper {
    border-radius: 12px;
  }
`;

const COLORS = ["#4F46E5", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

const getColumns = (onRequestAction) => [
  {
    title: "Membre",
    dataIndex: "member",
    key: "member",
    render: (text) => <strong>{text}</strong>,
    sorter: (a, b) => a.member.localeCompare(b.member),
  },
  {
    title: "Type",
    dataIndex: "type",
    key: "type",
    width: 120,
    render: (type) => <TagStyle text={type} color="blue" />,
    filters: [
      { text: "Congé", value: "Congé" },
      { text: "RTT", value: "RTT" },
      { text: "Télétravail", value: "Télétravail" },
      { text: "Congé maladie", value: "Congé maladie" },
      { text: "Formation", value: "Formation" },
    ],
    onFilter: (value, record) => record.type.includes(value),
  },
  {
    title: "Date début",
    dataIndex: "startDate",
    key: "startDate",
    width: 180,
    render: (date) => dayjs(date).format("DD/MM/YYYY"),
    sorter: (a, b) => dayjs(a.startDate).unix() - dayjs(b.startDate).unix(),
  },
  {
    title: "Date fin",
    dataIndex: "endDate",
    key: "endDate",
    width: 180,
    render: (date) => dayjs(date).format("DD/MM/YYYY"),
    sorter: (a, b) => dayjs(a.endDate).unix() - dayjs(b.endDate).unix(),
  },
  {
    title: "Raison",
    dataIndex: "reason",
    key: "reason",
    ellipsis: true,
  },
  {
    title: "Statut",
    dataIndex: "status",
    key: "status",
    width: 120,
    render: (status) => {
      let color = "default";
      if (status === "Approuvé") color = "success";
      if (status === "Refusé") color = "error";
      if (status === "En attente") color = "warning";

      return <TagStyle color={color} text={status} />;
    },
    filters: [
      { text: "Approuvé", value: "Approuvé" },
      { text: "Refusé", value: "Refusé" },
      { text: "En attente", value: "En attente" },
    ],
    onFilter: (value, record) => record.status === value,
  },
  {
    title: "Actions",
    key: "actions",
    render: (_, record) =>
      record.status === "En attente" ? (
        <Space size="small">
          <Button
            type="primary"
            icon={<CheckOutlined />}
            size="small"
            style={{ background: "#10B981", borderColor: "#10B981" }}
            onClick={() => onRequestAction?.(record.id, "approve")}
          >
            Approuver
          </Button>
          <Button
            danger
            icon={<CloseOutlined />}
            size="small"
            onClick={() => onRequestAction?.(record.id, "reject")}
          >
            Refuser
          </Button>
        </Space>
      ) : (
        <span style={{ color: "#999", fontSize: "12px" }}>Traité</span>
      ),
  },
];
export const Manager = ({ selectedTeam, dateRange, onRequestAction }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = useUserStore((state) => state.user);
  const [warningModalVisible, setWarningModalVisible] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [warningForm] = Form.useForm();

  const teamId = selectedTeam ? parseInt(selectedTeam) : null;
  const startDate = dateRange?.[0]?.format("YYYY-MM-DD");
  const endDate = dateRange?.[1]?.format("YYYY-MM-DD");

  const {
    data: teamData,
    isLoading,
    error,
  } = useGetManagerKPIs(teamId, startDate, endDate);
  const { data: teamDetails, isLoading: isLoadingTeamDetails } =
    useGetTeamById(teamId);

  if (isLoading || isLoadingTeamDetails) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "400px",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Erreur"
        description={error.message || "Erreur lors du chargement des données"}
        type="error"
        showIcon
      />
    );
  }

  if (!teamData) {
    return (
      <Alert
        message="Aucune donnée"
        description="Aucune donnée disponible pour cette équipe"
        type="info"
        showIcon
      />
    );
  }

  const currentTeamData = teamData;

  // Gérer l'ouverture du modal d'avertissement
  const handleOpenWarningModal = (member) => {
    setSelectedMember(member);
    setWarningModalVisible(true);
    warningForm.resetFields();
    warningForm.setFieldsValue({
      date: dayjs(),
    });
  };

  // Créer un avertissement
  const handleCreateWarning = async (values) => {
    try {
      await warningApi.createWarning({
        userId: selectedMember.id,
        status: values.status,
        description: values.description,
        date: values.date.format("YYYY-MM-DD"),
        createdById: currentUser?.id,
      });
      message.success("Avertissement créé avec succès");
      setWarningModalVisible(false);
      setSelectedMember(null);
      warningForm.resetFields();
    } catch (error) {
      message.error(
        error.message || "Erreur lors de la création de l'avertissement"
      );
    }
  };

  return (
    <>
      <StatsGrid>
        <StatCard color="#4F46E5">
          <StatLabel>Présence Équipe</StatLabel>
          <StatValue>{currentTeamData.teamAttendance?.rate || 0}%</StatValue>
        </StatCard>
        <StatCard color="#10B981">
          <StatLabel>Heures Moyenne</StatLabel>
          <StatValue>
            {currentTeamData.hoursWorked?.length > 0
              ? (
                currentTeamData.hoursWorked.reduce(
                  (acc, curr) => acc + curr.hours,
                  0
                ) / currentTeamData.hoursWorked.length
              ).toFixed(1)
              : 0}
            h
          </StatValue>
        </StatCard>
        <StatCard color="#EF4444">
          <StatLabel>Avertissements</StatLabel>
          <StatValue>
            {currentTeamData.warnings?.reduce(
              (acc, curr) => acc + curr.count,
              0
            ) || 0}
          </StatValue>
        </StatCard>
        <StatCard color="#8B5CF6">
          <StatLabel>Membres</StatLabel>
          <StatValue>{currentTeamData.attendance?.length || 0}</StatValue>
        </StatCard>
      </StatsGrid>

      <DashboardGrid>
        <KPICard>
          <h3>Taux de Présence par Membre</h3>
          <ChartContainer>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={currentTeamData.attendance || []}>
                <defs>
                  <linearGradient
                    id="colorPresence"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0.4} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="name" stroke="#6B7280" />
                <YAxis domain={[0, 100]} stroke="#6B7280" />
                <RechartsTooltip
                  contentStyle={{
                    background: "white",
                    border: "1px solid #E5E7EB",
                    borderRadius: "8px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  }}
                />
                <Bar
                  dataKey="rate"
                  fill="url(#colorPresence)"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </KPICard>

        <KPICard>
          <h3>Heures Travaillées par Membre</h3>
          <ChartContainer>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={currentTeamData.hoursWorked || []}>
                <defs>
                  <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.4} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="member" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <RechartsTooltip
                  contentStyle={{
                    background: "white",
                    border: "1px solid #E5E7EB",
                    borderRadius: "8px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  }}
                />
                <Bar
                  dataKey="hours"
                  fill="url(#colorHours)"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </KPICard>

        <KPICard>
          <h3>Avertissements par Membre</h3>
          <ChartContainer>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={currentTeamData.warnings || []}>
                <defs>
                  <linearGradient
                    id="colorWarnings"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0.4} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="member" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <RechartsTooltip
                  contentStyle={{
                    background: "white",
                    border: "1px solid #E5E7EB",
                    borderRadius: "8px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  }}
                />
                <Bar
                  dataKey="count"
                  fill="url(#colorWarnings)"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </KPICard>

        <WideKPICard>
          <h3>Conformité au Contrat (% des heures)</h3>
          <ChartContainer>
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={currentTeamData.contractCompliance || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="month" stroke="#6B7280" />
                <YAxis domain={[90, 105]} stroke="#6B7280" />
                <RechartsTooltip
                  contentStyle={{
                    background: "white",
                    border: "1px solid #E5E7EB",
                    borderRadius: "8px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  }}
                />
                <Legend
                  wrapperStyle={{
                    paddingTop: "20px",
                  }}
                />
                {(currentTeamData.attendance || []).map((member, index) => (
                  <Line
                    key={member.name}
                    type="monotone"
                    dataKey={member.name}
                    stroke={COLORS[index % COLORS.length]}
                    strokeWidth={3}
                    dot={{ r: 5, strokeWidth: 2, fill: "white" }}
                    activeDot={{ r: 7 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </WideKPICard>

        <KPICard>
          <h3>Temps de Pause Moyen</h3>
          <ChartContainer>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={currentTeamData.pauseTime || []}>
                <defs>
                  <linearGradient id="colorPause" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.4} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="member" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <RechartsTooltip
                  contentStyle={{
                    background: "white",
                    border: "1px solid #E5E7EB",
                    borderRadius: "8px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  }}
                />
                <Bar
                  dataKey="minutes"
                  fill="url(#colorPause)"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </KPICard>

        <KPICard>
          <h3>Jours de Congé par Membre</h3>
          <ChartContainer>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={currentTeamData.leaveDays || []}>
                <defs>
                  <linearGradient id="colorLeave" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.4} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="member" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <RechartsTooltip
                  contentStyle={{
                    background: "white",
                    border: "1px solid #E5E7EB",
                    borderRadius: "8px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  }}
                />
                <Bar
                  dataKey="days"
                  fill="url(#colorLeave)"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </KPICard>

        <RequestsCard>
          <h3>Demandes des Membres</h3>
          <TableStyle
            columns={getColumns(onRequestAction)}
            dataSource={currentTeamData.requests || []}
            pagination={false}
            locale={{
              filterConfirm: "Filtrer",
              filterReset: "Réinitialiser",
              emptyText: "Aucune demande",
            }}
          />
        </RequestsCard>

        {teamId &&
          teamDetails &&
          (() => {
            // Préparer la liste des membres en incluant le propriétaire
            const membersList = [...(teamDetails.members || [])];

            // Vérifier si le propriétaire est déjà dans la liste des membres
            const ownerInMembers = membersList.some(
              (member) => member.id === teamDetails.owner?.id
            );

            // Ajouter le propriétaire s'il n'est pas déjà dans la liste
            if (teamDetails.owner && !ownerInMembers) {
              membersList.unshift({
                ...teamDetails.owner,
                isLead: true,
                isOwner: true,
                key: `owner-${teamDetails.owner.id}`,
              });
            }

            return (
              <RequestsCard>
                <h3>{"Membres de l'équipe"}</h3>
                <TableStyle
                  columns={[
                    {
                      title: "Nom",
                      key: "name",
                      render: (_, record) => (
                        <strong>
                          {record.firstName} {record.lastName}
                        </strong>
                      ),
                      sorter: (a, b) =>
                        `${a.firstName} ${a.lastName}`.localeCompare(
                          `${b.firstName} ${b.lastName}`
                        ),
                    },
                    {
                      title: "Email",
                      dataIndex: "email",
                      key: "email",
                    },
                    {
                      title: "Rôle",
                      dataIndex: "role",
                      key: "role",
                      render: (role) => <TagStyle text={role} color="blue" />,
                    },
                    {
                      title: "Type de contrat",
                      dataIndex: "contractType",
                      key: "contractType",
                      render: (contractType) => (
                        <TagStyle text={contractType} color="green" />
                      ),
                    },
                    {
                      title: "Téléphone",
                      dataIndex: "phoneNumber",
                      key: "phoneNumber",
                    },
                    {
                      title: "Statut",
                      key: "status",
                      render: (_, record) => (
                        <>
                          {record.isOwner && <Tag color="purple">Manager</Tag>}
                          {record.isLead && !record.isOwner && (
                            <Tag color="gold">Lead</Tag>
                          )}
                          {!record.isLead && !record.isOwner && (
                            <Tag color="default">Membre</Tag>
                          )}
                        </>
                      ),
                    },
                    {
                      title: "Actions",
                      key: "actions",
                      width: 100,
                      render: (_, record) => (
                        <Space>
                          <Tooltip title="Voir les détails de l'utilisateur">
                            <Button
                              type="text"
                              icon={<EyeOutlined />}
                              onClick={() =>
                                navigate(`/effectif/${record.id}`, {
                                  state: { from: location.pathname },
                                })
                              }
                              style={{ padding: "4px 8px" }}
                            />
                          </Tooltip>
                          <Tooltip title="Créer un avertissement pour cet utilisateur">
                            <Button
                              type="text"
                              icon={<WarningOutlined />}
                              onClick={() => handleOpenWarningModal(record)}
                              style={{ padding: "4px 8px", color: "#EF4444" }}
                            />
                          </Tooltip>
                        </Space>
                      ),
                    },
                  ]}
                  dataSource={membersList}
                  pagination={false}
                  locale={{
                    emptyText: "Aucun membre",
                  }}
                />
              </RequestsCard>
            );
          })()}
      </DashboardGrid>

      {/* Modal pour créer un avertissement */}
      <Modal
        title="Créer un avertissement"
        open={warningModalVisible}
        onCancel={() => {
          setWarningModalVisible(false);
          setSelectedMember(null);
          warningForm.resetFields();
        }}
        onOk={() => warningForm.submit()}
        okText="Créer"
        cancelText="Annuler"
      >
        {selectedMember && (
          <Form
            form={warningForm}
            layout="vertical"
            onFinish={handleCreateWarning}
            initialValues={{
              date: dayjs(),
            }}
          >
            <Form.Item label="Membre">
              <Input
                value={`${selectedMember.firstName} ${selectedMember.lastName}`}
                disabled
              />
            </Form.Item>
            <Form.Item
              name="status"
              label="Type d'avertissement"
              rules={[
                { required: true, message: "Veuillez sélectionner un type" },
              ]}
            >
              <Select placeholder="Sélectionner un type">
                <Select.Option value="Alert">Alerte</Select.Option>
                <Select.Option value="Late">Retard</Select.Option>
                <Select.Option value="UnjustifiedAbsence">
                  Absence injustifiée
                </Select.Option>
              </Select>
            </Form.Item>
            <Form.Item
              name="date"
              label="Date"
              rules={[
                { required: true, message: "Veuillez sélectionner une date" },
              ]}
            >
              <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
            </Form.Item>
            <Form.Item
              name="description"
              label="Description"
              rules={[
                { required: true, message: "Veuillez saisir une description" },
                {
                  max: 500,
                  message: "La description ne doit pas dépasser 500 caractères",
                },
              ]}
            >
              <Input.TextArea
                rows={4}
                placeholder="Décrivez la raison de l'avertissement..."
                maxLength={500}
                showCount
              />
            </Form.Item>
          </Form>
        )}
      </Modal>
    </>
  );
};
