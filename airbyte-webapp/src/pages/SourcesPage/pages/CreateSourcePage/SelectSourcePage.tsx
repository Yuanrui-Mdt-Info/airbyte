import React, { useState } from "react";
import { useIntl } from "react-intl";
import styled from "styled-components";

import Button from "components/ButtonGroup/components/Button";
import { ConnectionStep } from "components/ConnectionStep";
import DefinitionCard from "components/DataPanel";

import { Action, Namespace } from "core/analytics";
import { Connector, ConnectorDefinition } from "core/domain/connector";
import { useAnalyticsService } from "hooks/services/Analytics";
import useRouter from "hooks/useRouter";
import { RoutePaths } from "pages/routePaths";
import { useSourceDefinitionList } from "services/connector/SourceDefinitionService";

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

const SelectNewSourceCard: React.FC = () => {
  const { push, location } = useRouter();
  const { formatMessage } = useIntl();
  const { sourceDefinitions } = useSourceDefinitionList();
  const analyticsService = useAnalyticsService();
  const [sourceDefinitionId, setSourceDefinitionId] = useState<string>(
    hasSourceDefinitionId(location.state) ? location.state.sourceDefinitionId : ""
  );

  const clickSelect = () => {
    push(`/${RoutePaths.Source}/${RoutePaths.SourceNew}`, {
      state: {
        sourceDefinitionId,
      },
    });

    const connector = sourceDefinitions.find((item) => item.sourceDefinitionId === sourceDefinitionId);
    analyticsService.track(Namespace.SOURCE, Action.SELECT, {
      actionDescription: "Source connector type selected",
      connector_source: connector?.name,
      connector_source_definition_id: sourceDefinitionId,
    });
  };

  const afterSelect = (selectCardData: ConnectorDefinition) => {
    const selectId = Connector.id(selectCardData);
    if (sourceDefinitionId === selectId) {
      return setSourceDefinitionId("");
    }
    setSourceDefinitionId(selectId);
  };
  return (
    <>
      <ConnectionStep lightMode type="source" />
      <Container>
        <DefinitionCard
          onSelect={afterSelect}
          data={sourceDefinitions}
          value={sourceDefinitionId}
          type="source"
          title={formatMessage({
            id: "form.setup.source",
          })}
        />
        <ButtonRows>
          <Button btnText="selectContinue" onClick={clickSelect} type={sourceDefinitionId ? "active" : "disabled"} />
        </ButtonRows>
      </Container>
    </>
  );
};

export default SelectNewSourceCard;
