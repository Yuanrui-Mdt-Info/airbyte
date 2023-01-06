import React from "react";
import styled from "styled-components";

interface StepProps {
  id: string;
  lightMode?: boolean;
  name: string | React.ReactNode;
  onClick?: (id: string) => void;
  isActive?: boolean;
  isPartialSuccess?: boolean;
  num: number;
  status?: string;
}

export const StepBlock = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const StepContent = styled.div<{
  isActive?: boolean;
  lightMode?: boolean;
  nonClickable?: boolean;
}>`
  display: flex;
  justify-content: center;
  align-items: center;
  color: ${({ theme, isActive }) => (isActive ? theme.primaryColor : theme.greyColor60)};
  cursor: ${({ nonClickable }) => (nonClickable ? "default" : "pointer")};
`;

export const StepCircle = styled.div<{
  isActive?: boolean;
}>`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 40px;
  height: 40px;
  border: 2px solid ${({ theme, isActive }) => (isActive ? theme.primaryColor : " #d1d5db")};
  border-radius: 20px;
  margin-right: 16px;
`;

export const StepLine = styled.div<{
  isActive?: boolean;
}>`
  width: 110px;
  border: 1px solid ${({ theme, isActive }) => (isActive ? theme.primaryColor : " #d1d5db")};
  margin: 0 30px;
`;

const StepBox: React.FC<StepProps> = ({ name, id, isActive, onClick, num, lightMode, status }) => {
  const onItemClickItem = () => {
    if (onClick) {
      onClick(id);
    }
  };
  return (
    <StepBlock>
      {num > 1 ? <StepLine isActive={isActive} /> : null}
      <StepContent
        data-id={`${id.toLowerCase()}-step`}
        nonClickable={!onClick}
        onClick={onItemClickItem}
        isActive={isActive}
        lightMode={lightMode}
      >
        {status === "success" ? (
          <img src="/icons/checkbox-checked.png" alt="checkbox-checked" />
        ) : (
          <StepCircle isActive={isActive}>{num > 9 ? num : `0${num}`}</StepCircle>
        )}
        {name}
      </StepContent>
    </StepBlock>
  );
};

export default StepBox;
