import React from "react";
import { FormattedMessage } from "react-intl";
import styled from "styled-components";

import { BigButton, ButtonRows } from "components/base/Button/BigButton";

import TestingLoading from "views/Connector/TestConnection/components/TestingLoading";
import TestingSuccess from "views/Connector/TestConnection/components/TestingSuccess";

interface Iprops {
  isLoading: boolean;
  type: "destination" | "source" | "connection";
  onBack?: () => void;
  onFinish: () => void;
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: space-around;
`;
const LoadingContainer = styled.div`
  // margin: 10% auto 200px auto;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  // flex: 1;
`;
// disabled isLoading was removed from back button
const TestConnection: React.FC<Iprops> = ({ isLoading, type, onFinish }) => {
  return (
    <Container>
      <LoadingContainer>{isLoading ? <TestingLoading /> : <TestingSuccess type={type} />}</LoadingContainer>
      <ButtonRows>
        {/* {((isLoading && type === "connection") || type !== "connection") && (
          <BigButton secondary onClick={onBack} disabled={isLoading}>
            <FormattedMessage id="form.button.back" />
          </BigButton>
        )} */}
        {((!isLoading && type === "connection") || type !== "connection") && (
          <BigButton disabled={isLoading} onClick={onFinish}>
            <FormattedMessage id={type === "connection" ? "form.button.returnToDashoard" : "form.button.continue"} />
          </BigButton>
        )}
      </ButtonRows>
    </Container>
  );
};

export default TestConnection;
