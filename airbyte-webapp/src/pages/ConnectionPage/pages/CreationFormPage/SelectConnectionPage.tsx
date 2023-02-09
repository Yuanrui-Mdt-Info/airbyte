import React, { useState } from "react";
import { useIntl } from "react-intl";
import styled from "styled-components";

import Button from "components/ButtonGroup/components/Button";
import ConnectionStep from "components/ConnectionStep";
import DataPanel from "components/DataPanel";
import { useDataCardContext } from "components/DataPanel/DataCardContext";

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

interface State {
  currentStepNumber?: number;
  sourceId?: string;
  destinationId?: string;
  sourceDefinitionId?: string;
  destinationDefinitionId?: string;
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

const hasSourceDefinitionId = (state: unknown): state is { sourceDefinitionId: string } => {
  return (
    typeof state === "object" &&
    state !== null &&
    typeof (state as { sourceDefinitionId?: string }).sourceDefinitionId === "string"
  );
};

const hasDestinationDefinitionId = (state: unknown): state is { destinationDefinitionId: string } => {
  return (
    typeof state === "object" &&
    state !== null &&
    typeof (state as { destinationDefinitionId?: string }).destinationDefinitionId === "string"
  );
};

const SelectNewConnectionCard: React.FC = () => {
  const { push, location } = useRouter();
  const { formatMessage } = useIntl();
  const { sourceDefinitions } = useSourceDefinitionList();
  const { destinationDefinitions } = useDestinationDefinitionList();
  const { clearSourceServiceValues, clearDestinationServiceValues } = useDataCardContext();
  console.warn("SelectConnection------------------", location.state);

  const [sourceId, setSourceId] = useState<string>(hasSourceId(location.state) ? location.state.sourceId : "");
  const [destinationId, setDestinationId] = useState<string>(
    hasDestinationId(location.state) ? location.state.destinationId : ""
  );

  const [sourceDefinitionId, setSourceDefinitionId] = useState<string>(
    !sourceId ? (hasSourceDefinitionId(location.state) ? location.state.sourceDefinitionId : "") : ""
  );
  const [destinationDefinitionId, setDestinationDefinitionId] = useState<string>(
    !destinationId ? (hasDestinationDefinitionId(location.state) ? location.state.destinationDefinitionId : "") : ""
  );
  const [currentStepNumber, setCurrentStepNumber] = useState<number>(
    hasCurrentStepNumber(location.state) ? location.state.currentStepNumber : 1
  ); // 1,2,3,4

  // const [useNewService, setUseNewService] = useState<boolean>(true);

  const clickCancel = () => {
    setCurrentStepNumber(1);
    if (sourceDefinitionId) {
      push("", {
        state: {
          //  ...(location.state as Record<string, unknown>),
          sourceDefinitionId,
          currentStepNumber: 1,
        },
      });
    } else {
      push("", {
        state: {
          //  ...(location.state as Record<string, unknown>),
          sourceId,
          currentStepNumber: 1,
        },
      });
    }
  };

  const clickSelect = () => {
    const locationState: State = {};
    if (sourceId) {
      locationState.sourceId = sourceId;
    }
    if (destinationId) {
      locationState.destinationId = destinationId;
    }
    if (sourceDefinitionId) {
      locationState.sourceDefinitionId = sourceDefinitionId;
    }
    if (destinationDefinitionId) {
      locationState.destinationDefinitionId = destinationDefinitionId;
    }
    console.log("locationState", JSON.stringify(locationState));

    if (currentStepNumber === 1) {
      if (sourceDefinitionId) {
        push(`/${RoutePaths.Connections}/${RoutePaths.ConnectionNew}`, {
          state: {
            // ...(location.state as Record<string, unknown>),
            //  sourceId,
            // sourceDefinitionId,
            ...locationState,
            currentStepNumber: 1,
          },
        });
        clearSourceServiceValues();
        setCurrentStepNumber(1);
      } else {
        push("", {
          state: {
            // ...(location.state as Record<string, unknown>),
            // sourceId,
            ...locationState,
            currentStepNumber: 2,
          },
        });
        setCurrentStepNumber(2);
      }
      return;
    }

    if (currentStepNumber === 2) {
      if (destinationDefinitionId) {
        push(`/${RoutePaths.Connections}/${RoutePaths.ConnectionNew}`, {
          state: {
            // ...(location.state as Record<string, unknown>),
            // destinationDefinitionId,
            // sourceDefinitionId,
            // sourceId,
            // destinationId,
            ...locationState,
            currentStepNumber: 2,
          },
        });
        clearDestinationServiceValues();
      } else {
        push(`/${RoutePaths.Connections}/${RoutePaths.ConnectionNew}`, {
          state: {
            //  ...(location.state as Record<string, unknown>),
            // sourceId,
            // destinationId,
            // destinationDefinitionId,
            // sourceDefinitionId,
            ...locationState,
            currentStepNumber: 3,
          },
        });
      }
    }
  };

  const afterSelect = (selectCardData: ConnectorDefinition) => {
    const selectId = Connector.id(selectCardData);
    if (sourceDefinitionId === selectId) {
      return setSourceDefinitionId("");
    }

    if (destinationDefinitionId === selectId) {
      return setDestinationDefinitionId("");
    }

    if (currentStepNumber === 1) {
      if (sourceId) {
        setSourceId("");
      }
      setSourceDefinitionId(selectId);
    }
    if (currentStepNumber === 2) {
      if (destinationId) {
        setDestinationId("");
      }
      setDestinationDefinitionId(selectId);
    }
  };

  const onSelectExistingSource = (id: string) => {
    if (currentStepNumber === 1) {
      if (sourceDefinitionId) {
        setSourceDefinitionId("");
      }
      setSourceId(id);
    }
    if (currentStepNumber === 2) {
      if (destinationDefinitionId) {
        setDestinationDefinitionId("");
      }
      setDestinationId(id);
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
              value={sourceId}
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
              value={destinationId}
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
          {currentStepNumber === 2 && <Button btnText="back" onClick={clickCancel} type="cancel" />}
          <Button
            btnText="selectContinue"
            onClick={clickSelect}
            type={
              (currentStepNumber === 1 && (sourceId || sourceDefinitionId)) ||
              (currentStepNumber === 2 && (destinationId || destinationDefinitionId))
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
