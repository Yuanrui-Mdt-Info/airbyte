import React, { useState } from "react";
import styled from "styled-components";

import Button from "components/ButtonGroup/components/Button";
import ConnectionStep from "components/ConnectionStep";
import DataPanel from "components/DataPanel";
import { useDataCardContext } from "components/DataPanel/DataCardContext";

import useRouter from "hooks/useRouter";
import { RoutePaths } from "pages/routePaths";
import { SourceDefinitionReadWithLatestTag } from "services/connector/SourceDefinitionService";

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
  margin-top: 40px;
  width: 100%;
`;

const SelectNewSourceCard: React.FC = () => {
  const { push } = useRouter();
  const { selectDefinition, clearFormValues } = useDataCardContext();
  const [definitionId, setDefinitionId] = useState<string>(selectDefinition.definitionId);

  const clickCancel = () => {
    push(`/${RoutePaths.Source}`);
  };

  const clickSelect = () => {
    if (!definitionId) {
      return;
    }
    clearFormValues();
    push(`/${RoutePaths.Source}/${RoutePaths.SourceNew}`);
  };

  const onSelectNewDefinition = (selectCardData: SourceDefinitionReadWithLatestTag) => {
    if (definitionId === selectCardData.sourceDefinitionId) {
      return setDefinitionId("");
    }
    setDefinitionId(selectCardData.sourceDefinitionId);
  };
  return (
    <>
      <ConnectionStep lightMode type="source" />
      <Container>
        <DataPanel onSelect={onSelectNewDefinition} value={definitionId} title="Set up a new data source" />
        <ButtonRows>
          <Button btnText="Cancel" onClick={clickCancel} type="cancel" />
          <Button btnText="Select & Continue" onClick={clickSelect} type={definitionId ? "active" : "disabled"} />
        </ButtonRows>
      </Container>
    </>
  );
};

export default SelectNewSourceCard;
