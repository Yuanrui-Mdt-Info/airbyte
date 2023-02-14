import React, { useState } from "react"; // useMemo
import styled from "styled-components";

// import { useConnectionList } from "hooks/services/useConnectionHook";
import ConnectionStep from "components/ConnectionStep";

import { useGetSource } from "hooks/services/useSourceHook";
import useRouter from "hooks/useRouter";
// import { useSourceDefinition } from "services/connector/SourceDefinitionService";
import { ConnectorDocumentationWrapper } from "views/Connector/ConnectorDocumentationLayout";
import { ServiceFormValues } from "views/Connector/ServiceForm/types";
import TestConnection from "views/Connector/TestConnection";

import { RoutePaths } from "../../../routePaths";
import SourceCopy from "./components/SourceCopy";

enum StepsTypes {
  CREATE_ENTITY = "createEntity",
  TEST_CONNECTION = "testConnection",
}

const Container = styled.div`
  padding: 10px 70px;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
`;

const CopySourcePage: React.FC = () => {
  const { query, push } = useRouter<{ id: string }, { id: string; "*": string }>();
  const [currentStep, setCurrentStep] = useState(StepsTypes.CREATE_ENTITY);
  const [loadingStatus, setLoadingStatus] = useState<boolean>(true);
  const [fetchingConnectorError, setFetchingConnectorError] = useState<JSX.Element | string | null>(null);
  const [sourceFormValues, setSourceFormValues] = useState<ServiceFormValues | null>({
    name: "",
    serviceType: "",
    connectionConfiguration: {},
  });

  const source = useGetSource(query.id);
  //   const sourceDefinition = useSourceDefinition(source?.sourceDefinitionId);

  const goBack = () => {
    push(`/${RoutePaths.Source}`);
  };

  return (
    <>
      <ConnectionStep lightMode type="source" currentStepNumber={1} />
      <Container>
        <ConnectorDocumentationWrapper>
          {currentStep === StepsTypes.TEST_CONNECTION && (
            <TestConnection
              isLoading={loadingStatus}
              type="source"
              onBack={() => {
                setCurrentStep(StepsTypes.CREATE_ENTITY);
              }}
              onFinish={() => {
                goBack();
              }}
            />
          )}
          {currentStep === StepsTypes.CREATE_ENTITY && (
            <SourceCopy
              currentSource={source}
              errorMessage={fetchingConnectorError}
              onBack={goBack}
              formValues={sourceFormValues}
              afterSubmit={() => {
                setLoadingStatus(false);
              }}
              onShowLoading={(
                isLoading: boolean,
                formValues: ServiceFormValues | null,
                error: JSX.Element | string | null
              ) => {
                setSourceFormValues(formValues);
                if (isLoading) {
                  setCurrentStep(StepsTypes.TEST_CONNECTION);
                  setLoadingStatus(true);
                } else {
                  setCurrentStep(StepsTypes.CREATE_ENTITY);
                  setFetchingConnectorError(error || null);
                }
              }}
            />
          )}
        </ConnectorDocumentationWrapper>
      </Container>
    </>
  );
};

export default CopySourcePage;
