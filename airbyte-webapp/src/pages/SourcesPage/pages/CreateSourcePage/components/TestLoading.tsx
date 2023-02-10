import React from "react";
import { FormattedMessage } from "react-intl";
import styled, { keyframes } from "styled-components";

import Button from "components/ButtonGroup/components/Button";

interface Iprops {
  isLoading: boolean;
  type: "destination" | "source";
  onFinish: () => void;
  onBack: () => void;
}

const Container = styled.div`
  margin: 150px auto 200px auto;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
`;

export const ButtonRows = styled.div`
  display: flex;
  justify-content: space-around;
  align-items: center;
  margin-top: 40px;
  width: 100%;
`;

const Text = styled.div`
  font-size: 48px;
  line-height: 58px;
  margin-bottom: 120px;
`;

const Image = styled.img`
  width: 126px;
  height: 126px;
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

// .loadingDiv {
//     display: inline-block;
//     border: 4px solid rgba(#4F46E5,0.1);
//     border-left-color: #4F46E5;
//     border-radius: 50%;
//     width: 126px;
//     height: 126px;
//     animation: loading 1.5s linear infinite;
//     margin-top: 40px;
// }

const TestLoading: React.FC<Iprops> = ({ isLoading, type, onBack, onFinish }) => {
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
        <Button btnText="back" onClick={onBack} type="cancel" />
        <Button btnText="finish" onClick={onFinish} type={!isLoading ? "active" : "disabled"} />
      </ButtonRows>
    </>
  );
};

export default TestLoading;
