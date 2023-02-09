import React from "react";
import { FormattedMessage } from "react-intl";
import styled, { keyframes } from "styled-components";

import Button from "components/ButtonGroup/components/Button";
// import { useDataCardContext } from "components/DataPanel/DataCardContext";

// import useRouter from "hooks/useRouter";
// import { RoutePaths } from "pages/routePaths";

// import { SwitchStepParams } from "pages/SourcesPage/pages/CreateSourcePage/CreateSourcePage";

// import style from "pages/SourcesPage/pages/CreateSourcePage/components/TestLoading.module.scss";

interface Iprops {
  isLoading: boolean;
  type: "destination" | "source" | "connection";
  onBack: (btnType: string) => void;
  onFinish: (btnType: string) => void;
  //   onClickBtn: (params: SwitchStepParams) => void;
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

const TestLoading: React.FC<Iprops> = ({ isLoading, type, onBack, onFinish }) => {
  console.log("loading-page-------------------", isLoading, `type:${type}`);
  return (
    <>
      <Container>
        <Text>
          {isLoading ? <FormattedMessage id="form.testing" /> : <FormattedMessage id={`form.${type}.validated`} />}
        </Text>
        {isLoading && <LoadingImage src="/icons/loading-icon.png" alt="loading-icon" />}
        {!isLoading && <Image src="/icons/finish-icon.png" alt="finish-icon" />}
      </Container>
      <ButtonRows>
        {((isLoading && type === "connection") || type !== "connection") && (
          <Button btnText="back" onClick={onBack} type="cancel" />
        )}
        {((!isLoading && type === "connection") || type !== "connection") && (
          <Button
            btnText={type === "connection" ? "returnToDashoard" : "finish"}
            onClick={onFinish}
            type={!isLoading ? "active" : "disabled"}
          />
        )}
      </ButtonRows>
    </>
  );
};

export default TestLoading;
