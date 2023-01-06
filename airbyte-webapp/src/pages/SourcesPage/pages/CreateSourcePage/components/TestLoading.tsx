import React, { useState, useEffect } from "react";
import styled from "styled-components";

import ButtonGroup from "components/ButtonGroup";
import { ButtonItems } from "components/ButtonGroup/ButtonGroup";

import useRouter from "hooks/useRouter";
import { RoutePaths } from "pages/routePaths";

import style from "./TestLoading.module.scss";

interface Iprops {
  // type?: "source" | "destination" | "connection";
  currentStep: string; // selecting|creating|Testing
  requestStatus: string; // loading|finish|error
  onClickBtn: (step: string, selectedId?: string) => void;
}

const Container = styled.div`
  margin: 150px auto 200px auto;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
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

const TestLoading: React.FC<Iprops> = ({ currentStep, onClickBtn, requestStatus }) => {
  const { push } = useRouter();
  const [status, setStatus] = useState<string>("loading"); // loading or finish
  const [ButtonItems, setButtonItems] = useState([
    {
      btnText: "Back",
      type: "cancel",
    },
    {
      btnText: "Finish",
      type: "disabled",
    },
  ] as ButtonItems[]);

  useEffect(() => {
    changeButtonStatus(1, requestStatus === "finish" ? "active" : "disabled");
    setStatus(requestStatus);
    console.log("requestStatus", requestStatus);
  }, [setStatus, requestStatus]);

  const changeButtonStatus = (index: number, type: "cancel" | "disabled" | "active") => {
    const NewData = ButtonItems.map((rows, key) => {
      if (index === key) {
        rows.type = type;
      }
      return rows;
    });
    setButtonItems(NewData);
  };

  const clickButton = (btnType: string) => {
    if (btnType === "disabled") {
      return;
    }
    if (btnType === "cancel") {
      return onClickBtn("creating");
    }

    if (currentStep === "testing") {
      return push(`/${RoutePaths.Source}`);
    }
  };

  return (
    <>
      <Container>
        <Text>{status === "loading" ? "Testing your connection..." : "Source validated!"}</Text>
        <Image
          src={status === "loading" ? "/icons/loading-icon.png" : "/icons/finish-icon.png"}
          alt=""
          className={status === "loading" ? style.loadingIcon : ""}
        />
        {/* <div className={style.loadingDiv}></div> */}
      </Container>
      <ButtonGroup data={ButtonItems} onClick={clickButton} />
    </>
  );
};

export default TestLoading;
