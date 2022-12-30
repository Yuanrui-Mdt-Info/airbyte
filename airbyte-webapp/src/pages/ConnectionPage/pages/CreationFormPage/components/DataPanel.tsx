import React from "react";
import styled from "styled-components";

import { useSourceDefinitionList } from "services/connector/SourceDefinitionService";

import DataCard from "./DataCard";

interface SourcePanelProps {
  value?: string;
  onSelect: (id: string) => void;
}

export const Panel = styled.div`
  max-width: 858px;
  margin: 0 auto;
`;

export const PanelTitle = styled.div`
  font-weight: 500;
  font-size: 24px;
  line-height: 30px;
  color: #27272a;
  margin-bottom: 30px;
  margin-top: 30px;
`;

export const BoxList = styled.div`
  display: flex;
  flex-wrap: wrap;
  // align-items: center;
`;

const DataPanel: React.FC<SourcePanelProps> = ({ onSelect, value }) => {
  const { sourceDefinitions } = useSourceDefinitionList();
  return (
    <Panel>
      <PanelTitle>Select your data source</PanelTitle>
      <BoxList>
        {sourceDefinitions.map((item, key) => (
          <DataCard data={item} key={key + 1} onClick={onSelect} checked={item.sourceDefinitionId === value} />
        ))}
      </BoxList>
    </Panel>
  );
};

export default DataPanel;
