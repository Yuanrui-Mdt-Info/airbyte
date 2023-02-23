import React from "react";
import styled from "styled-components";

import { Button } from "components";

import { ButtonProps } from "./types";

export const ButtonRows = styled.div`
  display: flex;
  justify-content: space-around;
  align-items: center;
  margin-top: 200px;
  width: 100%;
`;

export const ButtonContainer = styled(Button)`
  box-sizing: border-box;
  width: 264px;
  height: 68px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  font-size: 18px;
`;

export const BigButton: React.FC<ButtonProps> = (props) => {
  return <ButtonContainer {...props}>{props.children}</ButtonContainer>;
};
