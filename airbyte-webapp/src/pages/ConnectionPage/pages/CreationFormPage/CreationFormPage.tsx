import React, { useState } from "react";
import { FormattedMessage } from "react-intl";

import { LoadingPage, PageTitle } from "components";
// import ConnectionBlock from "components/ConnectionBlock";
import ConnectionStep from "components/ConnectionStep";
import { FormPageContent } from "components/ConnectorBlocks";
import CreateConnectionContent from "components/CreateConnectionContent";
// import HeadTitle from "components/HeadTitle";
import StepsMenu from "components/StepsMenu";

import { useTrackPage, PageTrackingCodes } from "hooks/services/Analytics";
import { useFormChangeTrackerService } from "hooks/services/FormChangeTracker";
import { useGetDestination } from "hooks/services/useDestinationHook";
import { useGetSource } from "hooks/services/useSourceHook";
import useRouter from "hooks/useRouter";
import TestLoading from "pages/ConnectionPage/pages/CreationFormPage/components/TestLoading";
import { RoutePaths } from "pages/routePaths";
import { useDestinationDefinition } from "services/connector/DestinationDefinitionService";
import { useSourceDefinition } from "services/connector/SourceDefinitionService";
import { ConnectorDocumentationWrapper } from "views/Connector/ConnectorDocumentationLayout";

import {
  DestinationDefinitionRead,
  DestinationRead,
  SourceDefinitionRead,
  SourceRead,
  WebBackendConnectionRead,
} from "../../../../core/request/AirbyteClient";
import { ConnectionCreateDestinationForm } from "./components/DestinationForm";
import ExistingEntityForm from "./components/ExistingEntityForm";
import { ConnectionCreateSourceForm } from "./components/SourceForm";

export enum StepsTypes {
  CREATE_ENTITY = "createEntity",
  CREATE_CONNECTOR = "createConnector",
  CREATE_CONNECTION = "createConnection",
  TEST_CONNECTION = "testConnection",
}

export enum EntityStepsTypes {
  SOURCE = "source",
  DESTINATION = "destination",
  CONNECTION = "connection",
}

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

const hasCurrentStepNumber = (state: unknown): state is { currentStepNumber: number } => {
  return (
    typeof state === "object" &&
    state !== null &&
    typeof (state as { currentStepNumber?: number }).currentStepNumber === "number"
  );
};

function usePreloadData(): {
  sourceDefinition?: SourceDefinitionRead;
  destination?: DestinationRead;
  source?: SourceRead;
  destinationDefinition?: DestinationDefinitionRead;
} {
  const { location } = useRouter();
  const source = useGetSource(hasSourceId(location.state) ? location.state.sourceId : null);
  const sourceDefinition = useSourceDefinition(source?.sourceDefinitionId);
  const destination = useGetDestination(hasDestinationId(location.state) ? location.state.destinationId : null);
  const destinationDefinition = useDestinationDefinition(destination?.destinationDefinitionId);
  return { source, sourceDefinition, destination, destinationDefinition };
}

