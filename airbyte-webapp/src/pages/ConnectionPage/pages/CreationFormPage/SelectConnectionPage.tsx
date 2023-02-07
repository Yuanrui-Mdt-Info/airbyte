import React, { useState } from "react";
import styled from "styled-components";

import Button from "components/ButtonGroup/components/Button";
import ConnectionStep from "components/ConnectionStep";
// import DataPanel from "components/DataPanel";
import { useDataCardContext } from "components/DataPanel/DataCardContext";

// import { Connector, ConnectorDefinition } from "core/domain/connector";
import useRouter from "hooks/useRouter";
import { RoutePaths } from "pages/routePaths";
// import { useSourceDefinitionList } from "services/connector/SourceDefinitionService";
// import { useDestinationDefinitionList } from "services/connector/DestinationDefinitionService";

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
  const [sourceDefinitionId, setSourceDefinitionId] = useState<string>(selectDefinition.definitionId);
  const [destinationDefinitionId, setDestinationDefinitionId] = useState<string>(selectDefinition.definitionId);
  // const { sourceDefinitions } = useSourceDefinitionList();
  // const { destinationDefinitions } = useDestinationDefinitionList();
  const [currentStepNumber, setCurrentStepNumber] = useState<number>(1); // 1,2,3,4
  const [useNewService, setUseNewService] = useState<boolean>(true);

  const clickCancel = () => {
    setCurrentStepNumber(1);
    // push(`/${RoutePaths.Source}`);
  };

  const clickSelect = () => {
    console.log(currentStepNumber, useNewService);
    if (currentStepNumber === 1 && !sourceDefinitionId) {
      return;
    }
    if (currentStepNumber === 2 && !destinationDefinitionId) {
      return;
    }

    if (currentStepNumber === 1 && !useNewService) {
      setCurrentStepNumber(2);
      return;
    }
    clearFormValues();
    push(`/${RoutePaths.Connections}/${RoutePaths.ConnectionNew}`, {
      state: {
        sourceId: sourceDefinitionId,
        destinationId: destinationDefinitionId,
        currentStepNumber: 3,
      },
    });
  };

  // const afterSelect = (selectCardData: ConnectorDefinition) => {
  //   const selectId = Connector.id(selectCardData);
  // setUseNewService(true)
  //   if (definitionId === selectId) {
  //     return setDefinitionId("");
  //   }
  //   setDefinitionId(selectId);
  // };

  const onSelectExistingSource = (id: string) => {
    setUseNewService(false);
    console.log(id);
    if (currentStepNumber === 1) {
      setSourceDefinitionId(id);
    }
    if (currentStepNumber === 2) {
      setDestinationDefinitionId(id);
    }
  };
  return (
    <>
      <ConnectionStep lightMode type="connection" currentStepNumber={currentStepNumber} />
      <Container>
        {currentStepNumber === 1 && (
          <>
            <ExistingEntityForm type="source" onSubmit={onSelectExistingSource} value={sourceDefinitionId} />
            {/* <DataPanel onSelect={afterSelect} data={sourceDefinitions} value={definitionId} type="source" /> */}
          </>
        )}

        {currentStepNumber === 2 && (
          <>
            <ExistingEntityForm type="destination" onSubmit={onSelectExistingSource} value={destinationDefinitionId} />
            {/* <DataPanel onSelect={afterSelect} data={destinationDefinitions} value={definitionId} type="destination" /> */}
          </>
        )}

        <ButtonRows>
          {currentStepNumber === 2 && <Button btnText="cancel" onClick={clickCancel} type="cancel" />}
          <Button
            btnText="selectContinue"
            onClick={clickSelect}
            type={
              (currentStepNumber === 1 && sourceDefinitionId) || (currentStepNumber === 2 && destinationDefinitionId)
                ? "active"
                : "disabled"
            }
          />
        </ButtonRows>
      </Container>
    </>
  );
};

export default SelectNewConnectionCard;
