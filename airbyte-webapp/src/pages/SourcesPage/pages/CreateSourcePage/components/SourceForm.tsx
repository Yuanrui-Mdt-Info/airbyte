import React, { useState } from "react";
import { FormattedMessage } from "react-intl";

import { useDataCardContext } from "components/DataPanel/DataCardContext";

import { Action, Namespace } from "core/analytics";
import { ConnectionConfiguration } from "core/domain/connection";
import { LogsRequestError } from "core/request/LogsRequestError";
import { useAnalyticsService } from "hooks/services/Analytics";
import useRouter from "hooks/useRouter";
import { SwitchStepParams } from "pages/SourcesPage/pages/CreateSourcePage/CreateSourcePage";
import { SourceDefinitionReadWithLatestTag } from "services/connector/SourceDefinitionService";
import { useGetSourceDefinitionSpecificationAsync } from "services/connector/SourceDefinitionSpecificationService";
import { generateMessageFromError, FormError } from "utils/errorStatusMessage";
import { ConnectorCard } from "views/Connector/ConnectorCard";
import { ServiceFormValues } from "views/Connector/ServiceForm/types";

interface SourceFormProps {
  onSubmit: (values: {
    name: string;
    serviceType: string;
    sourceDefinitionId?: string;
    connectionConfiguration?: ConnectionConfiguration;
  }) => void;
  afterSelectConnector?: () => void;
  sourceDefinitions: SourceDefinitionReadWithLatestTag[];
  hasSuccess?: boolean;
  error?: FormError | null;
  selectEntityId?: string;
  onClickBtn?: (params: SwitchStepParams) => void;
  formValue?: Partial<ServiceFormValues>;
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
  selectEntityId,
  afterSelectConnector,
  onClickBtn,
}) => {
  const { location } = useRouter();
  const analyticsService = useAnalyticsService();
  const { formValues } = useDataCardContext();

  console.log("formValues*******************", formValues);

  const _selectEntityId = selectEntityId ? selectEntityId : null;

  const [sourceDefinitionId, setSourceDefinitionId] = useState<string | null>(
    hasSourceDefinitionId(location.state) ? location.state.sourceDefinitionId : _selectEntityId // null
  );

  const {
    data: sourceDefinitionSpecification,
    error: sourceDefinitionError,
    isLoading,
  } = useGetSourceDefinitionSpecificationAsync(selectEntityId || sourceDefinitionId);

  const onDropDownSelect = (sourceDefinitionId: string) => {
    setSourceDefinitionId(sourceDefinitionId);

    const connector = sourceDefinitions.find((item) => item.sourceDefinitionId === sourceDefinitionId);

    if (afterSelectConnector) {
      afterSelectConnector();
    }

    analyticsService.track(Namespace.SOURCE, Action.SELECT, {
      actionDescription: "Source connector type selected",
      connector_source: connector?.name,
      connector_source_definition_id: sourceDefinitionId,
    });
  };

  const onSubmitForm = async (values: ServiceFormValues) => {
    await onSubmit({
      ...values,
      sourceDefinitionId: sourceDefinitionSpecification?.sourceDefinitionId,
    });
  };

  const errorMessage = error ? generateMessageFromError(error) : null;

  console.log("errorMessage", errorMessage);

  return (
    <ConnectorCard
      onServiceSelect={onDropDownSelect}
      onSubmit={onSubmitForm}
      formType="source"
      availableServices={sourceDefinitions}
      selectedConnectorDefinitionSpecification={sourceDefinitionSpecification}
      hasSuccess={hasSuccess}
      fetchingConnectorError={sourceDefinitionError instanceof Error ? sourceDefinitionError : null}
      errorMessage={errorMessage}
      isLoading={isLoading}
      // formValues={sourceDefinitionId ? { serviceType: sourceDefinitionId, name: "" } : undefined}
      //  formValues={formValue && formValue.serviceType ? formValue : {}}
      formValues={formValues}
      title={<FormattedMessage id="onboarding.sourceSetUp" />}
      jobInfo={LogsRequestError.extractJobInfo(error)}
      onClickBtn={onClickBtn}
    />
  );
};
