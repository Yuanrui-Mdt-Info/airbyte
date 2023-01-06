import React, { useState, useEffect } from "react";
import styled from "styled-components";

import ButtonGroup from "components/ButtonGroup";
import DataPanel from "components/DataPanel";

import useRouter from "hooks/useRouter";
import { RoutePaths } from "pages/routePaths";
import { SourceDefinitionReadWithLatestTag } from "services/connector/SourceDefinitionService";

export interface ButtonItems {
  btnText: string;
  type: "cancel" | "disabled" | "active";
}

interface Iprops {
  type?: "source" | "destination" | "connection";
  currentStep: string; // selecting|creating|Testing
  onClickBtn: (step: string, selectedId?: string, definitionName?: string) => void;
  selectEntityId?: string;
}

const Container = styled.div`
  max-width: 858px;
  margin: 0 auto;
`;

const SelectNewSourceCard: React.FC<Iprops> = ({ currentStep, onClickBtn, selectEntityId }) => {
  const { push } = useRouter();
  const [definitionId, setDefinitionId] = useState(selectEntityId);
  const [definitionName, setDefinitionName] = useState("");

  useEffect(() => {
    changeButtonStatus(1, !definitionId ? "disabled" : "active");
  }, [definitionId]);

  const [ButtonItems, setButtonItems] = useState([
    {
      btnText: "Cancel",
      type: "cancel",
    },
    {
      btnText: "Select & Continue",
      type: "disabled",
    },
  ] as ButtonItems[]);

  const changeButtonStatus = (index: number, type: "cancel" | "disabled" | "active") => {
    const NewData = ButtonItems.map((rows, key) => {
      if (index === key) {
        rows.type = type;
      }
      return rows;
    });
    setButtonItems(NewData);
  };

  const backUrl = `/${RoutePaths.Source}`;

  const clickButton = (btnType: string) => {
    if (btnType === "disabled") {
      return;
    }
    if (btnType === "cancel") {
      return push(backUrl);
    }

    if (currentStep === "selecting") {
      onClickBtn("creating", definitionId, definitionName);
    }

    if (currentStep === "creating") {
      onClickBtn("Testing", definitionId, definitionName);
    }
  };

  const onSelectNewDefinition = (selectCardData: SourceDefinitionReadWithLatestTag) => {
    if (definitionId === selectCardData.sourceDefinitionId) {
      return setDefinitionId("");
    }
    setDefinitionId(selectCardData.sourceDefinitionId);
    setDefinitionName(selectCardData.name);
  };
  return (
    <Container>
      <DataPanel onSelect={onSelectNewDefinition} value={definitionId} title="Set up a new data source" />
      <ButtonGroup data={ButtonItems} onClick={clickButton} />
    </Container>
  );
};

export default SelectNewSourceCard;
