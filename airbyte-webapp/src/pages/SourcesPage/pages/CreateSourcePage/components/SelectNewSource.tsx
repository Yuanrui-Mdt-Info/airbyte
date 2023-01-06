import React, { useState, useEffect } from "react";
import styled from "styled-components";

import ButtonGroup from "components/ButtonGroup";
import DataPanel from "components/DataPanel";

import useRouter from "hooks/useRouter";
import { RoutePaths } from "pages/routePaths";

export interface ButtonItems {
  btnText: string;
  type: "cancel" | "disabled" | "active";
}

interface Iprops {
  type?: "source" | "destination" | "connection";
  currentStep: string; // selecting|creating|Testing
  onClickBtn: (step: string, selectedId?: string) => void;
}

const Container = styled.div`
  max-width: 858px;
  margin: 0 auto;
`;

const SelectNewSourceCard: React.FC<Iprops> = ({ currentStep, onClickBtn }) => {
  const { push } = useRouter();
  const [definitionId, setDefinitionId] = useState("");

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
      onClickBtn("creating", definitionId);
    }

    if (currentStep === "creating") {
      onClickBtn("Testing");
    }
  };

  const onSelectNewDefinition = (id: string) => {
    if (definitionId === id) {
      return setDefinitionId("");
    }
    setDefinitionId(id);
  };
  return (
    <Container>
      <DataPanel onSelect={onSelectNewDefinition} value={definitionId} title="Set up a new data source" />
      <ButtonGroup data={ButtonItems} onClick={clickButton} />
    </Container>
  );
};

export default SelectNewSourceCard;
