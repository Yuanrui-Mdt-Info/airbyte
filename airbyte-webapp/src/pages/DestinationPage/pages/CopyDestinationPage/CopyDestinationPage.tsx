import React, { useState } from "react";
import styled from "styled-components";

import { ConnectionStep, CreateStepTypes } from "components/ConnectionStep";

import { useGetDestination } from "hooks/services/useDestinationHook";
import useRouter from "hooks/useRouter";
import { ConnectorDocumentationWrapper } from "views/Connector/ConnectorDocumentationLayout";
import { ServiceFormValues } from "views/Connector/ServiceForm/types";
import TestConnection from "views/Connector/TestConnection";

import DestinationCopy from "./components/DestinationCopy";
import { RoutePaths } from "../../../routePaths";

const ContainerPadding = styled.div`
  padding: 0px 0px 0px 70px;
  height: 100%;
`;
const Container = styled.div`
  padding-top: 130px;
`;

const CopyDestinationPage: React.FC = () => {
  const { query, push } = useRouter<{ id: string }, { id: string; "*": string }>();
  const [currentStep, setCurrentStep] = useState(CreateStepTypes.CREATE_DESTINATION);
  const [loadingStatus, setLoadingStatus] = useState<boolean>(true);
  const [fetchingConnectorError, setFetchingConnectorError] = useState<JSX.Element | string | null>(null);
  const [destinationFormValues, setDestinationFormValues] = useState<ServiceFormValues | null>({
    name: "",
    serviceType: "",
    connectionConfiguration: {},
    workspaceId: "",
  });

  const destination = useGetDestination(query.id);

  const goBack = () => {
    push(`/${RoutePaths.Destination}`);
  };

  return (
    <>
      <ConnectionStep lightMode type="destination" />
      <ConnectorDocumentationWrapper>
        <ContainerPadding>
          {currentStep === CreateStepTypes.TEST_CONNECTION && (
            <Container>
              {" "}
              <TestConnection
                isLoading={loadingStatus}
                type="destination"
                onBack={() => {
                  setCurrentStep(CreateStepTypes.CREATE_DESTINATION);
                }}
                onFinish={() => {
                  goBack();
                }}
              />
            </Container>
          )}
          {currentStep === CreateStepTypes.CREATE_DESTINATION && (
            <DestinationCopy
              currentDestination={destination}
              errorMessage={fetchingConnectorError}
              onBack={goBack}
              formValues={destinationFormValues}
              afterSubmit={() => {
                setLoadingStatus(false);
              }}
              onShowLoading={(
                isLoading: boolean,
                formValues: ServiceFormValues | null,
                error: JSX.Element | string | null
              ) => {
                setDestinationFormValues(formValues);
                if (isLoading) {
                  setCurrentStep(CreateStepTypes.TEST_CONNECTION);
                  setLoadingStatus(true);
                } else {
                  setCurrentStep(CreateStepTypes.CREATE_DESTINATION);
                  setFetchingConnectorError(error || null);
                }
              }}
            />
          )}
        </ContainerPadding>
      </ConnectorDocumentationWrapper>
    </>
  );
};

export default CopyDestinationPage;
