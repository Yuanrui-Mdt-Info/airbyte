import React from "react";
import styled from "styled-components";

import Step from "./Step";

// import { H3 } from "components";

export interface StepMenuItem {
  id: string;
  name: string | React.ReactNode;
  status?: string;
  isPartialSuccess?: boolean;
  onSelect?: () => void;
}

interface IProps {
  lightMode?: boolean;
  data: StepMenuItem[];
  activeStep?: string;
  onSelect?: (id: string) => void;
}

export const StepBlock = styled.div`
  width: 100%;
  height: 120px;
  background: #eff0f5;
  font-weight: 500;
  font-size: 16px;
  line-height: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ConnectionStep: React.FC<IProps> = ({ data, onSelect, activeStep, lightMode }) => {
  return (
    <StepBlock>
      {data.map((item, key) => (
        <Step
          status={item.status}
          isPartialSuccess={item.isPartialSuccess}
          lightMode={lightMode}
          key={item.id}
          num={key + 1}
          {...item}
          onClick={item.onSelect || onSelect}
          isActive={activeStep === item.id}
        />
      ))}
    </StepBlock>
  );
};

export default ConnectionStep;
