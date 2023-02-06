import React from "react";
import { FormattedMessage } from "react-intl";
import styled from "styled-components";

import { Connector, ConnectorDefinition } from "core/domain/connector";

import DataCard from "./components/DataCard";
interface SourcePanelProps {
  value?: string;
  onSelect: (data: ConnectorDefinition) => void;
  type: "destination" | "source";
  data: ConnectorDefinition[];
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

const DataPanel: React.FC<SourcePanelProps> = ({ data, onSelect, value, type }) => {
  return (
    <Panel>
      <PanelTitle>
        <FormattedMessage id={`form.setup.${type}`} />
      </PanelTitle>
      <BoxList>
        {data.map((item) => (
          <DataCard data={item} key={Connector.id(item)} onClick={onSelect} checked={Connector.id(item) === value} />
        ))}
      </BoxList>
    </Panel>
  );
};

export default DataPanel;
