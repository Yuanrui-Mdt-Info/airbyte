import React, { useState, useEffect } from "react";
import { FormattedMessage } from "react-intl";
import styled from "styled-components";
// import CreateStepTypes from "components/ConnectionStep";

import useRouter from "hooks/useRouter";

import StepBox from "./components/StepBox";
import CreateStepTypes from "./CreateStepTypes";

export interface StepMenuItem {
  id: string;
  name: string | React.ReactNode;
  status?: string;
  isPartialSuccess?: boolean;

  onSelect?: () => void;
}

interface IProps {
  lightMode?: boolean;
  data?: StepMenuItem[];
  activeStep?: string;
  onSelect?: (id: string) => void;
  type?: "source" | "destination" | "connection";
  currentStepNumber?: number; // 1~4
}

// export enum StepsTypes {
//   CREATE_ENTITY = "createEntity",
//   CREATE_CONNECTOR = "createConnector",
//   CREATE_CONNECTION = "createConnection",
// }

export enum EntityStepsTypes {
  SOURCE = "source",
  DESTINATION = "destination",
  CONNECTION = "connection",
}

export const StepBlock = styled.div`
  width: 100%;
  height: 90px;
  background: #eff0f5;
  font-weight: 500;
  font-size: 16px;
  line-height: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const SingleText = styled.div`
  font-weight: 700;
  font-size: 28px;
  line-height: 30px;
`;

const currentStepArray: string[] = ["", "createSource", "createDestination", "createConnection", "allFinish"];

const ConnectionStep: React.FC<IProps> = ({ onSelect, lightMode, activeStep }) => {
  const { location } = useRouter(); // push
  const locationType = location.pathname.split("/")[1];

  const type: EntityStepsTypes =
    locationType === "connections"
      ? EntityStepsTypes.CONNECTION
      : locationType === "destination"
      ? EntityStepsTypes.DESTINATION
      : EntityStepsTypes.SOURCE;

  const [currentStepNumber, setCurrentStepNumber] = useState<number>(1);

  useEffect(() => {
    if (activeStep !== CreateStepTypes.TEST_CONNECTION) {
      const stepNumber: number = currentStepArray.findIndex((val) => val === activeStep);
      setCurrentStepNumber(stepNumber);
    }
  }, [activeStep]);

  const steps: StepMenuItem[] =
    type === "connection"
      ? [
          {
            id: CreateStepTypes.CREATE_SOURCE,
            name: <FormattedMessage id="onboarding.addSource" />,
          },
          {
            id: CreateStepTypes.CREATE_DESTINATION,
            name: <FormattedMessage id="onboarding.addDestination" />,
          },
          {
            id: CreateStepTypes.CREATE_CONNECTION,
            name: <FormattedMessage id="onboarding.configurations" />,
          },
        ]
      : [
          {
            id: type === "destination" ? CreateStepTypes.CREATE_DESTINATION : CreateStepTypes.CREATE_SOURCE,
            name:
              type === "destination" ? (
                <FormattedMessage id="onboarding.addDestination" />
              ) : (
                <FormattedMessage id="onboarding.addSource" />
              ),
          },
        ];

  const StepComponents = () => {
    if (steps.length > 1) {
      return (
        <>
          {steps.map((item, key) => (
            <StepBox
              status={item.status}
              isPartialSuccess={item.isPartialSuccess}
              lightMode={lightMode}
              key={item.id}
              stepNumber={key}
              {...item}
              onClick={onSelect || item.onSelect}
              currentStepNumber={currentStepNumber}
              isActive={key < currentStepNumber}
            />
          ))}
        </>
      );
    }
    return <SingleText>{steps[0].name}</SingleText>;
  };

  return <StepBlock>{StepComponents()}</StepBlock>;
};

export default ConnectionStep;
