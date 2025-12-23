import React from "react";
import { Card, Avatar, Button, Tooltip } from "antd";
import styled from "styled-components";
import { Link } from "react-router";
import { DeleteOutlined, TeamOutlined, UserOutlined } from "@ant-design/icons";
import { ButtonStyle } from "@/utils/ButtonStyle";

const CardContainer = styled.div`
  position: relative;
  height: 100%;
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-4px);
  }
`;

const CardStyle = styled(Card)`
  height: 240px;
  border-radius: 16px !important;
  overflow: hidden;
  border: 1px solid #e2e8f0 !important;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08) !important;
  transition: all 0.3s ease !important;
  position: relative;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #4f46e5, #7c3aed);
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.4s ease;
  }

  &:hover {
    box-shadow: 0 12px 40px rgba(79, 70, 229, 0.15) !important;
    border-color: rgba(79, 70, 229, 0.2) !important;

    &::before {
      transform: scaleX(1);
    }
  }

  .ant-card-body {
    padding: 24px !important;
    height: 100%;
    display: flex;
    flex-direction: column;
    background: linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%);
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  gap: 12px;
`;

const TeamInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const TeamName = styled.h3`
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  svg {
    color: #4f46e5;
    font-size: 20px;
    flex-shrink: 0;
  }
`;

const MemberCount = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #64748b;
  font-weight: 600;

  svg {
    color: #7c3aed;
    font-size: 14px;
  }
`;

const AvatarGroupStyled = styled(Avatar.Group)`
  .ant-avatar {
    border: 2px solid white !important;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    font-weight: 600;
    font-size: 14px;
  }
`;

const Description = styled.div`
  flex: 1;
  margin: 16px 0;
  p {
    margin: 0;
    color: #64748b;
    font-size: 14px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const CardFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid #e2e8f0;
  margin-top: auto;
`;

const DeleteButton = styled(Button)`
  border-radius: 8px !important;
  height: 36px !important;
  width: 36px !important;
  padding: 0 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  transition: all 0.3s ease !important;

  &:hover {
    transform: scale(1.1) !important;
  }
`;

export const TeamCard = ({ team, handleDelete, userRole }) => {
  return (
    <CardContainer>
      <CardStyle>
        <Link
          to={`/teams/${team.id}`}
          state={{ id: team.id }}
          style={{
            textDecoration: "none",
            color: "inherit",
            display: "flex",
            flexDirection: "column",
            flex: 1,
          }}
        >
          <CardHeader>
            <TeamInfo>
              <TeamName>
                <TeamOutlined />
                {team.teamName}
              </TeamName>
              <MemberCount>
                <UserOutlined />
                {team.members.length}{" "}
                {team.members.length > 1 ? "membres" : "membre"}
              </MemberCount>
            </TeamInfo>
            <AvatarGroupStyled
              maxCount={3}
              maxStyle={{
                backgroundColor: "#7C3AED",
                color: "white",
                fontWeight: 600,
              }}
            >
              {team.members.map((member) => (
                <Tooltip
                  key={member.id}
                  title={`${member.firstName} ${member.lastName}`}
                >
                  <Avatar
                    style={{
                      backgroundColor: "#4F46E5",
                      color: "white",
                    }}
                  >
                    {member.firstName.charAt(0)}
                    {member.lastName.charAt(0)}
                  </Avatar>
                </Tooltip>
              ))}
            </AvatarGroupStyled>
          </CardHeader>

          <Description>
            <p>{team.description || "Aucune description disponible."}</p>
          </Description>
        </Link>

        <CardFooter>
          <Link
            to={`/teams/${team.id}`}
            state={{ id: team.id }}
            style={{ textDecoration: "none" }}
          >
            <ButtonStyle type="primary">{"Voir l'équipe"}</ButtonStyle>
          </Link>
          {userRole === "Responsable" && (
            <Tooltip title={"Supprimer l'équipe"}>
              <DeleteButton
                type="primary"
                danger
                icon={<DeleteOutlined />}
                onClick={(e) => {
                  e.preventDefault();
                  handleDelete(team);
                }}
              />
            </Tooltip>
          )}
        </CardFooter>
      </CardStyle>
    </CardContainer>
  );
};
