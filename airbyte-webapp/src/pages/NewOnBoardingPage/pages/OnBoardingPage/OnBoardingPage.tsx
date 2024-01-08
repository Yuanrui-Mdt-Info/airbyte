import { Container, StepIcon } from "@mui/material";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Stepper from "@mui/material/Stepper";
import Typography from "@mui/material/Typography";
import React, { useState } from "react";
import { FormattedMessage } from "react-intl";
import styled from "styled-components";

import { Button as NewButton } from "components";
import { ButtonRows, CustomButton } from "components/base/Button/CustomButton";
import DataPanel from "components/DataPanel";
import DefinitionCard from "components/DataPanel";
import { BoardIcon } from "components/icons/BoardIcon";
import { ColorRocketIcon } from "components/icons/ColorRocketIcon";
import { RocketIcon } from "components/icons/RocketIcon";

import { Action, Namespace } from "core/analytics";
import { Connector, ConnectorDefinition } from "core/domain/connector";
import { useAnalyticsService } from "hooks/services/Analytics/useAnalyticsService";
import useRouter from "hooks/useRouter";
import { RoutePaths } from "pages/routePaths";
import { useDestinationDefinitionList } from "services/connector/DestinationDefinitionService";
import { useSourceDefinitionList } from "services/connector/SourceDefinitionService";

import "./OnBoardingPage.scss";

const steps = [
  "Setup your first connection",
  "Setup you first Souce",
  "Setup your first destination",
  "Configure your connection",
  "You are all Set",
];
const hasSourceDefinitionId = (state: unknown): state is { sourceDefinitionId: string } => {
  return (
    typeof state === "object" &&
    state !== null &&
    typeof (state as { sourceDefinitionId?: string }).sourceDefinitionId === "string"
  );
};
const hasDestinationDefinitionId = (state: unknown): state is { destinationDefinitionId: string } => {
  return (
    typeof state === "object" &&
    state !== null &&
    typeof (state as { destinationDefinitionId?: string }).destinationDefinitionId === "string"
  );
};

