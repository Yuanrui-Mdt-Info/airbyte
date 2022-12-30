import React from "react";
import styled from "styled-components";

import Button from "./Button";

export interface ButtonItems {
  btnText: string;
  type: "cancel" | "disabled" | "active";
}

interface ButtonProps {
  data: ButtonItems[];
}

export const ButtonRows = styled.div`
  display: flex;
  justify-content: space-around;
  align-items: center;
  margin-top: 40px;
`;

const ButtonGroup: React.FC<ButtonProps> = ({ data }) => {
  return (
    <ButtonRows>
      {data.map((item, index) => (
        <Button btnText={item.btnText} type={item.type} key={index + 1} />
      ))}
    </ButtonRows>
  );
};

export default ButtonGroup;
