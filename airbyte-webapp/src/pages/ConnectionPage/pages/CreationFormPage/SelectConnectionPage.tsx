import React, { useState } from "react";
import styled from "styled-components";

import Button from "components/ButtonGroup/components/Button";
import ConnectionStep from "components/ConnectionStep";
import DataPanel from "components/DataPanel";
import { useDataCardContext } from "components/DataPanel/DataCardContext";

import { Connector, ConnectorDefinition } from "core/domain/connector";
import useRouter from "hooks/useRouter";
import { RoutePaths } from "pages/routePaths";
import { useSourceDefinitionList } from "services/connector/SourceDefinitionService";

import ExistingEntityForm from "./components/ExistingEntityForm";

export interface ButtonItems {
  btnText: string;
  type: "cancel" | "disabled" | "active";
}

const Container = styled.div`
  max-width: 858px;
  margin: 0 auto;
`;

export const ButtonRows = styled.div`
  display: flex;
  justify-content: space-around;
  align-items: center;
  margin: 40px 0 60px 0;
  width: 100%;
`;

const SelectNewConnectionCard: React.FC = () => {
  const { push } = useRouter();
  const { selectDefinition, clearFormValues } = useDataCardContext();
  const [definitionId, setDefinitionId] = useState<string>(selectDefinition.definitionId);
  const { sourceDefinitions } = useSourceDefinitionList();

  // const clickCancel = () => {
  //   push(`/${RoutePaths.Source}`);
  // };

  const clickSelect = () => {
    if (!definitionId) {
      return;
    }
    clearFormValues();
    push(`/${RoutePaths.Connections}/${RoutePaths.ConnectionNew}`);
  };

  const afterSelect = (selectCardData: ConnectorDefinition) => {
    const selectId = Connector.id(selectCardData);
    if (definitionId === selectId) {
      return setDefinitionId("");
    }
    setDefinitionId(selectId);
  };

  const onSelectExistingSource = (id: string) => {
    if (definitionId === id) {
      return setDefinitionId("");
    }
    setDefinitionId(id);
    console.log(`onSelectExistingSource:${id}`);
  };
  return (
    <>
      <ConnectionStep lightMode type="source" />
      <Container>
        <ExistingEntityForm type="source" onSubmit={onSelectExistingSource} value={definitionId} />
        <DataPanel onSelect={afterSelect} data={sourceDefinitions} value={definitionId} type="source" />
        <ButtonRows>
          {/* <Button btnText="Cancel" onClick={clickCancel} type="cancel" /> */}
          <Button btnText="selectContinue" onClick={clickSelect} type={definitionId ? "active" : "disabled"} />
        </ButtonRows>
      </Container>
    </>
  );
};

export default SelectNewConnectionCard;