const OnBoardingPage = () => {
  const { push, location } = useRouter();
  console.log(location, "Location");
  const { sourceDefinitions } = useSourceDefinitionList();
  const analyticsService = useAnalyticsService();
  const [sourceDefinitionId, setSourceDefinitionId] = useState<string>(
    hasSourceDefinitionId(location.state) ? location.state.sourceDefinitionId : ""
  );
  const [destinationDefinitionId, setDestinationDefinitionId] = useState<string>(
    hasDestinationDefinitionId(location.state) ? location.state.destinationDefinitionId : ""
  );

  const { destinationDefinitions } = useDestinationDefinitionList();

  const clickSelect = () => {
    push(`/${RoutePaths.Source}/${RoutePaths.SourceNew}`, {
      state: {
        sourceDefinitionId,
        onBoarding: "onBoarding",
      },
    });

    const connector = sourceDefinitions.find((item) => item.sourceDefinitionId === sourceDefinitionId);
    analyticsService.track(Namespace.SOURCE, Action.SELECT, {
      actionDescription: "Source connector type selected",
      connector_source: connector?.name,
      connector_source_definition_id: sourceDefinitionId,
    });
  };
  const clickDestinationSelect = () => {
    if (!destinationDefinitionId) {
      return;
    }

    push(`/${RoutePaths.Destination}/${RoutePaths.DestinationNew}`, {
      state: {
        destinationDefinitionId,
        onBoarding: "onBoarding",
      },
    });

    const connector = destinationDefinitions.find((item) => item.destinationDefinitionId === destinationDefinitionId);
    analyticsService.track(Namespace.DESTINATION, Action.SELECT, {
      actionDescription: "Destination connector type selected",
      connector_destination: connector?.name,
      connector_destination_definition_id: destinationDefinitionId,
    });
  };

  const afterSelect = (selectCardData: ConnectorDefinition) => {
    const selectId = Connector.id(selectCardData);
    if (sourceDefinitionId === selectId) {
      return setSourceDefinitionId("");
    }
    setSourceDefinitionId(selectId);
  };

  const afterDestinationSelect = (selectCardData: ConnectorDefinition) => {
    const selectId = Connector.id(selectCardData);
    if (destinationDefinitionId === selectId) {
      return setDestinationDefinitionId("");
    }
    setDestinationDefinitionId(selectId);
  };

  const BtnText = styled.div`
    font-family: Inter;
    font-size: 24px;
    color: #fff;
    font-weight: 500;
  `;
  const isAddSource = (location?.state as { onBoarding?: string })?.onBoarding?.includes("addSource");
  const finishSource = (location?.state as { onBoarding?: string })?.onBoarding?.includes("finishSource");
  const isAddDestination = (location?.state as { onBoarding?: string })?.onBoarding?.includes("addDestination");
  const finishDestination = (location?.state as { onBoarding?: string })?.onBoarding?.includes("finishDestination");
  let initialActiveStep = 0;

  switch (true) {
    case isAddSource:
      initialActiveStep = 1;
      break;
    case finishSource:
      initialActiveStep = 2;
      break;
    case isAddDestination:
      initialActiveStep = 2; // Set activeStep to 2 for adding destination
      break;
    case finishDestination:
      // Handle finishDestination if needed
      initialActiveStep = 3;
      break;
    default:
      initialActiveStep = 0; // Default case
  }

  const [activeStep, setActiveStep] = useState(initialActiveStep);
  const [skipped, setSkipped] = useState(new Set<number>());

  const isStepSkipped = (step: number) => {
    return skipped.has(step);
  };

  const handleNext = () => {
    let newSkipped = skipped;
    if (isStepSkipped(activeStep)) {
      newSkipped = new Set(newSkipped.values());
      newSkipped.delete(activeStep);
    }

    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    setSkipped(newSkipped);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
  };
  const handleCancel = () => {
    // Reset the sourceDefinitionId to an empty string when cancel is clicked
    setSourceDefinitionId("");
  };
  const handleDestinationCancel = () => {
    setDestinationDefinitionId("");
  };
  return (
    <>
      <Container>
        <Box pt={8}>
          <Stepper
            activeStep={activeStep}
            className="customSteps"
            sx={{
              width: "500px",
              margin: "auto",
              "& .MuiStepConnector-line": { borderLeftWidth: 0.5 },
              "& .MuiStepConnector-root": { paddingLeft: 0, paddingRight: 0 },
              "& .MuiStepConnector-line.MuiStepConnector-active": {
                // Set the color for completed connector line
                color: "#4F46E5", // Change this to your desired color
              },
            }}
          >
            {steps.map((label, index) => {
              const stepProps: { completed?: boolean } = {};
              const labelProps: {
                optional?: React.ReactNode;
              } = {};

              if (isStepSkipped(index)) {
                stepProps.completed = false;
              } else {
                stepProps.completed = index < activeStep; // Check if the step is completed
              }

              return (
                <Step key={label} {...stepProps}>
                  <StepLabel
                    StepIconComponent={(props) =>
                      index === steps.length - 1 ? (
                        stepProps.completed ? (
                          <ColorRocketIcon {...props} />
                        ) : (
                          <RocketIcon {...props} />
                        )
                      ) : (
                        <StepIcon {...props} />
                      )
                    }
                    {...labelProps}
                  />
                </Step>
              );
            })}
          </Stepper>
          {activeStep === steps.length ? (
            <>
              <Typography sx={{ mt: 2, mb: 1 }}>All steps completed - you&apos;re finished</Typography>
              <Box sx={{ display: "flex", flexDirection: "row", pt: 2 }}>
                <Box sx={{ flex: "1 1 auto" }} />
                <Button onClick={handleReset}>Reset</Button>
              </Box>
            </>
          ) : (
            <>
              {activeStep === 0 && (
                <Box mt={8} sx={{ display: "flex", justifyContent: "center" }}>
                  <Box>
                    <Box pl={13}>
                      <BoardIcon />
                    </Box>

                    <Box pt={2}>
                      <Typography fontSize={40} fontWeight={700} fontStyle="normal" color="#27272A">
                        Welcome to Daspire,<span style={{ color: "#4F46E5" }}> Jane </span>
                      </Typography>
                    </Box>
                    <Box pt={1} textAlign="center">
                      <Typography
                        variant="caption"
                        sx={{ color: "#767676" }}
                        fontSize={16}
                        fontWeight={200}
                        fontStyle="normal"
                        fontFamily="Inter"
                      >
                        Daspire helps you set up automated data pipelines that
                        <br /> replicate data from a source to a destination.
                      </Typography>
                    </Box>
                    <Box textAlign="center" pt={5}>
                      <NewButton size="lg" style={{ padding: "29px 43px" }} borderRadius={60} onClick={handleNext}>
                        <BtnText>
                          <FormattedMessage id="onboarding.firstConnection" />
                        </BtnText>
                      </NewButton>
                    </Box>
                  </Box>
                </Box>
              )}
              {activeStep === 1 && (
                <Box mt={8} sx={{ display: "flex", justifyContent: "center" }}>
                  <Box>
                    <Box textAlign="center">
                      <Typography fontSize={35} fontWeight={700} fontStyle="normal" color="#27272A" fontFamily="Inter">
                        Setup your <span style={{ color: "#4F46E5" }}>first source</span>
                      </Typography>
                    </Box>
                    <Box pt={3} textAlign="center">
                      <Typography
                        variant="caption"
                        sx={{ color: "#767676" }}
                        fontSize={16}
                        fontWeight={200}
                        fontStyle="normal"
                        fontFamily="Inter"
                      >
                        A source is an API,file or database that you want to pull data from.
                      </Typography>
                    </Box>
                    <Box pt={3}>
                      <DefinitionCard
                        onSelect={afterSelect}
                        data={sourceDefinitions}
                        value={sourceDefinitionId}
                        type="source"
                      />
                    </Box>
                  </Box>
                </Box>
              )}
              {activeStep === 2 && (
                <Box mt={8} sx={{ display: "flex", justifyContent: "center" }}>
                  <Box>
                    <Box textAlign="center">
                      <Typography fontSize={35} fontWeight={700} fontStyle="normal" color="#27272A" fontFamily="Inter">
                        Setup your <span style={{ color: "#4F46E5" }}>first destination</span>
                      </Typography>
                    </Box>
                    <Box pt={3} textAlign="center">
                      <Typography
                        variant="caption"
                        sx={{ color: "#767676" }}
                        fontSize={16}
                        fontWeight={200}
                        fontStyle="normal"
                        fontFamily="Inter"
                      >
                        A destination is a data warehouse, data lake, database, or an
                        <br /> analytics tool where you want to load your ingested data.
                      </Typography>
                    </Box>
                    <Box pt={3}>
                      <DataPanel
                        onSelect={afterDestinationSelect}
                        data={destinationDefinitions}
                        value={destinationDefinitionId}
                        type="destination"
                      />
                    </Box>
                  </Box>
                </Box>
              )}
              {activeStep === 3 && <Box>Configure Page</Box>}
              <Box sx={{ display: "flex", flexDirection: "row", pt: 2 }}>
                <Button color="inherit" disabled={activeStep === 0} onClick={handleBack} sx={{ mr: 1 }}>
                  Back
                </Button>
                <Box sx={{ flex: "1 1 auto" }} />

                <Button onClick={handleNext}>{activeStep === steps.length - 1 ? "Finish" : "Next"}</Button>
              </Box>
            </>
          )}
        </Box>
      </Container>
      {activeStep === 1 && (
        <ButtonRows position="fixed">
          <Box display="flex" justifyContent="center" marginRight="280px">
            <Box>
              <CustomButton
                style={{ backgroundColor: "#FFF", borderColor: "#D1D5DB", color: "#6B6B6F", borderRadius: "1px solid" }}
                onClick={handleCancel}
              >
                <FormattedMessage id="form.button.cancel" />
              </CustomButton>
            </Box>

            <Box pl={3}>
              <CustomButton onClick={clickSelect} disabled={sourceDefinitionId ? false : true}>
                <FormattedMessage id="form.button.selectContinue" />
              </CustomButton>
            </Box>
          </Box>
        </ButtonRows>
      )}
      {activeStep === 2 && (
        <ButtonRows position="fixed">
          <Box display="flex" justifyContent="center" marginRight="280px">
            <Box>
              <CustomButton
                style={{ backgroundColor: "#FFF", borderColor: "#D1D5DB", color: "#6B6B6F", borderRadius: "1px solid" }}
                onClick={handleDestinationCancel}
              >
                <FormattedMessage id="form.button.cancel" />
              </CustomButton>
            </Box>

            <Box pl={3}>
              <CustomButton onClick={clickDestinationSelect} disabled={destinationDefinitionId ? false : true}>
                <FormattedMessage id="form.button.selectContinue" />
              </CustomButton>
            </Box>
          </Box>
        </ButtonRows>
      )}
    </>
  );
};
export default OnBoardingPage;
