import React, { useState } from "react";
import { FormattedMessage } from "react-intl";

import { ConnectionConfiguration } from "core/domain/connection";
import { LogsRequestError } from "core/request/LogsRequestError";
import useRouter from "hooks/useRouter";
import { SourceDefinitionReadWithLatestTag } from "services/connector/SourceDefinitionService";
import { useGetSourceDefinitionSpecificationAsync } from "services/connector/SourceDefinitionSpecificationService";
import { useCurrentWorkspace } from "services/workspaces/WorkspacesService";
import { ConnectorCard } from "views/Connector/ConnectorCard";
import { ServiceFormValues } from "views/Connector/ServiceForm/types";

interface SourceFormProps {
  onSubmit: (values: {
    name: string;
    serviceType: string;
    sourceDefinitionId?: string;
    connectionConfiguration?: ConnectionConfiguration;
    workspaceId?: any;
  }) => void;
  afterSelectConnector?: () => void;
  sourceDefinitions: SourceDefinitionReadWithLatestTag[];
  hasSuccess?: boolean;
  formValues: ServiceFormValues;
  error?: JSX.Element | string | null;
  onShowLoading?: (isLoading: boolean, formValues: ServiceFormValues, error: JSX.Element | string | null) => void;
  onBack?: () => void;
}

const hasSourceDefinitionId = (state: unknown): state is { sourceDefinitionId: string } => {
  return (
    typeof state === "object" &&
    state !== null &&
    typeof (state as { sourceDefinitionId?: string }).sourceDefinitionId === "string"
  );
};

export const SourceForm: React.FC<SourceFormProps> = ({
  onSubmit,
  sourceDefinitions,
  error,
  hasSuccess,
  formValues,
  afterSelectConnector,
  onShowLoading,
  onBack,
}) => {
  const { location } = useRouter();
  const { workspaceId } = useCurrentWorkspace();
  const [sourceDefinitionId, setSourceDefinitionId] = useState<string | null>(
    hasSourceDefinitionId(location.state) ? location.state.sourceDefinitionId : null
  );

  const {
    data: sourceDefinitionSpecification,
    error: sourceDefinitionError,
    isLoading,
  } = useGetSourceDefinitionSpecificationAsync(sourceDefinitionId);

  const onDropDownSelect = (sourceDefinitionId: string) => {
    setSourceDefinitionId(sourceDefinitionId);

    if (afterSelectConnector) {
      afterSelectConnector();
    }
  };

  const onSubmitForm = async (values: ServiceFormValues) => {
    await onSubmit({
      ...values,
      sourceDefinitionId: sourceDefinitionSpecification?.sourceDefinitionId,
      workspaceId,
    });
  };

  return (
    <ConnectorCard
      onServiceSelect={onDropDownSelect}
      onSubmit={onSubmitForm}
      formType="source"
      availableServices={sourceDefinitions}
      selectedConnectorDefinitionSpecification={sourceDefinitionSpecification}
      hasSuccess={hasSuccess}
      fetchingConnectorError={sourceDefinitionError instanceof Error ? sourceDefinitionError : null}
      errorMessage={error}
      isLoading={isLoading}
      formValues={sourceDefinitionId ? { ...formValues, serviceType: sourceDefinitionId, name: "" } : undefined}
      title={<FormattedMessage id="onboarding.sourceSetUp" />}
      jobInfo={LogsRequestError.extractJobInfo(error)}
      onShowLoading={onShowLoading}
      onBack={onBack}
    />
  );
};
