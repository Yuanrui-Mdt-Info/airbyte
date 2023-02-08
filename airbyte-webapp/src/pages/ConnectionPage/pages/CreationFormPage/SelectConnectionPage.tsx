import React, { useState } from "react";
import { useIntl } from "react-intl";
import styled from "styled-components";

import Button from "components/ButtonGroup/components/Button";
import ConnectionStep from "components/ConnectionStep";
import DataPanel from "components/DataPanel";
// import { useDataCardContext } from "components/DataPanel/DataCardContext";

import { Connector, ConnectorDefinition } from "core/domain/connector";
import useRouter from "hooks/useRouter";
import { RoutePaths } from "pages/routePaths";
import { useDestinationDefinitionList } from "services/connector/DestinationDefinitionService";
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

const hasSourceId = (state: unknown): state is { sourceId: string } => {
  return typeof state === "object" && state !== null && typeof (state as { sourceId?: string }).sourceId === "string";
};

const hasDestinationId = (state: unknown): state is { destinationId: string } => {
  return (
    typeof state === "object" &&
    state !== null &&
    typeof (state as { destinationId?: string }).destinationId === "string"
  );
};

const hasCurrentStepNumber = (state: unknown): state is { currentStepNumber: number } => {
  return (
    typeof state === "object" &&
    state !== null &&
    typeof (state as { currentStepNumber?: number }).currentStepNumber === "number"
  );
};

// const hasNewService = (state: unknown): state is { currentStepNumber: number } => {
//   return (
//     typeof state === "object" &&
//     state !== null &&
//     typeof (state as { currentStepNumber?: number }).currentStepNumber === "number"
//   );
// };

const SelectNewConnectionCard: React.FC = () => {
  const { push, location } = useRouter();
  const { formatMessage } = useIntl();
  // selectDefinition
  // const { clearFormValues } = useDataCardContext();
  const [sourceDefinitionId, setSourceDefinitionId] = useState<string>(
    hasSourceId(location.state) ? location.state.sourceId : ""
  );
  const [destinationDefinitionId, setDestinationDefinitionId] = useState<string>(
    hasDestinationId(location.state) ? location.state.destinationId : ""
  );
  const { sourceDefinitions } = useSourceDefinitionList();
  const { destinationDefinitions } = useDestinationDefinitionList();
  const [currentStepNumber, setCurrentStepNumber] = useState<number>(
    hasCurrentStepNumber(location.state) ? location.state.currentStepNumber : 1
  ); // 1,2,3,4
  const [useNewService, setUseNewService] = useState<boolean>(true);

  const clickCancel = () => {
    setCurrentStepNumber(1);
    push("", {
      state: {
        sourceId: sourceDefinitionId,
        sourceDefinitionId,
        currentStepNumber: 1,
      },
    });
    // push(`/${RoutePaths.Source}`);
  };

  const clickSelect = () => {
    if (currentStepNumber === 1) {
      const path = useNewService ? `/${RoutePaths.Connections}/${RoutePaths.ConnectionNew}` : "";
      const step = useNewService ? 1 : 2;
      push(path, {
        state: {
          // sourceId: sourceDefinitionId,
          sourceDefinitionId,
          currentStepNumber: step,
        },
      });
      setCurrentStepNumber(step);
      return;
    }

    if (currentStepNumber === 2) {
      // clearFormValues();
      // const path = useNewService ? `/${RoutePaths.Connections}/${RoutePaths.ConnectionNew}` : ""
      push(`/${RoutePaths.Connections}/${RoutePaths.ConnectionNew}`, {
        state: {
          sourceId: sourceDefinitionId,
          destinationId: destinationDefinitionId,
          destinationDefinitionId,
          sourceDefinitionId,
          currentStepNumber: useNewService ? 2 : 3,
        },
      });
    }
  };

  const afterSelect = (selectCardData: ConnectorDefinition) => {
    const selectId = Connector.id(selectCardData);
    setUseNewService(true);
    if (sourceDefinitionId === selectId) {
      return setSourceDefinitionId("");
    }

    if (destinationDefinitionId === selectId) {
      return setDestinationDefinitionId("");
    }

    //  setDefinitionId(selectId);

    if (currentStepNumber === 1) {
      setSourceDefinitionId(selectId);
    }
    if (currentStepNumber === 2) {
      setDestinationDefinitionId(selectId);
    }
  };

  const onSelectExistingSource = (id: string) => {
    setUseNewService(false);
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
            <ExistingEntityForm
              type="source"
              onSubmit={onSelectExistingSource}
              value={sourceDefinitionId}
              placeholder={formatMessage({
                id: "form.select.placeholder.source",
              })}
            />
            <DataPanel
              onSelect={afterSelect}
              data={sourceDefinitions}
              value={sourceDefinitionId}
              type="source"
              title={formatMessage({
                id: "connection.select.source",
              })}
            />
          </>
        )}

        {currentStepNumber === 2 && (
          <>
            <ExistingEntityForm
              type="destination"
              onSubmit={onSelectExistingSource}
              value={destinationDefinitionId}
              placeholder={formatMessage({
                id: "form.select.placeholder.destination",
              })}
            />
            <DataPanel
              onSelect={afterSelect}
              data={destinationDefinitions}
              value={destinationDefinitionId}
              type="destination"
              title={formatMessage({
                id: "form.setup.destination",
              })}
            />
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
