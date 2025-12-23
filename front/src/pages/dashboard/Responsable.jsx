import styled from "styled-components";
import { DatePicker, Spin, Alert } from "antd";
import dayjs from "dayjs";
import "dayjs/locale/fr";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

dayjs.locale("fr");
import {
  KPICard,
  StatCard,
  StatLabel,
  StatValue,
  StatsGrid,
  DashboardGrid,
  ChartContainer,
} from "@/utils/dashboardStyle";
import { TableStyle } from "@/utils/TableStyle";
import { TagStyle } from "@/utils/TagStyle";
import { Space, Button } from "antd";
import { CheckOutlined, CloseOutlined } from "@ant-design/icons";
import { useGetResponsableKPIs } from "@/service/useKpi";
import { useGetManagerKPIs } from "@/service/useKpi";
import { useUserStore } from "@/zustand/store";

const RequestsCard = styled(KPICard)`
  margin-top: 24px;
  grid-column: 1 / -1;

  .ant-table-thead > tr > th {
    background: #f8fafc;
    color: #475569;
    font-weight: 600;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    border-bottom: 2px solid #e2e8f0;
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
      if (status === "refused") color = "error";
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
const RankingList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const RankingItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: white;
  border-radius: 10px;
  border: 1px solid
    ${(props) => {
    if (props.rank === 1) return "#FFD700";
    if (props.rank === 2) return "#C0C0C0";
    if (props.rank === 3) return "#CD7F32";
    return "#e2e8f0";
  }};
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  transition: all 0.2s ease;
  border-left: 4px solid
    ${(props) => {
    if (props.rank === 1) return "#FFD700";
    if (props.rank === 2) return "#C0C0C0";
    if (props.rank === 3) return "#CD7F32";
    return "#cbd5e1";
  }};

  &:hover {
    transform: translateX(4px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const RankBadge = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${(props) => {
    if (props.rank === 1) return "#FFD700";
    if (props.rank === 2) return "#C0C0C0";
    if (props.rank === 3) return "#CD7F32";
    return "#e2e8f0";
  }};
  color: ${(props) => (props.rank <= 3 ? "white" : "#64748b")};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const RankInfo = styled.div`
  flex: 1;
  margin: 0 20px;

  .name {
    font-weight: 700;
    color: #1f2937;
    font-size: 16px;
    margin-bottom: 4px;
  }

  .detail {
    font-size: 13px;
    color: #6b7280;
    font-weight: 500;
  }
`;

const Score = styled.div`
  font-weight: 700;
  color: #4f46e5;
  font-size: 20px;
`;

const TopRankingGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  margin-top: 24px;
`;

