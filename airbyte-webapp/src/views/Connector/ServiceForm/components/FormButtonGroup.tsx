import React, { useState } from "react";
import { FormattedMessage } from "react-intl";
import styled from "styled-components";

import { Button } from "components";
import ButtonGroup from "components/ButtonGroup";
import { ButtonItems } from "components/ButtonGroup/ButtonGroup";

import { SwitchStepParams } from "pages/SourcesPage/pages/CreateSourcePage/CreateSourcePage";

// import { useServiceForm } from "../serviceFormContext";
import { ServiceFormValues } from "../types";
import { TestingConnectionError, FetchingConnectorError } from "./TestingConnectionError";
// import TestingConnectionSpinner from "./TestingConnectionSpinner";
// import TestingConnectionSuccess from "./TestingConnectionSuccess";

// import { RoutePaths } from "pages/routePaths";
// import useRouter from "hooks/useRouter";

interface FormRootProps {
  // formType: "source" | "destination";
  isSubmitting?: boolean;
  errorMessage?: React.ReactNode;
  hasSuccess?: boolean;
  isLoadSchema?: boolean;
  fetchingConnectorError?: Error | null;
  formValues?: Partial<ServiceFormValues>;
  isTestConnectionInProgress?: boolean;
  // onCancelTesting?: () => void;
  currentStep: string; // selecting|creating|Testing
  onClickBtn?: (params: SwitchStepParams) => void;
}

const ButtonContainer = styled.div`
  margin-top: 34px;
  display: flex;
  //align-items: center;
  justify-content: space-between;
  flex-direction: column;
`;

const SubmitButton = styled(Button)`
  // margin-left: auto;
  width: 264px;
  height: 68px;
  border-radius: 6px;
  font-weight: 500;
  font-size: 18px;
  line-height: 22px;
`;

const FormRootNew: React.FC<FormRootProps> = ({
  // isTestConnectionInProgress,
  isSubmitting,
  //   //formType,
  hasSuccess,
  errorMessage,
  fetchingConnectorError,
  isLoadSchema,
  // onCancelTesting,
  currentStep,
  onClickBtn,
  formValues,
}) => {
  // const { push } = useRouter();

  // const { getValues } = useServiceForm();

  // const useNewUI = true;

  const [ButtonItems] = useState([
    // setButtonItems
    {
      btnText: "Back",
      type: "cancel",
    },
  ] as ButtonItems[]);

  if (isSubmitting) {
    //  return <TestingConnectionSpinner isCancellable={isTestConnectionInProgress} onCancelTesting={onCancelTesting} />;
  }

  if (hasSuccess) {
    // return <TestingConnectionSuccess />;
  }

  if (errorMessage) {
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

  const clickButton = (btnType: string) => {
    if (btnType === "disabled") {
      return;
    }
    if (btnType === "cancel" && onClickBtn) {
      return onClickBtn({
        currentStep: "creating",
        formValue: formValues,
      });
    }

    if (currentStep === "creating" && onClickBtn) {
      // return onClickBtn("testing");
    }
  };

  // id={`onboarding.${formType}SetUp.buttonText`}
  return (
    <ButtonContainer>
      {errorMessage && !fetchingConnectorError && <TestingConnectionError errorMessage={errorMessage} />}
      {fetchingConnectorError && <FetchingConnectorError />}
      <ButtonGroup data={ButtonItems} onClick={clickButton}>
        <SubmitButton type="submit" disabled={isLoadSchema}>
          <FormattedMessage id="form.button.saveTest" />
        </SubmitButton>
      </ButtonGroup>
    </ButtonContainer>
  );
};

export default FormRootNew;
