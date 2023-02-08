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

const SelectDestinationCard: React.FC = () => {
  const { push } = useRouter();
  const { formatMessage } = useIntl();
  const { selectDefinition, clearFormValues } = useDataCardContext();
  const [definitionId, setDefinitionId] = useState<string>(selectDefinition.definitionId);

  const { destinationDefinitions } = useDestinationDefinitionList();

  // const clickCancel = () => {
  //   push(`/${RoutePaths.Source}`);
  // };

  const clickSelect = () => {
    if (!definitionId) {
      return;
    }
    clearFormValues();
    push(`/${RoutePaths.Destination}/${RoutePaths.DestinationNew}`, {
      state: {
        destinationDefinitionId: definitionId,
      },
    });
  };

  const afterSelect = (selectCardData: ConnectorDefinition) => {
    const selectId = Connector.id(selectCardData);
    if (definitionId === selectId) {
      return setDefinitionId("");
    }
    setDefinitionId(selectId);
  };

  return (
    <>
      <ConnectionStep lightMode type="destination" currentStepNumber={1} />
      <Container>
        <DataPanel
          onSelect={afterSelect}
          data={destinationDefinitions}
          value={definitionId}
          type="destination"
          title={formatMessage({
            id: "form.setup.destination",
          })}
        />
        <ButtonRows>
          {/* <Button btnText="Cancel" onClick={clickCancel} type="cancel" /> */}
          <Button btnText="selectContinue" onClick={clickSelect} type={definitionId ? "active" : "disabled"} />
        </ButtonRows>
      </Container>
    </>
  );
};

export default SelectDestinationCard;