export const Responsable = ({ selectedTeam, dateRange, onRequestAction }) => {
  const user = useUserStore((state) => state.user);
  const userRole = user?.role;
  const isResponsable = userRole === "Responsable";
  
  const startDate = dateRange?.[0]?.format("YYYY-MM-DD");
  const endDate = dateRange?.[1]?.format("YYYY-MM-DD");

  const {
    data: responsableData,
    isLoading: isLoadingResponsable,
    error: errorResponsable,
  } = useGetResponsableKPIs(startDate, endDate, {
    enabled: isResponsable,
  });
  const {
    data: managerData,
    isLoading: isLoadingManager,
    error: errorManager,
  } = useGetManagerKPIs(
    selectedTeam ? parseInt(selectedTeam) : null,
    startDate,
    endDate,
    {
      enabled: isResponsable && !!selectedTeam,
    }
  );

  // Si l'utilisateur n'est pas Responsable, afficher un message
  if (!isResponsable) {
    return (
      <Alert
        message="Accès refusé"
        description="Vous n'avez pas les permissions nécessaires pour accéder à cette vue. Cette vue est réservée aux Responsables uniquement."
        type="warning"
        showIcon
      />
    );
  }

  if (isLoadingResponsable || isLoadingManager) {
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

  // Gérer les erreurs 403 de manière gracieuse
  if (errorResponsable || errorManager) {
    const errorMessage = errorResponsable?.message || errorManager?.message;
    if (errorMessage?.includes('403') || errorMessage?.includes('Forbidden')) {
      return (
        <Alert
          message="Accès refusé"
          description="Vous n'avez pas les permissions nécessaires pour accéder à ces données."
          type="warning"
          showIcon
        />
      );
    }
    return (
      <Alert
        message="Erreur"
        description={errorMessage || "Erreur lors du chargement des données"}
        type="error"
        showIcon
      />
    );
  }

  const kpiData = responsableData || {};
  const currentTeamData = managerData || { requests: [] };

  // Calculer les stats depuis les données réelles
  const acceptedLeave =
    kpiData.leaveStats?.find((s) => s.name === "Acceptés")?.value || 0;
  const refusedLeave =
    kpiData.leaveStats?.find((s) => s.name === "Refusés")?.value || 0;
  const pendingLeave =
    kpiData.leaveStats?.find((s) => s.name === "En attente")?.value || 0;
  const avgProcessingTime =
    kpiData.processingTime?.length > 0
      ? (
        kpiData.processingTime.reduce((sum, item) => sum + item.days, 0) /
          kpiData.processingTime.length
      ).toFixed(1)
      : 0;

  return (
    <>
      <StatsGrid>
        <StatCard color="#4CAF50">
          <StatLabel>Congés Acceptés</StatLabel>
          <StatValue>{acceptedLeave}%</StatValue>
        </StatCard>
        <StatCard color="#F44336">
          <StatLabel>Congés Refusés</StatLabel>
          <StatValue>{refusedLeave}%</StatValue>
        </StatCard>
        <StatCard color="#FF9800">
          <StatLabel>En Attente</StatLabel>
          <StatValue>{pendingLeave}%</StatValue>
        </StatCard>
        <StatCard color="#4F46E5">
          <StatLabel>Délai Traitement</StatLabel>
          <StatValue>{avgProcessingTime}j</StatValue>
        </StatCard>
      </StatsGrid>

      <DashboardGrid>
        <KPICard>
          <h3>Répartition des Congés</h3>
          <ChartContainer>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={kpiData.leaveStats || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={90}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {(kpiData.leaveStats || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </KPICard>

        <KPICard>
          <h3>Délai Moyen de Traitement</h3>
          <ChartContainer>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={kpiData.processingTime || []}>
                <defs>
                  <linearGradient id="colorDays" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="month" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip
                  contentStyle={{
                    background: "white",
                    border: "1px solid #E5E7EB",
                    borderRadius: "8px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="days"
                  stroke="#4F46E5"
                  strokeWidth={3}
                  fill="url(#colorDays)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </KPICard>
        <KPICard>
          <h3>Ratio Manager/Employés</h3>
          <ChartContainer>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={kpiData.managerRatio || []}>
                <defs>
                  <linearGradient id="colorRatio" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.4} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="team" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip
                  formatter={(value) => `1:${Math.round(1 / value)}`}
                  contentStyle={{
                    background: "white",
                    border: "1px solid #E5E7EB",
                    borderRadius: "8px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  }}
                />
                <Bar
                  dataKey="ratio"
                  fill="url(#colorRatio)"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </KPICard>
      </DashboardGrid>

      <TopRankingGrid>
        <KPICard>
          <h3> Top 5 Managers</h3>
          <RankingList>
            {(kpiData.topManagers || []).map((manager, index) => (
              <RankingItem key={index} rank={index + 1}>
                <RankBadge rank={index + 1}>{index + 1}</RankBadge>
                <RankInfo>
                  <div className="name">{manager.name}</div>
                  <div className="detail">{manager.team}</div>
                </RankInfo>
                <Score>{manager.score}/100</Score>
              </RankingItem>
            ))}
          </RankingList>
        </KPICard>

        <KPICard>
          <h3>Top 5 Équipes</h3>
          <RankingList>
            {(kpiData.topTeams || []).map((team, index) => (
              <RankingItem key={index} rank={index + 1}>
                <RankBadge rank={index + 1}>{index + 1}</RankBadge>
                <RankInfo>
                  <div className="name">{team.name}</div>
                  <div className="detail">Meilleur membre: {team.topUser}</div>
                </RankInfo>
                <Score>{team.score}/100</Score>
              </RankingItem>
            ))}
          </RankingList>
        </KPICard>
      </TopRankingGrid>
      <RequestsCard>
        <h3>Demandes des Managers</h3>
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
    </>
  );
};
