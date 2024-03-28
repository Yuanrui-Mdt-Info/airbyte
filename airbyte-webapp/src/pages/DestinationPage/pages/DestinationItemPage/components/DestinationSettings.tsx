import React, { useEffect } from "react";
import { FormattedMessage } from "react-intl";

import { FormContainer } from "components/ConnectorBlocks";

import { ConnectionConfiguration } from "core/domain/connection";
import { DestinationRead } from "core/request/AirbyteClient";
import { useTrackPage, PageTrackingCodes } from "hooks/services/Analytics";
import { useUniqueFormId } from "hooks/services/FormChangeTracker";
import { useUpdateDestination } from "hooks/services/useDestinationHook";
import { useDestinationDefinition } from "services/connector/DestinationDefinitionService";
import { useGetDestinationDefinitionSpecification } from "services/connector/DestinationDefinitionSpecificationService";
import { useCurrentWorkspace } from "services/workspaces/WorkspacesService";
import { ConnectorCard } from "views/Connector/ConnectorCard";
import { useDocumentationPanelContext } from "views/Connector/ConnectorDocumentationLayout/DocumentationPanelContext";
import { ServiceFormValues } from "views/Connector/ServiceForm";

interface DestinationsSettingsProps {
  currentDestination: DestinationRead;
  errorMessage?: JSX.Element | string | null;
  onBack?: () => void;
  formValues?: ServiceFormValues | null;
  afterSubmit?: () => void;
  onShowLoading?: (
    isLoading: boolean,
    formValues: ServiceFormValues | null,
    error: JSX.Element | string | null
  ) => void;
}

const DestinationsSettings: React.FC<DestinationsSettingsProps> = ({
  currentDestination,
  errorMessage,
  formValues,
  onBack,
  onShowLoading,
  afterSubmit,
}) => {
  const destinationSpecification = useGetDestinationDefinitionSpecification(currentDestination.destinationDefinitionId);
  const destinationDefinition = useDestinationDefinition(currentDestination.destinationDefinitionId);
  const { mutateAsync: updateDestination } = useUpdateDestination();
  const { setDocumentationPanelOpen } = useDocumentationPanelContext();
  const formId = useUniqueFormId();
  const { workspaceId } = useCurrentWorkspace();
  useTrackPage(PageTrackingCodes.DESTINATION_ITEM_SETTINGS);

  useEffect(() => {
    return () => {
      setDocumentationPanelOpen(false);
    };
  }, [setDocumentationPanelOpen]);

  const onSubmitForm = async (values: {
    name: string;
    serviceType: string;
    connectionConfiguration?: ConnectionConfiguration;
  }) => {
    await updateDestination({
      values,
      destinationId: currentDestination.destinationId,
      workspaceId,
    });

    if (afterSubmit) {
      afterSubmit();
    }
  };

  const defaultFormValues = formValues?.serviceType
    ? formValues
    : { ...currentDestination, serviceType: currentDestination.destinationDefinitionId };

  return (
    <FormContainer>
      <ConnectorCard
        formId={formId}
        isEditMode
        onSubmit={onSubmitForm}
        formType="destination"
        availableServices={[destinationDefinition]}
        formValues={defaultFormValues}
        errorMessage={errorMessage}
        connector={currentDestination}
        onBack={onBack}
        onShowLoading={onShowLoading}
        selectedConnectorDefinitionSpecification={destinationSpecification}
        title={<FormattedMessage id="destination.destinationSettings" />}
      />
    </FormContainer>
  );
};

export default DestinationsSettings;
