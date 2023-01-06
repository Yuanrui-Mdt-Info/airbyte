import React, { useState } from "react";
// import { FormattedMessage } from "react-intl";
import styled from "styled-components";

// import { Button } from "components";

import ButtonGroup from "components/ButtonGroup";
import { ButtonItems } from "components/ButtonGroup/ButtonGroup";

import { TestingConnectionError, FetchingConnectorError } from "./TestingConnectionError";
import TestingConnectionSpinner from "./TestingConnectionSpinner";
import TestingConnectionSuccess from "./TestingConnectionSuccess";

// import { RoutePaths } from "pages/routePaths";
// import useRouter from "hooks/useRouter";

interface CreateControlProps {
  formType: "source" | "destination";
  isSubmitting: boolean;
  errorMessage?: React.ReactNode;
  hasSuccess?: boolean;
  isLoadSchema?: boolean;
  fetchingConnectorError?: Error | null;

  isTestConnectionInProgress: boolean;
  onCancelTesting?: () => void;
  currentStep: string; // selecting|creating|Testing
  onClickBtn?: (step: string, selectedId?: string) => void;
}

const ButtonContainer = styled.div`
  margin-top: 34px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

// const SubmitButton = styled(Button)`
//   margin-left: auto;
// `;

const CreateControls: React.FC<CreateControlProps> = ({
  isTestConnectionInProgress,
  isSubmitting,
  // formType,
  hasSuccess,
  errorMessage,
  fetchingConnectorError,
  // isLoadSchema,
  onCancelTesting,
  currentStep,
  onClickBtn,
}) => {
  // const { push } = useRouter();
  const [ButtonItems] = useState([
    // setButtonItems
    {
      btnText: "Back",
      type: "cancel",
    },
    {
      btnText: "Save & Test",
      type: "active",
    },
  ] as ButtonItems[]);

  if (isSubmitting) {
    return <TestingConnectionSpinner isCancellable={isTestConnectionInProgress} onCancelTesting={onCancelTesting} />;
  }

  if (hasSuccess) {
    return <TestingConnectionSuccess />;
  }

  // useEffect(() => {
  //   changeButtonStatus(1, "active");
  // }, [setStatus]);

  // const changeButtonStatus = (index: number, type: "cancel" | "disabled" | "active") => {
  //   const NewData = ButtonItems.map((rows, key) => {
  //     if (index === key) {
  //       rows.type = type;
  //     }
  //     return rows;
  //   });
  //   setButtonItems(NewData);
  // };

  // setTimeout(()=>{
  //   changeButtonStatus(1,'active')
  // },1500)

  const clickButton = (btnType: string) => {
    if (btnType === "disabled") {
      return;
    }
    if (btnType === "cancel" && onClickBtn) {
      return onClickBtn("selecting");
    }

    if (currentStep === "creating" && onClickBtn) {
      return onClickBtn("testing");
    }
  };

  return (
    <ButtonContainer>
      {errorMessage && !fetchingConnectorError && <TestingConnectionError errorMessage={errorMessage} />}
      {fetchingConnectorError && <FetchingConnectorError />}

      <ButtonGroup data={ButtonItems} onClick={clickButton} />
      {/* <SubmitButton type="submit" disabled={isLoadSchema}>
        <FormattedMessage id={`onboarding.${formType}SetUp.buttonText`} />
      </SubmitButton> */}
    </ButtonContainer>
  );
};

export default CreateControls;
