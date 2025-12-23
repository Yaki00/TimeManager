import React, { useState } from "react";
import styled from "styled-components";
import { DatePicker, Select, Button, message, Dropdown } from "antd";
import { DownloadOutlined, DownOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import "dayjs/locale/fr";
import { Header, PageWrapper, ScrollableContent } from "@/utils/layoutStyle";
import { Breadcrumbs } from "@/utils/Breadcrumb";
import { Responsable } from "./Responsable";
import { Manager } from "./Manager";
import { Employer } from "./Employer";
import { useGetTeams } from "@/service/useTeam";
import { useUserStore } from "@/zustand/store";
import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { userApi } from "@/api/user";
import { Link } from "react-router-dom";
import {
  useGetResponsableKPIs,
  useGetManagerKPIs,
  useGetCurrentUserKPIs,
} from "@/service/useKpi";
import {
  exportResponsableKPIs,
  exportManagerKPIs,
  exportUserKPIs,
  EXPORT_FORMATS,
} from "@/utils/exportKpi";

dayjs.locale("fr");

const { RangePicker } = DatePicker;

const TeamTextLink = styled(Link)`
  color: #4f46e5;
  text-decoration: none;
  font-weight: 600;
  margin-left: 8px;
  transition: all 0.2s ease;

  &:hover {
    color: #4338ca;
    text-decoration: underline;
  }
`;

const TeamTextNoTeam = styled.span`
  color: #94a3b8;
  font-style: italic;
  margin-left: 8px;
`;

const ViewSwitcher = styled.div`
  display: flex;
  gap: 8px;
  background: #f1f5f9;
  padding: 4px;
  border-radius: 10px;
  width: fit-content;
`;

const ViewButton = styled.button`
  padding: 10px 24px;
  border: none;
  border-radius: 8px;
  background: ${(props) => (props.active ? "white" : "transparent")};
  color: ${(props) => (props.active ? "#4F46E5" : "#64748b")};
  font-weight: ${(props) => (props.active ? "700" : "600")};
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: ${(props) =>
    props.active ? "0 2px 8px rgba(0, 0, 0, 0.08)" : "none"};

  &:hover {
    color: ${(props) => (props.active ? "#4F46E5" : "#1e293b")};
    background: ${(props) => (props.active ? "white" : "#e2e8f0")};
  }
`;

const TeamSelector = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  background: #f1f5f9;
  padding: 4px 4px 4px 16px;
  border-radius: 10px;
  width: fit-content;

  label {
    font-weight: 600;
    color: #64748b;
    font-size: 14px;
    white-space: nowrap;
  }

  .ant-select {
    min-width: 200px;

    .ant-select-selector {
      border: none;
      border-radius: 8px;
      background: white;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      padding: 6px 16px;
      height: auto;

      &:hover {
        background: #fafafa;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
      }
    }

    &.ant-select-focused .ant-select-selector {
      background: white;
      box-shadow: 0 2px 8px rgba(79, 70, 229, 0.2);
    }

    .ant-select-selection-item {
      font-size: 14px;
      font-weight: 600;
      color: #1e293b;
    }

    .ant-select-arrow {
      color: #64748b;
    }
  }
`;

const DateRangeSelector = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  background: #f1f5f9;
  padding: 4px 4px 4px 16px;
  border-radius: 10px;

  label {
    font-weight: 600;
    color: #64748b;
    font-size: 14px;
    white-space: nowrap;
  }

  .ant-picker {
    border-radius: 8px;
    border: none;
    background: white;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

    &:hover {
      background: #fafafa;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
    }

    &.ant-picker-focused {
      background: white;
      box-shadow: 0 2px 8px rgba(79, 70, 229, 0.2);
    }
  }

  .ant-picker-input > input {
    font-size: 14px;
    font-weight: 600;
    color: #1e293b;
  }
`;

const ExportButtonWrapper = styled.div`
  .ant-btn {
    background: white;
    border: none;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    padding: 6px 16px;
    height: auto;
    font-size: 14px;
    font-weight: 600;
    color: #1e293b;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;

    &:hover {
      background: #fafafa;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
      color: #1e293b;
    }

    &:focus {
      background: white;
      box-shadow: 0 2px 8px rgba(79, 70, 229, 0.2);
      color: #1e293b;
    }

    .anticon {
      color: #64748b;
    }
  }
`;

export const Dashboard = () => {
  const user = useUserStore((state) => state.user);
  const userRole = user?.role;
  const isResponsable = userRole === "Responsable";
  const isManager = userRole === "Manager";
  const isManagerOrResponsable = isManager || isResponsable;

  // Initialiser la vue par défaut selon le rôle
  const getDefaultView = () => {
    if (userRole === "Responsable") {
      return "responsable";
    }
    if (userRole === "Manager") {
      return "manager";
    }
    return "user";
  };

  const [activeView, setActiveView] = useState(getDefaultView());
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [dateRange, setDateRange] = useState([
    dayjs().subtract(30, "days"),
    dayjs(),
  ]);

  const { data: allTeams, isLoading: isLoadingTeams } = useGetTeams();

  // Récupérer l'utilisateur actuel avec ses équipes
  const {
    data: currentUserData,
    isLoading: isLoadingCurrentUser,
    refetch: refetchCurrentUser,
  } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => userApi.getCurrentUser(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Préparer les dates pour les KPI
  const startDate = dateRange?.[0]?.format("YYYY-MM-DD");
  const endDate = dateRange?.[1]?.format("YYYY-MM-DD");

  // Récupérer les données KPI selon la vue active
  const { data: responsableKpiData, isLoading: isLoadingResponsableKpi } =
    useGetResponsableKPIs(startDate, endDate, {
      enabled: activeView === "responsable" && isResponsable,
    });

  const { data: managerKpiData, isLoading: isLoadingManagerKpi } =
    useGetManagerKPIs(
      selectedTeam ? parseInt(selectedTeam) : null,
      startDate,
      endDate,
      {
        enabled:
          activeView === "manager" && isManagerOrResponsable && !!selectedTeam,
      }
    );

  const { data: userKpiData, isLoading: isLoadingUserKpi } =
    useGetCurrentUserKPIs(startDate, endDate, {
      enabled: activeView === "user",
    });

  // Forcer le rafraîchissement si les équipes ne sont pas présentes
  useEffect(() => {
    if (
      isManager &&
      currentUserData &&
      !currentUserData.teams &&
      !isLoadingCurrentUser
    ) {
      refetchCurrentUser();
    }
  }, [isManager, currentUserData, isLoadingCurrentUser, refetchCurrentUser]);

  // Filtrer les équipes selon le rôle
  const availableTeams = useMemo(() => {
    if (!allTeams) return [];

    // Si Responsable : toutes les équipes
    if (isResponsable) {
      return allTeams;
    }

    // Si Manager : uniquement ses équipes
    if (isManager) {
      // Attendre que les données de l'utilisateur soient chargées
      if (isLoadingCurrentUser || !currentUserData) {
        return [];
      }

      // Vérifier si l'utilisateur a des équipes
      if (currentUserData.teams && currentUserData.teams.length > 0) {
        // Convertir les IDs en nombres pour la comparaison
        const userTeamIds = currentUserData.teams.map((team) =>
          Number(team.id)
        );
        const filtered = allTeams.filter((team) =>
          userTeamIds.includes(Number(team.id))
        );

        // Debug: afficher dans la console pour vérifier
        console.log("Manager teams debug:", {
          currentUserData: currentUserData,
          userTeams: currentUserData.teams,
          userTeamIds,
          allTeamsCount: allTeams.length,
          allTeams: allTeams.map((t) => ({
            id: t.id,
            idType: typeof t.id,
            name: t.teamName,
          })),
          filteredCount: filtered.length,
          filtered: filtered.map((t) => ({ id: t.id, name: t.teamName })),
        });

        return filtered;
      } else {
        console.log("Manager has no teams:", {
          currentUserData,
          teams: currentUserData?.teams,
        });
      }
    }

    return [];
  }, [
    allTeams,
    isResponsable,
    isManager,
    currentUserData,
    isLoadingCurrentUser,
  ]);

  // Initialiser automatiquement l'équipe si le Manager n'en a qu'une
  useEffect(() => {
    if (isManager && !selectedTeam && availableTeams.length === 1) {
      setSelectedTeam(availableTeams[0].id.toString());
    }
    // Réinitialiser si l'équipe sélectionnée n'est plus disponible
    if (selectedTeam && availableTeams.length > 0) {
      const teamExists = availableTeams.some(
        (team) => team.id.toString() === selectedTeam
      );
      if (!teamExists) {
        setSelectedTeam(
          availableTeams.length === 1 ? availableTeams[0].id.toString() : null
        );
      }
    }
  }, [isManager, availableTeams, selectedTeam]);

  // Empêcher l'accès non autorisé aux vues
  useEffect(() => {
    // Si un Manager essaie d'accéder à la vue Responsable, rediriger vers Manager
    if (isManager && activeView === "responsable") {
      setActiveView("manager");
    }
    // Si un Employer essaie d'accéder à une vue non autorisée, rediriger vers User
    if (
      !isManagerOrResponsable &&
      (activeView === "responsable" || activeView === "manager")
    ) {
      setActiveView("user");
    }
  }, [userRole, isManager, isManagerOrResponsable, activeView]);

  const handleRequestAction = (requestId, action) => {
    alert(
      `Demande ${requestId} ${action === "approve" ? "approuvée" : "refusée"}`
    );
  };

  const handleDateRangeChange = (dates) => {
    if (dates) {
      setDateRange(dates);
    }
  };

  // Fonction pour exporter les KPI selon la vue active et le format
  const handleExportKPIs = (format) => {
    try {
      if (activeView === "responsable" && isResponsable) {
        if (!responsableKpiData) {
          message.warning("Aucune donnée disponible pour l'export");
          return;
        }
        exportResponsableKPIs(responsableKpiData, startDate, endDate, format);
        message.success(
          `Export des KPI Responsable (${format.toUpperCase()}) réussi`
        );
      } else if (activeView === "manager" && isManagerOrResponsable) {
        if (!managerKpiData || !selectedTeam) {
          message.warning(
            "Veuillez sélectionner une équipe et attendre le chargement des données"
          );
          return;
        }
        const selectedTeamData = availableTeams.find(
          (team) => team.id.toString() === selectedTeam
        );
        const teamName = selectedTeamData?.teamName || "Equipe";
        exportManagerKPIs(managerKpiData, teamName, startDate, endDate, format);
        message.success(
          `Export des KPI Manager (${format.toUpperCase()}) réussi`
        );
      } else if (activeView === "user") {
        if (!userKpiData) {
          message.warning("Aucune donnée disponible pour l'export");
          return;
        }
        exportUserKPIs(userKpiData, startDate, endDate, format);
        message.success(
          `Export des KPI Utilisateur (${format.toUpperCase()}) réussi`
        );
      }
    } catch (error) {
      message.error("Erreur lors de l'export: " + error.message);
    }
  };

  const rangePresets = [
    {
      label: "Aujourd'hui",
      value: [dayjs().startOf("day"), dayjs().endOf("day")],
    },
    {
      label: "7 derniers jours",
      value: [dayjs().subtract(7, "days"), dayjs()],
    },
    {
      label: "15 derniers jours",
      value: [dayjs().subtract(15, "days"), dayjs()],
    },
    {
      label: "30 derniers jours",
      value: [dayjs().subtract(30, "days"), dayjs()],
    },
    {
      label: "3 derniers mois",
      value: [dayjs().subtract(3, "months"), dayjs()],
    },
    {
      label: "6 derniers mois",
      value: [dayjs().subtract(6, "months"), dayjs()],
    },
    {
      label: "1 an",
      value: [dayjs().subtract(1, "year"), dayjs()],
    },
    {
      label: "Ce mois",
      value: [dayjs().startOf("month"), dayjs().endOf("month")],
    },
    {
      label: "Mois dernier",
      value: [
        dayjs().subtract(1, "month").startOf("month"),
        dayjs().subtract(1, "month").endOf("month"),
      ],
    },
    {
      label: "Cette année",
      value: [dayjs().startOf("year"), dayjs().endOf("year")],
    },
  ];
  return (
    <PageWrapper>
      <Header>
        <Breadcrumbs items={[{ label: "Dashboard", path: "/" }]} />
        <h1>Dashboard</h1>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            justifyContent: "space-between",
            marginTop: 10,
          }}
        >
          <div style={{ display: "flex", gap: "15px" }}>
            <ViewSwitcher>
              {/* Seuls les Responsables peuvent voir la vue Responsable */}
              {isResponsable && (
                <ViewButton
                  active={activeView === "responsable"}
                  onClick={() => setActiveView("responsable")}
                >
                  Vue Responsable
                </ViewButton>
              )}
              {/* Managers et Responsables peuvent voir la vue Manager */}
              {isManagerOrResponsable && (
                <ViewButton
                  active={activeView === "manager"}
                  onClick={() => setActiveView("manager")}
                >
                  Vue Manager
                </ViewButton>
              )}
              {/* Tous les utilisateurs peuvent voir la vue Utilisateur */}
              <ViewButton
                active={activeView === "user"}
                onClick={() => setActiveView("user")}
              >
                Vue Utilisateur
              </ViewButton>
            </ViewSwitcher>

            {/* Afficher le nom de l'équipe pour la vue Utilisateur */}
            {activeView === "user" && (
              <span style={{ fontSize: "14px", color: "#64748b" }}>
                Équipe :
                {isLoadingCurrentUser ? (
                  <span style={{ marginLeft: "8px" }}>...</span>
                ) : currentUserData?.teams &&
                  currentUserData.teams.length > 0 ? (
                  <TeamTextLink
                    to={`/teams/${currentUserData.teams[0].id}`}
                    state={{ id: currentUserData.teams[0].id }}
                  >
                    {currentUserData.teams[0].teamName}
                  </TeamTextLink>
                ) : (
                  <TeamTextNoTeam>Aucune équipe</TeamTextNoTeam>
                )}
              </span>
            )}

            {activeView === "manager" && (
              <>
                {/* Responsable : toujours afficher le sélecteur avec toutes les équipes */}
                {isResponsable && (
                  <TeamSelector>
                    <label>Équipe :</label>
                    <Select
                      value={selectedTeam}
                      onChange={setSelectedTeam}
                      loading={isLoadingTeams}
                      placeholder="Sélectionner une équipe"
                      options={availableTeams.map((team) => ({
                        label: team.teamName,
                        value: team.id.toString(),
                      }))}
                      style={{ minWidth: "200px" }}
                    />
                  </TeamSelector>
                )}
                {/* Manager avec plusieurs équipes : afficher le sélecteur */}
                {isManager && availableTeams.length > 1 && (
                  <TeamSelector>
                    <label>Équipe :</label>
                    <Select
                      value={selectedTeam}
                      onChange={setSelectedTeam}
                      loading={isLoadingTeams}
                      placeholder="Sélectionner une équipe"
                      options={availableTeams.map((team) => ({
                        label: team.teamName,
                        value: team.id.toString(),
                      }))}
                      style={{ minWidth: "200px" }}
                    />
                  </TeamSelector>
                )}
                {/* Manager avec une seule équipe : afficher le nom de l'équipe (pas de sélecteur) */}
                {isManager && availableTeams.length === 1 && (
                  <TeamSelector>
                    <label>Équipe :</label>
                    <span
                      style={{
                        padding: "6px 16px",
                        background: "white",
                        borderRadius: "8px",
                        fontWeight: 600,
                        color: "#1e293b",
                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
                      }}
                    >
                      {availableTeams[0].teamName}
                    </span>
                  </TeamSelector>
                )}
                {/* Manager sans équipe : message informatif (seulement si les données sont chargées) */}
                {isManager &&
                  availableTeams.length === 0 &&
                  !isLoadingTeams &&
                  !isLoadingCurrentUser &&
                  currentUserData && (
                    <TeamSelector>
                      <label>Équipe :</label>
                      <span
                        style={{
                          padding: "6px 16px",
                          background: "#fef3c7",
                          borderRadius: "8px",
                          fontWeight: 600,
                          color: "#92400e",
                          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
                        }}
                      >
                        Aucune équipe assignée
                      </span>
                    </TeamSelector>
                  )}
              </>
            )}
          </div>
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <DateRangeSelector>
              <label>Période :</label>
              <RangePicker
                value={dateRange}
                onChange={handleDateRangeChange}
                presets={rangePresets}
                format="DD/MM/YYYY"
                placeholder={["Date début", "Date fin"]}
                style={{ minWidth: "280px" }}
              />
            </DateRangeSelector>
            <ExportButtonWrapper>
              <Dropdown
                menu={{
                  items: [
                    {
                      key: EXPORT_FORMATS.CSV,
                      label: "Exporter en CSV",
                      icon: <DownloadOutlined />,
                      onClick: () => handleExportKPIs(EXPORT_FORMATS.CSV),
                    },
                    {
                      key: EXPORT_FORMATS.PDF,
                      label: "Exporter en PDF",
                      icon: <DownloadOutlined />,
                      onClick: () => handleExportKPIs(EXPORT_FORMATS.PDF),
                    },
                    {
                      key: EXPORT_FORMATS.JSON,
                      label: "Exporter en JSON",
                      icon: <DownloadOutlined />,
                      onClick: () => handleExportKPIs(EXPORT_FORMATS.JSON),
                    },
                  ],
                }}
                disabled={
                  (activeView === "responsable" && isLoadingResponsableKpi) ||
                  (activeView === "manager" &&
                    (isLoadingManagerKpi || !selectedTeam)) ||
                  (activeView === "user" && isLoadingUserKpi)
                }
              >
                <Button>
                  <DownloadOutlined /> Exporter les KPI <DownOutlined />
                </Button>
              </Dropdown>
            </ExportButtonWrapper>
          </div>
        </div>
      </Header>
      <ScrollableContent>
        {/* Seuls les Responsables peuvent accéder à la vue Responsable */}
        {activeView === "responsable" && isResponsable && (
          <Responsable
            selectedTeam={selectedTeam}
            dateRange={dateRange}
            onRequestAction={handleRequestAction}
          />
        )}
        {/* Managers et Responsables peuvent accéder à la vue Manager */}
        {activeView === "manager" && isManagerOrResponsable && (
          <Manager
            selectedTeam={selectedTeam}
            dateRange={dateRange}
            onRequestAction={handleRequestAction}
          />
        )}
        {/* Tous les utilisateurs peuvent accéder à la vue Utilisateur */}
        {activeView === "user" && <Employer dateRange={dateRange} />}
      </ScrollableContent>
    </PageWrapper>
  );
};
