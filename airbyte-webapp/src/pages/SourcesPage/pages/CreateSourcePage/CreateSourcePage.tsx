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
// import useRouter from "hooks/useRouter";
import { useSourceDefinitionList } from "services/connector/SourceDefinitionService";
import { FormError } from "utils/errorStatusMessage";
import { ConnectorDocumentationWrapper } from "views/Connector/ConnectorDocumentationLayout/ConnectorDocumentationWrapper";
import { ServiceFormValues } from "views/Connector/ServiceForm/types";

import SelectNewSourceCard from "./components/SelectNewSource";
import { SourceForm } from "./components/SourceForm";
import TestLoading from "./components/TestLoading";

export interface SwitchStepParams {
  currentStep: string;
  selectDefinitionId?: string;
  selectDefinitionName?: string;
  fetchingConnectorError?: FormError | null;
  formValue?: Partial<ServiceFormValues>;
  isLoading?: false;
}

const CreateSourcePage: React.FC = () => {
  useTrackPage(PageTrackingCodes.SOURCE_NEW);

  // const { push } = useRouter();
  const [successRequest, setSuccessRequest] = useState(false);
  const [currentStep, setCurrentStep] = useState<string>("selecting"); // selecting|creating|testing
  const [selectEntityId, setSelectEntityId] = useState("");
  const [fetchingConnectorError, setFetchingConnectorError] = useState<FormError | null>(null);
  const [formValues, setFormValues] = useState<Partial<ServiceFormValues>>({});
  // const [selectEntityName, setSelectEntityName] = useState("");
  const [requestStatus, setRequestStatus] = useState("loading"); // loading|finish|error setRequestStatus

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

    setTimeout(() => {
      setSuccessRequest(false);
      setRequestStatus("finish");
      clickBtnHandleStep &&
        clickBtnHandleStep({
          currentStep: "testing",
          formValue: values,
        });
      //  push(`../${result.sourceId}`);
    }, 2000);
  };

  //
  const clickBtnHandleStep = ({
    currentStep,
    selectDefinitionId,
    fetchingConnectorError,
    formValue,
  }: SwitchStepParams) => {
    console.log(`回到createPage页面进行切换至===>${currentStep}`, "selectId:", selectDefinitionId);
    if (currentStep) {
      setCurrentStep(currentStep);
    }

    if (selectDefinitionId) {
      setSelectEntityId(selectDefinitionId);
    }
    // if (fetchingConnectorError) {
    setFetchingConnectorError(fetchingConnectorError || null);
    setFormValues(formValue || {});

    console.log(JSON.stringify(formValue, null, 2));
    // }
    // if (step === "creating") {
    //   // if (name) setSelectEntityName(name);
    // }

    if (currentStep === "testing") {
      // setRequestStatus(requestStatus==='finish'?'loading':"finish")
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
          onClickBtn={clickBtnHandleStep}
          error={fetchingConnectorError}
          formValue={formValues}
        />
      );
    }

    if (currentStep === "testing") {
      return <TestLoading currentStep={currentStep} onClickBtn={clickBtnHandleStep} requestStatus={requestStatus} />;
    }
    return (
      <SelectNewSourceCard
        type="source"
        currentStep={currentStep}
        onClickBtn={clickBtnHandleStep}
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
