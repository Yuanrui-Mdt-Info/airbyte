import React, { useState } from "react";
// import { FormattedMessage } from "react-intl";

import ConnectionStep from "components/ConnectionStep";
import { FormPageContent } from "components/ConnectorBlocks";
import HeadTitle from "components/HeadTitle";
// import PageTitle from "components/PageTitle";

import { ConnectionConfiguration } from "core/domain/connection";
import { useTrackPage, PageTrackingCodes } from "hooks/services/Analytics";
import { useCreateSource } from "hooks/services/useSourceHook";
import TestLoading from "pages/SourcesPage/pages/CreateSourcePage/components/TestLoading";
import { useSourceDefinitionList } from "services/connector/SourceDefinitionService";
import { FormError } from "utils/errorStatusMessage";
import { ConnectorDocumentationWrapper } from "views/Connector/ConnectorDocumentationLayout/ConnectorDocumentationWrapper";

import { SourceForm } from "./components/SourceForm";

export interface SwitchStepParams {
  currentStep: string;
  selectDefinitionId?: string;
  selectDefinitionName?: string;
  fetchingConnectorError?: FormError | null;
  isLoading?: boolean;
  btnType?: string;
}

const CreateSourcePage: React.FC = () => {
  useTrackPage(PageTrackingCodes.SOURCE_NEW);
  const [successRequest, setSuccessRequest] = useState(false);
  const [currentStep, setCurrentStep] = useState<string>("creating"); // creating|testing
  const [isLoading, setLoadingStatus] = useState<boolean>(true);
  const [fetchingConnectorError, setFetchingConnectorError] = useState<FormError | null>(null);

  const { sourceDefinitions } = useSourceDefinitionList();
  const { mutateAsync: createSource } = useCreateSource();

  const onSubmitSourceStep = async (values: {
    name: string;
    serviceType: string;
    connectionConfiguration?: ConnectionConfiguration;
  }) => {
    const connector = sourceDefinitions.find((item) => item.sourceDefinitionId === values.serviceType);
    if (!connector) {
      // Unsure if this can happen, but the types want it defined
      throw new Error("No Connector Found");
    }
    // const result =
    await createSource({ values, sourceConnector: connector });
    setSuccessRequest(true);
    setLoadingStatus(false);

    setTimeout(() => {
      setSuccessRequest(false);
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
      <HeadTitle titles={[{ id: "sources.newSourceTitle" }]} />
      <ConnectionStep lightMode type="source" currentStepNumber={1} />
      <ConnectorDocumentationWrapper>
        {/* <PageTitle title={null} middleTitleBlock={<FormattedMessage id="sources.newSourceTitle" />} /> */}
        <FormPageContent>
          {/* {renderCard()} */}
          {currentStep === "testing" && (
            <TestLoading onClickBtn={clickBtnHandleStep} isLoading={isLoading} type="source" />
          )}
          {currentStep === "creating" && (
            <SourceForm
              onSubmit={onSubmitSourceStep}
              sourceDefinitions={sourceDefinitions}
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

export default CreateSourcePage;
