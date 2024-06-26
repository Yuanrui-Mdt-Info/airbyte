import React, { useMemo } from "react";
import styled from "styled-components";

import StatusIcon from "components/StatusIcon";
import { StatusIconStatus } from "components/StatusIcon/StatusIcon";

import Status from "core/statuses";

interface IProps {
  id: string;
  lightMode?: boolean;
  name: string | React.ReactNode;
  onClick?: (id: string) => void;
  isActive?: boolean;
  isPartialSuccess?: boolean;
  num: number;
  status?: string;
}

const StepView = styled.div<{
  isActive?: boolean;
  lightMode?: boolean;
  nonClickable?: boolean;
}>`
  padding: 6px 14px;
  border-radius: 4px;
  text-align: center;
  font-weight: 500;
  font-size: 16px;
  line-height: 20px;
  transition: 0.3s;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
`;

const Num = styled.div<{ isActive?: boolean }>`
  width: 16px;
  height: 16px;
  border-radius: 50%;
  text-align: center;
  background: ${({ theme, isActive }) => (isActive ? theme.primaryColor : theme.greyColor60)};
  color: ${({ theme }) => theme.whiteColor};
  font-weight: 500;
  font-size: 12px;
  line-height: 16px;
  display: inline-block;
  margin-right: 6px;
  box-shadow: 0 1px 2px 0 ${({ theme }) => theme.shadowColor};
`;

const StepBlock = styled.div<{
  isActive?: boolean;
  lightMode?: boolean;
  nonClickable?: boolean;
}>`
  width: 152px;
  height: 40px;
  border-radius: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme, isActive }) => (isActive ? theme.primaryColor : theme.greyColor60)};
  background: ${({ isActive }) => (isActive ? "#dedcff" : "none")};
  cursor: ${({ nonClickable }) => (nonClickable ? "default" : "pointer")};
  pointer-events: ${({ isActive, nonClickable }) => (isActive || nonClickable ? "none" : "all")};
`;

const Step: React.FC<IProps> = ({ name, id, isActive, onClick, num, lightMode, status, isPartialSuccess }) => {
  const onItemClickItem = () => {
    if (onClick) {
      onClick(id);
    }
  };

  const statusIconStatus: StatusIconStatus | undefined = useMemo(
    () => (status !== Status.FAILED && !isPartialSuccess ? "success" : isPartialSuccess ? "warning" : undefined),
    [status, isPartialSuccess]
  );

  return (
    <StepView data-id={`${id.toLowerCase()}-step`} onClick={onItemClickItem}>
      <StepBlock nonClickable={!onClick} isActive={isActive} lightMode={lightMode}>
        {lightMode ? null : <Num isActive={isActive}>{num}</Num>}
        {status ? <StatusIcon status={statusIconStatus} /> : null}
        {name}
      </StepBlock>
    </StepView>
  );
};

export default Step;
