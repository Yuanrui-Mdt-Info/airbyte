import React from "react";
import styled from "styled-components";

import { ConnectorIcon } from "components/ConnectorIcon";
import { useDataCardContext, SelectDefinition } from "components/DataPanel/DataCardContext";

import { Connector, ConnectorDefinition } from "core/domain/connector";

interface CardProps {
  checked: boolean;
  data: ConnectorDefinition;
  type: "source" | "destination";
  onClick: (data: ConnectorDefinition) => void;
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
  background: #fff;
  padding: 10px;
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
  margin-bottom: 6px;
`;

const DataCard: React.FC<CardProps> = ({ data, onClick, checked, type }) => {
  const { setSourceSelectDefinition, setDestinationSelectDefinition } = useDataCardContext();

  const clickBox = () => {
    onClick(data);
    const obj: SelectDefinition = {
      definitionId: Connector.id(data),
      icon: data.icon,
      name: data.name,
    };
    if (type === "source") {
      setSourceSelectDefinition(obj);
    } else {
      setDestinationSelectDefinition(obj);
    }
  };

  return (
    <Box checked={checked} onClick={clickBox}>
      <Image icon={data.icon} />
      <div>{data.name}</div>
    </Box>
  );
};

export default DataCard;
