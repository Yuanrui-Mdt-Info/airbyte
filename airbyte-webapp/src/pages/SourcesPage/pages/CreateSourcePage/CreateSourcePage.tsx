import React, { useState } from "react";
// import { FormattedMessage } from "react-intl";

import ConnectionStep from "components/ConnectionStep";
import { FormPageContent } from "components/ConnectorBlocks";
import { DataCardProvider } from "components/DataPanel/DataCardContext";
import HeadTitle from "components/HeadTitle";
// import PageTitle from "components/PageTitle";

import { ConnectionConfiguration } from "core/domain/connection";
import { useTrackPage, PageTrackingCodes } from "hooks/services/Analytics";
import { useCreateSource } from "hooks/services/useSourceHook";
import useRouter from "hooks/useRouter";
import { useSourceDefinitionList } from "services/connector/SourceDefinitionService";
import { ConnectorDocumentationWrapper } from "views/Connector/ConnectorDocumentationLayout/ConnectorDocumentationWrapper";

import SelectNewSourceCard from "./components/SelectNewSource";
import { SourceForm } from "./components/SourceForm";
import TestLoading from "./components/TestLoading";

const CreateSourcePage: React.FC = () => {
  useTrackPage(PageTrackingCodes.SOURCE_NEW);
  const { push } = useRouter();
  const [successRequest, setSuccessRequest] = useState(false);
  const [currentStep, setCurrentStep] = useState<string>("selecting"); // selecting|creating|testing
  const [selectEntityId, setSelectEntityId] = useState("");
  // const [selectEntityName, setSelectEntityName] = useState("");
  const [requestStatus] = useState("loading"); // loading|finish|error setRequestStatus

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
    const result = await createSource({ values, sourceConnector: connector });

    console.log(JSON.stringify(result, null, 2));

    setSuccessRequest(true);
    setTimeout(() => {
      setSuccessRequest(false);
      push(`../${result.sourceId}`);
    }, 2000);
  };

  const onClickBtn = (step: string, selectId?: string, name?: string) => {
    setCurrentStep(step);
    console.log("createSource", step, selectId, name);
    if (selectId) {
      setSelectEntityId(selectId);
    }
    if (step === "creating") {
      // if (name) setSelectEntityName(name);
    }

    if (step === "testing") {
      // if (selectId) setRequestStatus(name);
    }
  };

  const renderCard = () => {
    if (currentStep === "creating") {
      return (
        <SourceForm
          onSubmit={onSubmitSourceStep}
          sourceDefinitions={sourceDefinitions}
          hasSuccess={successRequest}
          selectEntityId={selectEntityId}
          onClickBtn={onClickBtn}
        />
      );
    }

    if (currentStep === "testing") {
      return <TestLoading currentStep={currentStep} onClickBtn={onClickBtn} requestStatus={requestStatus} />;
    }
    return (
      <SelectNewSourceCard
        type="source"
        currentStep={currentStep}
        onClickBtn={onClickBtn}
        selectEntityId={selectEntityId}
      />
    );
  };

  return (
    <>
      <HeadTitle titles={[{ id: "sources.newSourceTitle" }]} />
      <ConnectionStep lightMode type="source" />
      <DataCardProvider>
        <ConnectorDocumentationWrapper>
          {/* <PageTitle title={null} middleTitleBlock={<FormattedMessage id="sources.newSourceTitle" />} /> */}
          <FormPageContent>{renderCard()}</FormPageContent>
        </ConnectorDocumentationWrapper>
      </DataCardProvider>
    </>
  );
};

export default CreateSourcePage;
