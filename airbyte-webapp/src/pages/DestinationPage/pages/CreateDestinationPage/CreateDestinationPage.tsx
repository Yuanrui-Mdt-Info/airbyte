import React, { useState } from "react";

// import { FormattedMessage } from "react-intl";
import ConnectionStep from "components/ConnectionStep";
import { FormPageContent } from "components/ConnectorBlocks";
import HeadTitle from "components/HeadTitle";
// import PageTitle from "components/PageTitle";

import { ConnectionConfiguration } from "core/domain/connection";
import { useTrackPage, PageTrackingCodes } from "hooks/services/Analytics";
import { useCreateDestination } from "hooks/services/useDestinationHook";
import useRouter from "hooks/useRouter";
import { RoutePaths } from "pages/routePaths";
import TestLoading from "pages/SourcesPage/pages/CreateSourcePage/components/TestLoading";
import { useDestinationDefinitionList } from "services/connector/DestinationDefinitionService";
import { FormError } from "utils/errorStatusMessage";
import { ConnectorDocumentationWrapper } from "views/Connector/ConnectorDocumentationLayout";
import { ServiceFormValues } from "views/Connector/ServiceForm/types";

import { DestinationForm } from "./components/DestinationForm";

export const CreateDestinationPage: React.FC = () => {
  useTrackPage(PageTrackingCodes.DESTINATION_NEW);

  const { push, location } = useRouter();
  const [successRequest, setSuccessRequest] = useState(false);
  const { destinationDefinitions } = useDestinationDefinitionList();
  const { mutateAsync: createDestination } = useCreateDestination();

  const [currentStep, setCurrentStep] = useState<string>("creating"); // creating|testing
  const [isLoading, setLoadingStatus] = useState<boolean>(true);
  const [fetchingConnectorError, setFetchingConnectorError] = useState<FormError | null>(null);
  const [formValues, setFormValues] = useState<ServiceFormValues>({
    name: "",
    serviceType: "",
    connectionConfiguration: {},
  });

  const onSubmitDestinationForm = async (values: {
    name: string;
    serviceType: string;
    connectionConfiguration?: ConnectionConfiguration;
  }) => {
    const connector = destinationDefinitions.find((item) => item.destinationDefinitionId === values.serviceType);
    await createDestination({
      values,
      destinationConnector: connector,
    });
    setSuccessRequest(true);
    setLoadingStatus(false);
    setTimeout(() => {
      setSuccessRequest(false);
      //  push(`../${result.destinationId}`);
    }, 2000);
  };

  const handleBackButton = () => {
    if (currentStep === "testing") {
      setCurrentStep("creating");
      return;
    }
    push(`/${RoutePaths.Destination}/${RoutePaths.SelectDestination}`, {
      state: {
        ...(location.state as Record<string, unknown>),
      },
    });
  };

  const handleFinishButton = () => {
    push(`/${RoutePaths.Destination}`);
  };

  const onShowLoading = (isLoading: boolean, formValues: ServiceFormValues, error: FormError | null) => {
    if (isLoading) {
      setCurrentStep("testing");
    } else {
      setCurrentStep("creating");
    }
    setFormValues(formValues);
    setLoadingStatus(isLoading || false);
    setFetchingConnectorError(error || null);
  };

  return (
    <>
      <HeadTitle titles={[{ id: "destinations.newDestinationTitle" }]} />
      <ConnectionStep lightMode type="destination" currentStepNumber={1} />
      <ConnectorDocumentationWrapper>
        {/* <PageTitle title={null} middleTitleBlock={<FormattedMessage id="destinations.newDestinationTitle" />} /> */}
        <FormPageContent>
          {currentStep === "testing" && (
            <TestLoading
              onBack={handleBackButton}
              onFinish={handleFinishButton}
              isLoading={isLoading}
              type="destination"
            />
          )}
          {currentStep === "creating" && (
            <DestinationForm
              onSubmit={onSubmitDestinationForm}
              destinationDefinitions={destinationDefinitions}
              hasSuccess={successRequest}
              onShowLoading={onShowLoading}
              onBack={handleBackButton}
              error={fetchingConnectorError}
              formValues={formValues}
            />
          )}
        </FormPageContent>
      </ConnectorDocumentationWrapper>
    </>
  );
};
