import React, { useState, useEffect } from "react";
import { useIntl } from "react-intl";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

import Button from "components/ButtonGroup/components/Button";
import { ConnectionStep, CreateStepTypes } from "components/ConnectionStep";
import DataPanel from "components/DataPanel";

import { Connector, ConnectorDefinition } from "core/domain/connector";
import useRouter from "hooks/useRouter";
import { RoutePaths } from "pages/routePaths";
import { useDestinationDefinitionList } from "services/connector/DestinationDefinitionService";
import { useSourceDefinitionList } from "services/connector/SourceDefinitionService";

import ExistingEntityForm from "./components/ExistingEntityForm";

interface State {
  currentStepNumber?: number;
  sourceId?: string;
  destinationId?: string;
  sourceDefinitionId?: string;
  destinationDefinitionId?: string;
  currentStep?: string;
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

const hasCurrentStep = (state: unknown): state is { currentStep: string } => {
  return (
    typeof state === "object" && state !== null && typeof (state as { currentStep?: string }).currentStep === "string"
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

const SelectNewConnectionCard: React.FC<{
  single?: boolean;
}> = ({ single }) => {
  const { push, location } = useRouter();
  const { formatMessage } = useIntl();
  const navigator = useNavigate();
  const { sourceDefinitions } = useSourceDefinitionList();
  const { destinationDefinitions } = useDestinationDefinitionList();

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

  const [currentStep, setCurrentStep] = useState<string>(
    hasCurrentStep(location.state) ? location.state.currentStep : CreateStepTypes.CREATE_SOURCE
  );

  const [disabled, setDisabled] = useState<boolean>(true);

  useEffect(() => {
    if (currentStep === CreateStepTypes.CREATE_SOURCE) {
      setDisabled(!Boolean(sourceId || sourceDefinitionId));
    } else {
      setDisabled(!Boolean(destinationId || destinationDefinitionId));
    }
  }, [currentStep, sourceId, sourceDefinitionId, destinationId, destinationDefinitionId]);

  const clickCancel = () => {
    if (single) {
      navigator(-1);
      return;
    }
    setCurrentStep(CreateStepTypes.CREATE_SOURCE);
    if (sourceDefinitionId) {
      push("", {
        state: {
          sourceDefinitionId,
        },
      });
    } else {
      push("", {
        state: {
          sourceId,
        },
      });
    }
  };

  const clickSelect = () => {
    const locationState: State = {
      // currentStep,
    };
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

    if (currentStep === CreateStepTypes.CREATE_SOURCE) {
      if (sourceDefinitionId) {
        push(`../${RoutePaths.ConnectionNew}`, {
          state: {
            ...locationState,
            currentStep: CreateStepTypes.CREATE_SOURCE,
          },
        });
      } else {
        push("", {
          state: locationState,
        });
        setCurrentStep(CreateStepTypes.CREATE_DESTINATION);
      }
      return;
    }

    if (currentStep === CreateStepTypes.CREATE_DESTINATION) {
      push(`../${RoutePaths.ConnectionNew}`, {
        state: {
          ...locationState,
          currentStep: destinationDefinitionId ? CreateStepTypes.CREATE_DESTINATION : CreateStepTypes.CREATE_CONNECTION,
        },
      });
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

    if (currentStep === CreateStepTypes.CREATE_SOURCE) {
      if (sourceId) {
        setSourceId("");
      }
      setSourceDefinitionId(selectId);
    }
    if (currentStep === CreateStepTypes.CREATE_DESTINATION) {
      if (destinationId) {
        setDestinationId("");
      }
      setDestinationDefinitionId(selectId);
    }
  };

  const onSelectExistingSource = (id: string) => {
    if (currentStep === CreateStepTypes.CREATE_SOURCE) {
      if (sourceDefinitionId) {
        setSourceDefinitionId("");
      }
      setSourceId(id);
    }
    if (currentStep === CreateStepTypes.CREATE_DESTINATION) {
      if (destinationDefinitionId) {
        setDestinationDefinitionId("");
      }
      setDestinationId(id);
    }
  };
  return (
    <>
      <ConnectionStep lightMode type="connection" activeStep={currentStep} />
      <Container>
        {currentStep === CreateStepTypes.CREATE_SOURCE && (
          <>
            {!single && (
              <ExistingEntityForm
                type="source"
                onSubmit={onSelectExistingSource}
                value={sourceId}
                placeholder={formatMessage({
                  id: "form.select.placeholder.source",
                })}
              />
            )}
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

        {currentStep === CreateStepTypes.CREATE_DESTINATION && (
          <>
            {!single && (
              <ExistingEntityForm
                type="destination"
                onSubmit={onSelectExistingSource}
                value={destinationId}
                placeholder={formatMessage({
                  id: "form.select.placeholder.destination",
                })}
              />
            )}
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
          {currentStep === CreateStepTypes.CREATE_DESTINATION && (
            <Button btnText="back" onClick={clickCancel} type="cancel" />
          )}
          <Button btnText="selectContinue" onClick={clickSelect} type={disabled ? "disabled" : "active"} />
        </ButtonRows>
      </Container>
    </>
  );
};

export default SelectNewConnectionCard;
