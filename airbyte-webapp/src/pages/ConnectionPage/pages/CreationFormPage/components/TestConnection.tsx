import React from "react";
import styled from "styled-components";

import Button from "components/ButtonGroup/components/Button";

import TestingLoading from "views/Connector/TestConnection/components/TestingLoading";
import TestingSuccess from "views/Connector/TestConnection/components/TestingSuccess";

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

const TestConnection: React.FC<Iprops> = ({ isLoading, type, onBack, onFinish }) => {
  return (
    <>
      <Container>{isLoading ? <TestingLoading /> : <TestingSuccess type={type} />}</Container>
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
