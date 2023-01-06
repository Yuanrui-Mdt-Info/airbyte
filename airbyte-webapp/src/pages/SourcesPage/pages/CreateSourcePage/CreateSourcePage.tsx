import React, { useState } from "react";
// import { FormattedMessage } from "react-intl";

import ConnectionStep from "components/ConnectionStep";
import { FormPageContent } from "components/ConnectorBlocks";
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
  const [currentStep, setCurrentStep] = useState<string>("creating"); // selecting|creating|testing
  const [selectEntityId, setSelectEntityId] = useState("435bb9a5-7887-4809-aa58-28c27df0d7ad");

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
    setSuccessRequest(true);
    setTimeout(() => {
      setSuccessRequest(false);
      push(`../${result.sourceId}`);
    }, 2000);
  };

  const onClickBtn = (step: string, selectId?: string) => {
    setCurrentStep(step);
    if (step === "creating") {
      if (selectId) {
        setSelectEntityId(selectId);
      }
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
      return <TestLoading currentStep={currentStep} onClickBtn={onClickBtn} />;
    }
    return <SelectNewSourceCard type="source" currentStep={currentStep} onClickBtn={onClickBtn} />;
  };

  return (
    <>
      <HeadTitle titles={[{ id: "sources.newSourceTitle" }]} />
      <ConnectionStep lightMode type="source" />
      <ConnectorDocumentationWrapper>
        {/* <PageTitle title={null} middleTitleBlock={<FormattedMessage id="sources.newSourceTitle" />} /> */}
        <FormPageContent>{renderCard()}</FormPageContent>
      </ConnectorDocumentationWrapper>
    </>
  );
};

export default CreateSourcePage;
