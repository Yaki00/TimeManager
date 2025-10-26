import { Tag } from "antd";
import styled from "styled-components";

const StyledTag = styled(Tag)`
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  display: inline-flex;
  align-items: center;
  gap: 4px;
`;

export const TagStyle = ({ icon, text, color }) => {
  return (
    <StyledTag color={color}>
      {icon && <span>{icon}</span>}
      {text}
    </StyledTag>
  );
};