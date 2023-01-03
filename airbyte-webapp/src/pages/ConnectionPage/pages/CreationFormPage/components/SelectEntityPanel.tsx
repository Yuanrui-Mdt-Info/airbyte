import React, { useEffect, useState } from "react";

import useRouter from "hooks/useRouter";

import ButtonGroup from "./ButtonGroup";
import DataPanel from "./DataPanel";
import ExistingEntityForm from "./ExistingEntityForm";

export interface ButtonItems {
  btnText: string;
  type: "cancel" | "disabled" | "active";
}

const SelectEntityPanel: React.FC = () => {
  const { push } = useRouter();
  // const [currentEntityStep, setCurrentEntityStep] = useState(
  //     hasSourceId(location.state) ? EntityStepsTypes.DESTINATION : EntityStepsTypes.SOURCE
  //   );

  const onSelectExistingSource = (id: string) => {
    console.log("onSelectExistingSource", id);
    // clearAllFormChanges();
    // push("", {
    //   state: {
    //     ...(location.state as Record<string, unknown>),
    //     sourceId: id,
    //   },
    // });
    // setCurrentEntityStep(EntityStepsTypes.DESTINATION);
    // setCurrentStep(StepsTypes.CREATE_CONNECTOR);
  };

  //   const onSelectExistingDestination = (id: string) => {
  //     console.log("onSelectExistingSource", id);
  //     // clearAllFormChanges();
  //     // push("", {
  //     //   state: {
  //     //     ...(location.state as Record<string, unknown>),
  //     //     destinationId: id,
  //     //   },
  //     // });
  //     // setCurrentEntityStep(EntityStepsTypes.CONNECTION);
  //     // setCurrentStep(StepsTypes.CREATE_CONNECTION);
  //   };

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

  // selected sourceID or destiantionID
  const [definitionId, setDefinitionId] = useState("");

  const onSelectNewDefinition = (id: string) => {
    if (definitionId === id) {
      setDefinitionId("");
    } else {
      setDefinitionId(id);
    }
  };

  useEffect(() => {
    changeButtonStatus(1, !definitionId ? "disabled" : "active");
  }, [definitionId]);

  const clickButton = (btnType: string) => {
    if (btnType === "disabled") {
      return;
    }
    if (btnType === "cancel") {
      return push("/");
    }

    // if (type === "connection") {
    //   setCurrentEntityStep(EntityStepsTypes.DESTINATION);
    //   setCurrentStep(StepsTypes.CREATE_CONNECTOR);
    // } else {
    //   setCurrentEntityStep(EntityStepsTypes.CONNECTION);
    //   setCurrentStep(StepsTypes.CREATE_CONNECTION);
    // }
    console.log("btnType", btnType);
  };
  return (
    <>
      <ExistingEntityForm
        type="source"
        onSubmit={onSelectExistingSource}
        onChange={onSelectNewDefinition}
        value={definitionId}
      />
      <DataPanel onSelect={onSelectNewDefinition} value={definitionId} />
      <ButtonGroup data={ButtonItems} onClick={clickButton} />
    </>
  );
};

export default SelectEntityPanel;
