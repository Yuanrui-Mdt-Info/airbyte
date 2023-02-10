import React, { useState } from "react";
// import { FormattedMessage } from "react-intl";

import { LoadingPage } from "components";
// import ConnectionBlock from "components/ConnectionBlock";
import ConnectionStep from "components/ConnectionStep";
import { FormPageContent } from "components/ConnectorBlocks";
import CreateConnectionContent from "components/CreateConnectionContent";
// import HeadTitle from "components/HeadTitle";
// import StepsMenu from "components/StepsMenu";

import { useTrackPage, PageTrackingCodes } from "hooks/services/Analytics";
// import { useFormChangeTrackerService } from "hooks/services/FormChangeTracker";
import { useGetDestination } from "hooks/services/useDestinationHook";
import { useGetSource } from "hooks/services/useSourceHook";
import useRouter from "hooks/useRouter";
import TestConnection from "pages/ConnectionPage/pages/CreationFormPage/components/TestConnection";
import { RoutePaths } from "pages/routePaths";
// import { useDestinationDefinition } from "services/connector/DestinationDefinitionService";
// import { useSourceDefinition } from "services/connector/SourceDefinitionService";
import { FormError } from "utils/errorStatusMessage";
import { ConnectorDocumentationWrapper } from "views/Connector/ConnectorDocumentationLayout";
import { ServiceFormValues } from "views/Connector/ServiceForm/types";

import {
  DestinationDefinitionRead,
  DestinationRead,
  SourceDefinitionRead,
  SourceRead,
  // WebBackendConnectionRead,
} from "../../../../core/request/AirbyteClient";
import { ConnectionCreateDestinationForm } from "./components/DestinationForm";
// import ExistingEntityForm from "./components/ExistingEntityForm";
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

  // const sourceDefinition = useSourceDefinition(source?.sourceDefinitionId);
  const destination = useGetDestination(hasDestinationId(location.state) ? location.state.destinationId : null);
  // const destinationDefinition = useDestinationDefinition(destination?.destinationDefinitionId);
  return { source, destination }; // sourceDefinition,destinationDefinition
}

