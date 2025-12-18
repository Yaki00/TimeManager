import React, { useState } from "react";
import { Button, Tooltip, Space, Typography, Divider } from "antd";
import styled from "styled-components";
import {
  PlayCircleOutlined,
  PauseCircleOutlined,
  PoweroffOutlined,
  ClockCircleOutlined,
  DownOutlined,
  UpOutlined,
  CoffeeOutlined,
  LoginOutlined,
  BarChartOutlined,
  LogoutOutlined,
  FieldTimeOutlined,
} from "@ant-design/icons";
import { useClocking } from "../service/useClocking";

const { Text } = Typography;

const WorkButtonContainer = styled.div`
  padding: 12px;
  border-top: 1px solid #f0f0f0;
  background-color: #fafafa;
  transition: all 0.3s ease;
`;

const StatusIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  padding: 8px;
  border-radius: 6px;
  background-color: ${(props) => {
    if (props.$isWorking && !props.$isPaused) return "#f6ffed";
    if (props.$isPaused) return "#fff7e6";
    return "#fff";
  }};
  border: 1px solid
    ${(props) => {
      if (props.$isWorking && !props.$isPaused) return "#b7eb8f";
      if (props.$isPaused) return "#ffd591";
      return "#d9d9d9";
    }};
`;

const StatusDot = styled.div`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: ${(props) => {
    if (props.$isWorking && !props.$isPaused) return "#52c41a";
    if (props.$isPaused) return "#fa8c16";
    return "#d9d9d9";
  }};
  animation: ${(props) => (props.$isWorking ? "pulse 2s infinite" : "none")};

  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }
`;

const TimeDisplay = styled(Text)`
  font-size: 11px;
  color: #666;
  font-family: monospace;
`;

const ButtonsContainer = styled(Space)`
  width: 100%;
  display: flex;
  justify-content: center;

  .ant-btn {
    flex: 1;
    font-size: 12px;
    height: 36px;
  }
`;

const DetailsPanel = styled.div`
  max-height: ${(props) => (props.$isOpen ? "400px" : "0")};
  overflow: hidden;
  transition: max-height 0.3s ease-in-out;
  background-color: #fff;
  border-top: ${(props) => (props.$isOpen ? "1px solid #f0f0f0" : "none")};
  margin-top: ${(props) => (props.$isOpen ? "8px" : "0")};
`;

const DetailsPanelContent = styled.div`
  padding: 12px 8px;
`;

const DetailItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  margin-bottom: 4px;
  border-radius: 4px;
  background-color: ${(props) => (props.$highlight ? "#f0f7ff" : "#fafafa")};
  font-size: 11px;

  .detail-icon {
    color: #1890ff;
    font-size: 14px;
  }

  .detail-label {
    color: #666;
    flex: 1;
  }

  .detail-value {
    color: #262626;
    font-weight: 600;
    font-family: monospace;
  }
`;

const PauseItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 8px;
  margin: 4px 0;
  border-radius: 4px;
  background-color: #fff7e6;
  border-left: 3px solid #fa8c16;
  font-size: 10px;

  .pause-time {
    color: #666;
  }

  .pause-duration {
    color: #fa8c16;
    font-weight: 600;
    font-family: monospace;
  }
`;

const ToggleButton = styled(Button)`
  width: 100%;
  margin-top: 8px;
  height: 28px;
  font-size: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
