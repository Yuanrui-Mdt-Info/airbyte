import React, { useState } from "react";
import { FormattedMessage } from "react-intl";
import styled from "styled-components";

import useRouter from "hooks/useRouter";

import StepBox from "./components/StepBox";

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
}

export enum StepsTypes {
  CREATE_ENTITY = "createEntity",
  CREATE_CONNECTOR = "createConnector",
  CREATE_CONNECTION = "createConnection",
}

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

const ConnectionStep: React.FC<IProps> = ({ onSelect, lightMode }) => {
  const { location } = useRouter(); // push
  const locationType = location.pathname.split("/")[1];
  const type: EntityStepsTypes =
    locationType === "connections"
      ? EntityStepsTypes.CONNECTION
      : locationType === "destination"
      ? EntityStepsTypes.DESTINATION
      : EntityStepsTypes.SOURCE;

  const hasSourceId = (state: unknown): state is { sourceId: string } => {
    return typeof state === "object" && state !== null && typeof (state as { sourceId?: string }).sourceId === "string";
  };

  const hasDestinationId = (state: unknown): state is { destinationId: string } => {
    return (
      typeof state === "object" &&
      state !== null &&
      typeof (state as { destinationId?: string }).destinationId === "string"
    );
  };

  const [currentStep] = useState(
    // setCurrentStep

    hasSourceId(location.state) && hasDestinationId(location.state)
      ? StepsTypes.CREATE_CONNECTION
      : hasSourceId(location.state) && !hasDestinationId(location.state)
      ? StepsTypes.CREATE_CONNECTOR
      : StepsTypes.CREATE_ENTITY
  );

  // setCurrentStep(StepsTypes.CREATE_CONNECTOR)

  // const [currentEntityStep] = useState(
  //   // setCurrentEntityStep

  //   hasSourceId(location.state) ? EntityStepsTypes.DESTINATION : EntityStepsTypes.SOURCE
  // );

  const steps: StepMenuItem[] =
    type === "connection"
      ? [
          {
            id: StepsTypes.CREATE_ENTITY,
            name: <FormattedMessage id="onboarding.addSource" />,
          },
          {
            id: StepsTypes.CREATE_CONNECTOR,
            name: <FormattedMessage id="onboarding.addDestination" />,
          },
          {
            id: StepsTypes.CREATE_CONNECTION,
            name: <FormattedMessage id="onboarding.configurations" />,
          },
        ]
      : [
          {
            id: StepsTypes.CREATE_ENTITY,
            name:
              type === "destination" ? (
                <FormattedMessage id="onboarding.addDestination" />
              ) : (
                <FormattedMessage id="onboarding.addSource" />
              ),
          },
          // {
          //   id: StepsTypes.CREATE_CONNECTION,
          //   name: <FormattedMessage id="onboarding.configurations" />,
          // },
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
              num={key + 1}
              {...item}
              onClick={onSelect || item.onSelect}
              isActive={currentStep === item.id}
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
