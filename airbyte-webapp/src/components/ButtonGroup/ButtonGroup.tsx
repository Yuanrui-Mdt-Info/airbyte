import React from "react";
import styled from "styled-components";

import Button from "components/ButtonGroup/components/Button";

export interface ButtonItems {
  btnText: string;
  type: "cancel" | "disabled" | "active";
}

interface ButtonProps {
  data: ButtonItems[];
  onClick: (btnType: string) => void;
}

export const ButtonRows = styled.div`
  display: flex;
  justify-content: space-around;
  align-items: center;
  margin-top: 40px;
  width: 100%;
`;

const ButtonGroup: React.FC<ButtonProps> = ({ data, onClick, children }) => {
  return (
    <ButtonRows>
      {data.map((item, index) => (
        <Button btnText={item.btnText} type={item.type} key={index + 1} onClick={onClick} />
      ))}
      {children}
    </ButtonRows>
  );
};

export default ButtonGroup;
