import React from "react";
import { FormattedMessage } from "react-intl";
import styled from "styled-components";

import { Button } from "components";

// import Button from "components/ButtonGroup/components/Button";
import useRouter from "hooks/useRouter";
import { RoutePaths } from "pages/routePaths";
import { SwitchStepParams } from "pages/SourcesPage/pages/CreateSourcePage/CreateSourcePage";

// import { useServiceForm } from "../serviceFormContext";
import { ServiceFormValues } from "../types";
import { TestingConnectionError, FetchingConnectorError } from "./TestingConnectionError";
// import TestingConnectionSpinner from "./TestingConnectionSpinner";
// import TestingConnectionSuccess from "./TestingConnectionSuccess";

interface FormRootProps {
  // formType: "source" | "destination";
  isSubmitting?: boolean;
  errorMessage?: React.ReactNode;
  hasSuccess?: boolean;
  disabled?: boolean;
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

const BackButton = styled(Button)`
  // margin-left: auto;
  width: 264px;
  height: 68px;
  border-radius: 6px;
  font-weight: 500;
  font-size: 18px;
  line-height: 22px;
  background: #fff;
  color: #6b6b6f;
  border-color: #d1d5db;
`;

export const ButtonRows = styled.div`
  display: flex;
  justify-content: space-around;
  align-items: center;
  margin-top: 40px;
  width: 100%;
`;

const FormRootNew: React.FC<FormRootProps> = ({
  // isTestConnectionInProgress,
  isSubmitting,
  //   //formType,
  hasSuccess,
  errorMessage,
  fetchingConnectorError,
  disabled,
  // onCancelTesting,
  // currentStep,
  // onClickBtn,
  // formValues,
}) => {
  const { push } = useRouter();

  if (isSubmitting) {
    //  return <TestingConnectionSpinner isCancellable={isTestConnectionInProgress} onCancelTesting={onCancelTesting} />;
  }

  if (hasSuccess) {
    // return <TestingConnectionSuccess />;
  }

  if (errorMessage) {
  }

  const goBack = () => {
    push(`/${RoutePaths.Source}/${RoutePaths.SelectSource}`);
  };

  // id={`onboarding.${formType}SetUp.buttonText`}
  return (
    <ButtonContainer>
      {errorMessage && !fetchingConnectorError && <TestingConnectionError errorMessage={errorMessage} />}
      {fetchingConnectorError && <FetchingConnectorError />}
      <ButtonRows>
        <BackButton type="button" onClick={goBack}>
          Back
        </BackButton>
        <SubmitButton type="submit" disabled={disabled}>
          <FormattedMessage id="form.button.saveTest" />
        </SubmitButton>
      </ButtonRows>
    </ButtonContainer>
  );
};

export default FormRootNew;
