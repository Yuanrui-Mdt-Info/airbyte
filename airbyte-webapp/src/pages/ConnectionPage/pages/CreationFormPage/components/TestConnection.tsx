import React from "react";
import { FormattedMessage } from "react-intl";
import styled, { keyframes } from "styled-components";

import Button from "components/ButtonGroup/components/Button";

interface Iprops {
  isLoading: boolean;
  type: "destination" | "source" | "connection";
  onBack: (btnType: string) => void;
  onFinish: (btnType: string) => void;
}

const Container = styled.div`
  margin: 10% auto 200px auto;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
`;

export const ButtonRows = styled.div`
  display: flex;
  justify-content: space-around;
  align-items: center;
  margin-top: 200px;
  width: 100%;
`;

const Text = styled.div`
  font-size: 36px;
  line-height: 58px;
  margin-bottom: 120px;
`;

const Image = styled.img`
  width: 120px;
  height: 120px;
`;

const Loading = keyframes`
0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
`;

const LoadingImage = styled.img`
  width: 120px;
  height: 120px;
  display: inline-block;
  animation: ${Loading} 1.8s linear infinite;
`;

const TestingConnectionSuccess: React.FC<{
  type: "destination" | "source" | "connection";
}> = ({ type }) => {
  return (
    <>
      <Text>
        <FormattedMessage id={`form.${type}.validated`} />
      </Text>
      <Image src="/icons/finish-icon.png" alt="finish-icon" />
    </>
  );
};

const TestingConnection: React.FC = () => {
  return (
    <>
      <Text>
        <FormattedMessage id="form.testing" />
      </Text>
      <LoadingImage src="/icons/loading-icon.png" alt="loading-icon" />
    </>
  );
};

const TestConnection: React.FC<Iprops> = ({ isLoading, type, onBack, onFinish }) => {
  return (
    <>
      <Container>{isLoading ? <TestingConnectionSuccess type={type} /> : <TestingConnection />}</Container>
      <ButtonRows>
        {((isLoading && type === "connection") || type !== "connection") && (
          <Button btnText="back" onClick={onBack} type="cancel" />
        )}
        {((!isLoading && type === "connection") || type !== "connection") && (
          <Button
            btnText={type === "connection" ? "returnToDashoard" : "continue"}
            onClick={onFinish}
            type={!isLoading ? "active" : "disabled"}
          />
        )}
      </ButtonRows>
    </>
  );
};

export default TestConnection;
