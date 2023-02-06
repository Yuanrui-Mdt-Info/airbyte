import React, { useState } from "react";
// import { FormattedMessage } from "react-intl";

import ConnectionStep from "components/ConnectionStep";
import { FormPageContent } from "components/ConnectorBlocks";
import HeadTitle from "components/HeadTitle";
// import PageTitle from "components/PageTitle";

import { ConnectionConfiguration } from "core/domain/connection";
import { useTrackPage, PageTrackingCodes } from "hooks/services/Analytics";
import { useCreateDestination } from "hooks/services/useDestinationHook";
// import useRouter from "hooks/useRouter";
import TestLoading from "pages/SourcesPage/pages/CreateSourcePage/components/TestLoading";
import { useDestinationDefinitionList } from "services/connector/DestinationDefinitionService";
import { FormError } from "utils/errorStatusMessage";
import { ConnectorDocumentationWrapper } from "views/Connector/ConnectorDocumentationLayout";

import { DestinationForm } from "./components/DestinationForm";

export interface SwitchStepParams {
  currentStep: string;
  selectDefinitionId?: string;
  selectDefinitionName?: string;
  fetchingConnectorError?: FormError | null;
  isLoading?: boolean;
  btnType?: string;
}

export const CreateDestinationPage: React.FC = () => {
  useTrackPage(PageTrackingCodes.DESTINATION_NEW);

  // const { push } = useRouter();
  const [successRequest, setSuccessRequest] = useState(false);
  const { destinationDefinitions } = useDestinationDefinitionList();
  const { mutateAsync: createDestination } = useCreateDestination();

  const [currentStep, setCurrentStep] = useState<string>("creating"); // creating|testing
  const [isLoading, setLoadingStatus] = useState<boolean>(true);
  const [fetchingConnectorError, setFetchingConnectorError] = useState<FormError | null>(null);

  const onSubmitDestinationForm = async (values: {
    name: string;
    serviceType: string;
    connectionConfiguration?: ConnectionConfiguration;
  }) => {
    const connector = destinationDefinitions.find((item) => item.destinationDefinitionId === values.serviceType);
    //  const result =
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

  const clickBtnHandleStep = ({ currentStep, isLoading, fetchingConnectorError }: SwitchStepParams) => {
    setCurrentStep(currentStep);
    if (currentStep === "testing") {
      setLoadingStatus(isLoading || false);
    }
    // if (fetchingConnectorError) {
    setFetchingConnectorError(fetchingConnectorError || null);
    // }
  };

  return (
    <>
      <HeadTitle titles={[{ id: "destinations.newDestinationTitle" }]} />
      <ConnectionStep lightMode type="destination" />
      <ConnectorDocumentationWrapper>
        {/* <PageTitle title={null} middleTitleBlock={<FormattedMessage id="destinations.newDestinationTitle" />} /> */}
        <FormPageContent>
          {currentStep === "testing" && (
            <TestLoading onClickBtn={clickBtnHandleStep} isLoading={isLoading} type="destination" />
          )}
          {currentStep === "creating" && (
            <DestinationForm
              onSubmit={onSubmitDestinationForm}
              destinationDefinitions={destinationDefinitions}
              hasSuccess={successRequest}
              onClickBtn={clickBtnHandleStep}
              error={fetchingConnectorError}
            />
          )}
        </FormPageContent>
      </ConnectorDocumentationWrapper>
    </>
  );
};
