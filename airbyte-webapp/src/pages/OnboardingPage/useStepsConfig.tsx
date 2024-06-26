import { useMemo, useState, useCallback } from "react";
import { FormattedMessage } from "react-intl";

import { StepType } from "./types";

const useStepsConfig = (
  hasSources: boolean,
  hasDestinations: boolean,
  hasConnections: boolean,
  afterUpdateStep?: () => void
): {
  currentStep: StepType;
  setCurrentStep: (step: StepType) => void;
  steps: Array<{ name: JSX.Element; id: StepType }>;
} => {
  const getInitialStep = () => {
    if (hasSources) {
      if (hasDestinations) {
        if (hasConnections) {
          return StepType.FINAL;
        }
        return StepType.SET_UP_CONNECTION;
      }
      return StepType.CREATE_DESTINATION;
    }
    return StepType.INSTRUCTION;
  };

  const [currentStep, setCurrentStep] = useState<StepType>(getInitialStep);
  const updateStep = useCallback(
    (step: StepType) => {
      setCurrentStep(step);
      afterUpdateStep?.();
    },
    [setCurrentStep, afterUpdateStep]
  );

  const steps = useMemo(
    () => [
      {
        id: StepType.INSTRUCTION,
        name: <FormattedMessage id="onboarding.instruction" />,
      },
      {
        id: StepType.CREATE_SOURCE,
        name: <FormattedMessage id="onboarding.createSource" />,
      },
      {
        id: StepType.CREATE_DESTINATION,
        name: <FormattedMessage id="onboarding.createDestination" />,
      },
      {
        id: StepType.SET_UP_CONNECTION,
        name: <FormattedMessage id="onboarding.setUpConnection" />,
      },
      {
        id: StepType.FINAL,
        name: <FormattedMessage id="onboarding.final" />,
      },
    ],
    []
  );

  return {
    steps,
    currentStep,
    setCurrentStep: updateStep,
  };
};

export default useStepsConfig;
