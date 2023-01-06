import React from "react";
import styled from "styled-components";

import { useSourceDefinitionList } from "services/connector/SourceDefinitionService";

import DataCard from "./components/DataCard";

interface SourcePanelProps {
  value?: string;
  title: string;
  onSelect: (id: string) => void;
}

export const Panel = styled.div`
  max-width: 858px;
  margin: 60px auto 200px auto;
`;

export const PanelTitle = styled.div`
  font-weight: 500;
  font-size: 24px;
  line-height: 30px;
  color: #27272a;
  margin-bottom: 30px;
`;

export const BoxList = styled.div`
  display: flex;
  flex-wrap: wrap;
`;

const DataPanel: React.FC<SourcePanelProps> = ({ onSelect, value, title }) => {
  const { sourceDefinitions } = useSourceDefinitionList();
  return (
    <Panel>
      <PanelTitle>{title}</PanelTitle>
      <BoxList>
        {sourceDefinitions.map((item, key) => (
          <DataCard data={item} key={key + 1} onClick={onSelect} checked={item.sourceDefinitionId === value} />
        ))}
      </BoxList>
    </Panel>
  );
};

export default DataPanel;
