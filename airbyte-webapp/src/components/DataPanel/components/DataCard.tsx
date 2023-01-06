import React from "react";
import styled from "styled-components";

import { ConnectorIcon } from "components/ConnectorIcon";
import { useDataCardContext } from "components/DataPanel/DataCardContext";

import { SourceDefinitionReadWithLatestTag } from "services/connector/SourceDefinitionService";
interface CardProps {
  checked: boolean;
  data: SourceDefinitionReadWithLatestTag;
  onClick: (data: SourceDefinitionReadWithLatestTag) => void;
}

export const Box = styled.div<{
  checked: boolean;
}>`
  box-sizing: border-box;
  width: 210px;
  height: 172px;
  border: 2px solid ${({ checked, theme }) => (checked ? theme.primaryColor : "#eff0f5")};
  border-radius: 8px;
  display: flex;
  align-items: center;
  flex-direction: column;
  margin-right: 84px;
  margin-bottom: 43px;
  font-size: 20px;
  text-align: center;
  &:hover {
    cursor: pointer;
    box-shadow: 1px 1px 1px #ccc;
  }
  &:nth-child(3n) {
    margin-right: 0;
  }
`;

export const Image = styled(ConnectorIcon)`
  width: 106px;
  height: 106px;
  margin-bottom: 2px;
`;

const DataCard: React.FC<CardProps> = ({ data, onClick, checked }) => {
  const { setSelectDefinition } = useDataCardContext();

  return (
    <Box
      checked={checked}
      onClick={() => {
        onClick(data);
        setSelectDefinition({
          definitionId: data.sourceDefinitionId,
          icon: data.icon,
          name: data.name,
        });
      }}
    >
      <Image icon={data.icon} />
      <div>{data.name}</div>
    </Box>
  );
};

export default DataCard;
