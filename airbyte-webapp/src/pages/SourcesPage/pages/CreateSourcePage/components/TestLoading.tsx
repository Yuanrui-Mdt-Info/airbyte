import React from "react";
import styled from "styled-components";

import Button from "components/ButtonGroup/components/Button";
import { useDataCardContext } from "components/DataPanel/DataCardContext";

import useRouter from "hooks/useRouter";
import { RoutePaths } from "pages/routePaths";
import { SwitchStepParams } from "pages/SourcesPage/pages/CreateSourcePage/CreateSourcePage";

import style from "./TestLoading.module.scss";

interface Iprops {
  isLoading: boolean;
  type: "destination" | "source";
  onClickBtn: (params: SwitchStepParams) => void;
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

const TestLoading: React.FC<Iprops> = ({ isLoading, type, onClickBtn }) => {
  const { push } = useRouter();
  const { clearSelectDefinition } = useDataCardContext();
  const clickButton = (btnType: string) => {
    if (btnType === "active") {
      const path = type === "source" ? `/${RoutePaths.Source}` : `/${RoutePaths.Destination}`;
      push(path);
      clearSelectDefinition();
      return;
    }
    onClickBtn({
      currentStep: "creating",
      fetchingConnectorError: null,
      btnType,
    });
  };

  return (
    <>
      <Container>
        <Text>{isLoading ? "Testing your connection..." : "Source validated!"}</Text>
        {isLoading && <Image src="/icons/loading-icon.png" className={style.loadingIcon} alt="loading-icon" />}
        {!isLoading && <Image src="/icons/finish-icon.png" alt="finish-icon" />}
      </Container>
      <ButtonRows>
        <Button btnText="Back" onClick={clickButton} type="cancel" />
        <Button btnText="Finish" onClick={clickButton} type={!isLoading ? "active" : "disabled"} />
      </ButtonRows>
    </>
  );
};

export default TestLoading;