`;

export const WorkButton = ({ collapsed }) => {
  const [showDetails, setShowDetails] = useState(false);

  const {
    isWorking,
    isPaused,
    elapsedWorkTime,
    elapsedBreakTime,
    loading,
    startWork,
    pauseWork,
    resumeWork,
    stopWork,
    formatDisplayTime,
    pauseHistory,
    sessionStartTime,
    getCurrentBreakTime,
    previousWorkTime,
    previousBreakTime,
    getTotalWorkTimeWithPrevious,
    getTotalBreakTimeWithPrevious,
    todayData,
    hasTodayData,
    getFirstArrival,
  } = useClocking();

  const getStatusText = () => {
    if (!isWorking) return "Hors service";
    if (isPaused) return "En pause";
    return "En service";
  };

  const getTotalTime = () => {
    return elapsedWorkTime + elapsedBreakTime;
  };

  const formatTimeSimple = (date) => {
    console.log("formatTimeSimple reçu:", { date, type: typeof date });

    if (!date) return "--:--";

    // Si c'est déjà une chaîne au format HH:MM:SS ou HH:MM:SS.ssssss
    if (typeof date === "string") {
      if (date.includes(":")) {
        const parts = date.split(":");
        return `${parts[0].padStart(2, "0")}:${parts[1].padStart(2, "0")}`;
      }
      // Si c'est une date ISO string
      const d = new Date(date);
      if (!isNaN(d.getTime())) {
        const hours = String(d.getHours()).padStart(2, "0");
        const minutes = String(d.getMinutes()).padStart(2, "0");
        return `${hours}:${minutes}`;
      }
    }

    // Si c'est un objet Date
    if (date instanceof Date && !isNaN(date.getTime())) {
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      return `${hours}:${minutes}`;
    }

    return "--:--";
  };

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${mins}m ${secs}s`;
    }
    if (mins > 0) {
      return `${mins}m ${secs}s`;
    }
    return `${secs}s`;
  };

  const getTotalPauseTime = () => {
    const historyTotal = pauseHistory.reduce(
      (sum, pause) => sum + pause.duration,
      0
    );
    return historyTotal + getCurrentBreakTime();
  };

  const hasPreviousTime = previousWorkTime > 0 || previousBreakTime > 0;
  const canShowDetails = hasTodayData();

  if (collapsed) {
    // Construction du tooltip pour les détails
    const detailsTooltip = isWorking ? (
      <div style={{ fontSize: 11 }}>
        <div style={{ marginBottom: 4 }}>
          <strong>Session actuelle:</strong>{" "}
          {formatTimeSimple(sessionStartTime)}
        </div>
        <div style={{ marginBottom: 4 }}>
          <strong>Travaillé:</strong>{" "}
          {formatDuration(getTotalWorkTimeWithPrevious())}
        </div>
        <div style={{ marginBottom: 4 }}>
          <strong>Pause:</strong>{" "}
          {formatDuration(getTotalBreakTimeWithPrevious())}
        </div>
        <div
          style={{
            borderTop: "1px solid rgba(255,255,255,0.3)",
            paddingTop: 4,
            marginTop: 4,
          }}
        >
          <strong>Total journée:</strong>{" "}
          {formatDisplayTime(
            getTotalWorkTimeWithPrevious() + getTotalBreakTimeWithPrevious()
          )}
        </div>
      </div>
    ) : null;

    return (
      <WorkButtonContainer>
        <Space direction="vertical" style={{ width: "100%" }} size="small">
          {!isWorking ? (
            <Tooltip title="Démarrer la prise de fonction" placement="right">
              <Button
                type="primary"
                icon={<PlayCircleOutlined />}
                onClick={startWork}
                loading={loading}
                block
                style={{
                  backgroundColor: "#52c41a",
                  borderColor: "#52c41a",
                }}
              />
            </Tooltip>
          ) : (
            <>
              <Tooltip title={detailsTooltip} placement="right">
                <StatusDot
                  $isWorking={isWorking}
                  $isPaused={isPaused}
                  style={{
                    margin: "0 auto",
                    width: 12,
                    height: 12,
                    cursor: "pointer",
                  }}
                />
              </Tooltip>

              {!isPaused ? (
                <Tooltip title="Mettre en pause" placement="right">
                  <Button
                    icon={<PauseCircleOutlined />}
                    onClick={pauseWork}
                    loading={loading}
                    block
                    style={{
                      backgroundColor: "#fa8c16",
                      borderColor: "#fa8c16",
                      color: "#fff",
                    }}
                  />
                </Tooltip>
              ) : (
                <Tooltip title="Reprendre" placement="right">
                  <Button
                    icon={<PlayCircleOutlined />}
                    onClick={resumeWork}
                    loading={loading}
                    block
                    style={{
                      backgroundColor: "#1890ff",
                      borderColor: "#1890ff",
                      color: "#fff",
                    }}
                  />
                </Tooltip>
              )}

              <Tooltip title="Terminer la prise de fonction" placement="right">
                <Button
                  danger
                  icon={<PoweroffOutlined />}
                  onClick={stopWork}
                  loading={loading}
                  block
                />
              </Tooltip>
            </>
          )}
        </Space>
      </WorkButtonContainer>
    );
  }

  return (
    <WorkButtonContainer>
      <StatusIndicator $isWorking={isWorking} $isPaused={isPaused}>
        <StatusDot $isWorking={isWorking} $isPaused={isPaused} />
        <div style={{ flex: 1 }}>
          <Text strong style={{ fontSize: 12, display: "block" }}>
            {getStatusText()}
          </Text>
          {isWorking && (
            <TimeDisplay>
              <ClockCircleOutlined style={{ marginRight: 4 }} />
              {formatDisplayTime(getTotalTime())}
            </TimeDisplay>
          )}
        </div>
      </StatusIndicator>

      <ButtonsContainer direction="vertical" size="small">
        {!isWorking ? (
          <Button
            type="primary"
            icon={<PlayCircleOutlined />}
            onClick={startWork}
            loading={loading}
            block
            style={{
              backgroundColor: "#52c41a",
              borderColor: "#52c41a",
            }}
          >
            Démarrer
          </Button>
        ) : (
          <>
            {!isPaused ? (
              <Button
                icon={<PauseCircleOutlined />}
                onClick={pauseWork}
                loading={loading}
                block
                style={{
                  backgroundColor: "#fa8c16",
                  borderColor: "#fa8c16",
                  color: "#fff",
                }}
              >
                Pause
              </Button>
            ) : (
              <Button
                icon={<PlayCircleOutlined />}
                onClick={resumeWork}
                loading={loading}
                block
                style={{
                  backgroundColor: "#1890ff",
                  borderColor: "#1890ff",
                  color: "#fff",
                }}
              >
                Reprendre
              </Button>
            )}

            <Button
              danger
              icon={<PoweroffOutlined />}
              onClick={stopWork}
              loading={loading}
              block
            >
              Terminer
            </Button>
          </>
        )}
      </ButtonsContainer>

      {/* Bouton pour afficher/cacher les détails */}
      {canShowDetails && (
        <ToggleButton
          type="text"
          onClick={() => setShowDetails(!showDetails)}
          icon={showDetails ? <UpOutlined /> : <DownOutlined />}
        >
          {showDetails ? "Masquer" : "Détails de la journée"}
        </ToggleButton>
      )}

      {/* Panneau de détails */}
      <DetailsPanel $isOpen={showDetails && canShowDetails}>
        <DetailsPanelContent>
          {!isWorking && todayData && (
            <DetailItem style={{ backgroundColor: "#fff7e6", marginBottom: 8 }}>
              <BarChartOutlined style={{ color: "#d48806", fontSize: 14 }} />
              <span style={{ fontSize: 11, color: "#d48806", fontWeight: 600 }}>
                Résumé de la journée (terminée)
              </span>
            </DetailItem>
          )}

          <DetailItem $highlight>
            <LoginOutlined className="detail-icon" />
            <span className="detail-label">Première arrivée</span>
            <span className="detail-value">
              {formatTimeSimple(getFirstArrival() || sessionStartTime)}
            </span>
          </DetailItem>

          {isWorking && hasPreviousTime && (
            <DetailItem>
              <FieldTimeOutlined
                className="detail-icon"
                style={{ color: "#1890ff" }}
              />
              <span className="detail-label">Session actuelle</span>
              <span className="detail-value">
                {formatTimeSimple(sessionStartTime)}
              </span>
            </DetailItem>
          )}

          {!isWorking && todayData && (
            <DetailItem>
              <LogoutOutlined className="detail-icon" />
              <span className="detail-label">Dernier départ</span>
              <span className="detail-value">
                {formatTimeSimple(todayData.lastDeparture)}
              </span>
            </DetailItem>
          )}

          {hasPreviousTime && (
            <>
              <Divider style={{ margin: "8px 0", fontSize: 10, color: "#999" }}>
                Sessions précédentes
              </Divider>

              <DetailItem style={{ backgroundColor: "#f0f5ff" }}>
                <FieldTimeOutlined
                  className="detail-icon"
                  style={{ color: "#722ed1" }}
                />
                <span className="detail-label">Travail antérieur</span>
                <span className="detail-value" style={{ color: "#722ed1" }}>
                  {formatDuration(previousWorkTime)}
                </span>
              </DetailItem>

              <DetailItem style={{ backgroundColor: "#fff7e6" }}>
                <CoffeeOutlined
                  className="detail-icon"
                  style={{ color: "#d48806" }}
                />
                <span className="detail-label">Pause antérieure</span>
                <span className="detail-value" style={{ color: "#d48806" }}>
                  {formatDuration(previousBreakTime)}
                </span>
              </DetailItem>

              <Divider style={{ margin: "8px 0", fontSize: 10, color: "#999" }}>
                Session actuelle
              </Divider>
            </>
          )}

          {isWorking && (
            <>
              <DetailItem>
                <ClockCircleOutlined className="detail-icon" />
                <span className="detail-label">Temps travaillé</span>
                <span className="detail-value">
                  {formatDuration(elapsedWorkTime)}
                </span>
              </DetailItem>

              <DetailItem>
                <CoffeeOutlined
                  className="detail-icon"
                  style={{ color: "#fa8c16" }}
                />
                <span className="detail-label">Temps de pause</span>
                <span className="detail-value" style={{ color: "#fa8c16" }}>
                  {formatDuration(getTotalPauseTime())}
                </span>
              </DetailItem>
            </>
          )}

          {((isWorking && (pauseHistory.length > 0 || isPaused)) ||
            (!isWorking && todayData?.pauseHistory?.length > 0)) && (
            <>
              <Divider style={{ margin: "8px 0", fontSize: 10 }}>
                Pauses (
                {isWorking
                  ? pauseHistory.length + (isPaused ? 1 : 0)
                  : todayData?.pauseHistory?.length || 0}
                )
              </Divider>

              {(isWorking ? pauseHistory : todayData?.pauseHistory || []).map(
                (pause, index) => (
                  <PauseItem key={index}>
                    <span className="pause-time">
                      {formatTimeSimple(pause.start)} -{" "}
                      {formatTimeSimple(pause.end)}
                    </span>
                    <span className="pause-duration">
                      {formatDuration(pause.duration)}
                    </span>
                  </PauseItem>
                )
              )}

              {isWorking && isPaused && (
                <PauseItem
                  style={{
                    backgroundColor: "#fffbe6",
                    borderLeftColor: "#fadb14",
                  }}
                >
                  <span className="pause-time">
                    En cours depuis {formatTimeSimple(new Date())}
                  </span>
                  <span className="pause-duration" style={{ color: "#fadb14" }}>
                    {formatDuration(getCurrentBreakTime())}
                  </span>
                </PauseItem>
              )}
            </>
          )}

          {hasPreviousTime && (
            <Divider
              style={{ margin: "8px 0", fontSize: 10, color: "#1890ff" }}
            >
              Total cumulé de la journée
            </Divider>
          )}

          <DetailItem
            style={{
              marginTop: hasPreviousTime ? 4 : 8,
              backgroundColor: "#e6f7ff",
              borderTop: "2px solid #1890ff",
            }}
          >
            <ClockCircleOutlined className="detail-icon" />
            <span className="detail-label" style={{ fontWeight: 600 }}>
              {hasPreviousTime ? "Total journée" : "Temps total"}
            </span>
            <span
              className="detail-value"
              style={{ color: "#1890ff", fontSize: 13 }}
            >
              {formatDisplayTime(
                getTotalWorkTimeWithPrevious() + getTotalBreakTimeWithPrevious()
              )}
            </span>
          </DetailItem>

          {hasPreviousTime && (
            <DetailItem
              style={{
                backgroundColor: "#f6ffed",
                fontSize: 10,
                flexWrap: "wrap",
              }}
            >
              <span
                className="detail-label"
                style={{
                  color: "#52c41a",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <FieldTimeOutlined /> Travail total:{" "}
                {formatDuration(getTotalWorkTimeWithPrevious())}
              </span>
              <span
                className="detail-label"
                style={{
                  color: "#fa8c16",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <CoffeeOutlined /> Pause totale:{" "}
                {formatDuration(getTotalBreakTimeWithPrevious())}
              </span>
            </DetailItem>
          )}
        </DetailsPanelContent>
      </DetailsPanel>
    </WorkButtonContainer>
  );
};
