import React, { useEffect, useState } from "react";

// TODO: create separate component for source and destinations forms
import { ConnectionConfiguration } from "core/domain/connection";
import { useCreateDestination } from "hooks/services/useDestinationHook";
import useRouter from "hooks/useRouter";
import { DestinationForm } from "pages/DestinationPage/pages/CreateDestinationPage/components/DestinationForm";
import { SwitchStepParams } from "pages/SourcesPage/pages/CreateSourcePage/CreateSourcePage";
import { useDestinationDefinitionList } from "services/connector/DestinationDefinitionService";
import { FormError } from "utils/errorStatusMessage";
import { useDocumentationPanelContext } from "views/Connector/ConnectorDocumentationLayout/DocumentationPanelContext";

interface ConnectionCreateDestinationFormProps {
  afterSubmit: () => void;
  onBack?: () => void;
  onClickBtn?: (params: SwitchStepParams) => void;
  fetchingConnectorError?: FormError | null;
}

export const ConnectionCreateDestinationForm: React.FC<ConnectionCreateDestinationFormProps> = ({
  afterSubmit,
  onBack,
  onClickBtn,
  fetchingConnectorError,
}) => {
  const { push, location } = useRouter();
  const [successRequest, setSuccessRequest] = useState(false);

  const { destinationDefinitions } = useDestinationDefinitionList();
  const { mutateAsync: createDestination } = useCreateDestination();

  const onSubmitDestinationForm = async (values: {
    name: string;
    serviceType: string;
    connectionConfiguration?: ConnectionConfiguration;
  }) => {
    const connector = destinationDefinitions.find((item) => item.destinationDefinitionId === values.serviceType);
    const result = await createDestination({
      values,
      destinationConnector: connector,
    });
    setSuccessRequest(true);
    setTimeout(() => {
      setSuccessRequest(false);
      push(
        {},
        {
          state: {
            ...(location.state as Record<string, unknown>),
            destinationId: result.destinationId,
          },
        }
      );
      afterSubmit();
    }, 2000);
  };

  const { setDocumentationPanelOpen } = useDocumentationPanelContext();

  useEffect(() => {
    return () => {
      setDocumentationPanelOpen(false);
    };
  }, [setDocumentationPanelOpen]);

  return (
    <DestinationForm
      onSubmit={onSubmitDestinationForm}
      destinationDefinitions={destinationDefinitions}
      hasSuccess={successRequest}
      onBack={onBack}
      error={fetchingConnectorError}
      onClickBtn={onClickBtn}
    />
  );
};