export const CreationFormPage: React.FC = () => {
  useTrackPage(PageTrackingCodes.CONNECTIONS_NEW);
  const { location, push } = useRouter();
  const { clearAllFormChanges } = useFormChangeTrackerService();
  const [currentStepNumber] = useState<number>(
    hasCurrentStepNumber(location.state) ? location.state.currentStepNumber : 1
  ); // 1,2,3,4 setCurrentStepNumber
  const useNewUI = true;

  // TODO: Probably there is a better way to figure it out instead of just checking third elem
  // const locationType = location.pathname.split("/")[3];
  const locationType = location.pathname.split("/")[1];

  const type: EntityStepsTypes =
    locationType === "connections"
      ? EntityStepsTypes.CONNECTION
      : locationType === "source"
      ? EntityStepsTypes.DESTINATION
      : EntityStepsTypes.SOURCE;

  const [currentStep, setCurrentStep] = useState(
    hasSourceId(location.state) && hasDestinationId(location.state)
      ? StepsTypes.CREATE_CONNECTION
      : hasSourceId(location.state) && !hasDestinationId(location.state)
      ? StepsTypes.CREATE_CONNECTOR
      : StepsTypes.CREATE_ENTITY
  );

  const [currentEntityStep, setCurrentEntityStep] = useState(
    hasSourceId(location.state) ? EntityStepsTypes.DESTINATION : EntityStepsTypes.SOURCE
  );

  const [isLoading, setLoadingStatus] = useState(true);

  const { source, destination } = usePreloadData(); // destinationDefinition, sourceDefinition,

  const onSelectExistingSource = (id: string) => {
    clearAllFormChanges();
    push("", {
      state: {
        ...(location.state as Record<string, unknown>),
        sourceId: id,
      },
    });
    setCurrentEntityStep(EntityStepsTypes.DESTINATION);
    setCurrentStep(StepsTypes.CREATE_CONNECTOR);
  };

  const onSelectExistingDestination = (id: string) => {
    clearAllFormChanges();
    push("", {
      state: {
        ...(location.state as Record<string, unknown>),
        destinationId: id,
      },
    });
    setCurrentEntityStep(EntityStepsTypes.CONNECTION);
    setCurrentStep(StepsTypes.CREATE_CONNECTION);
  };

  const handleBackButton = () => {
    push(`../${RoutePaths.SelectConnection}`, {
      state: {
        sourceId: source?.sourceId,
        destinationId: destination?.destinationId,
        currentStepNumber: 2,
      },
    });
  };

  const renderStep = () => {
    console.log("currentStep", currentStep, "currentEntityStep", currentEntityStep);
    if (currentStep === StepsTypes.CREATE_ENTITY || currentStep === StepsTypes.CREATE_CONNECTOR) {
      if (currentEntityStep === EntityStepsTypes.SOURCE) {
        return (
          <>
            {!useNewUI && type === EntityStepsTypes.CONNECTION && (
              <ExistingEntityForm type="source" onSubmit={onSelectExistingSource} value="" />
            )}

            <ConnectionCreateSourceForm
              afterSubmit={() => {
                if (type === "connection") {
                  setCurrentEntityStep(EntityStepsTypes.DESTINATION);
                  setCurrentStep(StepsTypes.CREATE_CONNECTOR);
                } else {
                  setCurrentEntityStep(EntityStepsTypes.CONNECTION);
                  setCurrentStep(StepsTypes.CREATE_CONNECTION);
                }
              }}
              onClickBtn={() => {
                console.log(222);
              }}
              onBack={() => {
                console.log("onBack");
              }}
            />
          </>
        );
      } else if (currentEntityStep === EntityStepsTypes.DESTINATION) {
        return (
          <>
            {!useNewUI && type === EntityStepsTypes.CONNECTION && (
              <ExistingEntityForm type="destination" onSubmit={onSelectExistingDestination} value="" />
            )}
            <ConnectionCreateDestinationForm
              afterSubmit={() => {
                setCurrentEntityStep(EntityStepsTypes.CONNECTION);
                setCurrentStep(StepsTypes.CREATE_CONNECTION);
              }}
            />
          </>
        );
      }
    }

    const afterSubmitConnection = (connection: WebBackendConnectionRead) => {
      setLoadingStatus(false);

      return;
      switch (type) {
        case EntityStepsTypes.DESTINATION:
          push(`../${source?.sourceId}`);
          break;
        case EntityStepsTypes.SOURCE:
          push(`../${destination?.destinationId}`);
          break;
        default:
          push(`../${connection.connectionId}`);
          break;
      }
    };

    const onListenAfterSubmit = (isSuccess: boolean) => {
      if (isSuccess) {
        setCurrentStep(StepsTypes.TEST_CONNECTION);
        setLoadingStatus(true);
      }
      console.log("isSuccess", isSuccess);
    };

    const hanldeFinishButton = () => {
      if (currentStep === StepsTypes.TEST_CONNECTION) {
        push(`/${RoutePaths.Connections}`);
      }
    };

    if (!source || !destination) {
      console.error("unexpected state met");
      return <LoadingPage />;
    }

    if (
      currentStepNumber === 3 &&
      (currentStep === StepsTypes.TEST_CONNECTION || currentEntityStep === EntityStepsTypes.CONNECTION)
    ) {
      return <TestLoading type={type} isLoading={isLoading} onBack={handleBackButton} onFinish={hanldeFinishButton} />;
    }

    return (
      <CreateConnectionContent
        onBack={handleBackButton}
        source={source}
        destination={destination}
        afterSubmitConnection={afterSubmitConnection}
        onListenAfterSubmit={onListenAfterSubmit}
      />
    );
  };

  const steps =
    type === "connection"
      ? [
          {
            id: StepsTypes.CREATE_ENTITY,
            name: <FormattedMessage id="onboarding.createSource" />,
          },
          {
            id: StepsTypes.CREATE_CONNECTOR,
            name: <FormattedMessage id="onboarding.createDestination" />,
          },
          {
            id: StepsTypes.CREATE_CONNECTION,
            name: <FormattedMessage id="onboarding.setUpConnection" />,
          },
        ]
      : [
          {
            id: StepsTypes.CREATE_ENTITY,
            name:
              type === "destination" ? (
                <FormattedMessage id="onboarding.createDestination" />
              ) : (
                <FormattedMessage id="onboarding.createSource" />
              ),
          },
          {
            id: StepsTypes.CREATE_CONNECTION,
            name: <FormattedMessage id="onboarding.setUpConnection" />,
          },
        ];

  const titleId: string = (
    {
      [EntityStepsTypes.CONNECTION]: "connection.newConnectionTitle",
      [EntityStepsTypes.DESTINATION]: "destinations.newDestinationTitle",
      [EntityStepsTypes.SOURCE]: "sources.newSourceTitle",
    } as Record<EntityStepsTypes, string>
  )[type];

  return (
    <>
      {/* <HeadTitle titles={[{ id: "connection.newConnectionTitle" }]} /> */}
      <ConnectionStep lightMode type="source" currentStepNumber={currentStepNumber} />
      <ConnectorDocumentationWrapper>
        {!useNewUI && (
          <PageTitle
            title={<FormattedMessage id={titleId} />}
            middleComponent={<StepsMenu lightMode data={steps} activeStep={currentStep} />}
          />
        )}
        <FormPageContent big={currentStep === StepsTypes.CREATE_CONNECTION}>
          {/* {currentStep !== StepsTypes.CREATE_CONNECTION && (!!source || !!destination) && (
            <ConnectionBlock
              itemFrom={source ? { name: source.name, icon: sourceDefinition?.icon } : undefined}
              itemTo={
                destination
                  ? {
                      name: destination.name,
                      icon: destinationDefinition?.icon,
                    }
                  : undefined
              }
            />
          )} */}
          {renderStep()}
        </FormPageContent>
      </ConnectorDocumentationWrapper>
    </>
  );
};
