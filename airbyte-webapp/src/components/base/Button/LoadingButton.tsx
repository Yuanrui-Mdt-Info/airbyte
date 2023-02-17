import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import styled, { keyframes } from "styled-components";

import Button from "./Button";
import { ButtonProps } from "./types";

export const SpinAnimation = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

const SymbolSpinner = styled(FontAwesomeIcon)<ButtonProps>`
  display: inline-block;
  font-size: 18px;
  position: absolute;
  left: 50%;
  animation: ${SpinAnimation} 1.5s linear 0s infinite;
  color: ${({ theme, danger, white }) => (danger ? theme.dangerColor : white ? theme.whiteColor : theme.primaryColor)};
  margin: -1px 0 -3px -9px;
`;

const SubmitButton = styled(Button)`
  width: 160px;
  height: 46px;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 500;
`;

const ButtonView = styled(Button)<ButtonProps>`
  pointer-events: none;
  background: ${({ theme, danger }) => (danger ? theme.dangerColor25 : theme.primaryColor25)};
  border-color: transparent;
  position: relative;
  width: 160px;
  height: 46px;
  border-radius: 6px;
  font-size: 16px;
`;

const Invisible = styled.div`
  color: rgba(255, 255, 255, 0);
`;
/*
 * TODO: this component need to be refactored - we need to have
 * the only one <Button/> component and set loading state via props
 * issue: https://github.com/airbytehq/airbyte/issues/12705
 * */
const LoadingButton: React.FC<ButtonProps> = (props) => {
  if (props.isLoading) {
    return (
      <ButtonView {...props}>
        {props.isLoading ? (
          <>
            <SymbolSpinner icon={faCircleNotch} danger={props.danger} white={props.white} />
            <Invisible>{props.children}</Invisible>
          </>
        ) : (
          props.children
        )}
      </ButtonView>
    );
  }

  return <SubmitButton {...props} />;
};

export default LoadingButton;