export const CreationFormPage: React.FC = () => {
  useTrackPage(PageTrackingCodes.CONNECTIONS_NEW);
  const { location, push } = useRouter();
  // const { clearAllFormChanges } = useFormChangeTrackerService();
  const [currentStepNumber] = useState<number>(
    hasCurrentStepNumber(location.state) ? location.state.currentStepNumber : 1
  ); // 1,2,3,4 setCurrentStepNumber

  // TODO: Probably there is a better way to figure it out instead of just checking third elem
  // const locationType = location.pathname.split("/")[3];
  // const locationType = location.pathname.split("/")[1];

  // const type: EntityStepsTypes =
  //   locationType === "connections"
  //     ? EntityStepsTypes.CONNECTION
  //     : locationType === "source"
  //     ? EntityStepsTypes.DESTINATION
  //     : EntityStepsTypes.SOURCE;

  const [currentStep, setCurrentStep] = useState(
    hasSourceId(location.state) && hasDestinationId(location.state)
      ? StepsTypes.CREATE_CONNECTION
      : hasSourceId(location.state) && !hasDestinationId(location.state)
      ? StepsTypes.CREATE_CONNECTOR
      : StepsTypes.CREATE_ENTITY
  );

  const [currentEntityStep, setCurrentEntityStep] = useState(
    currentStepNumber === 1
      ? EntityStepsTypes.SOURCE
      : currentStepNumber === 2
      ? EntityStepsTypes.DESTINATION
      : EntityStepsTypes.CONNECTION
  );

  const [isLoading, setLoadingStatus] = useState(true);
  const [fetchingConnectorError, setFetchingConnectorError] = useState<FormError | null>(null);
  const [destinationFormValues, setDestinationFormValues] = useState<ServiceFormValues>({
    name: "",
    serviceType: "",
    connectionConfiguration: {},
  });

  const [sourceFormValues, setSourceFormValues] = useState<ServiceFormValues>({
    name: "",
    serviceType: "",
    connectionConfiguration: {},
  });

  const { source, destination } = usePreloadData(); // destinationDefinition, sourceDefinition,

  // const onSelectExistingSource = (id: string) => {
  //   clearAllFormChanges();
  //   push("", {
  //     state: {
  //       ...(location.state as Record<string, unknown>),
  //       sourceId: id,
  //     },
  //   });
  //   setCurrentEntityStep(EntityStepsTypes.DESTINATION);
  //   setCurrentStep(StepsTypes.CREATE_CONNECTOR);
  // };

  // const onSelectExistingDestination = (id: string) => {
  //   clearAllFormChanges();
  //   push("", {
  //     state: {
  //       ...(location.state as Record<string, unknown>),
  //       destinationId: id,
  //     },
  //   });
  //   setCurrentEntityStep(EntityStepsTypes.CONNECTION);
  //   setCurrentStep(StepsTypes.CREATE_CONNECTION);
  // };

  const handleBackButton = () => {
    if (currentEntityStep === EntityStepsTypes.SOURCE || currentEntityStep === EntityStepsTypes.DESTINATION) {
      setCurrentStep(StepsTypes.CREATE_ENTITY);
      push("", {
        state: {
          ...(location.state as Record<string, unknown>),
        },
      });
    }

    if (currentEntityStep === EntityStepsTypes.CONNECTION) {
      push(`../${RoutePaths.SelectConnection}`, {
        state: {
          ...(location.state as Record<string, unknown>),
          currentStepNumber: 2,
        },
      });
    }
  };

  const renderStep = () => {
    if (currentStep === StepsTypes.CREATE_ENTITY || currentStep === StepsTypes.CREATE_CONNECTOR) {
      if (currentEntityStep === EntityStepsTypes.SOURCE) {
        return (
          <ConnectionCreateSourceForm
            fetchingConnectorError={fetchingConnectorError}
            formValues={sourceFormValues}
            afterSubmit={() => {
              setLoadingStatus(false);
              // push("", {
              //   state: {
              //     ...(location.state as Record<string, unknown>),
              //     // sourceDefinitionId: sourceDefinition?.sourceDefinitionId,
              //     currentStepNumber: 1,
              //   },
              // });
              // if (type === "connection") {
              //   setCurrentEntityStep(EntityStepsTypes.DESTINATION);
              //   setCurrentStep(StepsTypes.CREATE_CONNECTOR);
              // } else {
              //   setCurrentEntityStep(EntityStepsTypes.CONNECTION);
              //   setCurrentStep(StepsTypes.CREATE_CONNECTION);
              // }
            }}
            onShowLoading={(isLoading: boolean, formValues: ServiceFormValues, error: FormError | null) => {
              setSourceFormValues(formValues);
              if (isLoading) {
                setCurrentStep(StepsTypes.TEST_CONNECTION);
                setLoadingStatus(true);
              } else {
                setCurrentStep(StepsTypes.CREATE_ENTITY);
                setFetchingConnectorError(error || null);
              }
            }}
            onBack={() => {
              push(`/${RoutePaths.Connections}/${RoutePaths.SelectConnection}`, {
                state: {
                  ...(location.state as Record<string, unknown>),
                  currentStepNumber: 1,
                },
              });
            }}
          />
        );
      } else if (currentEntityStep === EntityStepsTypes.DESTINATION) {
        return (
          <ConnectionCreateDestinationForm
            fetchingConnectorError={fetchingConnectorError}
            formValues={destinationFormValues}
            afterSubmit={() => {
              setLoadingStatus(false);
              // setCurrentEntityStep(EntityStepsTypes.CONNECTION);
              // setCurrentStep(StepsTypes.CREATE_CONNECTION);
            }}
            onShowLoading={(isLoading: boolean, formValues: ServiceFormValues, error: FormError | null) => {
              setDestinationFormValues(formValues);
              if (isLoading) {
                setCurrentStep(StepsTypes.TEST_CONNECTION);
                setLoadingStatus(true);
              } else {
                setCurrentStep(StepsTypes.CREATE_ENTITY);
                setFetchingConnectorError(error || null);
              }
            }}
            onBack={() => {
              push(`/${RoutePaths.Connections}/${RoutePaths.SelectConnection}`, {
                state: {
                  ...(location.state as Record<string, unknown>),
                  currentStepNumber: 2,
                },
              });
            }}
          />
        );
      }
    }

    const afterSubmitConnection = () => {
      // connection: WebBackendConnectionRead
      setLoadingStatus(false);
      push("", {
        state: {
          currentStepNumber: 4,
        },
      });

      // return;
      // switch (type) {
      //   case EntityStepsTypes.DESTINATION:
      //     push(`../${source?.sourceId}`);
      //     break;
      //   case EntityStepsTypes.SOURCE:
      //     push(`../${destination?.destinationId}`);
      //     break;
      //   default:
      //     push(`../${connection.connectionId}`);
      //     break;
      // }
    };

    const onListenAfterSubmit = (isSuccess: boolean) => {
      if (isSuccess) {
        setCurrentStep(StepsTypes.TEST_CONNECTION);
        setLoadingStatus(true);
      }
    };

    const hanldeFinishButton = () => {
      if (currentEntityStep === EntityStepsTypes.SOURCE) {
        push(`/${RoutePaths.Connections}/${RoutePaths.SelectConnection}`, {
          state: {
            ...(location.state as Record<string, unknown>),
            currentStepNumber: 2,
          },
        });
      }

      if (currentEntityStep === EntityStepsTypes.DESTINATION) {
        setCurrentStep(StepsTypes.CREATE_CONNECTION);
        setCurrentEntityStep(EntityStepsTypes.CONNECTION);
        push("", {
          state: {
            ...(location.state as Record<string, unknown>),
            currentStepNumber: 3,
          },
        });
      }

      if (currentEntityStep === EntityStepsTypes.CONNECTION) {
        push(`/${RoutePaths.Connections}`);
      }
    };

    if (currentStep === StepsTypes.TEST_CONNECTION) {
      return (
        <TestConnection
          type={currentEntityStep}
          isLoading={isLoading}
          onBack={handleBackButton}
          onFinish={hanldeFinishButton}
        />
      );
    }

    if (!source || !destination) {
      console.error("unexpected state met");
      return <LoadingPage />;
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
  return (
    <>
      {/* <HeadTitle titles={[{ id: "connection.newConnectionTitle" }]} /> */}
      <ConnectionStep lightMode type="source" currentStepNumber={currentStepNumber} />
      <ConnectorDocumentationWrapper>
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
