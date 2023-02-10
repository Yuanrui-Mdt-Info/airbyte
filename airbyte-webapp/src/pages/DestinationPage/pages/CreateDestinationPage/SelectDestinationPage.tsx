import React, { useState } from "react";
import { useIntl } from "react-intl";
import styled from "styled-components";

import Button from "components/ButtonGroup/components/Button";
import ConnectionStep from "components/ConnectionStep";
import DataPanel from "components/DataPanel";

import { Connector, ConnectorDefinition } from "core/domain/connector";
import useRouter from "hooks/useRouter";
import { RoutePaths } from "pages/routePaths";
import { useDestinationDefinitionList } from "services/connector/DestinationDefinitionService";

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

const hasSourceDefinitionId = (state: unknown): state is { sourceDefinitionId: string } => {
  return (
    typeof state === "object" &&
    state !== null &&
    typeof (state as { sourceDefinitionId?: string }).sourceDefinitionId === "string"
  );
};

const SelectDestinationCard: React.FC = () => {
  const { push, location } = useRouter();
  const { formatMessage } = useIntl();
  const [destinationDefinitionId, setDestinationDefinitionId] = useState<string>(
    hasSourceDefinitionId(location.state) ? location.state.sourceDefinitionId : ""
  );

  const { destinationDefinitions } = useDestinationDefinitionList();

  const clickSelect = () => {
    if (!destinationDefinitionId) {
      return;
    }
    push(`/${RoutePaths.Destination}/${RoutePaths.DestinationNew}`, {
      state: {
        destinationDefinitionId,
      },
    });
  };

  const afterSelect = (selectCardData: ConnectorDefinition) => {
    const selectId = Connector.id(selectCardData);
    if (destinationDefinitionId === selectId) {
      return setDestinationDefinitionId("");
    }
    setDestinationDefinitionId(selectId);
  };

  return (
    <>
      <ConnectionStep lightMode type="destination" currentStepNumber={1} />
      <Container>
        <DataPanel
          onSelect={afterSelect}
          data={destinationDefinitions}
          value={destinationDefinitionId}
          type="destination"
          title={formatMessage({
            id: "form.setup.destination",
          })}
        />
        <ButtonRows>
          <Button
            btnText="selectContinue"
            onClick={clickSelect}
            type={destinationDefinitionId ? "active" : "disabled"}
          />
        </ButtonRows>
      </Container>
    </>
  );
};

export default SelectDestinationCard;
