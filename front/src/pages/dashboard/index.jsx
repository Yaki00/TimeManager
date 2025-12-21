import React, { useState } from "react";
import styled from "styled-components";
import { DatePicker, Select } from "antd";
import dayjs from "dayjs";
import "dayjs/locale/fr";
import {
  Header,
  PageWrapper,
  ScrollableContent,
} from "../../utils/layoutStyle";
import { Breadcrumbs } from "../../utils/Breadcrumb";
import { Responsable } from "./Responsable";
import { Manager } from "./Manager";
import { Employer } from "./Employer";
import { useGetTeams } from "../../service/useTeam";
import { useUserStore } from "../../zustand/store";
import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { userApi } from "../../api/user";

dayjs.locale("fr");

const { RangePicker } = DatePicker;

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
